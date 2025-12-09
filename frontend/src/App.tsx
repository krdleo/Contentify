import { useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api/v1', withCredentials: true });

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [me, setMe] = useState<any>(null);

  const login = async () => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.data.accessToken);
  };

  const fetchMe = async () => {
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
