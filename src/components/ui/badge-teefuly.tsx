import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium tracking-[0.01em] whitespace-nowrap",
  {
    variants: {
      variant: {
        category: "bg-card/95 backdrop-blur-sm text-foreground shadow-sm",
        bestseller: "bg-primary text-primary-foreground",
        new: "bg-secondary text-secondary-foreground",
        sale: "bg-destructive/10 text-destructive",
        freeShipping: "bg-accent/10 text-accent",
        madeToOrder: "bg-primary-light text-primary-dark",
        eco: "bg-accent/10 text-accent",
      },
    },
    defaultVariants: { variant: "category" },
  },
);

export interface TeefulyBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const TeefulyBadge = React.forwardRef<HTMLSpanElement, TeefulyBadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
TeefulyBadge.displayName = "TeefulyBadge";

export { badgeVariants };
