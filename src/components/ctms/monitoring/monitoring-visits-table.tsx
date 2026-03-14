"use client";

import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { VisitTypeBadge } from "@/components/ctms/monitoring/visit-type-badge";
import type { MonitoringVisit, Site } from "@/types/database";

interface MonitoringVisitsTableProps {
  visits: MonitoringVisit[];
  sites?: Site[];
}

export function MonitoringVisitsTable({ visits, sites = [] }: MonitoringVisitsTableProps) {
  const siteMap = new Map(sites.map((site) => [site.id, `${site.site_number} · ${site.name}`]));

  const columns: DataGridColumnDef<MonitoringVisit>[] = [
    {
      id: "planned_date",
      accessorKey: "planned_date",
      header: "Planned Date",
      enableSorting: true,
    },
    {
      id: "visit_type",
      accessorKey: "visit_type",
      header: "Visit Type",
      cell: ({ row }) => <VisitTypeBadge type={row.original.visit_type} />,
    },
    {
      id: "site",
      header: "Site",
      cell: ({ row }) => siteMap.get(row.original.site_id) ?? row.original.site_id,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status.replaceAll("_", " "),
    },
    {
      id: "actual_date",
      accessorKey: "actual_date",
      header: "Actual Date",
      cell: ({ row }) => row.original.actual_date ?? "-",
    },
    {
      id: "report_due_date",
      accessorKey: "report_due_date",
      header: "Report Due",
      cell: ({ row }) => row.original.report_due_date ?? "-",
    },
  ];

  return (
    <DataGrid<MonitoringVisit>
      data={visits}
      columns={columns}
      defaultSort={{ id: "planned_date", desc: false }}
      globalSearch={{ placeholder: "Search visit type/status..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
