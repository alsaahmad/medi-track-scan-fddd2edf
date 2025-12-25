import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading, authError } = useAuth();

  // Show loading ONLY while auth is actively being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If there was an auth error or timeout, redirect to auth
  if (authError) {
    console.warn('Auth error detected:', authError);
    return <Navigate to="/auth" state={{ error: authError }} replace />;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    console.log('No user found - redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // CRITICAL: If loading is done and role is missing, redirect to auth
  // Do NOT wait indefinitely for role
  if (allowedRoles && !role) {
    console.warn('User authenticated but role missing - redirecting to auth');
    return <Navigate to="/auth" state={{ error: 'Profile setup incomplete. Please sign in again.' }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes: Record<string, string> = {
      manufacturer: '/manufacturer',
      distributor: '/distributor',
      pharmacy: '/pharmacy',
      admin: '/admin',
      consumer: '/verify',
    };
    return <Navigate to={roleRoutes[role] || '/'} replace />;
  }

  return <>{children}</>;
};
