import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    email: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
}

export const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations');
      const data = response.data.data?.items || response.data.data || [];
      setConversations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading conversations...</div>;
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
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-gray-600">Your conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {conversations.map((conversation) => {
            const otherParticipant = conversation.participants[0]; // Simplified
            return (
              <Link
                key={conversation.id}
                to={`/conversations/${conversation.id}`}
                className="block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{otherParticipant.email}</h3>
                    {conversation.lastMessage && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

