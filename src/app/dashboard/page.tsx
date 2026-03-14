"use client";

import { useItems } from "@/hooks/use-items";
import { ItemsList } from "@/components/dashboard/items-list";
import { ItemsListSkeleton } from "@/components/dashboard/items-list-skeleton";
import { SeedButton } from "@/components/dashboard/seed-button";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardPage() {
  const { data: items, isLoading, isError, error } = useItems();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your items. Users can add and edit their own; admins can manage all.
          </p>
        </div>
        <SeedButton />
      </div>
      {isLoading && <ItemsListSkeleton />}
      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load items.")}
        </p>
      )}
      {items && !isLoading && !isError && (
        <ItemsList items={items} showActions="own" />
      )}
    </div>
  );
}
