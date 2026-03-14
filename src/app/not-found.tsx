import Link from "next/link";
import { ContentContainer } from "@/components/shared/content-container";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <ContentContainer variant="narrow" className="py-12 text-center">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          404
        </h1>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Go home
        </Link>
      </ContentContainer>
    </div>
  );
}
