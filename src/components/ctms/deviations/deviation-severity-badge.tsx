import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityClasses: Record<string, string> = {
  minor: "bg-yellow-100 text-yellow-700",
  major: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

interface DeviationSeverityBadgeProps {
  severity: string;
}

export function DeviationSeverityBadge({ severity }: DeviationSeverityBadgeProps) {
  return (
    <Badge className={cn("capitalize", severityClasses[severity] ?? "bg-muted text-muted-foreground")}>
      {severity}
    </Badge>
  );
}
