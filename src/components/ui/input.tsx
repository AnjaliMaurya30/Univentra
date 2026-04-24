import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-12 w-full rounded-2xl border border-surface-soft bg-white/85 px-4 text-sm text-ink placeholder:text-ink-faint shadow-soft transition-all duration-200 focus:border-brand/60 focus:ring-4 focus:ring-brand/10',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
