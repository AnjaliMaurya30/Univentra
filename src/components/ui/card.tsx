import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('surface-card p-5 md:p-6', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display text-lg font-semibold text-ink md:text-xl', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm leading-6 text-ink-soft', className)} {...props} />
);
