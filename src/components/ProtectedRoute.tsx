import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

// Fallback role for demo when role is missing
const FALLBACK_ROLE = 'pharmacy';

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  // Show loading ONLY briefly during initial auth check
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

  // If not authenticated, redirect to auth page
  if (!user) {
    console.log('No user - redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Use actual role or fallback - NEVER block
  const effectiveRole = role || FALLBACK_ROLE;
  console.log('ProtectedRoute - effective role:', effectiveRole);

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes: Record<string, string> = {
      manufacturer: '/manufacturer',
      distributor: '/distributor',
      pharmacy: '/pharmacy',
      admin: '/admin',
      consumer: '/verify',
    };
    return <Navigate to={roleRoutes[effectiveRole] || '/'} replace />;
  }

  return <>{children}</>;
};
