import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-warm px-5 py-3 text-sm text-brand-foreground shadow-[0_14px_28px_rgba(255,184,0,0.28)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(255,184,0,0.3)]',
        secondary:
          'bg-surface-muted px-5 py-3 text-sm text-ink shadow-soft hover:-translate-y-0.5 hover:bg-white',
        ghost: 'px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-muted',
        outline:
          'border border-surface-soft bg-white/80 px-5 py-3 text-sm text-ink shadow-soft hover:-translate-y-0.5 hover:border-brand/50',
        danger:
          'bg-danger px-5 py-3 text-sm text-white shadow-[0_14px_28px_rgba(230,61,69,0.22)] hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
