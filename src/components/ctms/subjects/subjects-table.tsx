"use client";

import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { SubjectStatusBadge } from "@/components/ctms/subjects/subject-status-badge";
import type { Site, Subject } from "@/types/database";

interface SubjectsTableProps {
  subjects: Subject[];
  sites?: Site[];
}

export function SubjectsTable({ subjects, sites = [] }: SubjectsTableProps) {
  const siteMap = new Map(sites.map((site) => [site.id, `${site.site_number} · ${site.name}`]));

  const columns: DataGridColumnDef<Subject>[] = [
    {
      id: "subject_number",
      accessorKey: "subject_number",
      header: "Subject #",
      enableSorting: true,
      enableFiltering: true,
      filterType: "text",
    },
    {
      id: "initials",
      accessorKey: "initials",
      header: "Initials",
      cell: ({ row }) => row.original.initials ?? "-",
    },
    {
      id: "site_id",
      header: "Site",
      cell: ({ row }) => siteMap.get(row.original.site_id) ?? row.original.site_id,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <SubjectStatusBadge status={row.original.status} />,
    },
    {
      id: "screen_date",
      accessorKey: "screen_date",
      header: "Screen Date",
      cell: ({ row }) => row.original.screen_date ?? "-",
    },
    {
      id: "enrollment_date",
      accessorKey: "enrollment_date",
      header: "Enrollment Date",
      cell: ({ row }) => row.original.enrollment_date ?? "-",
    },
  ];

  return (
    <DataGrid<Subject>
      data={subjects}
      columns={columns}
      defaultSort={{ id: "created_at", desc: true }}
      globalSearch={{ placeholder: "Search subject number, initials..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
