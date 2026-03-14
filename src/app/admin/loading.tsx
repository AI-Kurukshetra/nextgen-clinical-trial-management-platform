import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
