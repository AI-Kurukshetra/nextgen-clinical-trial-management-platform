import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-36" />
        </div>
      </div>
    </div>
  );
}
