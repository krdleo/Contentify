import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface Deliverable {
  id: number;
  description: string;
  fileUrl?: string;
  createdAt: string;
}

interface Engagement {
  id: number;
  status: string;
  paymentStatus: string;
  project: {
    id: number;
    title: string;
  };
  business: {
    id: number;
    email: string;
  };
}

export const EngagementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [deliverableForm, setDeliverableForm] = useState({
    description: '',
    fileUrl: '',
  });

  useEffect(() => {
    if (id) {
      fetchEngagement();
      fetchMilestones();
    }
  }, [id]);

  const fetchEngagement = async () => {
    try {
      const response = await api.get(`/engagements/${id}`);
      setEngagement(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load engagement');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await api.get(`/engagements/${id}/milestones`);
      const data = response.data.data?.items || response.data.data || [];
      setMilestones(data);
    } catch (err) {
      console.error('Error fetching milestones:', err);
    }
  };

  const handleMilestoneAction = async (milestoneId: number, action: 'start' | 'submit') => {
    try {
      await api.post(`/milestones/${milestoneId}/${action}`);
      fetchMilestones();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} milestone`);
    }
  };

  const handleSubmitDeliverable = async (milestoneId: number, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/milestones/${milestoneId}/deliverables`, deliverableForm);
      setDeliverableForm({ description: '', fileUrl: '' });
      setSelectedMilestone(null);
      fetchMilestones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit deliverable');
    }
  };

  const handleMarkReceived = async () => {
    try {
      await api.post(`/engagements/${id}/mark-received`);
      fetchEngagement();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark payment as received');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading engagement...</div>;
  }

  if (error || !engagement) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Engagement not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/freelancer/engagements')}
          className="text-primary hover:text-opacity-80 mb-4"
        >
          ← Back to Engagements
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{engagement.project.title}</h1>
        <p className="mt-2 text-gray-600">Client: {engagement.business.email}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className={`px-2 py-1 rounded ${
            engagement.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            engagement.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Milestones</h2>

        {milestones.length === 0 ? (
          <p className="text-gray-500">No milestones yet</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                    <p className="mt-1 text-gray-600">{milestone.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Amount: ${milestone.amount}</span>
                      <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        milestone.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        milestone.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        milestone.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        milestone.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {milestone.status === 'PENDING' && (
                      <button
                        onClick={() => handleMilestoneAction(milestone.id, 'start')}
                        className="btn-primary text-sm"
                      >
                        Start
                      </button>
                    )}
                    {milestone.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setSelectedMilestone(milestone.id)}
                        className="btn-secondary text-sm"
                      >
                        Submit Work
                      </button>
                    )}
                  </div>
                </div>

                {selectedMilestone === milestone.id && (
                  <form
                    onSubmit={(e) => handleSubmitDeliverable(milestone.id, e)}
                    className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4"
                  >
                    <textarea
                      placeholder="Deliverable description"
                      value={deliverableForm.description}
                      onChange={(e) => setDeliverableForm({ ...deliverableForm, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      required
                    />
                    <input
                      type="url"
                      placeholder="File URL (optional)"
                      value={deliverableForm.fileUrl}
                      onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
                      className="input-field"
                    />
                    <div className="flex space-x-2">
                      <button type="submit" className="btn-primary text-sm">
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMilestone(null);
                          setDeliverableForm({ description: '', fileUrl: '' });
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {engagement.paymentStatus === 'PAID' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <button onClick={handleMarkReceived} className="btn-primary">
            Mark Payment as Received
          </button>
        </div>
      )}
    </div>
  );
};

