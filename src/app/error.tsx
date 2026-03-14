"use client";

import { useEffect } from "react";
import { ContentContainer } from "@/components/shared/content-container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <ContentContainer variant="narrow" className="py-12 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          We couldn&apos;t load this page. You can try again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </ContentContainer>
    </div>
  );
}
