import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Engagement {
  id: number;
  status: string;
  paymentStatus: string;
  project: {
    id: number;
    title: string;
  };
  freelancer: {
    id: number;
    email: string;
  };
  createdAt: string;
}

export const EngagementList: React.FC = () => {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/businesses/me/engagements');
      const data = response.data.data?.items || response.data.data || [];
      setEngagements(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load engagements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading engagements...</div>;
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
        <h1 className="text-3xl font-bold text-gray-900">My Engagements</h1>
        <p className="mt-2 text-gray-600">Manage your active projects and freelancers</p>
      </div>

      {engagements.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No engagements yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {engagements.map((engagement) => (
            <Link
              key={engagement.id}
              to={`/business/engagements/${engagement.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {engagement.project.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Freelancer: {engagement.freelancer.email}
                  </p>
                  <div className="mt-4 flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      engagement.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      engagement.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      engagement.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {engagement.status}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      engagement.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      engagement.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Payment: {engagement.paymentStatus}
                    </span>
                  </div>
                </div>
                <span className="text-primary">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

