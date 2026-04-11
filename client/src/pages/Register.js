import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm]       = useState({ username:'', email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/auctions');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={s.page}>
      <div className="glass" style={s.box}>
        <div style={s.logoRow}>⚡ <span style={s.logo}>SmartBid</span></div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.subtitle}>Join thousands of bidders</p>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleRegister}>
          <label style={s.label}>Username</label>
          <input className="input-field" name="username" placeholder="coolbidder99"
            value={form.username} onChange={handleChange} required />
          <label style={s.label}>Email</label>
          <input className="input-field" name="email" type="email" placeholder="you@email.com"
            value={form.email} onChange={handleChange} required />
          <label style={s.label}>Password</label>
          <input className="input-field" name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} required />
          <button className="btn-primary" type="submit" style={{width:'100%', marginTop:'8px'}}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p style={s.link}>Already have account? <Link to="/" style={{color:'#6c63ff'}}>Login</Link></p>
      </div>
    </div>
  );
}

const s = {
  page:    { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' },
  box:     { padding:'48px', width:'420px' },
  logoRow: { fontSize:'22px', fontWeight:'800', marginBottom:'24px', color:'#6c63ff' },
  logo:    { color:'#6c63ff' },
  title:   { fontSize:'28px', fontWeight:'700', marginBottom:'8px' },
  subtitle:{ color:'rgba(255,255,255,0.5)', marginBottom:'32px' },
  label:   { display:'block', marginBottom:'6px', fontSize:'13px', color:'rgba(255,255,255,0.6)' },
  error:   { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  link:    { textAlign:'center', marginTop:'24px', color:'rgba(255,255,255,0.5)', fontSize:'14px' }
};

export default Register;