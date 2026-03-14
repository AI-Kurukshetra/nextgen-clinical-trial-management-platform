import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeviationsSummaryProps {
  minor: number;
  major: number;
  critical: number;
}

export function DeviationsSummary({ minor, major, critical }: DeviationsSummaryProps) {
  const items = [
    { label: "Minor", value: minor, className: "text-yellow-700" },
    { label: "Major", value: major, className: "text-orange-700" },
    { label: "Critical", value: critical, className: "text-red-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Deviations by Severity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-semibold ${item.className}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
