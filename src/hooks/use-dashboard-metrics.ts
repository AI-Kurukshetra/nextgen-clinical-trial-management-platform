"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { AuditActivity } from "@/types/api";
import type { Site, Study, Subject } from "@/types/database";

interface EnrollmentRow {
  studyId: string;
  protocolNumber: string;
  title: string;
  targetEnrollment: number;
  enrolledCount: number;
  siteCount: number;
}

export interface DashboardMetrics {
  activeStudies: number;
  totalSites: number;
  totalEnrolled: number;
  enrollmentRows: EnrollmentRow[];
  recentActivity: AuditActivity[];
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
          const [sites, subjects] = await Promise.all([
            apiGet<Site[]>(`/sites?study_id=${study.id}`),
            apiGet<Subject[]>(`/subjects?study_id=${study.id}`),
          ]);

          return { study, sites, subjects };
        })
      );

      const enrollmentRows = perStudy.map((item) => {
        const enrolledCount = item.subjects.filter((subject) => isEnrolledSubject(subject.status)).length;

        return {
          studyId: item.study.id,
          protocolNumber: item.study.protocol_number,
          title: item.study.title,
          targetEnrollment: item.study.target_enrollment ?? 0,
          enrolledCount,
          siteCount: item.sites.length,
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
        enrollmentRows,
        recentActivity,
      };
    },
  });
}
