import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const studyStatusColors: Record<string, string> = {
  setup: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  terminated: "bg-red-100 text-red-700",
};

interface StudyStatusBadgeProps {
  status: string;
}

export function StudyStatusBadge({ status }: StudyStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize", studyStatusColors[status] ?? "bg-gray-100 text-gray-700")}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
