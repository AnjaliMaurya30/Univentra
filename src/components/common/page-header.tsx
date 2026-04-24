import { cn } from '@/lib/utils/cn';

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-orange">{eyebrow}</p>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-ink-soft">{description}</p> : null}
      </div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
