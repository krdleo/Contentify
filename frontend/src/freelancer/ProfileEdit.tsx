import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/axios';
import { FormInput } from '../components/FormInput';

const profileSchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
    fetchSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/freelancers/me');
      const profile = response.data.data?.freelancerProfile || response.data.data;
      if (profile) {
        setValue('city', profile.city || '');
        setValue('category', profile.category || '');
        if (profile.skills) {
          setSelectedSkills(profile.skills.map((s: any) => s.id));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setAvailableSkills(response.data.data?.items || response.data.data || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError('');
      await api.put('/freelancers/me', data);
      await api.put('/freelancers/me/skills', { skillIds: selectedSkills });
      navigate('/freelancer/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-gray-600">Update your freelancer profile information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FormInput
          label="City"
          error={errors.city?.message}
          {...register('city')}
        />

        <FormInput
          label="Category"
          error={errors.category?.message}
          {...register('category')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSkills.includes(skill.id)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/freelancer/profile')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

