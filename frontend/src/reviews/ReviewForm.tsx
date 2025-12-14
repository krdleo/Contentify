import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, 'Comment is required'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  engagementId: number;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ engagementId, onSuccess }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/engagements/${engagementId}/reviews`, data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <select
          className={`input-field ${errors.rating ? 'border-red-500' : ''}`}
          {...register('rating', { valueAsNumber: true })}
        >
          <option value="">Select rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment
        </label>
        <textarea
          className={`input-field ${errors.comment ? 'border-red-500' : ''}`}
          rows={4}
          {...register('comment')}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

