import { cn } from "@/lib/utils";

const steps = ["identified", "selected", "initiated", "active", "closed"] as const;

interface SiteStatusStepperProps {
  status: string;
}

export function SiteStatusStepper({ status }: SiteStatusStepperProps) {
  const index = steps.indexOf(status as (typeof steps)[number]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((step, i) => {
        const active = i <= (index === -1 ? 0 : index);
        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs capitalize",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 ? <span className="text-muted-foreground">→</span> : null}
          </div>
        );
      })}
      {status === "terminated" ? (
        <span className="rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs text-red-700">
          terminated
        </span>
      ) : null}
    </div>
  );
}
