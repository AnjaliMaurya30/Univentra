import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils/cn';

export const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <ProgressPrimitive.Root className={cn('h-3 w-full overflow-hidden rounded-full bg-surface-soft', className)} value={value}>
    <ProgressPrimitive.Indicator
      className="h-full rounded-full bg-gradient-warm transition-all duration-700 ease-out"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </ProgressPrimitive.Root>
);
