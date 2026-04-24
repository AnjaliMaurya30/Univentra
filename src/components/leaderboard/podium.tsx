import { Crown, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

import { Avatar, Badge, Card } from '@/components/ui';
import type { LeaderboardEntry } from '@/types';

export const LeaderboardPodium = ({
  topThree,
}: {
  topThree: LeaderboardEntry[];
}) => {
  const [first, second, third] = topThree;

  const tiles = [
    first
      ? {
          entry: first,
          height: 'md:h-[320px]',
          accent: 'bg-gradient-warm',
          icon: <Crown className="h-5 w-5" />,
          label: '1st',
        }
      : null,
    second
      ? {
          entry: second,
          height: 'md:h-[270px]',
          accent: 'bg-gradient-cool',
          icon: <Trophy className="h-5 w-5" />,
          label: '2nd',
        }
      : null,
    third
      ? {
          entry: third,
          height: 'md:h-[245px]',
          accent: 'bg-gradient-pop',
          icon: <Sparkles className="h-5 w-5" />,
          label: '3rd',
        }
      : null,
  ].filter(Boolean) as Array<{
    entry: LeaderboardEntry;
    height: string;
    accent: string;
    icon: React.ReactNode;
    label: string;
  }>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tiles.map((tile, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={index === 0 ? 'lg:order-2' : index === 1 ? 'lg:order-1' : 'lg:order-3'}
          initial={{ opacity: 0, y: 28 }}
          key={tile.entry.profile.id}
          transition={{ delay: index * 0.12, duration: 0.4 }}
        >
          <Card className={`flex h-full flex-col justify-end overflow-hidden ${tile.height}`}>
            <div className={`absolute inset-x-0 top-0 h-36 ${tile.accent} opacity-85`} />
            <div className="relative mt-auto space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{tile.label}</Badge>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-ink shadow-soft">
                  {tile.icon}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14" name={tile.entry.profile.full_name} src={tile.entry.profile.avatar_url} />
                <div>
                  <p className="font-display text-2xl font-semibold text-ink">{tile.entry.profile.full_name}</p>
                  <p className="text-sm text-ink-soft">{tile.entry.profile.department}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[24px] bg-white/85 p-4 shadow-soft">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">Campus XP</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink">{tile.entry.profile.total_xp}</p>
                </div>
                <div className="text-right text-sm text-ink-soft">
                  <p>{tile.entry.attendedEvents} attended</p>
                  <p>{tile.entry.badges.length} badges</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
