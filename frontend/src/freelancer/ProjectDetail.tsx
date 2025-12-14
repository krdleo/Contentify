import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const bidSchema = z.object({
  bidAmount: z.number().min(1, 'Bid amount must be greater than 0'),
  bidType: z.enum(['FIXED', 'HOURLY']),
  proposedTimelineDays: z.number().min(1, 'Timeline must be at least 1 day'),
});

type BidFormData = z.infer<typeof bidSchema>;

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

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bidType: 'FIXED',
    },
  });

  useEffect(() => {
    if (id) {
      fetchProject();
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

  const onSubmitBid = async (data: BidFormData) => {
    try {
      setSubmitting(true);
      setBidError('');
      await api.post(`/projects/${id}/bids`, data);
      alert('Bid submitted successfully!');
      navigate('/freelancer/bids');
    } catch (err: any) {
      setBidError(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/freelancer/projects')}
          className="text-primary hover:text-opacity-80 mb-4"
        >
          ← Back to Projects
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <p className="mt-2 text-gray-600">{project.description}</p>
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

      {project.status === 'OPEN' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Submit a Bid</h2>
          {bidError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {bidError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmitBid)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="FIXED"
                    {...register('bidType')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Fixed Price</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="HOURLY"
                    {...register('bidType')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Hourly Rate</span>
                </label>
              </div>
            </div>

            <FormInput
              label="Bid Amount"
              type="number"
              step="0.01"
              error={errors.bidAmount?.message}
              {...register('bidAmount', { valueAsNumber: true })}
            />

            <FormInput
              label="Proposed Timeline (days)"
              type="number"
              error={errors.proposedTimelineDays?.message}
              {...register('proposedTimelineDays', { valueAsNumber: true })}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

