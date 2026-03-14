"use client";

import { useParams } from "next/navigation";
import { SiteForm } from "@/components/ctms/sites/site-form";
import { StudyDetailTabs } from "@/components/ctms/studies/study-detail-tabs";

export default function NewSitePage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <StudyDetailTabs studyId={params.id} />
      <div>
        <h2 className="text-xl font-semibold">Create Site</h2>
        <p className="text-sm text-muted-foreground">
          Enter site metadata and investigator details. Site number can be auto-generated, and creator becomes site
          owner by default.
        </p>
      </div>
      <SiteForm studyId={params.id} mode="create" />
    </div>
  );
}
