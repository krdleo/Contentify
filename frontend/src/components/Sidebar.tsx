import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SidebarLink {
  to: string;
  label: string;
  icon?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const businessLinks: SidebarLink[] = [
    { to: '/business/dashboard', label: 'Dashboard' },
    { to: '/business/projects', label: 'My Projects' },
    { to: '/business/projects/create', label: 'Create Project' },
    { to: '/business/engagements', label: 'Engagements' },
  ];

  const freelancerLinks: SidebarLink[] = [
    { to: '/freelancer/dashboard', label: 'Dashboard' },
    { to: '/freelancer/profile', label: 'Profile' },
    { to: '/freelancer/portfolio', label: 'Portfolio' },
    { to: '/freelancer/projects', label: 'Discover Projects' },
    { to: '/freelancer/bids', label: 'My Bids' },
    { to: '/freelancer/engagements', label: 'Engagements' },
  ];

  const links = user?.role === 'BUSINESS' ? businessLinks : freelancerLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

