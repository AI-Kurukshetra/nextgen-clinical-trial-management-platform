"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "@/config/breadcrumbs";

export function LayoutBreadcrumbs() {
  const pathname = usePathname();
  const segments = getBreadcrumbs(pathname);

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={i} className="contents">
              <BreadcrumbItem>
                {isLast || seg.href == null ? (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={seg.href}>{seg.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
