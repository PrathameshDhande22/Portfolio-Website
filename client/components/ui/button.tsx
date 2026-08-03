import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border font-semibold whitespace-nowrap no-underline transition-[background-color,border-color,color,opacity,transform] duration-200 ease-smooth outline-none select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-accent bg-accent text-accent-ink hover:-translate-y-px hover:opacity-90",
        secondary: "border-line bg-surface text-ink hover:-translate-y-px hover:border-ink-3",
        tertiary: "border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
        info: "border-accent-soft bg-accent-soft text-accent hover:-translate-y-px hover:border-accent",
        warning: "border-slab bg-slab text-slab-accent hover:-translate-y-px hover:opacity-90",
      },
      size: {
        default: "px-[1.15rem] py-[0.7rem] text-[0.9rem] [&_svg:not([class*='size-'])]:size-[15px]",
        sm: "px-3 py-2 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-9.5 p-0 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
