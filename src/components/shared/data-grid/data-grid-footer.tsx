"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";

export interface DataGridFooterProps<TData> {
  /** TanStack Table instance. */
  table: Table<TData>;
  /** Number of columns (for colSpan). */
  columnCount: number;
  /** Whether row selection is enabled (shows "X of Y selected"). */
  selectable?: boolean;
  /** When true, total count comes from server (totalRowCount). */
  serverSide?: boolean;
  /** Total row count for server-side mode. */
  totalRowCount?: number;
  /** Optional extra content (e.g. totals, custom summary) shown between summary and pagination. */
  children?: React.ReactNode;
}

/**
 * Table footer for DataGrid: total/summary (range or count) + optional extra content + pagination.
 * Renders inside <table> as <tfoot>. Use children for totals or other generic footer content.
 */
export function DataGridFooter<TData>({
  table,
  columnCount,
  selectable = false,
  serverSide = false,
  totalRowCount = 0,
  children: footerExtra,
}: DataGridFooterProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = serverSide
    ? totalRowCount
    : table.getFilteredRowModel().rows.length;
  const pagination = table.getState().pagination;
  const pageIndex = pagination?.pageIndex ?? 0;
  const pageSize = pagination?.pageSize ?? 10;
  const from = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalCount);

  const summaryText = selectable
    ? `${selectedCount} of ${totalCount} row(s) selected`
    : serverSide
      ? `Total: ${totalCount} row(s)`
      : totalCount === 0
        ? "0 row(s)"
        : `Showing ${from}–${to} of ${totalCount} row(s)`;

  return (
    <TableFooter>
      <TableRow>
        <TableCell
          colSpan={columnCount}
          className="h-12 px-4 text-muted-foreground"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm">{summaryText}</span>
              {footerExtra}
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
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
