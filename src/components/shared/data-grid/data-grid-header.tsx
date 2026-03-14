"use client";

import { flexRender } from "@tanstack/react-table";
import type { Header } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreVertical, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DataGridColumnDef, DataGridFilterOption } from "./types";

export interface DataGridHeaderProps<TData> {
  /** Header groups from table.getHeaderGroups(). */
  headerGroups: { id: string; headers: Header<TData, unknown>[] }[];
  /** Original column definitions (for filter config). */
  columns: DataGridColumnDef<TData>[];
}

/**
 * Header layout:
 * - Top row: Label + sort menu (3-dot: Sort ascending, Sort descending, Clear sort).
 * - Bottom row: Filter input only (when column has filtering).
 */
export function DataGridHeader<TData>({ headerGroups, columns }: DataGridHeaderProps<TData>) {
  return (
    <TableHeader>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id} className="border-b bg-muted/50">
          {headerGroup.headers.map((header) => {
            const colDef = columns.find((c) => {
              const key =
                "accessorKey" in c ? (c as { accessorKey?: string }).accessorKey : undefined;
              return (c.id ?? key) === header.column.id;
            });
            const isSelectCol = header.column.id === "select";
            const hasFilter = !isSelectCol && colDef?.enableFiltering;
            const isSelectFilter =
              hasFilter &&
              colDef?.filterType === "select" &&
              (colDef.filterOptions?.length ?? 0) > 0;
            const canSort = !isSelectCol && header.column.getCanSort();

            return (
              <TableHead key={header.id}>
                <div className={"flex flex-col gap-2"}>
                  {isSelectCol ? (
                    flexRender(header.column.columnDef.header, header.getContext())
                  ) : (
                    <>
                      {/* Top row: label + sort menu */}
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {header.isPlaceholder
                            ? null
                            : typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {canSort && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                              aria-label="Sort options"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-44">
                              <DropdownMenuItem onClick={() => header.column.toggleSorting(false)}>
                                <ArrowUp className="mr-2 h-4 w-4" />
                                Sort ascending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => header.column.toggleSorting(true)}>
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Sort descending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => header.column.clearSorting()}>
                                <X className="mr-2 h-4 w-4" />
                                Clear sort
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {/* Bottom row: filter input only */}
                      {hasFilter && (
                        <div className="min-w-0">
                          {isSelectFilter ? (
                            <select
                              className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={(header.column.getFilterValue() as string) ?? ""}
                              onChange={(e) =>
                                header.column.setFilterValue(e.target.value || undefined)
                              }
                            >
                              <option value="">All</option>
                              {(colDef.filterOptions as DataGridFilterOption[]).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              placeholder="Filter..."
                              className="h-9 min-w-0"
                              value={(header.column.getFilterValue() as string) ?? ""}
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
