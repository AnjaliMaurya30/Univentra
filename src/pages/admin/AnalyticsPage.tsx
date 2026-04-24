import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { platformService } from '@/services/platform-service';

export const AnalyticsPage = () => {
  const { profile } = useAuth();
  const analyticsQuery = useQuery({
    queryKey: ['admin-dashboard', profile?.id],
    queryFn: () => platformService.getAdminDashboard(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (analyticsQuery.isLoading) {
    return <LoadingScreen message="Loading analytics workspace..." />;
  }

  const analytics = analyticsQuery.data;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Participation insights"
        description="Use real event performance data to understand what your campus responds to best."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Hosted events per month</h3>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={analytics.eventsByMonth}>
                <CartesianGrid strokeDasharray="4 4" stroke="#EAEAEA" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hosted" fill="#7A4DFF" radius={[14, 14, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-2xl font-semibold text-ink">Top performing events</h3>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={analytics.topEvents} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" stroke="#EAEAEA" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="registrations" fill="#FFB800" radius={[0, 14, 14, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-display text-2xl font-semibold text-ink">Attendance summary</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {analytics.attendanceSummary.map((entry) => (
            <div className="rounded-[24px] bg-surface-muted p-5" key={entry.label}>
              <p className="text-sm text-ink-soft">{entry.label}</p>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">{entry.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
