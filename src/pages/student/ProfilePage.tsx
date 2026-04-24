import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Award, GraduationCap, Mail, Star } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

import { Avatar, Badge, Button, Card, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from '@/components/ui';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { useAuth } from '@/hooks/use-auth';
import { profileSchema } from '@/schemas/profile';
import { platformService } from '@/services/platform-service';

export const ProfilePage = () => {
  const { profile, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const summaryQuery = useQuery({
    queryKey: ['profile-summary', profile?.id],
    queryFn: () => platformService.getProfileSummary(profile!.id),
    enabled: Boolean(profile?.id),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name ?? '',
      department: profile?.department ?? '',
      year_of_study: profile?.year_of_study ?? '',
      bio: profile?.bio ?? '',
      favorite_category: profile?.favorite_category ?? '',
      interests: profile?.interests.join(', ') ?? '',
    },
  });

  if (summaryQuery.isLoading || !profile) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  const summary = summaryQuery.data;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Your student profile"
        description="Showcase your campus identity, achievements, participation, and club involvement."
        action={
          <Button onClick={() => setOpen(true)} variant="secondary">
            Edit profile
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-[28px]" name={profile.full_name} src={profile.avatar_url} />
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink">{profile.full_name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{profile.department} • {profile.year_of_study}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="default">{profile.favorite_category ?? 'Explore mode'}</Badge>
                <Badge variant="secondary">Rank #{profile.rank_cache}</Badge>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm leading-7 text-ink-soft">{profile.bio}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-surface-muted p-4">
              <Mail className="h-5 w-5 text-brand-orange" />
              <p className="mt-3 text-sm text-ink-soft">Email</p>
              <p className="font-medium text-ink">{profile.email}</p>
            </div>
            <div className="rounded-[24px] bg-surface-muted p-4">
              <GraduationCap className="h-5 w-5 text-brand-purple" />
              <p className="mt-3 text-sm text-ink-soft">Participation rate</p>
              <p className="font-medium text-ink">{profile.participation_rate}%</p>
            </div>
            <div className="rounded-[24px] bg-surface-muted p-4">
              <Star className="h-5 w-5 text-brand-blue" />
              <p className="mt-3 text-sm text-ink-soft">Total XP</p>
              <p className="font-medium text-ink">{profile.total_xp}</p>
            </div>
            <div className="rounded-[24px] bg-surface-muted p-4">
              <Award className="h-5 w-5 text-brand-orange" />
              <p className="mt-3 text-sm text-ink-soft">Total hours</p>
              <p className="font-medium text-ink">{profile.total_hours} hrs</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-2xl font-semibold text-ink">Badges</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {summary.badges.map((badge) => (
                <div className="rounded-full px-4 py-2 text-sm font-semibold" key={badge.id} style={{ backgroundColor: `${badge.badge_color}1A`, color: badge.badge_color }}>
                  {badge.name}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-2xl font-semibold text-ink">Joined clubs</h3>
            <div className="mt-5 grid gap-3">
              {summary.joinedClubs.map((club) => (
                <div className="rounded-[24px] bg-surface-muted px-4 py-3" key={club.id}>
                  <p className="font-medium text-ink">{club.name}</p>
                  <p className="text-sm text-ink-soft">{club.category}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-2xl font-semibold text-ink">Recent achievements</h3>
            <div className="mt-5 space-y-3">
              {summary.recentAchievements.map((achievement) => (
                <div className="rounded-[24px] bg-surface-muted px-4 py-3" key={achievement.id}>
                  <p className="font-medium text-ink">{achievement.description}</p>
                  <p className="text-sm text-ink-soft">+{achievement.xp_change} XP</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update how your campus profile appears across Univentra.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await updateProfile({
                  full_name: values.full_name,
                  department: values.department,
                  year_of_study: values.year_of_study,
                  bio: values.bio,
                  favorite_category: values.favorite_category,
                  interests: values.interests.split(',').map((item) => item.trim()).filter(Boolean),
                });
                toast.success('Profile updated.');
                setOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Unable to update profile.');
              }
            })}
          >
            <Input placeholder="Full name" {...form.register('full_name')} />
            <Input placeholder="Department" {...form.register('department')} />
            <Input placeholder="Year of study" {...form.register('year_of_study')} />
            <Input placeholder="Favorite category" {...form.register('favorite_category')} />
            <Input placeholder="Interests, comma separated" {...form.register('interests')} />
            <Textarea placeholder="Short bio" {...form.register('bio')} />
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
