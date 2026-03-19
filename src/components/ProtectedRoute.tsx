import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('officer' | 'resident')[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // If user is resident trying to access officer route, send to report
    if (user.role === 'resident') return <Navigate to="/report" replace />;
    
    // Fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
