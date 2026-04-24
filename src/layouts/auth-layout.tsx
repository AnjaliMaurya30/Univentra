import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/common/logo';

export const AuthLayout = () => (
  <div className="relative min-h-screen overflow-hidden px-4 py-8">
    <div className="absolute left-10 top-10 h-52 w-52 rounded-full bg-brand/25 blur-3xl" />
    <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-brand-purple/20 blur-3xl" />
    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl" />
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10">
      <div className="hidden flex-1 flex-col gap-6 lg:flex">
        <Logo />
        <div className="surface-panel grid-ambient overflow-hidden p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-orange">Univentra access</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-tight text-ink">
            Your campus. One premium engagement platform.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink-soft">
            Discover events, track your impact, unlock achievements, and manage vibrant student communities with a
            polished real-time workspace.
          </p>
        </div>
      </div>
      <div className="w-full max-w-xl flex-1">
        <Outlet />
      </div>
    </div>
  </div>
);
