import { StudyForm } from "@/components/ctms/studies/study-form";

export default function NewStudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Study</h1>
        <p className="text-muted-foreground">
          Enter core protocol and enrollment details. Protocol number can be auto-generated. Then use Protocol and
          Design tabs for detailed setup.
        </p>
      </div>
      <StudyForm mode="create" />
    </div>
  );
}
