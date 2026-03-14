"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface StudyDetailTabsProps {
  studyId: string;
}

const tabs = [
  { label: "Overview", path: "" },
  { label: "Sites", path: "sites" },
  { label: "Subjects", path: "subjects" },
  { label: "Monitoring (CRA)", path: "monitoring" },
  { label: "Deviations", path: "deviations" },
  { label: "Milestones", path: "milestones" },
  { label: "Documents", path: "documents" },
  { label: "Forms", path: "forms" },
];

export function StudyDetailTabs({ studyId }: StudyDetailTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const href = tab.path
          ? `/dashboard/studies/${studyId}/${tab.path}`
          : `/dashboard/studies/${studyId}`;
        const active = pathname === href;

        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
