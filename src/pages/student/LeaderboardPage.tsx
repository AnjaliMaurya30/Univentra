import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { LeaderboardPodium } from '@/components/leaderboard/podium';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Avatar, Badge, Card, Input } from '@/components/ui';
import { platformService } from '@/services/platform-service';

export const LeaderboardPage = () => {
  const [search, setSearch] = useState('');
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => platformService.getLeaderboard(),
  });

  if (leaderboardQuery.isLoading) {
    return <LoadingScreen message="Ranking campus champions..." />;
  }

  const entries = (leaderboardQuery.data ?? []).filter((entry) =>
    [entry.profile.full_name, entry.profile.department, entry.profile.favorite_category]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leaderboard"
        title="Campus momentum board"
        description="Live XP rankings powered by attendance, registrations, club activity, and badge unlocks."
      />

      <LeaderboardPodium topThree={entries.slice(0, 3)} />

      <div className="surface-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input className="pl-11" onChange={(event) => setSearch(event.target.value)} placeholder="Search participants" value={search} />
        </div>
      </div>

      <div className="grid gap-4">
        {entries.map((entry, index) => (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={entry.profile.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted font-display text-xl font-semibold text-ink">
                #{index + 1}
              </div>
              <Avatar className="h-12 w-12" name={entry.profile.full_name} src={entry.profile.avatar_url} />
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{entry.profile.full_name}</p>
                <p className="text-sm text-ink-soft">{entry.profile.department}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{entry.attendedEvents} attended</Badge>
              <Badge variant="purple">{entry.badges.length} badges</Badge>
              <div className="rounded-2xl bg-gradient-warm px-4 py-3 text-sm font-semibold text-brand-foreground">
                {entry.profile.total_xp} XP
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
