"use client";

import { ChevronDown, Columns } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Table } from "@tanstack/react-table";

export interface DataGridToolbarProps<TData> {
  /** TanStack Table instance. */
  table: Table<TData>;
  /** Global search input value. */
  globalFilter: string;
  /** Callback when global search changes. */
  onGlobalFilterChange: (value: string) => void;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Whether to show the global search input. */
  showGlobalSearch?: boolean;
  /** Whether to show the column visibility dropdown. */
  showColumnVisibility?: boolean;
  /**
   * Optional extra content rendered after default tools (search + columns).
   * Use for table-specific actions (e.g. Export, Add row).
   */
  children?: React.ReactNode;
}

/**
 * Default DataGrid toolbar: global search + column visibility.
 * Pass children to add custom actions without replacing the default tools.
 */
export function DataGridToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = "Search...",
  showGlobalSearch = true,
  showColumnVisibility = true,
  children,
}: DataGridToolbarProps<TData>) {
  const canHideColumns =
    showColumnVisibility &&
    table
      .getAllColumns()
      .filter((col) => col.getCanHide() && col.id !== "select").length > 0;

  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      {showGlobalSearch && (
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="max-w-sm"
        />
      )}
      {canHideColumns && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm">
              <Columns className="mr-2 h-4 w-4" />
              Columns
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide() && col.id !== "select")
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {typeof col.columnDef.header === "string"
                    ? col.columnDef.header
                    : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {children}
    </div>
  );
}
