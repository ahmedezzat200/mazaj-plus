import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ requireOnboarded = false, blockOnboarded = false, requireAdmin = false }: { requireOnboarded?: boolean, blockOnboarded?: boolean, requireAdmin?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireOnboarded && user.onboarding_complete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (blockOnboarded && user.onboarding_complete === true) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
