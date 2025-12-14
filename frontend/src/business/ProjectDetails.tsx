import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Bid {
  id: number;
  bidAmount: number;
  bidType: string;
  proposedTimelineDays: number;
  status: string;
  freelancer: {
    id: number;
    email: string;
    freelancerProfile?: {
      city?: string;
      category?: string;
    };
  };
  createdAt: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  budgetType: string;
  budgetAmount?: number;
  createdAt: string;
}

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchBids();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/projects/${id}/bids`);
      const data = response.data.data?.items || response.data.data || [];
      setBids(data);
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };

  const handleBidAction = async (bidId: number, action: 'shortlist' | 'reject' | 'accept') => {
    try {
      if (action === 'accept') {
        await api.post(`/bids/${bidId}/accept`);
        navigate('/business/engagements');
      } else {
        await api.post(`/bids/${bidId}/${action}`);
        fetchBids();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} bid`);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/business/projects')}
          className="text-primary hover:text-opacity-80 mb-4"
        >
          ← Back to Projects
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <p className="mt-2 text-gray-600">{project.description}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded">{project.category}</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{project.status}</span>
          {project.budgetAmount && (
            <span>
              {project.budgetType === 'FIXED' ? '$' : ''}
              {project.budgetAmount}
              {project.budgetType === 'HOURLY' ? '/hr' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Bids Received ({bids.length})</h2>
        
        {bids.length === 0 ? (
          <p className="text-gray-500">No bids yet</p>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {bid.freelancer.email}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        bid.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <strong>Bid Amount:</strong> ${bid.bidAmount} ({bid.bidType})
                    </p>
                    <p className="text-gray-600">
                      <strong>Timeline:</strong> {bid.proposedTimelineDays} days
                    </p>
                    {bid.freelancer.freelancerProfile?.city && (
                      <p className="text-gray-600">
                        <strong>Location:</strong> {bid.freelancer.freelancerProfile.city}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {bid.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => handleBidAction(bid.id, 'shortlist')}
                          className="btn-secondary text-sm"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'accept')}
                          className="btn-primary text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'reject')}
                          className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {bid.status === 'SHORTLISTED' && (
                      <>
                        <button
                          onClick={() => handleBidAction(bid.id, 'accept')}
                          className="btn-primary text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'reject')}
                          className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

