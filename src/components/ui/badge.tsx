import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
  {
    variants: {
      variant: {
        default: 'bg-brand/15 text-brand-foreground',
        secondary: 'bg-surface-muted text-ink-soft',
        success: 'bg-success/15 text-success',
        purple: 'bg-brand-purple/15 text-brand-purple',
        blue: 'bg-brand-blue/15 text-brand-blue',
        pink: 'bg-brand-pink/15 text-brand-pink',
        danger: 'bg-danger/15 text-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);
