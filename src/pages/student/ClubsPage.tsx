import { useQuery } from '@tanstack/react-query';

import { ClubCard } from '@/components/clubs/club-card';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const ClubsPage = () => {
  const { profile } = useAuth();
  const clubsQuery = useQuery({
    queryKey: ['clubs', profile?.id],
    queryFn: () => platformService.getClubs(profile?.id),
  });

  if (clubsQuery.isLoading) {
    return <LoadingScreen message="Loading campus clubs..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communities"
        title="Find your clubs"
        description="Join communities, meet coordinators, and discover the events shaping campus culture."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clubsQuery.data?.map((club) => (
          <ClubCard club={club} href={`/app/clubs/${club.slug}`} key={club.id} />
        ))}
      </div>
    </div>
  );
};
