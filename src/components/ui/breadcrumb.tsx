"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? React.Fragment : "a";
  const linkClassName = cn(
    "transition-colors hover:text-foreground",
    className
  );
  if (asChild) {
    return <Comp>{React.Children.only(props.children)}</Comp>;
  }
  return <a className={linkClassName} {...props} />;
}

function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      role="link"
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      aria-hidden
      className={cn("[&>svg]:size-3.5", className)}
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      role="presentation"
      {...props}
    >
      <span className="text-muted-foreground">⋯</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
