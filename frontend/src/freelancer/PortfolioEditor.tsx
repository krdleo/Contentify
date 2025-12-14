import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  mediaType: z.enum(['IMAGE', 'LINK']),
  mediaUrl: z.string().url('Invalid URL'),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

export const PortfolioEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
  });

  useEffect(() => {
    if (id) {
      fetchPortfolioItem();
    }
  }, [id]);

  const fetchPortfolioItem = async () => {
    try {
      // Get current user to get their ID
      const meResponse = await api.get('/auth/me');
      const userId = meResponse.data.data.id;
      const response = await api.get(`/freelancers/${userId}/portfolio`);
      const items = response.data.data?.items || response.data.data || [];
      const item = items.find((i: any) => i.id === Number(id));
      if (item) {
        setValue('title', item.title);
        setValue('description', item.description);
        setValue('mediaType', item.mediaType);
        setValue('mediaUrl', item.mediaUrl);
      }
    } catch (err) {
      console.error('Error fetching portfolio item:', err);
    }
  };

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      setLoading(true);
      setError('');
      if (id) {
        await api.put(`/freelancers/me/portfolio/${id}`, data);
      } else {
        await api.post('/freelancers/me/portfolio', data);
      }
      navigate('/freelancer/portfolio');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save portfolio item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        </h1>
        <p className="mt-2 text-gray-600">Showcase your work to potential clients</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FormInput
          label="Title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className={`input-field ${errors.description ? 'border-red-500' : ''}`}
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="IMAGE"
                {...register('mediaType')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Image</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="LINK"
                {...register('mediaType')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Link</span>
            </label>
          </div>
        </div>

        <FormInput
          label="Media URL"
          type="url"
          error={errors.mediaUrl?.message}
          {...register('mediaUrl')}
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update' : 'Add Item'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/freelancer/portfolio')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

