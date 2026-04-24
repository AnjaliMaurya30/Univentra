import { useParams } from 'react-router-dom';

import { EventDetailsScreen } from '@/components/events/event-details-screen';

export const AdminEventDetailsPage = () => {
  const { slug = '' } = useParams();
  return <EventDetailsScreen mode="app" slug={slug} />;
};
