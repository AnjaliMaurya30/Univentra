export const LoadingScreen = ({ message = 'Loading Univentra...' }: { message?: string }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5">
    <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
    <div className="text-center">
      <p className="font-display text-xl font-semibold text-ink">{message}</p>
      <p className="mt-1 text-sm text-ink-soft">Syncing your campus workspace.</p>
    </div>
  </div>
);
