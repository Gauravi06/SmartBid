import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    axios.get('http://localhost:5000/api/auctions/active')
      .then(res => setAuctions(res.data));
  }, []);

  const filtered = auctions.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.auctionType === filter;
    return matchSearch && matchFilter;
  });

  const timeLeft = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  };

  return (
    <div className="gradient-bg" style={s.page}>
      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.brand}>⚡ SmartBid</div>
        <div style={s.navRight}>
          <div style={s.walletBadge}>💰 ₹{user?.wallet?.toLocaleString()}</div>
          <button className="btn-primary" onClick={() => navigate('/create')}>+ New Auction</button>
          <button className="btn-danger" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Live Auctions</h1>
        <p style={s.heroSub}>
          <span className="live-dot"></span>
          {auctions.length} active auctions right now
        </p>
      </div>

      {/* Search + Filter */}
      <div style={s.searchRow}>
        <input className="input-field" style={s.searchInput} placeholder="🔍 Search auctions..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={s.filterBtns}>
          {['all','english','dutch','sealed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{fontSize:'64px'}}>🔍</div>
          <p style={{marginTop:'16px', color:'rgba(255,255,255,0.5)'}}>No auctions found</p>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(auction => (
            <div key={auction._id} className="card" style={s.card}>
              {/* Image */}
              <div style={s.imageWrap}>
                {auction.image ? (
                  <img src={auction.image} alt={auction.title} style={s.cardImg} />
                ) : (
                  <div style={s.noImg}>📦</div>
                )}
                <span className={`badge badge-${auction.auctionType}`} style={s.typeBadge}>
                  {auction.auctionType}
                </span>
                <span style={s.timeBadge}>{timeLeft(auction.endTime)}</span>
              </div>

              {/* Info */}
              <div style={s.cardBody}>
                <h3 style={s.cardTitle}>{auction.title}</h3>
                <p style={s.cardDesc}>{auction.description?.slice(0,60)}{auction.description?.length > 60 ? '...' : ''}</p>

                <div style={s.priceRow}>
                  <div>
                    <p style={s.priceLabel}>Current Bid</p>
                    <p style={s.priceValue}>₹{auction.currentHighest?.toLocaleString()}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={s.priceLabel}>Base Price</p>
                    <p style={s.basePrice}>₹{auction.basePrice?.toLocaleString()}</p>
                  </div>
                </div>

                <div style={s.sellerRow}>
                  <span style={s.sellerAvatar}>{auction.seller?.username?.[0]?.toUpperCase()}</span>
                  <span style={s.sellerName}>{auction.seller?.username}</span>
                </div>

                <button className="btn-primary" style={s.bidBtn}
                  onClick={() => navigate(`/auction/${auction._id}`)}>
                  Place Bid →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', padding:'0 0 40px' },
  navbar:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', borderBottom:'1px solid rgba(255,255,255,0.08)', position:'sticky', top:0, background:'rgba(15,12,41,0.95)', backdropFilter:'blur(10px)', zIndex:100 },
  brand:       { fontSize:'24px', fontWeight:'800', color:'#6c63ff' },
  navRight:    { display:'flex', gap:'12px', alignItems:'center' },
  walletBadge: { background:'rgba(108,99,255,0.2)', border:'1px solid rgba(108,99,255,0.3)', padding:'8px 16px', borderRadius:'10px', fontWeight:'600', color:'#a78bfa' },
  hero:        { textAlign:'center', padding:'48px 40px 32px' },
  heroTitle:   { fontSize:'48px', fontWeight:'800', marginBottom:'12px' },
  heroSub:     { color:'rgba(255,255,255,0.5)', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' },
  searchRow:   { display:'flex', gap:'16px', padding:'0 40px 32px', flexWrap:'wrap', alignItems:'center' },
  searchInput: { flex:1, minWidth:'200px', marginBottom:0 },
  filterBtns:  { display:'flex', gap:'8px' },
  filterBtn:   { padding:'10px 18px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.6)', cursor:'pointer', transition:'all 0.2s' },
  filterActive:{ background:'rgba(108,99,255,0.3)', border:'1px solid #6c63ff', color:'#a78bfa' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'24px', padding:'0 40px' },
  card:        { cursor:'pointer' },
  imageWrap:   { position:'relative', height:'200px', overflow:'hidden' },
  cardImg:     { width:'100%', height:'100%', objectFit:'cover' },
  noImg:       { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px', background:'rgba(255,255,255,0.03)' },
  typeBadge:   { position:'absolute', top:'12px', left:'12px' },
  timeBadge:   { position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.6)', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', color:'#fbbf24', fontWeight:'600' },
  cardBody:    { padding:'20px' },
  cardTitle:   { fontSize:'18px', fontWeight:'700', marginBottom:'6px' },
  cardDesc:    { color:'rgba(255,255,255,0.5)', fontSize:'13px', marginBottom:'16px', lineHeight:'1.5' },
  priceRow:    { display:'flex', justifyContent:'space-between', marginBottom:'16px', padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:'10px' },
  priceLabel:  { color:'rgba(255,255,255,0.5)', fontSize:'11px', marginBottom:'4px' },
  priceValue:  { fontWeight:'700', fontSize:'18px', color:'#6c63ff' },
  basePrice:   { fontWeight:'600', fontSize:'15px', color:'rgba(255,255,255,0.7)' },
  sellerRow:   { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  sellerAvatar:{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700' },
  sellerName:  { color:'rgba(255,255,255,0.5)', fontSize:'13px' },
  bidBtn:      { width:'100%' },
  empty:       { textAlign:'center', padding:'80px' }
};

export default AuctionList;