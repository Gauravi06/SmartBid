// seed.js — Run with: node seed.js
// Populates SmartBid with demo users, auctions, and bids for presentation

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User    = require('./models/User');
const Auction = require('./models/Auction');
const Bid     = require('./models/Bid');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB ✅');

  // Clear existing data
  await User.deleteMany({});
  await Auction.deleteMany({});
  await Bid.deleteMany({});
  console.log('Cleared old data 🗑️');

  // ─── 1. Create Users ────────────────────────────────────────────────────────
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const [admin, alice, bob, charlie] = await User.insertMany([
    {
      username: 'admin',
      email:    'admin@smartbid.com',
      password: hash('admin123'),
      role:     'admin',
      wallet:   9999,
      reputation: 4.9,
      totalRatings: 20
    },
    {
      username: 'alice',
      email:    'alice@demo.com',
      password: hash('alice123'),
      wallet:   5000,
      reputation: 4.5,
      totalRatings: 8
    },
    {
      username: 'bob',
      email:    'bob@demo.com',
      password: hash('bob123'),
      wallet:   3000,
      reputation: 3.8,
      totalRatings: 5
    },
    {
      username: 'charlie',
      email:    'charlie@demo.com',
      password: hash('charlie123'),
      wallet:   8000,
      reputation: 4.2,
      totalRatings: 12
    }
  ]);
  console.log('Users created 👤');

  // ─── 2. Create Auctions ─────────────────────────────────────────────────────
  const inOneHour  = new Date(Date.now() + 60 * 60 * 1000);
  const inTwoMins  = new Date(Date.now() + 2 * 60 * 1000);    // soft-close demo
  const inTwoDays  = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const yesterday  = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [auction1, auction2, auction3, auction4] = await Auction.insertMany([
    {
      title:          'Vintage Rolex Submariner 1965',
      description:    'Original dial, box and papers. Serviced 2023. A true collector\'s piece.',
      basePrice:      1500,
      currentHighest: 2100,
      highestBidder:  bob._id,
      seller:         alice._id,
      auctionType:    'english',
      endTime:        inOneHour,
      isActive:       true,
      image:          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    {
      title:          'MacBook Pro M3 Max 16-inch (Sealed)',
      description:    'Brand new, sealed box. Space Black. 36GB RAM, 1TB SSD.',
      basePrice:      2500,
      currentHighest: 2500,
      seller:         charlie._id,
      auctionType:    'english',
      endTime:        inTwoDays,
      isActive:       true,
      image:          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    },
    {
      title:          'Original Banksy Print — "Girl with Balloon"',
      description:    'Authenticated print with certificate of authenticity. Limited edition.',
      basePrice:      800,
      currentHighest: 1250,
      highestBidder:  charlie._id,
      seller:         alice._id,
      auctionType:    'english',
      endTime:        inTwoMins,   // ← for soft-close demo
      isActive:       true,
      image:          'https://images.unsplash.com/photo-1578926288207-32a2bf3f90e1?w=400'
    },
    {
      title:          'Signed Federer Wimbledon Racket 2017',
      description:    'Used in the 2017 Wimbledon final. Full authentication certificate.',
      basePrice:      3000,
      currentHighest: 3000,
      seller:         bob._id,
      auctionType:    'sealed',
      endTime:        yesterday,
      isActive:       false,
      isEnded:        true,
      winner:         alice._id,
      image:          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400'
    }
  ]);
  console.log('Auctions created 🏷️');

  // ─── 3. Create Bids on Auction 1 (Rolex) ────────────────────────────────────
  const bids = await Bid.insertMany([
    { auction: auction1._id, bidder: bob._id,     amount: 1600, createdAt: new Date(Date.now() - 50*60*1000) },
    { auction: auction1._id, bidder: charlie._id, amount: 1800, createdAt: new Date(Date.now() - 40*60*1000) },
    { auction: auction1._id, bidder: bob._id,     amount: 1950, createdAt: new Date(Date.now() - 30*60*1000) },
    { auction: auction1._id, bidder: charlie._id, amount: 2050, createdAt: new Date(Date.now() - 20*60*1000) },
    { auction: auction1._id, bidder: bob._id,     amount: 2100, createdAt: new Date(Date.now() - 10*60*1000) },

    // Auction 3 bids (Banksy — near soft-close)
    { auction: auction3._id, bidder: bob._id,     amount: 900,  createdAt: new Date(Date.now() - 60*60*1000) },
    { auction: auction3._id, bidder: charlie._id, amount: 1100, createdAt: new Date(Date.now() - 30*60*1000) },
    { auction: auction3._id, bidder: charlie._id, amount: 1250, createdAt: new Date(Date.now() - 5*60*1000)  },
  ]);

  // Link bids to auctions and users
  auction1.bids = bids.slice(0,5).map(b => b._id);
  await auction1.save();

  auction3.bids = bids.slice(5).map(b => b._id);
  await auction3.save();

  await User.findByIdAndUpdate(bob._id,     { bidHistory: [bids[0]._id, bids[2]._id, bids[4]._id, bids[5]._id] });
  await User.findByIdAndUpdate(charlie._id, { bidHistory: [bids[1]._id, bids[3]._id, bids[6]._id, bids[7]._id] });

  console.log('Bids created 💰');

  // ─── Done ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete! Demo credentials:\n');
  console.log('  👤 admin   / admin123   (Admin panel)');
  console.log('  👤 alice   / alice123   (Seller)');
  console.log('  👤 bob     / bob123     (Bidder)');
  console.log('  👤 charlie / charlie123 (Bidder)\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });