import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const subjectStatusClasses: Record<string, string> = {
  screened: "bg-yellow-100 text-yellow-700",
  enrolled: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-700",
  withdrawn: "bg-orange-100 text-orange-700",
  screen_failed: "bg-red-100 text-red-700",
  lost_to_followup: "bg-red-100 text-red-700",
};

interface SubjectStatusBadgeProps {
  status: string;
}

export function SubjectStatusBadge({ status }: SubjectStatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", subjectStatusClasses[status] ?? "bg-muted text-muted-foreground")}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
