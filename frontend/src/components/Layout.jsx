import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Button from './Button';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide back button on dashboard page to prevent going back to login or out of app flow
  // Also assume login/landing pages might not use this layout, but if they do, we can add checks.
  // We check if the path ends with /dashboard.
  const isDashboard = location.pathname.endsWith('/dashboard');
  const isRoot = location.pathname === '/' || location.pathname.endsWith('/login') || location.pathname.endsWith('/register');

  const showBackButton = !isDashboard && !isRoot;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mt-4 flex-1">
        {showBackButton && (
          <div className="mb-4">
             <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm py-1 px-3"
             >
                <span>←</span> Back
             </Button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
