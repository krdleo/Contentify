import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  mediaType: string;
  mediaUrl: string;
  createdAt: string;
}

export const PortfolioList: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      // Get current user to get their ID
      const meResponse = await api.get('/auth/me');
      const userId = meResponse.data.data.id;
      const response = await api.get(`/freelancers/${userId}/portfolio`);
      const data = response.data.data?.items || response.data.data || [];
      setPortfolio(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await api.delete(`/freelancers/me/portfolio/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete portfolio item');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading portfolio...</div>;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="mt-2 text-gray-600">Showcase your work to potential clients</p>
        </div>
        <Link to="/freelancer/portfolio/edit" className="btn-primary">
          Add Portfolio Item
        </Link>
      </div>

      {portfolio.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 mb-4">No portfolio items yet</p>
          <Link to="/freelancer/portfolio/edit" className="btn-primary">
            Add Your First Portfolio Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {item.mediaType === 'IMAGE' && (
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              {item.mediaType === 'LINK' && (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-opacity-80"
                  >
                    View Link →
                  </a>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-gray-600 line-clamp-3">{item.description}</p>
              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/freelancer/portfolio/edit/${item.id}`}
                  className="btn-secondary text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

