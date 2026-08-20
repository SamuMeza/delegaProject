import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-on-secondary [a&]:hover:bg-secondary/90",
        destructive:
          "bg-error text-on-error focus-visible:outline-error/20 dark:bg-error/60 dark:focus-visible:outline-error/40 [a&]:hover:bg-error/90",
        outline:
          "border-border-subtle text-on-surface [a&]:hover:bg-surface-container [a&]:hover:text-on-surface",
        ghost: "[a&]:hover:bg-surface-container [a&]:hover:text-on-surface",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        urgency: "bg-urgency-alert text-white [a&]:hover:bg-urgency-alert/90",
        "status-nueva": "bg-surface-container text-on-surface-variant",
        "status-progreso": "bg-tertiary-fixed text-on-tertiary-fixed-variant",
        "status-revision": "bg-yellow-100 text-yellow-800",
        "status-completada": "bg-secondary-container text-on-secondary-container",
        "status-cancelada": "bg-error-container text-on-error-container",
        "status-pendiente": "bg-surface-container-high text-on-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
