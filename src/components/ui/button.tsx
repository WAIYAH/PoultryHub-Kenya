import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

// Button variants (DESIGN_SYSTEM.md §9.1). shadcn's variant names are kept for compatibility
// with other primitives: `default` = primary (forest), `outline` = secondary action,
// `accent` = gold call to action (dark surfaces and the single hero CTA).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-standard outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-forest-950",
        accent: "bg-gold-400 text-ink-900 shadow-xs hover:bg-gold-300 active:bg-gold-500",
        outline: "border border-forest-900 bg-transparent text-forest-900 hover:bg-forest-50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-forest-200",
        "outline-inverse": "border border-white/40 bg-transparent text-white hover:bg-white/10",
        ghost: "text-ink-900 hover:bg-accent hover:text-accent-foreground",
        link: "text-forest-700 underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm has-[>svg]:px-3.5",
        default: "h-11 px-6 has-[>svg]:px-5",
        lg: "h-13 px-8 text-base has-[>svg]:px-7",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto rounded-sm px-0 has-[>svg]:px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, sets aria-busy and disables the button while keeping its label. */
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <LoaderCircle aria-hidden="true" className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
