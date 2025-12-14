import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Bid {
  id: number;
  bidAmount: number;
  bidType: string;
  proposedTimelineDays: number;
  status: string;
  project: {
    id: number;
    title: string;
  };
  createdAt: string;
}

export const MyBids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await api.get('/freelancers/me/bids');
      const data = response.data.data?.items || response.data.data || [];
      setBids(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading bids...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
        <p className="mt-2 text-gray-600">Track the status of your submitted bids</p>
      </div>

      {bids.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 mb-4">No bids yet</p>
          <Link to="/freelancer/projects" className="btn-primary">
            Discover Projects
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/freelancer/projects/${bid.project.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-primary"
                  >
                    {bid.project.title}
                  </Link>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      <strong>Bid Amount:</strong> ${bid.bidAmount} ({bid.bidType})
                    </span>
                    <span>
                      <strong>Timeline:</strong> {bid.proposedTimelineDays} days
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      bid.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                      bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

