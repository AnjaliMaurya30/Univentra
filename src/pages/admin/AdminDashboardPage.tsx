import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, CartesianGrid } from 'recharts';
import { Users, CalendarDays, Building2, ChartNoAxesCombined } from 'lucide-react';
import { toast } from 'sonner';

import { LoadingScreen } from '@/components/common/loading-screen';
import { MetricCard } from '@/components/common/metric-card';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { OrganizerDashboardPage } from '@/pages/admin/OrganizerDashboardPage';
import { platformService } from '@/services/platform-service';

const CampusAdminDashboard = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard', profile?.id],
    queryFn: () => platformService.getAdminDashboard(profile!.id),
    enabled: Boolean(profile?.id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'approved' | 'rejected' }) =>
      platformService.updateEventStatus(eventId, status, profile?.id),
    onSuccess: async () => {
      toast.success('Event review updated.');
      await queryClient.invalidateQueries({ queryKey: ['admin-dashboard', profile?.id] });
      await queryClient.invalidateQueries({ queryKey: ['managed-events', profile?.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (dashboardQuery.isLoading) {
    return <LoadingScreen message="Loading admin analytics..." />;
  }

  const dashboard = dashboardQuery.data;
  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin overview"
        title="Campus analytics dashboard"
        description="Monitor participation, event approvals, club growth, and attendance activity in real time."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent="warm" icon={<Users className="h-5 w-5 text-brand-orange" />} label="Total students" value={dashboard.metrics.totalStudents} />
        <MetricCard accent="purple" icon={<CalendarDays className="h-5 w-5 text-brand-purple" />} label="Total events" value={dashboard.metrics.totalEvents} />
        <MetricCard accent="blue" icon={<Building2 className="h-5 w-5 text-brand-blue" />} label="Active clubs" value={dashboard.metrics.activeClubs} />
        <MetricCard accent="warm" icon={<ChartNoAxesCombined className="h-5 w-5 text-brand-orange" />} label="Avg. participation" value={`${dashboard.metrics.averageParticipation}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Participation trend</h3>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={dashboard.participationTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#EAEAEA" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="participants" stroke="#7A4DFF" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Events by category</h3>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={dashboard.eventsByCategory} dataKey="value" innerRadius={70} outerRadius={110}>
                  {dashboard.eventsByCategory.map((entry, index) => (
                    <Cell fill={['#FFB800', '#7A4DFF', '#1F7DFF', '#FF4DBA', '#49D6FF'][index % 5]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Top clubs by membership</h3>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={dashboard.topClubs}>
                <CartesianGrid strokeDasharray="4 4" stroke="#EAEAEA" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#1F7DFF" radius={[14, 14, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Pending approvals</h3>
          <div className="mt-5 space-y-4">
            {dashboard.pendingEvents.map((event) => (
              <div className="rounded-[24px] bg-surface-muted p-4" key={event.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Badge variant="secondary">Pending</Badge>
                    <p className="mt-3 font-display text-2xl font-semibold text-ink">{event.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{event.short_description}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => statusMutation.mutate({ eventId: event.id, status: 'approved' })} size="sm">
                      Approve
                    </Button>
                    <Button onClick={() => statusMutation.mutate({ eventId: event.id, status: 'rejected' })} size="sm" variant="danger">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const AdminDashboardPage = () => {
  const { role } = useAuth();
  return role === 'organizer' ? <OrganizerDashboardPage /> : <CampusAdminDashboard />;
};
