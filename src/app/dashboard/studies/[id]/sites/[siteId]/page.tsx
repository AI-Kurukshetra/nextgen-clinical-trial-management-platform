"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteForm } from "@/components/ctms/sites/site-form";
import { SiteMembersPanel } from "@/components/ctms/sites/site-members-panel";
import { SiteStatusStepper } from "@/components/ctms/sites/site-status-stepper";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";
import { buttonVariants } from "@/components/ui/button";
import { useSite } from "@/hooks/use-sites";
import { cn, getErrorMessage } from "@/lib/utils";

export default function SiteDetailPage() {
  const params = useParams<{ id: string; siteId: string }>();
  const { data: site, isLoading, isError, error } = useSite(params.siteId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading site...</p>;
  }

  if (isError || !site) {
    return <p className="text-sm text-destructive">{getErrorMessage(error, "Site not found.")}</p>;
  }

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={params.id} />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{site.site_number}</p>
        <h2 className="text-xl font-semibold">{site.name}</h2>
        <SiteStatusStepper status={site.status} />
      </div>
      <Link
        href={`/dashboard/studies/${params.id}/sites/${params.siteId}/subjects/new`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Enroll Subject at This Site
      </Link>
      <SiteForm studyId={params.id} mode="edit" initialSite={site} />
      <SiteMembersPanel siteId={params.siteId} />
    </div>
  );
}
