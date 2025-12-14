import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const disputeSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

interface DisputeFormProps {
  engagementId: number;
  onSuccess?: () => void;
}

export const DisputeForm: React.FC<DisputeFormProps> = ({ engagementId, onSuccess }) => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
  });

  const onSubmit = async (data: DisputeFormData) => {
    try {
      setLoading(true);
      setError('');
      await api.post(`/engagements/${engagementId}/disputes`, data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to raise dispute');
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

      <FormInput
        label="Reason"
        error={errors.reason?.message}
        {...register('reason')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className={`input-field ${errors.description ? 'border-red-500' : ''}`}
          rows={6}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Raise Dispute'}
      </button>
    </form>
  );
};

