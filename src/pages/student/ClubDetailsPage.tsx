import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { EventCard } from '@/components/events/event-card';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const ClubDetailsPage = () => {
  const { slug = '' } = useParams();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const clubQuery = useQuery({
    queryKey: ['club', slug, profile?.id],
    queryFn: () => platformService.getClubBySlug(slug, profile?.id),
  });

  const announcementsQuery = useQuery({
    queryKey: ['announcements', profile?.id],
    queryFn: () => platformService.getAnnouncements(profile?.id),
    enabled: Boolean(profile?.id),
  });

  const joinMutation = useMutation({
    mutationFn: () => platformService.joinClub(profile!.id, clubQuery.data!.id),
    onSuccess: async () => {
      toast.success('Club joined successfully.');
      await queryClient.invalidateQueries({ queryKey: ['club', slug, profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['clubs', profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['profile-summary', profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (clubQuery.isLoading) {
    return <LoadingScreen message="Opening club profile..." />;
  }

  const club = clubQuery.data;
  if (!club) return null;

  const clubAnnouncements = (announcementsQuery.data ?? []).filter(
    (announcement) => announcement.target_type === 'club' && announcement.target_id === club.id,
  );

  return (
    <div className="space-y-6">
      <div className="surface-panel grid gap-6 bg-hero-grid p-6 md:p-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <Badge variant={club.category === 'Technology' ? 'purple' : 'default'}>{club.category}</Badge>
          <PageHeader
            className="mt-4"
            description={club.description}
            title={club.name}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {!club.isJoined ? (
              <Button disabled={joinMutation.isPending} onClick={() => joinMutation.mutate()}>
                Join club
              </Button>
            ) : (
              <Button variant="secondary">Member</Button>
            )}
            <Badge variant="secondary">{club.member_count_cache} members</Badge>
          </div>
        </div>
        <div className="grid gap-4">
          <Card className="bg-white/90">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14" name={club.featuredCoordinator?.full_name} src={club.featuredCoordinator?.avatar_url} />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Featured coordinator</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">{club.featuredCoordinator?.full_name ?? 'Club lead'}</p>
                <p className="text-sm text-ink-soft">{club.featuredCoordinator?.department}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/90">
            <div className="grid gap-3 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-orange" />
                <span>{club.member_count_cache} active members</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-brand-orange" />
                <span>{club.upcomingEvents.length} upcoming events</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <h2 className="font-display text-2xl font-semibold text-ink">Club announcements</h2>
          <div className="mt-5 space-y-4">
            {clubAnnouncements.length === 0 ? (
              <p className="text-sm text-ink-soft">No club-specific announcements yet.</p>
            ) : (
              clubAnnouncements.map((announcement) => (
                <div className="rounded-[24px] bg-surface-muted p-4" key={announcement.id}>
                  <p className="font-medium text-ink">{announcement.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{announcement.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-2xl font-semibold text-ink">Past highlights</h2>
          <div className="mt-5 space-y-4">
            {club.pastEvents.slice(0, 4).map((event) => (
              <div className="rounded-[24px] bg-surface-muted p-4" key={event.id}>
                <p className="font-medium text-ink">{event.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{event.short_description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <PageHeader
          eyebrow="Upcoming"
          title="Club events"
          description="The next experiences created by this community."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {club.upcomingEvents.map((event) => (
            <EventCard event={{ ...event }} href={`/app/events/${event.slug}`} key={event.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
