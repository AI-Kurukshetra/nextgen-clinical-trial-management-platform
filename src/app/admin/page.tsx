"use client";

import { useItems } from "@/hooks/use-items";
import { ItemsList } from "@/components/dashboard/items-list";
import { ItemsListSkeleton } from "@/components/dashboard/items-list-skeleton";
import { getErrorMessage } from "@/lib/utils";

export default function AdminPage() {
  const { data: items, isLoading, isError, error } = useItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin — All items</h1>
        <p className="text-muted-foreground">
          Create, edit, and delete any item. This area is restricted to admins.
        </p>
      </div>
      {isLoading && <ItemsListSkeleton />}
      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load items.")}
        </p>
      )}
      {items && !isLoading && !isError && (
        <ItemsList items={items} showActions="all" />
      )}
    </div>
  );
}
