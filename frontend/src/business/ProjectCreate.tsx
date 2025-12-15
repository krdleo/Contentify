import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
});

const projectSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    budgetType: z.enum(['FIXED', 'HOURLY']),
    budgetAmount: z.number().min(1, 'Budget amount must be greater than 0'),
    locationType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']),
    visibility: z.enum(['PUBLIC', 'INVITE_ONLY']),
    deadline: z.string().optional(),
    milestones: z.array(milestoneSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.budgetType === 'FIXED') {
      const milestones = data.milestones || [];
      if (milestones.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Add at least one milestone for fixed price projects',
          path: ['milestones'],
        });
        return;
      }
      const total = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
      if (Math.abs(total - data.budgetAmount) > 0.01) {
        ctx.addIssue({
          code: 'custom',
          message: 'Milestone totals must equal the budget amount',
          path: ['milestones'],
        });
      }
    }
  });

type ProjectFormData = z.infer<typeof projectSchema>;

export const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      budgetType: 'FIXED',
      milestones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const budgetType = useWatch({ control, name: 'budgetType' });
  const budgetAmount = useWatch({ control, name: 'budgetAmount' });
  const milestones = useWatch({ control, name: 'milestones' }) || [];

  const milestoneTotal = useMemo(
    () => milestones.reduce((sum, m) => sum + (m?.amount || 0), 0),
    [milestones]
  );

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        ...data,
        deadline: data.deadline || undefined,
        milestones: data.budgetType === 'FIXED' ? data.milestones : undefined,
      };
      const response = await api.post('/projects', payload);
      navigate(`/business/projects/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-gray-600">Post a project and start receiving bids</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FormInput
          label="Project Title"
          error={errors.title?.message}
          {...register('title')}
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

        <FormInput
          label="Category"
          error={errors.category?.message}
          {...register('category')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="FIXED"
                {...register('budgetType')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Fixed Price</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="HOURLY"
                {...register('budgetType')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Hourly Rate</span>
            </label>
          </div>
        </div>

        <FormInput
          label="Budget Amount"
          type="number"
          step="0.01"
          error={errors.budgetAmount?.message}
          {...register('budgetAmount', { valueAsNumber: true })}
        />

        {budgetType === 'FIXED' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
                <p className="text-sm text-gray-600">Define payment structure for this fixed price project.</p>
              </div>
              <button
                type="button"
                onClick={() => append({ title: '', description: '', amount: 0 })}
                className="btn-secondary text-sm"
              >
                Add Milestone
              </button>
            </div>

            {errors.milestones && (
              <p className="text-sm text-red-600">{errors.milestones.message as string}</p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <FormInput
                        label="Title"
                        error={errors.milestones?.[index]?.title?.message}
                        {...register(`milestones.${index}.title` as const)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (optional)
                        </label>
                        <textarea
                          className={`input-field ${errors.milestones?.[index]?.description ? 'border-red-500' : ''}`}
                          rows={2}
                          {...register(`milestones.${index}.description` as const)}
                        />
                        {errors.milestones?.[index]?.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.milestones[index]?.description?.message}
                          </p>
                        )}
                      </div>
                      <FormInput
                        label="Amount"
                        type="number"
                        step="0.01"
                        error={errors.milestones?.[index]?.amount?.message}
                        {...register(`milestones.${index}.amount` as const, { valueAsNumber: true })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-700">
              <span className="font-medium">Budget:</span> {budgetAmount || 0} | <span className="font-medium">Milestone total:</span> {milestoneTotal.toFixed(2)}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Type
          </label>
          <select
            className={`input-field ${errors.locationType ? 'border-red-500' : ''}`}
            {...register('locationType')}
          >
            <option value="">Select location type</option>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            className={`input-field ${errors.visibility ? 'border-red-500' : ''}`}
            {...register('visibility')}
          >
            <option value="">Select visibility</option>
            <option value="PUBLIC">Public</option>
            <option value="INVITE_ONLY">Invite Only</option>
          </select>
        </div>

        <FormInput
          label="Deadline (optional)"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/business/projects')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
