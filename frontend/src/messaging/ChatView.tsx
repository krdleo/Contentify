import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
}

interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    email: string;
  }>;
}

export const ChatView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchConversation();
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/conversations/${id}`);
      setConversation(response.data.data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/conversations/${id}/messages`);
      const data = response.data.data?.items || response.data.data || [];
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      setSending(true);
      await api.post(`/conversations/${id}/messages`, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading conversation...</div>;
  }

  const otherParticipant = conversation?.participants.find((p) => p.id !== user?.id);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      <div className="bg-white p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {otherParticipant?.email || 'Conversation'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isOwn ? 'text-white opacity-80' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

