import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90",
        destructive:
          "bg-error text-on-error hover:bg-error/90 focus-visible:outline-error/20 dark:focus-visible:outline-error/40 dark:bg-error/60",
        outline:
          "border bg-surface-container-lowest shadow-xs hover:bg-surface-container text-on-surface dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary/90",
        ghost: "hover:bg-surface-container hover:text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#20bd5a]",
        surface: "bg-surface-container-lowest border border-border-subtle shadow-ambient hover:shadow-ambient-hover text-on-surface",
        "outline-border": "border-2 border-border-subtle bg-transparent hover:bg-surface-container text-on-surface",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
