import { cn } from "@/lib/utils";

type ContentContainerVariant = "default" | "narrow" | "wide";

type ContentContainerProps = {
  variant?: ContentContainerVariant;
  as?: "div" | "section" | "main";
  className?: string;
  children: React.ReactNode;
};

/** Tailwind's container + mx-auto. Narrow caps width with max-w-3xl. */
const variantClass: Record<ContentContainerVariant, string> = {
  default: "container mx-auto px-4 md:px-6",
  narrow: "container max-w-3xl mx-auto px-4 md:px-6",
  wide: "container mx-auto px-4 md:px-6",
};

/**
 * Wrapper using Tailwind's container utility. Use only where you need constrained width.
 */
export function ContentContainer({
  variant = "default",
  as: Tag = "div",
  className,
  children,
}: ContentContainerProps) {
  return (
    <Tag className={cn(variantClass[variant], className)}>
      {children}
    </Tag>
  );
}
