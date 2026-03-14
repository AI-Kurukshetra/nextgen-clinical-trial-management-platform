"use client";

import Link from "next/link";
import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { EnrollmentGauge } from "@/components/ctms/sites/enrollment-gauge";
import { SiteStatusBadge } from "@/components/ctms/sites/site-status-badge";
import type { Site } from "@/types/database";

interface SitesTableProps {
  studyId: string;
  sites: Site[];
}

export function SitesTable({ studyId, sites }: SitesTableProps) {
  const columns: DataGridColumnDef<Site>[] = [
    {
      id: "site_number",
      accessorKey: "site_number",
      header: "Site #",
      enableSorting: true,
      enableFiltering: true,
      filterType: "text",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/studies/${studyId}/sites/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.site_number}
        </Link>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      enableFiltering: true,
      filterType: "text",
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const city = row.original.city || "-";
        const country = row.original.country || "-";
        return `${city}, ${country}`;
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => <SiteStatusBadge status={row.original.status} />,
    },
    {
      id: "pi",
      header: "PI",
      cell: ({ row }) => row.original.principal_investigator_name ?? "-",
    },
    {
      id: "enrollment",
      header: "Enrollment",
      cell: ({ row }) => (
        <EnrollmentGauge
          enrolled={row.original.enrolled_count ?? 0}
          target={row.original.target_enrollment}
        />
      ),
    },
  ];

  return (
    <DataGrid<Site>
      data={sites}
      columns={columns}
      defaultSort={{ id: "site_number", desc: false }}
      globalSearch={{ placeholder: "Search site number, name, PI..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
