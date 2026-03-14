"use client";

import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { MilestoneStatusBadge } from "@/components/ctms/milestones/milestone-status-badge";
import { MilestoneVarianceBadge } from "@/components/ctms/milestones/milestone-variance-badge";
import type { Milestone } from "@/types/database";

interface MilestonesTableProps {
  milestones: Milestone[];
}

export function MilestonesTable({ milestones }: MilestonesTableProps) {
  const columns: DataGridColumnDef<Milestone>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Milestone",
      enableSorting: true,
      enableFiltering: true,
      filterType: "text",
    },
    {
      id: "planned_date",
      accessorKey: "planned_date",
      header: "Planned",
      cell: ({ row }) => row.original.planned_date ?? "-",
    },
    {
      id: "actual_date",
      accessorKey: "actual_date",
      header: "Actual",
      cell: ({ row }) => row.original.actual_date ?? "-",
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MilestoneStatusBadge status={row.original.status} />,
    },
    {
      id: "variance",
      header: "Variance",
      cell: ({ row }) => (
        <MilestoneVarianceBadge
          plannedDate={row.original.planned_date}
          actualDate={row.original.actual_date}
        />
      ),
    },
  ];

  return (
    <DataGrid<Milestone>
      data={milestones}
      columns={columns}
      defaultSort={{ id: "created_at", desc: false }}
      globalSearch={{ placeholder: "Search milestone name..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
