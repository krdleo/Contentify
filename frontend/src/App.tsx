import { useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api/v1', withCredentials: true });

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [me, setMe] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [engagements, setEngagements] = useState<any[]>([]);
  const [bidProjectId, setBidProjectId] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const login = async () => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.data.accessToken);
  };

  const fetchMe = async () => {
    const res = await api.get('/auth/me', { headers: authHeaders });
    setMe(res.data.data);
  };

  const loadProjects = async () => {
    const res = await api.get('/projects', { headers: authHeaders });
    setProjects(res.data.data?.items || res.data.data || []);
  };

  const loadEngagements = async () => {
    if (!me) return;
    const url = me.role === 'BUSINESS' ? '/businesses/me/engagements' : '/freelancers/me/engagements';
    const res = await api.get(url, { headers: authHeaders });
    setEngagements(res.data.data || []);
  };

  const submitBid = async () => {
    if (!bidProjectId) return;
    await api.post(
      `/projects/${bidProjectId}/bids`,
      { bidAmount: Number(bidAmount), bidType: 'FIXED', proposedTimelineDays: 7 },
      { headers: authHeaders }
    );
    setBidAmount('');
    setBidProjectId('');
    loadProjects();
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>Contentify Sandbox</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 320, gap: 8 }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          <button onClick={fetchMe} disabled={!token}>
            Fetch Me
          </button>
          <button onClick={loadProjects} disabled={!token}>
            Load Projects
          </button>
          <button onClick={loadEngagements} disabled={!token || !me}>
            Load Engagements
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {me && (
            <div>
              <h3>Session</h3>
              <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(me, null, 2)}</pre>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <h3>Public Projects</h3>
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <strong>{p.title}</strong> — {p.category}
                </li>
              ))}
            </ul>
            {me?.role === 'FREELANCER' && (
              <div style={{ marginTop: 12 }}>
                <h4>Submit Bid</h4>
                <input placeholder="Project ID" value={bidProjectId} onChange={(e) => setBidProjectId(e.target.value)} />
                <input placeholder="Bid Amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                <button onClick={submitBid} disabled={!bidProjectId || !bidAmount}>
                  Send Bid
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <h3>My Engagements</h3>
            <ul>
              {engagements.map((e) => (
                <li key={e.id}>
                  Engagement #{e.id} — status {e.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    if (!token) return;
    const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    setMe(res.data.data);
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <h1>Contentify Sandbox</h1>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 320, gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <button onClick={fetchMe} disabled={!token}>
          Fetch Me
        </button>
      </div>
      {me && (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(me, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;
