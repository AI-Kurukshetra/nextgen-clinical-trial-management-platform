"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DataGridFooter } from "@/components/shared/data-grid/data-grid-footer";
import { DataGridHeader } from "@/components/shared/data-grid/data-grid-header";
import { DataGridToolbar } from "@/components/shared/data-grid/data-grid-toolbar";
import type {
  DataGridColumnDef,
  DataGridDefaultSort,
  DataGridGlobalSearchConfig,
  DataGridPaginationConfig,
  DataGridState,
} from "@/components/shared/data-grid/types";

export interface DataGridProps<TData extends { id?: string }> {
  /** Table rows. */
  data: TData[];
  /**
   * Column definitions. Use enableSorting, enableFiltering, filterType, filterOptions as needed.
   */
  columns: DataGridColumnDef<TData>[];
  /**
   * When true, pagination/sorting/filtering are controlled: state is passed out via onStateChange
   * and you supply data + totalRowCount from the server.
   */
  serverSide?: boolean;
  /**
   * Total number of rows (server-side). Required when serverSide is true.
   */
  totalRowCount?: number;
  /**
   * Called when sort, filter, or pagination changes (server-side). Use to refetch with new params.
   */
  onStateChange?: (state: DataGridState) => void;
  /**
   * Enable pagination. Pass object for pageSize and pageSizeOptions.
   * @default true
   */
  pagination?: boolean | DataGridPaginationConfig;
  /**
   * Enable global search input.
   * @default false
   */
  globalSearch?: boolean | DataGridGlobalSearchConfig;
  /**
   * Enable column visibility dropdown (show/hide columns).
   * @default true
   */
  columnVisibility?: boolean;
  /**
   * Enable row selection (checkboxes). Use onSelectionChange to get selected rows.
   * @default false
   */
  selectable?: boolean;
  /**
   * Called when selection changes. Receives the selected row data (original) array.
   */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /**
   * Default sort when no user sort is applied.
   */
  defaultSort?: DataGridDefaultSort;
  /**
   * Column id to group rows by (expand/collapse). Optional.
   */
  groupBy?: string;
  /**
   * Custom row id getter. Defaults to (row) => row.id ?? index.
   */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Replace the entire toolbar. When set, default search + column visibility are not rendered.
   */
  toolbar?: React.ReactNode;
  /**
   * Additional content after the default toolbar (e.g. Export, Add row). Ignored when toolbar is set.
   */
  toolbarExtra?: React.ReactNode;
  /**
   * Optional footer content (e.g. totals, custom summary) shown next to the row summary.
   * Rendered inside the table footer when pagination is enabled.
   */
  footerExtra?: React.ReactNode;
  /** Optional class for the wrapper. */
  className?: string;
}

const defaultPageSizeOptions = [10, 20, 30, 50];

function buildColumnDefs<TData extends { id?: string }>(
  columns: DataGridColumnDef<TData>[],
  selectable: boolean
): ColumnDef<TData>[] {
  const base: ColumnDef<TData>[] = selectable
    ? [
        {
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={
                table.getIsSomePageRowsSelected() &&
                !table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ]
    : [];

  const mapped = columns.map((col) => {
    const { filterType: _ft, filterOptions: _fo, enableFiltering: _ef, ...rest } = col;
    const accessorKey = "accessorKey" in col ? (col as { accessorKey?: string }).accessorKey : undefined;
    return {
      ...rest,
      id: col.id ?? (typeof accessorKey === "string" ? accessorKey : undefined),
      enableSorting: col.enableSorting ?? !!accessorKey,
      enableHiding: col.enableHiding ?? true,
    } as ColumnDef<TData>;
  });

  return [...base, ...mapped];
}

/**
 * DataGrid – feature-rich table built on TanStack Table and shadcn Table.
 * Supports client-side or server-side (controlled) mode, pagination, global and column
 * search, sorting, column visibility, row selection (with select-all and indeterminate state),
 * and optional grouping. Use columns with enableFiltering + filterType ("text" | "select")
 * and filterOptions for select filters.
 */
export function DataGrid<TData extends { id?: string }>({
  data,
  columns,
  serverSide = false,
  totalRowCount = 0,
  onStateChange,
  pagination = true,
  globalSearch = false,
  columnVisibility: columnVisibilityEnabled = true,
  selectable = false,
  onSelectionChange,
  defaultSort,
  groupBy,
  getRowId,
  toolbar,
  toolbarExtra,
  footerExtra,
  className,
}: DataGridProps<TData>) {
  const paginationConfig =
    typeof pagination === "object"
      ? {
          pageSize: pagination.pageSize ?? 10,
          pageSizeOptions: pagination.pageSizeOptions ?? defaultPageSizeOptions,
        }
      : { pageSize: 10, pageSizeOptions: defaultPageSizeOptions };

  const [sorting, setSorting] = React.useState<SortingState>(
    defaultSort ? [{ id: defaultSort.id, desc: defaultSort.desc ?? false }] : []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize: paginationConfig.pageSize,
  });

  const columnDefs = React.useMemo(
    () => buildColumnDefs(columns, selectable),
    [columns, selectable]
  );

  const notifyStateChange = React.useCallback(
    (updates: Partial<DataGridState>) => {
      onStateChange?.({
        pageIndex: updates.pageIndex ?? paginationState.pageIndex,
        pageSize: updates.pageSize ?? paginationState.pageSize,
        sorting: updates.sorting ?? sorting,
        globalFilter: updates.globalFilter ?? globalFilter,
        columnFilters: updates.columnFilters ?? columnFilters,
      });
    },
    [onStateChange, paginationState, sorting, globalFilter, columnFilters]
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    getRowId:
      getRowId ??
      ((row, index) => (row as { id?: string }).id ?? String(index)),
    initialState: {
      pagination: {
        pageSize: paginationConfig.pageSize,
        pageIndex: 0,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination:
        pagination === false ? undefined : { ...paginationState },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater;
      setPaginationState(next);
      if (serverSide) {
        notifyStateChange({
          pageIndex: next.pageIndex,
          pageSize: next.pageSize,
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      serverSide || !pagination ? undefined : getPaginationRowModel(),
    getGroupedRowModel: groupBy ? getGroupedRowModel() : undefined,
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide
      ? Math.ceil((totalRowCount || 0) / paginationState.pageSize)
      : undefined,
    autoResetPageIndex: false,
  });

  React.useEffect(() => {
    if (serverSide && onStateChange) {
      onStateChange({
        pageIndex: paginationState.pageIndex,
        pageSize: paginationState.pageSize,
        sorting,
        globalFilter,
        columnFilters,
      });
    }
  }, [serverSide, paginationState, sorting, globalFilter, columnFilters, onStateChange]);

  React.useEffect(() => {
    if (!selectable || !onSelectionChange) return;
    const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    onSelectionChange(selected);
  }, [rowSelection, selectable, onSelectionChange, table]);

  const globalSearchPlaceholder =
    typeof globalSearch === "object"
      ? globalSearch.placeholder ?? "Search..."
      : "Search...";

  return (
    <div className={className}>
      {toolbar != null ? (
        <div className="py-4">{toolbar}</div>
      ) : (
        (globalSearch || columnVisibilityEnabled || toolbarExtra) && (
          <DataGridToolbar
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            searchPlaceholder={globalSearchPlaceholder}
            showGlobalSearch={!!globalSearch}
            showColumnVisibility={
              columnVisibilityEnabled &&
              columns.some((c) => c.enableHiding !== false)
            }
          >
            {toolbarExtra}
          </DataGridToolbar>
        )
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <DataGridHeader
            headerGroups={table.getHeaderGroups()}
            columns={columns}
          />
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "select" ? "w-12 px-2" : "px-4 py-3"}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {pagination && (
            <DataGridFooter
              table={table}
              columnCount={columnDefs.length}
              selectable={selectable}
              serverSide={serverSide}
              totalRowCount={totalRowCount}
            >
              {footerExtra}
            </DataGridFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
