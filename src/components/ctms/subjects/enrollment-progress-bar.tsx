import { cn } from "@/lib/utils";

interface EnrollmentProgressBarProps {
  enrolledCount: number;
  targetEnrollment: number | null;
}

export function EnrollmentProgressBar({ enrolledCount, targetEnrollment }: EnrollmentProgressBarProps) {
  const target = targetEnrollment && targetEnrollment > 0 ? targetEnrollment : 0;
  const percentage = target > 0 ? Math.min(100, Math.round((enrolledCount / target) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Enrollment Progress</span>
        <span>
          {enrolledCount}/{target || "-"} ({percentage}%)
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted">
        <div className={cn("h-3 rounded-full bg-primary transition-all")} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
