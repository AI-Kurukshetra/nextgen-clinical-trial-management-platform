import { Badge } from "@/components/ui/badge";
import type { Signature } from "@/types/database";

interface SignatureDisplayProps {
  signature: Signature;
}

export function SignatureDisplay({ signature }: SignatureDisplayProps) {
  const when = new Date(signature.signed_at).toLocaleString();

  return (
    <div className="rounded-md border bg-muted/30 p-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">{signature.meaning}</Badge>
        <span className="text-muted-foreground">{when}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-muted-foreground">{signature.reason}</p>
    </div>
  );
}
