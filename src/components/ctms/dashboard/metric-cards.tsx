import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardsProps {
  activeStudies: number;
  totalSites: number;
  totalEnrolled: number;
}

export function MetricCards({ activeStudies, totalSites, totalEnrolled }: MetricCardsProps) {
  const items = [
    { label: "Active Studies", value: activeStudies },
    { label: "Total Sites", value: totalSites },
    { label: "Total Enrolled", value: totalEnrolled },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
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
