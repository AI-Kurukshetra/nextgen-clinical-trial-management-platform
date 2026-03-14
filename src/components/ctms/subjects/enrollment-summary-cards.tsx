import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject } from "@/types/database";

interface EnrollmentSummaryCardsProps {
  subjects: Subject[];
}

export function EnrollmentSummaryCards({ subjects }: EnrollmentSummaryCardsProps) {
  const screened = subjects.filter((s) => s.status === "screened").length;
  const enrolled = subjects.filter((s) => s.status === "enrolled" || s.status === "active" || s.status === "completed").length;
  const active = subjects.filter((s) => s.status === "active").length;
  const screenFailed = subjects.filter((s) => s.status === "screen_failed").length;

  const items = [
    { label: "Screened", value: screened },
    { label: "Enrolled", value: enrolled },
    { label: "Active", value: active },
    { label: "Screen Failed", value: screenFailed },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
