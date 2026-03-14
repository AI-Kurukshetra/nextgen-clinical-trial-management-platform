"use client";

import Link from "next/link";
import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { StudyStatusBadge } from "@/components/ctms/studies/study-status-badge";
import type { Study } from "@/types/database";

const columns: DataGridColumnDef<Study>[] = [
  {
    id: "protocol_number",
    accessorKey: "protocol_number",
    header: "Protocol #",
    enableSorting: true,
    enableFiltering: true,
    filterType: "text",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/studies/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.protocol_number}
      </Link>
    ),
  },
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    enableSorting: true,
    enableFiltering: true,
    filterType: "text",
  },
  {
    id: "phase",
    accessorKey: "phase",
    header: "Phase",
    enableSorting: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => <StudyStatusBadge status={row.original.status} />,
  },
  {
    id: "target_enrollment",
    accessorKey: "target_enrollment",
    header: "Target Enrollment",
    cell: ({ row }) => row.original.target_enrollment ?? "-",
  },
];

interface StudiesTableProps {
  studies: Study[];
}

export function StudiesTable({ studies }: StudiesTableProps) {
  return (
    <DataGrid<Study>
      data={studies}
      columns={columns}
      defaultSort={{ id: "created_at", desc: true }}
      globalSearch={{ placeholder: "Search protocol number, title..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
