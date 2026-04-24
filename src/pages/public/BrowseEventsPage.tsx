import { EventsExplorerScreen } from '@/components/events/events-explorer-screen';

export const BrowseEventsPage = () => (
  <div className="container">
    <EventsExplorerScreen
      description="Browse upcoming campus experiences across technology, culture, sports, workshops, and more."
      mode="public"
      title="Browse campus events"
    />
  </div>
);
