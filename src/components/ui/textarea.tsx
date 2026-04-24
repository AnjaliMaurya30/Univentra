import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[120px] w-full rounded-2xl border border-surface-soft bg-white/85 px-4 py-3 text-sm text-ink placeholder:text-ink-faint shadow-soft transition-all duration-200 focus:border-brand/60 focus:ring-4 focus:ring-brand/10',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
