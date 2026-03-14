"use client";

import { SignatureDisplay } from "@/components/ctms/signatures/signature-display";
import { useRecordSignatures } from "@/hooks/use-signatures";
import { getErrorMessage } from "@/lib/utils";

interface SignaturesListProps {
  tableName: "documents";
  recordId: string;
}

export function SignaturesList({ tableName, recordId }: SignaturesListProps) {
  const { data, isLoading, isError, error } = useRecordSignatures(tableName, recordId);

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading signatures...</p>;
  if (isError) return <p className="text-xs text-destructive">{getErrorMessage(error, "Failed to load signatures.")}</p>;
  if (!data || data.length === 0) return <p className="text-xs text-muted-foreground">No signatures yet.</p>;

  return (
    <div className="space-y-2">
      {data.map((signature) => (
        <SignatureDisplay key={signature.id} signature={signature} />
      ))}
    </div>
  );
}
