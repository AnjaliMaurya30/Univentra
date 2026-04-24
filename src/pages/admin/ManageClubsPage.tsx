import { useQuery } from '@tanstack/react-query';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Avatar, Badge, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const ManageClubsPage = () => {
  const { profile } = useAuth();
  const clubsQuery = useQuery({
    queryKey: ['clubs-admin', profile?.id],
    queryFn: () => platformService.getClubs(profile?.id),
  });

  if (clubsQuery.isLoading) {
    return <LoadingScreen message="Loading clubs overview..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Club management"
        title="Manage clubs"
        description="Monitor membership, coordinators, and the events each club is bringing to campus."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clubsQuery.data?.map((club) => (
          <Card key={club.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant={club.category === 'Technology' ? 'purple' : 'default'}>{club.category}</Badge>
                <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{club.name}</h3>
              </div>
              <Badge variant="secondary">{club.member_count_cache} members</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{club.description}</p>
            <div className="mt-5 flex items-center gap-3 rounded-[24px] bg-surface-muted p-4">
              <Avatar name={club.featuredCoordinator?.full_name} src={club.featuredCoordinator?.avatar_url} />
              <div>
                <p className="font-medium text-ink">{club.featuredCoordinator?.full_name ?? 'No coordinator assigned'}</p>
                <p className="text-sm text-ink-soft">{club.upcomingEvents.length} upcoming events</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
