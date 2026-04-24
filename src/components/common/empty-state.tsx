import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui';

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="surface-card flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-pop text-white shadow-soft">
      <Sparkles className="h-6 w-6" />
    </div>
    <div>
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">{description}</p>
    </div>
    {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
  </div>
);
