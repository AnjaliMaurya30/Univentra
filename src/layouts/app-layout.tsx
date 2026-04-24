import { AppShell } from '@/components/common/app-shell';
import { useAuth } from '@/hooks/use-auth';

export const StudentLayout = () => <AppShell mode="student" />;

export const ControlPanelLayout = () => {
  const { role } = useAuth();
  return <AppShell mode={role === 'admin' ? 'admin' : 'organizer'} />;
};
