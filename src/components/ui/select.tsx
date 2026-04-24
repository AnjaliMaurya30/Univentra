import * as React from 'react';

import { cn } from '@/lib/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border border-surface-soft bg-white/85 px-4 text-sm text-ink shadow-soft transition-all duration-200 focus:border-brand/60 focus:ring-4 focus:ring-brand/10',
        className,
      )}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = 'Select';
