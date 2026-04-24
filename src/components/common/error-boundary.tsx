import { Component, type PropsWithChildren } from 'react';

import { Button } from '@/components/ui';

export class ErrorBoundary extends Component<
  PropsWithChildren,
  {
    hasError: boolean;
  }
> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="surface-card max-w-xl p-8 text-center">
            <h1 className="font-display text-4xl font-semibold text-ink">Something slipped off-track</h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Refresh the app to try again. If the issue keeps happening, double-check your Supabase setup and seed data.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Refresh app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
