import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function AuctionRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [auction,    setAuction]    = useState(null);
  const [bids,       setBids]       = useState([]);
  const [bidAmount,  setBidAmount]  = useState('');
  const [message,    setMessage]    = useState('');
  const [error,      setError]      = useState('');
  const [timeLeft,   setTimeLeft]   = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/auctions/${id}`).then(res => setAuction(res.data));
    axios.get(`http://localhost:5000/api/bids/auction/${id}`).then(res => setBids(res.data));
    socket.emit('joinAuction', id);
    socket.on('bidUpdate', (data) => {
      setAuction(prev => ({ ...prev, currentHighest: data.amount, highestBidder: { username: data.username } }));
      setBids(prev => [data, ...prev]);
      setMessage(`🔔 New bid: ₹${data.amount?.toLocaleString()} by ${data.username}`);
    });
    return () => socket.off('bidUpdate');
  }, [id]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!auction) return;
      const diff = new Date(auction.endTime) - new Date();
      if (diff <= 0) { setTimeLeft('Auction Ended'); clearInterval(timer); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const placeBid = async () => {
    setError(''); setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/bids/place', {
        auctionId: id, bidderId: user.id, amount: Number(bidAmount)
      });
      socket.emit('placeBid', { auctionId: id, amount: Number(bidAmount), username: user.username });
      setMessage('✅ ' + res.data.msg + (res.data.extended ? ' ⏱ Extended by 2 mins!' : ''));
      setBidAmount('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Bid failed');
    }
  };

  if (!auction) return (
    <div className="gradient-bg" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>⏳</div>
        <p style={{color:'rgba(255,255,255,0.5)'}}>Loading auction...</p>
      </div>
    </div>
  );

  const isEnded = new Date(auction.endTime) < new Date();

  return (
    <div className="gradient-bg" style={s.page}>
      <div style={s.navbar}>
        <button onClick={() => navigate('/auctions')} style={s.back}>← Back to Auctions</button>
        <span className={`badge badge-${auction.auctionType}`}>{auction.auctionType} auction</span>
      </div>

      <div style={s.container}>
        <div style={s.left}>
          {/* Image */}
          <div className="glass" style={s.imgBox}>
            {auction.image ? (
              <img src={auction.image} alt={auction.title} style={s.img} />
            ) : (
              <div style={s.noImg}>📦</div>
            )}
          </div>

          {/* Bid History */}
          <div className="glass" style={s.historyBox}>
            <h3 style={s.historyTitle}>📜 Bid History</h3>
            {bids.length === 0 ? (
              <div style={s.noBids}>
                <div style={{fontSize:'32px'}}>🎯</div>
                <p style={{color:'rgba(255,255,255,0.4)', marginTop:'8px'}}>No bids yet. Be first!</p>
              </div>
            ) : (
              <div style={s.bidList}>
                {bids.map((bid, i) => (
                  <div key={i} style={{ ...s.bidItem, ...(i === 0 ? s.topBid : {}) }}>
                    <div style={s.bidLeft}>
                      <div style={s.bidAvatar}>{(bid.bidder?.username || bid.username)?.[0]?.toUpperCase()}</div>
                      <div>
                        <p style={s.bidUser}>{bid.bidder?.username || bid.username}</p>
                        <p style={s.bidTime}>{bid.createdAt ? new Date(bid.createdAt).toLocaleTimeString() : 'just now'}</p>
                      </div>
                    </div>
                    <div style={s.bidRight}>
                      <p style={s.bidAmount}>₹{bid.amount?.toLocaleString()}</p>
                      {i === 0 && <p style={s.topLabel}>🏆 Highest</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={s.right}>
          {/* Auction Info */}
          <div className="glass" style={s.infoBox}>
            <h1 style={s.auctionTitle}>{auction.title}</h1>
            <p style={s.auctionDesc}>{auction.description}</p>

            {/* Timer */}
            <div style={s.timerBox}>
              <p style={s.timerLabel}>⏱ Time Remaining</p>
              <p style={{ ...s.timerValue, color: isEnded ? '#ef4444' : '#fbbf24' }}>{timeLeft || '...'}</p>
            </div>

            {/* Stats */}
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <p style={s.statLabel}>Current Highest</p>
                <p style={s.statValue}>₹{auction.currentHighest?.toLocaleString()}</p>
              </div>
              <div style={s.statCard}>
                <p style={s.statLabel}>Highest Bidder</p>
                <p style={s.statValue}>{auction.highestBidder?.username || 'None'}</p>
              </div>
              <div style={s.statCard}>
                <p style={s.statLabel}>Total Bids</p>
                <p style={s.statValue}>{bids.length}</p>
              </div>
              <div style={s.statCard}>
                <p style={s.statLabel}>Seller</p>
                <p style={s.statValue}>{auction.seller?.username}</p>
              </div>
            </div>

            {/* Messages */}
            {message && <div style={s.successMsg}>{message}</div>}
            {error   && <div style={s.errorMsg}>{error}</div>}

            {/* Bid Input */}
            {!isEnded ? (
              <div style={s.bidSection}>
                <label style={s.bidLabel}>Your Bid Amount (₹)</label>
                <div style={s.bidRow}>
                  <input className="input-field" type="number" style={{marginBottom:0, flex:1}}
                    placeholder={`Min ₹${auction.currentHighest + 1}`}
                    value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                  <button className="btn-primary" onClick={placeBid} style={s.placeBidBtn}>
                    🔨 Bid Now
                  </button>
                </div>
                <p style={s.bidHint}>Minimum bid: ₹{(auction.currentHighest + 1)?.toLocaleString()}</p>
              </div>
            ) : (
              <div style={s.endedSection}>
                <p style={s.endedText}>🏁 This auction has ended</p>
                <button className="btn-primary" style={{width:'100%', marginTop:'16px'}}
                  onClick={() => navigate(`/winner/${id}`)}>
                  🏆 View Winner & Seller Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh' },
  navbar:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 32px', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  back:        { background:'none', border:'none', color:'#6c63ff', fontSize:'15px', cursor:'pointer' },
  container:   { display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:'24px', padding:'24px 32px', maxWidth:'1200px', margin:'0 auto' },
  left:        { display:'flex', flexDirection:'column', gap:'24px' },
  right:       { display:'flex', flexDirection:'column', gap:'24px' },
  imgBox:      { overflow:'hidden', borderRadius:'16px', height:'300px' },
  img:         { width:'100%', height:'100%', objectFit:'cover' },
  noImg:       { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'80px', background:'rgba(255,255,255,0.03)' },
  historyBox:  { padding:'24px', flex:1 },
  historyTitle:{ fontSize:'16px', fontWeight:'600', marginBottom:'16px' },
  noBids:      { textAlign:'center', padding:'32px' },
  bidList:     { display:'flex', flexDirection:'column', gap:'10px', maxHeight:'300px', overflowY:'auto' },
  bidItem:     { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'rgba(255,255,255,0.04)', borderRadius:'10px' },
  topBid:      { background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)' },
  bidLeft:     { display:'flex', alignItems:'center', gap:'10px' },
  bidAvatar:   { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', flexShrink:0 },
  bidUser:     { fontWeight:'600', fontSize:'14px' },
  bidTime:     { color:'rgba(255,255,255,0.4)', fontSize:'12px' },
  bidRight:    { textAlign:'right' },
  bidAmount:   { fontWeight:'700', color:'#6c63ff', fontSize:'16px' },
  topLabel:    { fontSize:'11px', color:'#fbbf24', marginTop:'2px' },
  infoBox:     { padding:'32px' },
  auctionTitle:{ fontSize:'28px', fontWeight:'800', marginBottom:'8px' },
  auctionDesc: { color:'rgba(255,255,255,0.5)', marginBottom:'24px', lineHeight:'1.6' },
  timerBox:    { background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', padding:'20px', borderRadius:'12px', textAlign:'center', marginBottom:'24px' },
  timerLabel:  { color:'rgba(255,255,255,0.5)', fontSize:'13px', marginBottom:'6px' },
  timerValue:  { fontSize:'36px', fontWeight:'800', fontFamily:'monospace' },
  statsGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' },
  statCard:    { background:'rgba(255,255,255,0.05)', padding:'16px', borderRadius:'10px' },
  statLabel:   { color:'rgba(255,255,255,0.4)', fontSize:'12px', marginBottom:'4px' },
  statValue:   { fontWeight:'700', fontSize:'16px' },
  successMsg:  { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  errorMsg:    { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  bidSection:  { background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.2)', padding:'20px', borderRadius:'12px' },
  bidLabel:    { display:'block', color:'rgba(255,255,255,0.6)', fontSize:'13px', marginBottom:'10px' },
  bidRow:      { display:'flex', gap:'12px' },
  placeBidBtn: { flexShrink:0 },
  bidHint:     { color:'rgba(255,255,255,0.3)', fontSize:'12px', marginTop:'8px' },
  endedSection:{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', padding:'24px', borderRadius:'12px', textAlign:'center' },
  endedText:   { fontSize:'18px', fontWeight:'600', color:'#fca5a5' }
};

export default AuctionRoom;