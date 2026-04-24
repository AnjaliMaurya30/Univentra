import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-sm" />
    <DialogPrimitive.Content
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-white/70 bg-white p-6 shadow-float',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-5 top-5 rounded-full p-2 text-ink-soft transition hover:bg-surface-muted">
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 space-y-1', className)} {...props} />
);

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display text-2xl font-semibold text-ink', className)} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-ink-soft', className)} {...props} />
);
