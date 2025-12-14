import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  budgetType: string;
  budgetAmount?: number;
  locationType: string;
  createdAt: string;
}

export const ProjectsFeed: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      const data = response.data.data?.items || response.data.data || [];
      // Filter to show only OPEN projects
      const openProjects = data.filter((p: Project) => p.status === 'OPEN');
      setProjects(openProjects);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading projects...</div>;
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
        <h1 className="text-3xl font-bold text-gray-900">Discover Projects</h1>
        <p className="mt-2 text-gray-600">Browse available projects and submit your bids</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No open projects available at the moment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/freelancer/projects/${project.id}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">{project.description}</p>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{project.category}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{project.locationType}</span>
                    {project.budgetAmount && (
                      <span>
                        {project.budgetType === 'FIXED' ? '$' : ''}
                        {project.budgetAmount}
                        {project.budgetType === 'HOURLY' ? '/hr' : ''}
                      </span>
                    )}
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

