import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const FreelancerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    openBids: 0,
    activeEngagements: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bidsRes, engagementsRes] = await Promise.all([
          api.get('/freelancers/me/bids'),
          api.get('/freelancers/me/engagements'),
        ]);

        const bids = bidsRes.data.data?.items || bidsRes.data.data || [];
        const engagements = engagementsRes.data.data?.items || engagementsRes.data.data || [];

        const openBids = bids.filter((b: any) => 
          ['SUBMITTED', 'SHORTLISTED'].includes(b.status)
        ).length;

        const activeEngagements = engagements.filter((e: any) => 
          ['ACTIVE', 'NEGOTIATION'].includes(e.status)
        ).length;

        // Count completed engagements without reviews (simplified)
        const pendingReviews = engagements.filter((e: any) => 
          e.status === 'COMPLETED'
        ).length;

        setStats({
          openBids,
          activeEngagements,
          pendingReviews,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your bids and engagements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Open Bids</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.openBids}</p>
          <Link
            to="/freelancer/bids"
            className="mt-4 text-sm text-primary hover:text-opacity-80"
          >
            View all bids →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Engagements</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.activeEngagements}</p>
          <Link
            to="/freelancer/engagements"
            className="mt-4 text-sm text-primary hover:text-opacity-80"
          >
            View engagements →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.pendingReviews}</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/freelancer/projects"
          className="btn-primary inline-block"
        >
          Discover Projects
        </Link>
      </div>
    </div>
  );
};

