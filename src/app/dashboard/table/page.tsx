"use client";

import { useItems } from "@/hooks/use-items";
import { ItemsTable } from "@/components/dashboard/items-table";
import { ItemsTableSkeleton } from "@/components/dashboard/items-table-skeleton";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardTablePage() {
  const { data: items, isLoading, isError, error } = useItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Table</h1>
        <p className="text-muted-foreground">
          Demo data table with sorting and pagination.
        </p>
      </div>
      {isLoading && <ItemsTableSkeleton />}
      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load items.")}
        </p>
      )}
      {items && !isLoading && !isError && (
        <ItemsTable items={items} pageSize={10} />
      )}
    </div>
  );
}
