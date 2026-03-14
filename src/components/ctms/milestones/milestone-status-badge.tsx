import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  at_risk: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
};

interface MilestoneStatusBadgeProps {
  status: string;
}

export function MilestoneStatusBadge({ status }: MilestoneStatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", statusClasses[status] ?? "bg-muted text-muted-foreground")}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
