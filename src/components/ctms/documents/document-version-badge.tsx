import { Badge } from "@/components/ui/badge";

interface DocumentVersionBadgeProps {
  version: string;
}

export function DocumentVersionBadge({ version }: DocumentVersionBadgeProps) {
  return <Badge variant="outline">v{version}</Badge>;
}
