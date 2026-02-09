
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginModal from '@/components/LoginModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show nothing or a loader while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, show the login modal instead of the protected content
  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Admin Access Required</h2>
                <p className="text-slate-600 mb-6">Please sign in to access the dashboard.</p>
                <div className="max-w-md mx-auto">
                    <LoginModal onClose={() => {}} /> 
                </div>
            </div>
        </div>
    );
  }

  // If authenticated, render the child components (Admin Layout/Pages)
  return children;
};

export default ProtectedRoute;
