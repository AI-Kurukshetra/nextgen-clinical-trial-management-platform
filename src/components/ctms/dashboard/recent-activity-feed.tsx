import type { AuditActivity } from "@/types/api";

interface RecentActivityFeedProps {
  items: AuditActivity[];
}

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-base font-semibold">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border p-2 text-sm">
              <p className="font-medium">{item.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.performed_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
