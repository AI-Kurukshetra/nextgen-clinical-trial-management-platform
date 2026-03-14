import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types/database";

interface DocumentStatusBadgeProps {
  status: Document["status"];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  superseded: "Superseded",
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  if (status === "approved") {
    return <Badge variant="default">{STATUS_LABELS[status] ?? status}</Badge>;
  }

  if (status === "under_review") {
    return <Badge variant="secondary">{STATUS_LABELS[status] ?? status}</Badge>;
  }

  if (status === "superseded") {
    return <Badge variant="outline">{STATUS_LABELS[status] ?? status}</Badge>;
  }

  return <Badge variant="ghost">{STATUS_LABELS[status] ?? status}</Badge>;
}
