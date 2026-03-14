import { Skeleton } from "@/components/ui/skeleton";

export function SitesListSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
