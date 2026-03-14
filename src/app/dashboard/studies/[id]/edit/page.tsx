"use client";

import { useParams } from "next/navigation";
import { StudyForm } from "@/components/ctms/studies/study-form";
import { useStudy } from "@/hooks/use-studies";
import { getErrorMessage } from "@/lib/utils";

export default function EditStudyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: study, isLoading, isError, error } = useStudy(id);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading study...</p>;
  }

  if (isError || !study) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Study not found.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Study</h1>
        <p className="text-muted-foreground">
          Update core metadata here. Manage objectives, endpoints, design, and amendments in Protocol/Design tabs.
        </p>
      </div>
      <StudyForm mode="edit" initialStudy={study} />
    </div>
  );
}
