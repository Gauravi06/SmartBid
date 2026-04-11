import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function WinnerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.put(`http://localhost:5000/api/auctions/end/${id}`)
      .then(res => setResult(res.data))
      .catch(err => console.log(err));
  }, [id]);

  if (!result) return (
    <div className="gradient-bg" style={s.loading}>
      <div style={s.spinner}>⏳</div>
      <p>Declaring winner...</p>
    </div>
  );

  return (
    <div className="gradient-bg" style={s.page}>
      <div style={s.container}>

        {/* Confetti Header */}
        <div style={s.confetti}>🎉 🏆 🎊</div>

        <div className="glass" style={s.winnerCard}>
          <div style={s.trophy}>🏆</div>
          <h1 style={s.winnerTitle}>Auction Winner!</h1>
          <p style={s.item}>"{result.item}"</p>

          <div style={s.winnerInfo}>
            <div style={s.winnerAvatar}>
              {result.winner?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={s.winnerName}>{result.winner?.username || 'Unknown'}</p>
              <p style={s.winnerEmail}>{result.winner?.email}</p>
            </div>
          </div>

          <div style={s.bidAmount}>
            <p style={s.bidLabel}>Winning Bid</p>
            <p style={s.bidValue}>₹{result.winningBid?.toLocaleString()}</p>
          </div>
        </div>

        {/* Seller Contact Card */}
        <div className="glass" style={s.sellerCard}>
          <h2 style={s.sellerTitle}>📋 Seller Contact Details</h2>
          <p style={s.sellerSubtitle}>
            Winner — please contact the seller to complete the transaction
          </p>

          <div style={s.sellerInfo}>
            <div style={s.sellerRow}>
              <span style={s.sellerIcon}>👤</span>
              <div>
                <p style={s.sellerLabel}>Seller Name</p>
                <p style={s.sellerValue}>{result.sellerInfo?.name}</p>
              </div>
            </div>
            <div style={s.sellerRow}>
              <span style={s.sellerIcon}>📧</span>
              <div>
                <p style={s.sellerLabel}>Email Address</p>
                <p style={s.sellerValue}>{result.sellerInfo?.email}</p>
              </div>
            </div>
            <div style={s.sellerRow}>
              <span style={s.sellerIcon}>📦</span>
              <div>
                <p style={s.sellerLabel}>Item</p>
                <p style={s.sellerValue}>{result.item}</p>
              </div>
            </div>
            <div style={s.sellerRow}>
              <span style={s.sellerIcon}>💰</span>
              <div>
                <p style={s.sellerLabel}>Amount to Pay</p>
                <p style={s.sellerValue}>₹{result.winningBid?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div style={s.noteBox}>
            <p style={s.noteText}>
              📌 Please contact the seller within 24 hours to arrange payment and delivery.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => navigate('/auctions')} style={s.backBtn}>
          ← Back to Auctions
        </button>
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', padding:'40px 24px' },
  loading:     { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' },
  spinner:     { fontSize:'48px', animation:'spin 1s linear infinite' },
  container:   { maxWidth:'600px', margin:'0 auto' },
  confetti:    { textAlign:'center', fontSize:'40px', marginBottom:'24px', letterSpacing:'16px' },
  winnerCard:  { padding:'40px', textAlign:'center', marginBottom:'24px' },
  trophy:      { fontSize:'64px', marginBottom:'16px' },
  winnerTitle: { fontSize:'32px', fontWeight:'800', marginBottom:'8px', color:'#fbbf24' },
  item:        { color:'rgba(255,255,255,0.6)', fontSize:'16px', marginBottom:'32px' },
  winnerInfo:  { display:'flex', alignItems:'center', gap:'16px', background:'rgba(108,99,255,0.15)', padding:'20px', borderRadius:'12px', marginBottom:'24px' },
  winnerAvatar:{ width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'700', flexShrink:0 },
  winnerName:  { fontSize:'20px', fontWeight:'700', marginBottom:'4px' },
  winnerEmail: { color:'rgba(255,255,255,0.5)', fontSize:'14px' },
  bidAmount:   { background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)', padding:'20px', borderRadius:'12px' },
  bidLabel:    { color:'rgba(255,255,255,0.6)', fontSize:'13px', marginBottom:'4px' },
  bidValue:    { fontSize:'36px', fontWeight:'800', color:'#fbbf24' },
  sellerCard:  { padding:'32px', marginBottom:'24px' },
  sellerTitle: { fontSize:'20px', fontWeight:'700', marginBottom:'8px' },
  sellerSubtitle: { color:'rgba(255,255,255,0.5)', fontSize:'14px', marginBottom:'24px' },
  sellerInfo:  { display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px' },
  sellerRow:   { display:'flex', alignItems:'center', gap:'16px', padding:'16px', background:'rgba(255,255,255,0.05)', borderRadius:'10px' },
  sellerIcon:  { fontSize:'24px', width:'40px', textAlign:'center', flexShrink:0 },
  sellerLabel: { color:'rgba(255,255,255,0.5)', fontSize:'12px', marginBottom:'4px' },
  sellerValue: { fontWeight:'600', fontSize:'15px' },
  noteBox:     { background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', padding:'16px', borderRadius:'10px' },
  noteText:    { color:'rgba(255,255,255,0.6)', fontSize:'13px', lineHeight:'1.6' },
  backBtn:     { width:'100%', padding:'16px', fontSize:'16px' }
};

export default WinnerPage;