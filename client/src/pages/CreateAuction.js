import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateAuction() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm]         = useState({ title:'', description:'', basePrice:'', auctionType:'english', endTime:'' });
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title',       form.title);
      formData.append('description', form.description);
      formData.append('basePrice',   form.basePrice);
      formData.append('auctionType', form.auctionType);
      formData.append('endTime',     form.endTime);
      formData.append('seller',      user.id);
      if (image) formData.append('image', image);

      await axios.post('http://localhost:5000/api/auctions/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Auction created successfully! ✅');
      setTimeout(() => navigate('/auctions'), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create auction');
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={s.page}>
      <div style={s.container}>
        <button onClick={() => navigate('/auctions')} style={s.back}>← Back</button>
        <h2 style={s.title}>🏷️ Create New Auction</h2>

        <div style={s.grid}>
          {/* Left - Form */}
          <div className="glass" style={s.formBox}>
            {error   && <div style={s.error}>{error}</div>}
            {success && <div style={s.successMsg}>{success}</div>}
            <form onSubmit={handleCreate}>
              <label style={s.label}>Item Title *</label>
              <input className="input-field" name="title" placeholder="e.g. iPhone 15 Pro Max"
                value={form.title} onChange={handleChange} required />

              <label style={s.label}>Description</label>
              <textarea className="input-field" name="description" placeholder="Describe your item..."
                value={form.description} onChange={handleChange} rows={3} style={{resize:'vertical'}} />

              <label style={s.label}>Base Price (₹) *</label>
              <input className="input-field" name="basePrice" type="number" placeholder="e.g. 50000"
                value={form.basePrice} onChange={handleChange} required />

              <label style={s.label}>Auction Type *</label>
              <select className="input-field" name="auctionType" value={form.auctionType} onChange={handleChange}>
                <option value="english">🔺 English — Highest bid wins</option>
                <option value="dutch">🔻 Dutch — Price decreases over time</option>
                <option value="sealed">🔒 Sealed — Hidden bids, revealed at end</option>
              </select>

              <label style={s.label}>End Date & Time *</label>
              <input className="input-field" name="endTime" type="datetime-local"
                value={form.endTime} onChange={handleChange} required />

              <button className="btn-primary" type="submit" style={{width:'100%', marginTop:'8px'}} disabled={loading}>
                {loading ? '⏳ Creating...' : '🚀 Launch Auction'}
              </button>
            </form>
          </div>

          {/* Right - Image Upload */}
          <div className="glass" style={s.imageBox}>
            <h3 style={s.imgTitle}>📸 Product Image</h3>
            <p style={s.imgSubtitle}>Upload a clear image of your item</p>

            <label style={s.uploadArea}>
              {preview ? (
                <img src={preview} alt="preview" style={s.previewImg} />
              ) : (
                <div style={s.uploadPlaceholder}>
                  <div style={{fontSize:'48px'}}>📷</div>
                  <p style={{color:'rgba(255,255,255,0.5)', marginTop:'12px'}}>Click to upload image</p>
                  <p style={{color:'rgba(255,255,255,0.3)', fontSize:'12px', marginTop:'4px'}}>JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{display:'none'}} />
            </label>

            {preview && (
              <button onClick={() => { setImage(null); setPreview(null); }}
                style={s.removeBtn}>✕ Remove Image</button>
            )}

            <div style={s.tipBox}>
              <p style={s.tipTitle}>💡 Tips for better bids</p>
              <p style={s.tipText}>• Use clear, well-lit photos</p>
              <p style={s.tipText}>• Show item from multiple angles</p>
              <p style={s.tipText}>• Set a fair base price</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', padding:'32px' },
  container:   { maxWidth:'1000px', margin:'0 auto' },
  back:        { background:'none', border:'none', color:'#6c63ff', fontSize:'16px', cursor:'pointer', marginBottom:'16px' },
  title:       { fontSize:'28px', fontWeight:'700', marginBottom:'32px' },
  grid:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' },
  formBox:     { padding:'32px' },
  label:       { display:'block', marginBottom:'6px', fontSize:'13px', color:'rgba(255,255,255,0.6)' },
  imageBox:    { padding:'32px' },
  imgTitle:    { fontSize:'18px', fontWeight:'600', marginBottom:'8px' },
  imgSubtitle: { color:'rgba(255,255,255,0.5)', fontSize:'14px', marginBottom:'20px' },
  uploadArea:  { display:'block', cursor:'pointer', border:'2px dashed rgba(108,99,255,0.4)', borderRadius:'12px', overflow:'hidden', minHeight:'220px' },
  previewImg:  { width:'100%', height:'220px', objectFit:'cover', display:'block' },
  uploadPlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'220px' },
  removeBtn:   { marginTop:'12px', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', width:'100%' },
  tipBox:      { marginTop:'24px', padding:'16px', background:'rgba(108,99,255,0.1)', borderRadius:'10px' },
  tipTitle:    { fontWeight:'600', marginBottom:'8px', color:'#a78bfa' },
  tipText:     { fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' },
  error:       { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' },
  successMsg:  { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac', padding:'12px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px' }
};

export default CreateAuction;