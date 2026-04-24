import { motion } from 'framer-motion';
import { ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, CardDescription, CardTitle } from '@/components/ui';
import type { ClubView } from '@/types';

export const ClubCard = ({
  club,
  href,
}: {
  club: ClubView;
  href: string;
}) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.24 }}>
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant={club.category === 'Technology' ? 'purple' : club.category === 'Sports' ? 'blue' : 'default'}>
            {club.category}
          </Badge>
          <CardTitle className="mt-4">{club.name}</CardTitle>
          <CardDescription className="mt-2">{club.description}</CardDescription>
        </div>
        <div className="rounded-2xl bg-gradient-pop px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {club.member_count_cache} members
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <Users className="h-4 w-4" />
          <span>{club.upcomingEvents.length} upcoming events</span>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to={href}>
            Explore
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  </motion.div>
);
