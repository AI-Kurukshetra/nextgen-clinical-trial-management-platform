import type { ColumnDef, RowData } from "@tanstack/react-table";

/**
 * Filter type for column filtering.
 * - `"text"`: plain input (e.g. name, email).
 * - `"select"`: dropdown of options (e.g. status, category enums).
 */
export type DataGridFilterType = "text" | "select";

/**
 * Option for select-type column filter.
 */
export interface DataGridFilterOption {
  /** Display label in the dropdown. */
  label: string;
  /** Value sent when filtering (e.g. API or filter state). */
  value: string;
}

/**
 * Extended column definition for DataGrid.
 * Extends TanStack ColumnDef with optional filter config and sensible defaults.
 */
export type DataGridColumnDef<TData extends RowData> = ColumnDef<TData> & {
  /** Unique column id. Defaults to accessorKey when not set. */
  id?: string;
  /**
   * Whether this column is sortable.
   * @default true when accessorKey is present
   */
  enableSorting?: boolean;
  /**
   * Whether this column has a filter UI.
   * @default false
   */
  enableFiltering?: boolean;
  /**
   * Filter UI type: text input or select dropdown.
   * Use "select" for enum-like fields; "text" for searchable strings.
   * @default "text"
   */
  filterType?: DataGridFilterType;
  /**
   * Options for filterType "select". Ignored for "text".
   */
  filterOptions?: DataGridFilterOption[];
  /**
   * Whether this column can be toggled in the column visibility menu.
   * @default true
   */
  enableHiding?: boolean;
};

/**
 * Pagination config for DataGrid.
 */
export interface DataGridPaginationConfig {
  /** Initial page size. */
  pageSize?: number;
  /** Available page size options. */
  pageSizeOptions?: number[];
}

/**
 * Global search config.
 */
export interface DataGridGlobalSearchConfig {
  /** Placeholder for the search input. */
  placeholder?: string;
}

/**
 * State emitted when using server-side (controlled) DataGrid.
 * Pass to your API and use the returned data + totalRowCount.
 */
export interface DataGridState {
  /** Current page index (0-based). */
  pageIndex: number;
  /** Current page size. */
  pageSize: number;
  /** Current sort: column id and direction. */
  sorting: { id: string; desc: boolean }[];
  /** Global search string. */
  globalFilter: string;
  /** Per-column filter values: column id -> value. */
  columnFilters: { id: string; value: unknown }[];
}

/**
 * Default sort applied when no user sort is set.
 */
export interface DataGridDefaultSort {
  /** Column id to sort by. */
  id: string;
  /** Sort descending when true, ascending when false. */
  desc?: boolean;
}

