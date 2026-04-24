import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/components/common/loading-screen';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/types';

export const ProtectedRoute = ({ allow }: { allow?: UserRole[] }) => {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Securing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/signin" />;
  }

  if (allow && (!role || !allow.includes(role))) {
    return <Navigate replace to={role === 'student' ? '/app' : '/admin'} />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingScreen message="Opening authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate replace to={role === 'student' ? '/app' : '/admin'} />;
  }

  return <Outlet />;
};
