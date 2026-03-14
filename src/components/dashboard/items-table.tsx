"use client";

import Link from "next/link";
import type { Item } from "@/types/database";
import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";

export type ItemWithOptionalOwner = Item & { created_by?: string };

const columns: DataGridColumnDef<ItemWithOptionalOwner>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <span className="font-medium">{row.getValue("title") as string}</span>,
    enableSorting: true,
    enableFiltering: true,
    filterType: "text",
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="max-w-xs truncate text-muted-foreground block">
        {(row.getValue("description") as string | null) ?? "—"}
      </span>
    ),
    enableSorting: false,
    enableFiltering: true,
    filterType: "text",
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {new Date(row.getValue("created_at") as string).toLocaleDateString()}
      </span>
    ),
    enableSorting: true,
    enableFiltering: false,
  },
];

type ItemsTableProps = {
  items: ItemWithOptionalOwner[];
  /** Page size when using client-side pagination. */
  pageSize?: number;
};

export function ItemsTable({ items, pageSize = 10 }: ItemsTableProps) {
  return (
    <div className="space-y-4">
      <DataGrid<ItemWithOptionalOwner>
        data={items}
        columns={columns}
        pagination={{ pageSize, pageSizeOptions: [10, 20, 30] }}
        globalSearch={{ placeholder: "Search title, description..." }}
        columnVisibility={true}
        selectable={true}
        defaultSort={{ id: "created_at", desc: true }}
        onSelectionChange={(selected) => {
          if (selected.length > 0) {
            console.debug("Selected items:", selected.length);
          }
        }}
      />
      <p className="text-muted-foreground text-sm">
        <Link href="/dashboard" className="text-primary underline-offset-4 hover:underline">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
