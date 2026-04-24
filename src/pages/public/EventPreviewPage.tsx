import { useParams } from 'react-router-dom';

import { EventDetailsScreen } from '@/components/events/event-details-screen';

export const EventPreviewPage = () => {
  const { slug = '' } = useParams();
  return (
    <div className="container">
      <EventDetailsScreen mode="public" slug={slug} />
    </div>
  );
};
