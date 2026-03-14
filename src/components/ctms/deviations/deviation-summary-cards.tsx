import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deviation } from "@/types/database";

interface DeviationSummaryCardsProps {
  deviations: Deviation[];
}

export function DeviationSummaryCards({ deviations }: DeviationSummaryCardsProps) {
  const open = deviations.filter((d) => d.status === "open").length;
  const underReview = deviations.filter((d) => d.status === "under_review").length;
  const critical = deviations.filter((d) => d.severity === "critical").length;
  const resolved = deviations.filter((d) => ["resolved", "closed"].includes(d.status)).length;

  const items = [
    { label: "Open", value: open },
    { label: "Under Review", value: underReview },
    { label: "Critical", value: critical },
    { label: "Resolved/Closed", value: resolved },
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
