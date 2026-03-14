import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MonitoringVisit } from "@/types/database";

interface UpcomingVisitsListProps {
  visits: MonitoringVisit[];
}

export function UpcomingVisitsList({ visits }: UpcomingVisitsListProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-base font-semibold">Upcoming Visits (Next 14 Days)</h3>
      {visits.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming visits.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Planned Date</TableHead>
              <TableHead>Visit Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subjects Reviewed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>{visit.planned_date}</TableCell>
                <TableCell>{visit.visit_type}</TableCell>
                <TableCell>{visit.status.replaceAll("_", " ")}</TableCell>
                <TableCell>{visit.subjects_reviewed ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
