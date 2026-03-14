import { ItemRow } from "@/components/dashboard/item-row";
import { CreateItemForm } from "@/components/dashboard/create-item-form";
import { EmptyState } from "@/components/common/empty-state";
import { Package } from "lucide-react";
import type { Item } from "@/types/database";

type ItemsListProps = {
  items: (Item & { created_by?: string })[];
  showActions: "own" | "all";
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ItemsList({
  items,
  showActions,
  emptyTitle = "No items yet",
  emptyDescription = "Create one above or run the seed to add demo items.",
}: ItemsListProps) {
  return (
    <div className="space-y-4">
      <CreateItemForm />
      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title={emptyTitle}
          description={emptyDescription}
          action={<CreateItemForm />}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} showActions={showActions} />
          ))}
        </ul>
      )}
    </div>
  );
}
