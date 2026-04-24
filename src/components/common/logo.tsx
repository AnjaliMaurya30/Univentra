import { Link } from 'react-router-dom';

import { APP_NAME } from '@/lib/constants/app';
import { cn } from '@/lib/utils/cn';

export const Logo = ({ className, compact = false }: { className?: string; compact?: boolean }) => (
  <Link className={cn('inline-flex items-center gap-3', className)} to="/">
    <img alt="Univentra" className="h-11 w-11 rounded-2xl shadow-soft" src="/brand/univentra-mark.svg" />
    {!compact ? (
      <div>
        <p className="font-display text-lg font-semibold leading-none text-ink">{APP_NAME}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-faint">Campus engagement OS</p>
      </div>
    ) : null}
  </Link>
);
