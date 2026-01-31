import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginModal from '@/components/LoginModal';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!user) {
    // Instead of redirecting immediately, we can show the login modal
    // Or simply redirect to home. Given the requirement is to "hide" admin access, 
    // redirecting to 404 or home might be safer, but showing login on the specific URL is also standard.
    // For "hidden" admin page, standard practice is usually show login form ON that page.
    // Since we have a modal, we'll just render the modal.
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Admin Access Required</h2>
                <p className="text-slate-600 mb-6">Please authenticate to continue.</p>
                <LoginModal onClose={() => {}} /> {/* Cannot close without logging in */}
            </div>
        </div>
    );
  }

  return children;
};

export default ProtectedRoute;