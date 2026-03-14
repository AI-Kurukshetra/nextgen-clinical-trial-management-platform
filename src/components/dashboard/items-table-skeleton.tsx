import { Skeleton } from "@/components/ui/skeleton";

export function ItemsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
