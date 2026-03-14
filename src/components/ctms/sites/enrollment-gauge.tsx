import { cn } from "@/lib/utils";

interface EnrollmentGaugeProps {
  enrolled: number;
  target: number | null;
}

export function EnrollmentGauge({ enrolled, target }: EnrollmentGaugeProps) {
  const safeTarget = target && target > 0 ? target : 0;
  const pct = safeTarget > 0 ? Math.min(100, Math.round((enrolled / safeTarget) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{enrolled}/{safeTarget || "-"}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full bg-primary transition-all")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
