import { ArrowUpRight } from 'lucide-react';

import { Card, CardDescription, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export const MetricCard = ({
  label,
  value,
  hint,
  icon,
  accent = 'warm',
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: 'warm' | 'blue' | 'purple';
  className?: string;
}) => {
  const accentClass =
    accent === 'blue'
      ? 'from-brand-blue/20 to-brand-cyan/20'
      : accent === 'purple'
        ? 'from-brand-purple/20 to-brand-pink/20'
        : 'from-brand/20 to-brand-orange/20';

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className={cn('absolute inset-x-0 top-0 h-28 rounded-b-[2rem] bg-gradient-to-br', accentClass)} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-soft">{label}</p>
          <CardTitle className="mt-3 text-3xl md:text-4xl">{value}</CardTitle>
          {hint ? <CardDescription className="mt-2">{hint}</CardDescription> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft">
          {icon ?? <ArrowUpRight className="h-5 w-5 text-ink" />}
        </div>
      </div>
    </Card>
  );
};
