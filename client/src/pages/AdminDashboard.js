import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [auctions,setAuctions]= useState([]);
  const [flagged, setFlagged] = useState([]);
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/stats').then(r => setStats(r.data));
    axios.get('http://localhost:5000/api/admin/users').then(r => setUsers(r.data));
    axios.get('http://localhost:5000/api/admin/auctions').then(r => setAuctions(r.data));
    axios.get('http://localhost:5000/api/admin/flagged').then(r => setFlagged(r.data));
  }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const banUser = async (id) => {
    const res = await axios.put(`http://localhost:5000/api/admin/users/ban/${id}`);
    showMsg(res.data.msg);
    setUsers(users.map(u => u._id === id ? { ...u, isBanned: !u.isBanned } : u));
  };

  const deleteAuction = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/auctions/${id}`);
    showMsg('Auction deleted ✅');
    setAuctions(auctions.filter(a => a._id !== id));
  };

  const endAuction = async (id) => {
    const res = await axios.put(`http://localhost:5000/api/admin/auctions/end/${id}`);
    showMsg('Auction ended ✅');
    setAuctions(auctions.map(a => a._id === id ? { ...a, isActive: false } : a));
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="gradient-bg" style={s.page}>
      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.brand}>⚡ SmartBid <span style={s.adminBadge}>ADMIN</span></div>
        <button className="btn-danger" onClick={logout}>Logout</button>
      </div>

      {msg && <div style={s.toast}>{msg}</div>}

      {/* Tabs */}
      <div style={s.tabs}>
        {['overview','users','auctions','flagged'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.tab, ...(tab === t ? s.activeTab : {}) }}>
            {t === 'overview' ? '📊 Overview' :
             t === 'users'    ? '👥 Users' :
             t === 'auctions' ? '🏷️ Auctions' : '🚨 Flagged Bids'}
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && stats && (
          <div>
            <h2 style={s.sectionTitle}>Dashboard Overview</h2>
            <div style={s.statsGrid}>
              {[
                { label:'Total Users',     value: stats.totalUsers,     icon:'👥', color:'#6c63ff' },
                { label:'Total Auctions',  value: stats.totalAuctions,  icon:'🏷️', color:'#3b82f6' },
                { label:'Active Auctions', value: stats.activeAuctions, icon:'🔴', color:'#22c55e' },
                { label:'Total Bids',      value: stats.totalBids,      icon:'🔨', color:'#f59e0b' },
                { label:'Flagged Bids',    value: stats.flaggedBids,    icon:'🚨', color:'#ef4444' },
                { label:'Banned Users',    value: stats.bannedUsers,    icon:'🚫', color:'#dc2626' },
              ].map(stat => (
                <div key={stat.label} className="glass" style={s.statCard}>
                  <div style={s.statIcon}>{stat.icon}</div>
                  <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
                  <p style={s.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Auctions Preview */}
            <h3 style={{ ...s.sectionTitle, marginTop:'32px' }}>Recent Auctions</h3>
            <div className="glass" style={s.table}>
              <div style={s.tableHeader}>
                <span>Title</span><span>Seller</span><span>Highest Bid</span><span>Status</span>
              </div>
              {auctions.slice(0,5).map(a => (
                <div key={a._id} style={s.tableRow}>
                  <span style={s.tableCell}>{a.title}</span>
                  <span style={s.tableCell}>{a.seller?.username}</span>
                  <span style={s.tableCell}>₹{a.currentHighest?.toLocaleString()}</span>
                  <span style={s.tableCell}>
                    <span style={{ ...s.statusBadge, background: a.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: a.isActive ? '#22c55e' : '#ef4444' }}>
                      {a.isActive ? 'Active' : 'Ended'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <h2 style={s.sectionTitle}>All Users ({users.length})</h2>
            <div className="glass" style={s.table}>
              <div style={s.tableHeader}>
                <span>Username</span><span>Email</span><span>Wallet</span><span>Joined</span><span>Action</span>
              </div>
              {users.map(u => (
                <div key={u._id} style={{ ...s.tableRow, opacity: u.isBanned ? 0.5 : 1 }}>
                  <span style={s.tableCell}>
                    <div style={s.userAvatar}>{u.username?.[0]?.toUpperCase()}</div>
                    {u.username}
                    {u.isBanned && <span style={s.bannedTag}>Banned</span>}
                  </span>
                  <span style={s.tableCell}>{u.email}</span>
                  <span style={s.tableCell}>₹{u.wallet?.toLocaleString()}</span>
                  <span style={s.tableCell}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  <span style={s.tableCell}>
                    <button onClick={() => banUser(u._id)}
                      style={{ ...s.actionBtn, background: u.isBanned ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: u.isBanned ? '#22c55e' : '#ef4444' }}>
                      {u.isBanned ? '✅ Unban' : '🚫 Ban'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUCTIONS TAB */}
        {tab === 'auctions' && (
          <div>
            <h2 style={s.sectionTitle}>All Auctions ({auctions.length})</h2>
            <div className="glass" style={s.table}>
              <div style={s.tableHeader}>
                <span>Title</span><span>Seller</span><span>Type</span><span>Highest Bid</span><span>Status</span><span>Actions</span>
              </div>
              {auctions.map(a => (
                <div key={a._id} style={s.tableRow}>
                  <span style={s.tableCell}>{a.title}</span>
                  <span style={s.tableCell}>{a.seller?.username}</span>
                  <span style={s.tableCell}>
                    <span className={`badge badge-${a.auctionType}`}>{a.auctionType}</span>
                  </span>
                  <span style={s.tableCell}>₹{a.currentHighest?.toLocaleString()}</span>
                  <span style={s.tableCell}>
                    <span style={{ ...s.statusBadge, background: a.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: a.isActive ? '#22c55e' : '#ef4444' }}>
                      {a.isActive ? '🟢 Active' : '🔴 Ended'}
                    </span>
                  </span>
                  <span style={{ ...s.tableCell, display:'flex', gap:'8px' }}>
                    {a.isActive && (
                      <button onClick={() => endAuction(a._id)} style={{ ...s.actionBtn, background:'rgba(251,191,36,0.2)', color:'#fbbf24' }}>
                        🏁 End
                      </button>
                    )}
                    <button onClick={() => deleteAuction(a._id)} style={{ ...s.actionBtn, background:'rgba(239,68,68,0.2)', color:'#ef4444' }}>
                      🗑️ Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLAGGED BIDS TAB */}
        {tab === 'flagged' && (
          <div>
            <h2 style={s.sectionTitle}>🚨 Flagged Bids ({flagged.length})</h2>
            {flagged.length === 0 ? (
              <div className="glass" style={s.emptyBox}>
                <div style={{fontSize:'48px'}}>✅</div>
                <p style={{color:'rgba(255,255,255,0.5)', marginTop:'12px'}}>No flagged bids. System is clean!</p>
              </div>
            ) : (
              <div className="glass" style={s.table}>
                <div style={s.tableHeader}>
                  <span>Bidder</span><span>Auction</span><span>Amount</span><span>Reason</span><span>Time</span>
                </div>
                {flagged.map(bid => (
                  <div key={bid._id} style={s.tableRow}>
                    <span style={s.tableCell}>{bid.bidder?.username}</span>
                    <span style={s.tableCell}>{bid.auction?.title}</span>
                    <span style={s.tableCell}>₹{bid.amount?.toLocaleString()}</span>
                    <span style={s.tableCell}>
                      <span style={s.flagReason}>{bid.flagReason || 'Suspicious activity'}</span>
                    </span>
                    <span style={s.tableCell}>{new Date(bid.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh' },
  navbar:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', borderBottom:'1px solid rgba(255,255,255,0.08)', position:'sticky', top:0, background:'rgba(15,12,41,0.95)', backdropFilter:'blur(10px)', zIndex:100 },
  brand:       { fontSize:'24px', fontWeight:'800', color:'#6c63ff', display:'flex', alignItems:'center', gap:'12px' },
  adminBadge:  { background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', color:'#fca5a5', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', fontWeight:'700' },
  toast:       { position:'fixed', top:'80px', right:'24px', background:'rgba(34,197,94,0.9)', color:'#fff', padding:'12px 24px', borderRadius:'10px', zIndex:999, fontWeight:'600' },
  tabs:        { display:'flex', gap:'8px', padding:'24px 40px 0' },
  tab:         { padding:'10px 20px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px 10px 0 0', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'14px' },
  activeTab:   { background:'rgba(108,99,255,0.3)', border:'1px solid #6c63ff', color:'#a78bfa' },
  content:     { padding:'24px 40px' },
  sectionTitle:{ fontSize:'22px', fontWeight:'700', marginBottom:'20px' },
  statsGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px' },
  statCard:    { padding:'24px', textAlign:'center' },
  statIcon:    { fontSize:'32px', marginBottom:'12px' },
  statValue:   { fontSize:'36px', fontWeight:'800', marginBottom:'4px' },
  statLabel:   { color:'rgba(255,255,255,0.5)', fontSize:'13px' },
  table:       { borderRadius:'12px', overflow:'hidden' },
  tableHeader: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', padding:'16px 20px', background:'rgba(108,99,255,0.2)', fontWeight:'600', fontSize:'13px', color:'rgba(255,255,255,0.7)', gap:'12px' },
  tableRow:    { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', alignItems:'center', gap:'12px', transition:'background 0.2s' },
  tableCell:   { fontSize:'14px', display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' },
  userAvatar:  { width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', flexShrink:0 },
  bannedTag:   { background:'rgba(239,68,68,0.2)', color:'#fca5a5', padding:'2px 8px', borderRadius:'4px', fontSize:'11px' },
  actionBtn:   { padding:'6px 12px', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px', fontWeight:'600' },
  statusBadge: { padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600' },
  flagReason:  { background:'rgba(239,68,68,0.15)', color:'#fca5a5', padding:'4px 10px', borderRadius:'6px', fontSize:'12px' },
  emptyBox:    { padding:'60px', textAlign:'center' }
};

export default AdminDashboard;