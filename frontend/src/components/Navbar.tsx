import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return user.role === 'BUSINESS' ? '/business/dashboard' : '/freelancer/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? getDashboardPath() : '/'} className="flex items-center">
              <span className="text-2xl font-bold text-primary">Contentify</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/conversations"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Notifications
                </Link>
                <span className="text-gray-700 px-3 py-2 text-sm">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

