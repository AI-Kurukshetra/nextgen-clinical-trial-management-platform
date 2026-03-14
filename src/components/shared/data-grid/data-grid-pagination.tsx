"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export interface DataGridPaginationProps<TData> {
  /** TanStack Table instance from useReactTable. */
  table: Table<TData>;
  /** Whether row selection is enabled (shows "X of Y selected"). */
  selectable?: boolean;
  /** When true, total count comes from server (totalRowCount). */
  serverSide?: boolean;
  /** Total row count for server-side mode. */
  totalRowCount?: number;
}

/**
 * Pagination bar for DataGrid: selection summary, page info, and Previous/Next.
 * Extracted for separation of concerns and reuse.
 */
export function DataGridPagination<TData>({
  table,
  selectable = false,
  serverSide = false,
  totalRowCount = 0,
}: DataGridPaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = serverSide
    ? totalRowCount
    : table.getFilteredRowModel().rows.length;
  const pagination = table.getState().pagination;
  const pageIndex = pagination?.pageIndex ?? 0;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="text-muted-foreground text-sm">
        {selectable ? (
          <>
            {selectedCount} of {totalCount} row(s) selected.
          </>
        ) : serverSide ? (
          <>Total: {totalCount} row(s)</>
        ) : (
          <>
            Page {pageIndex + 1} of {pageCount || 1}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
