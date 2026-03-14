import { Badge } from "@/components/ui/badge";

interface MilestoneVarianceBadgeProps {
  plannedDate: string | null;
  actualDate: string | null;
}

function diffDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function MilestoneVarianceBadge({ plannedDate, actualDate }: MilestoneVarianceBadgeProps) {
  if (!plannedDate) return <Badge variant="outline">No plan</Badge>;
  if (!actualDate) return <Badge variant="outline">Pending</Badge>;

  const planned = new Date(plannedDate);
  const actual = new Date(actualDate);
  const variance = diffDays(actual, planned);

  if (variance === 0) return <Badge className="bg-green-100 text-green-700">On time</Badge>;
  if (variance > 0) return <Badge className="bg-red-100 text-red-700">+{variance}d late</Badge>;
  return <Badge className="bg-blue-100 text-blue-700">{variance}d early</Badge>;
}
