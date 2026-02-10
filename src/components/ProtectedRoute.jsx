
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a loading spinner while we determine auth state
  // This prevents flashing the login screen or content prematurely
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // CRITICAL: If not authenticated, redirect to /login immediately
  // We pass 'state' so we can redirect back to the requested page after login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
