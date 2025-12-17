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

interface Engagement {
  id: number;
  status: string;
  paymentStatus: string;
  project: {
    id: number;
    title: string;
  };
  freelancer: {
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
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
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

  const handleStartEngagement = async () => {
    try {
      await api.post(`/engagements/${id}/start`);
      fetchEngagement();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start engagement');
    }
  };

  const handleSetMilestones = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const milestonesData = [{
        title: milestoneForm.title,
        description: milestoneForm.description,
        amount: Number(milestoneForm.amount),
        dueDate: milestoneForm.dueDate,
      }];
      await api.post(`/engagements/${id}/milestones`, { milestones: milestonesData });
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', description: '', amount: '', dueDate: '' });
      fetchMilestones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set milestone');
    }
  };

  const handleMilestoneAction = async (milestoneId: number, action: 'approve' | 'reject') => {
    try {
      await api.post(`/milestones/${milestoneId}/${action}`);
      fetchMilestones();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} milestone`);
    }
  };

  const handleSetPaymentStatus = async (status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID') => {
    try {
      await api.post(`/engagements/${id}/payment-status`, { paymentStatus: status });
      fetchEngagement();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment status');
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
          onClick={() => navigate('/business/engagements')}
          className="text-primary hover:text-opacity-80 mb-4"
        >
          ← Back to Engagements
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{engagement.project?.title ?? '(Project unavailable)'}</h1>
        <p className="mt-2 text-gray-600">Freelancer: {engagement.freelancer?.email ?? '(Freelancer unavailable)'}</p>
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

      {engagement.status === 'NEGOTIATION' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <button onClick={handleStartEngagement} className="btn-primary">
            Start Engagement
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Milestones</h2>
          {engagement.status === 'ACTIVE' && (
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="btn-secondary text-sm"
            >
              {showMilestoneForm ? 'Cancel' : 'Add Milestone'}
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={handleSetMilestones} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <input
              type="text"
              placeholder="Milestone Title"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              className="input-field"
              required
            />
            <textarea
              placeholder="Description"
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="input-field"
              rows={3}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={milestoneForm.amount}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="date"
              value={milestoneForm.dueDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
              className="input-field"
              required
            />
            <button type="submit" className="btn-primary">
              Add Milestone
            </button>
          </form>
        )}

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
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                  {milestone.status === 'SUBMITTED' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMilestoneAction(milestone.id, 'approve')}
                        className="btn-primary text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleMilestoneAction(milestone.id, 'reject')}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSetPaymentStatus('UNPAID')}
            className="btn-secondary text-sm"
          >
            Mark Unpaid
          </button>
          <button
            onClick={() => handleSetPaymentStatus('PARTIALLY_PAID')}
            className="btn-secondary text-sm"
          >
            Mark Partially Paid
          </button>
          <button
            onClick={() => handleSetPaymentStatus('PAID')}
            className="btn-primary text-sm"
          >
            Mark Paid
          </button>
        </div>
      </div>
    </div>
  );
};
