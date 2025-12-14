import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'BUSINESS' | 'FREELANCER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, fetchMe, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user && !isLoading) {
      fetchMe().catch(() => {
        // If fetchMe fails, user is not authenticated
      });
    }
  }, [user, isLoading, fetchMe]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'BUSINESS' ? '/business/dashboard' : '/freelancer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

