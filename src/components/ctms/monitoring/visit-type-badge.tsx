import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const visitTypeClasses: Record<string, string> = {
  SIV: "bg-blue-100 text-blue-700",
  IMV: "bg-green-100 text-green-700",
  COV: "bg-slate-100 text-slate-700",
  Remote: "bg-purple-100 text-purple-700",
  For_Cause: "bg-red-100 text-red-700",
};

interface VisitTypeBadgeProps {
  type: string;
}

export function VisitTypeBadge({ type }: VisitTypeBadgeProps) {
  return <Badge className={cn(visitTypeClasses[type] ?? "bg-muted text-muted-foreground")}>{type}</Badge>;
}
