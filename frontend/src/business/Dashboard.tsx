import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const BusinessDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalBids: 0,
    activeEngagements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, engagementsRes] = await Promise.all([
          api.get('/businesses/me/projects'),
          api.get('/businesses/me/engagements'),
        ]);

        const projects = projectsRes.data.data?.items || projectsRes.data.data || [];
        const engagements = engagementsRes.data.data?.items || engagementsRes.data.data || [];

        const activeProjects = projects.filter((p: any) => 
          ['OPEN', 'IN_PROGRESS'].includes(p.status)
        ).length;

        const activeEngagements = engagements.filter((e: any) => 
          ['ACTIVE', 'NEGOTIATION'].includes(e.status)
        ).length;

        // Count total bids across all projects
        let totalBids = 0;
        for (const project of projects) {
          try {
            const bidsRes = await api.get(`/projects/${project.id}/bids`);
            const bids = bidsRes.data.data?.items || bidsRes.data.data || [];
            totalBids += bids.length;
          } catch (err) {
            // Ignore errors for individual project bids
          }
        }

        setStats({
          activeProjects,
          totalBids,
          activeEngagements,
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
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your projects and engagements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.activeProjects}</p>
          <Link
            to="/business/projects"
            className="mt-4 text-sm text-primary hover:text-opacity-80"
          >
            View all projects →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Bids Received</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.totalBids}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Engagements</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.activeEngagements}</p>
          <Link
            to="/business/engagements"
            className="mt-4 text-sm text-primary hover:text-opacity-80"
          >
            View engagements →
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/business/projects/create"
          className="btn-primary inline-block"
        >
          Create New Project
        </Link>
      </div>
    </div>
  );
};

