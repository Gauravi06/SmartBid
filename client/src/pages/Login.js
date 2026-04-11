import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
localStorage.setItem('user', JSON.stringify(res.data.user));
if (res.data.user.role === 'admin') {
  navigate('/admin');
} else {
  navigate('/auctions');
}
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={s.page}>
      <div style={s.left}>
        <h1 style={s.brand}>⚡ SmartBid</h1>
        <p style={s.tagline}>Real-time auctions.<br/>Bid smart. Win big.</p>
        <div style={s.features}>
          {['🔴 Live bidding updates','🛡️ Fraud detection','⏱️ Soft close protection','🏆 Instant winner declaration'].map(f => (
            <div key={f} style={s.featureItem}>{f}</div>
          ))}
        </div>
      </div>
      <div style={s.right}>
        <div className="glass" style={s.box}>
          <h2 style={s.title}>Welcome Back</h2>
          <p style={s.subtitle}>Login to your account</p>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <label style={s.label}>Email</label>
            <input className="input-field" type="email" placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
            <label style={s.label}>Password</label>
            <input className="input-field" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn-primary" type="submit" style={{width:'100%', marginTop:'8px'}}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
          <p style={s.link}>No account? <Link to="/register" style={{color:'#6c63ff'}}>Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { display:'flex', minHeight:'100vh' },
  left:        { flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px' },
  right:       { flex:1, display:'flex', justifyContent:'center', alignItems:'center', padding:'40px' },
  brand:       { fontSize:'48px', fontWeight:'800', color:'#6c63ff', marginBottom:'16px' },
  tagline:     { fontSize:'28px', fontWeight:'600', lineHeight:'1.4', marginBottom:'40px', color:'rgba(255,255,255,0.9)' },
  features:    { display:'flex', flexDirection:'column', gap:'12px' },
  featureItem: { padding:'12px 20px', background:'rgba(108,99,255,0.15)', borderRadius:'10px', fontSize:'15px', color:'rgba(255,255,255,0.8)' },
  box:         { padding:'48px', width:'420px' },
  title:       { fontSize:'28px', fontWeight:'700', marginBottom:'8px' },
  subtitle:    { color:'rgba(255,255,255,0.5)', marginBottom:'32px' },
  label:       { display:'block', marginBottom:'6px', fontSize:'13px', color:'rgba(255,255,255,0.6)' },
  error:       { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  link:        { textAlign:'center', marginTop:'24px', color:'rgba(255,255,255,0.5)', fontSize:'14px' }
};

export default Login;