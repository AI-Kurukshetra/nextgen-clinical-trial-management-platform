"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SignDialog } from "@/components/ctms/signatures/sign-dialog";
import { SignaturesList } from "@/components/ctms/signatures/signatures-list";
import { DataGrid, type DataGridColumnDef } from "@/components/shared/data-grid";
import { QUERY_KEYS } from "@/constants/query-keys";
import { DeviationSeverityBadge } from "@/components/ctms/deviations/deviation-severity-badge";
import type { Deviation, Site, Subject } from "@/types/database";

interface DeviationsTableProps {
  studyId: string;
  deviations: Deviation[];
  sites?: Site[];
  subjects?: Subject[];
}

export function DeviationsTable({ studyId, deviations, sites = [], subjects = [] }: DeviationsTableProps) {
  const queryClient = useQueryClient();
  const siteMap = new Map(sites.map((site) => [site.id, `${site.site_number} · ${site.name}`]));
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject.subject_number]));

  const columns: DataGridColumnDef<Deviation>[] = [
    {
      id: "deviation_number",
      accessorKey: "deviation_number",
      header: "Deviation #",
      enableSorting: true,
      enableFiltering: true,
      filterType: "text",
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category.replaceAll("_", " "),
    },
    {
      id: "severity",
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => <DeviationSeverityBadge severity={row.original.severity} />,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status.replaceAll("_", " "),
    },
    {
      id: "site_id",
      header: "Site",
      cell: ({ row }) => siteMap.get(row.original.site_id) ?? row.original.site_id,
    },
    {
      id: "subject_id",
      header: "Subject",
      cell: ({ row }) => (row.original.subject_id ? subjectMap.get(row.original.subject_id) ?? row.original.subject_id : "-"),
    },
    {
      id: "reported_date",
      accessorKey: "reported_date",
      header: "Reported",
    },
    {
      id: "actions",
      header: "e-Signature",
      cell: ({ row }) => (
        <div className="space-y-2">
          <SignDialog
            triggerLabel="Close with Signature"
            tableName="deviations"
            recordId={row.original.id}
            meaning="Closed"
            title="Electronic Signature: Close Deviation"
            description="This will close the deviation and store your signature record."
            onSigned={async () => {
              await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deviations.byStudy(studyId) });
            }}
          />
          <SignaturesList tableName="deviations" recordId={row.original.id} />
        </div>
      ),
    },
  ];

  return (
    <DataGrid<Deviation>
      data={deviations}
      columns={columns}
      defaultSort={{ id: "reported_date", desc: true }}
      globalSearch={{ placeholder: "Search deviation number/category..." }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 30] }}
      columnVisibility={true}
    />
  );
}
