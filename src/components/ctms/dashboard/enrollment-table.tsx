import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EnrollmentRow {
  studyId: string;
  protocolNumber: string;
  title: string;
  targetEnrollment: number;
  enrolledCount: number;
  siteCount: number;
}

interface EnrollmentTableProps {
  rows: EnrollmentRow[];
}

export function EnrollmentTable({ rows }: EnrollmentTableProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-base font-semibold">Enrollment by Study</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Protocol</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Sites</TableHead>
            <TableHead>Enrolled / Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.studyId}>
              <TableCell>{row.protocolNumber}</TableCell>
              <TableCell className="whitespace-normal">{row.title}</TableCell>
              <TableCell>{row.siteCount}</TableCell>
              <TableCell>
                {row.enrolledCount}/{row.targetEnrollment || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
