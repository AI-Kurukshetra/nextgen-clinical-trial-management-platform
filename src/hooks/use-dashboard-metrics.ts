"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { AuditActivity } from "@/types/api";
import type { Deviation, MonitoringVisit, Site, Study, Subject } from "@/types/database";

interface EnrollmentRow {
  studyId: string;
  protocolNumber: string;
  title: string;
  targetEnrollment: number;
  enrolledCount: number;
  siteCount: number;
  openDeviationCount: number;
}

interface DeviationBreakdown {
  minor: number;
  major: number;
  critical: number;
}

export interface DashboardMetrics {
  activeStudies: number;
  totalSites: number;
  totalEnrolled: number;
  openDeviations: number;
  enrollmentRows: EnrollmentRow[];
  upcomingVisits: MonitoringVisit[];
  deviationBreakdown: DeviationBreakdown;
  recentActivity: AuditActivity[];
}

function isOpenDeviation(status: string) {
  return status === "open" || status === "under_review";
}

function isEnrolledSubject(status: string) {
  return status === "enrolled" || status === "active" || status === "completed";
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async (): Promise<DashboardMetrics> => {
      const studies = await apiGet<Study[]>("/studies");

      const perStudy = await Promise.all(
        studies.map(async (study) => {
          const [sites, subjects, deviations, visits] = await Promise.all([
            apiGet<Site[]>(`/sites?study_id=${study.id}`),
            apiGet<Subject[]>(`/subjects?study_id=${study.id}`),
            apiGet<Deviation[]>(`/deviations?study_id=${study.id}`),
            apiGet<MonitoringVisit[]>(`/monitoring-visits?study_id=${study.id}`),
          ]);

          return { study, sites, subjects, deviations, visits };
        })
      );

      const allVisits = perStudy.flatMap((item) => item.visits);
      const today = new Date();
      const next14 = new Date();
      next14.setDate(today.getDate() + 14);

      const upcomingVisits = allVisits
        .filter((visit) => {
          if (visit.status === "cancelled" || visit.status === "completed") return false;
          const planned = new Date(visit.planned_date);
          return planned >= today && planned <= next14;
        })
        .sort((a, b) => a.planned_date.localeCompare(b.planned_date));

      const deviationBreakdown = perStudy
        .flatMap((item) => item.deviations)
        .filter((deviation) => isOpenDeviation(deviation.status))
        .reduce<DeviationBreakdown>(
          (acc, deviation) => {
            if (deviation.severity === "minor") acc.minor += 1;
            if (deviation.severity === "major") acc.major += 1;
            if (deviation.severity === "critical") acc.critical += 1;
            return acc;
          },
          { minor: 0, major: 0, critical: 0 }
        );

      const enrollmentRows = perStudy.map((item) => {
        const enrolledCount = item.subjects.filter((subject) => isEnrolledSubject(subject.status)).length;
        const openDeviationCount = item.deviations.filter((deviation) => isOpenDeviation(deviation.status)).length;

        return {
          studyId: item.study.id,
          protocolNumber: item.study.protocol_number,
          title: item.study.title,
          targetEnrollment: item.study.target_enrollment ?? 0,
          enrolledCount,
          siteCount: item.sites.length,
          openDeviationCount,
        };
      });

      const recentActivity = await apiGet<AuditActivity[]>("/audit-logs?limit=10");

      return {
        activeStudies: studies.filter((study) => study.status === "active").length,
        totalSites: perStudy.reduce((sum, item) => sum + item.sites.length, 0),
        totalEnrolled: perStudy.reduce(
          (sum, item) => sum + item.subjects.filter((subject) => isEnrolledSubject(subject.status)).length,
          0
        ),
        openDeviations: perStudy.reduce(
          (sum, item) => sum + item.deviations.filter((deviation) => isOpenDeviation(deviation.status)).length,
          0
        ),
        enrollmentRows,
        upcomingVisits,
        deviationBreakdown,
        recentActivity,
      };
    },
  });
}
