import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface FreelancerProfile {
  id: number;
  city?: string;
  category?: string;
  skills?: Array<{ id: number; name: string }>;
}

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/freelancers/me');
      setProfile(response.data.data?.freelancerProfile || response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Profile not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">View and manage your freelancer profile</p>
        </div>
        <Link to="/freelancer/profile/edit" className="btn-primary">
          Edit Profile
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">City</h3>
          <p className="mt-1 text-gray-900">{profile.city || 'Not set'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1 text-gray-900">{profile.category || 'Not set'}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

