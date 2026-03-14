import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const siteStatusClasses: Record<string, string> = {
  identified: "bg-gray-100 text-gray-700",
  selected: "bg-blue-100 text-blue-700",
  initiated: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
  terminated: "bg-red-100 text-red-700",
};

interface SiteStatusBadgeProps {
  status: string;
}

export function SiteStatusBadge({ status }: SiteStatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", siteStatusClasses[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace("_", " ")}
    </Badge>
  );
}
