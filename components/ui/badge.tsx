import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-primary/15 text-primary",
      secondary: "border-transparent bg-muted text-foreground/85",
      outline: "text-muted-foreground",
      before: "border-phase-before/30 bg-phase-before/15 text-phase-before",
      during: "border-phase-during/30 bg-phase-during/15 text-phase-during",
      after: "border-phase-after/30 bg-phase-after/15 text-phase-after",
      destructive: "border-transparent bg-destructive/15 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
