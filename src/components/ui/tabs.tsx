import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn('inline-flex rounded-full bg-surface-muted p-1.5 shadow-soft', className)}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-soft',
      className,
    )}
    {...props}
  />
);

export const TabsContent = TabsPrimitive.Content;
