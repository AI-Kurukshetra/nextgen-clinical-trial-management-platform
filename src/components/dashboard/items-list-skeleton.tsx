import { Skeleton } from "@/components/ui/skeleton";

export function ItemsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24" />
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16" />
          </li>
        ))}
      </ul>
    </div>
  );
}
