const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Auction = require('../models/Auction');
const Bid     = require('../models/Bid');

// GET DASHBOARD STATS
router.get('/stats', async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: 'user' });
    const totalAuctions = await Auction.countDocuments();
    const totalBids     = await Bid.countDocuments();
    const activeAuctions= await Auction.countDocuments({ isActive: true });
    const flaggedBids   = await Bid.countDocuments({ isFlagged: true });
    const bannedUsers   = await User.countDocuments({ isBanned: true });

    res.json({ totalUsers, totalAuctions, totalBids, activeAuctions, flaggedBids, bannedUsers });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// BAN / UNBAN USER
router.put('/users/ban/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ msg: user.isBanned ? 'User banned ✅' : 'User unbanned ✅', isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET ALL AUCTIONS
router.get('/auctions', async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('seller', 'username email')
      .populate('highestBidder', 'username')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// DELETE AUCTION
router.delete('/auctions/:id', async (req, res) => {
  try {
    await Auction.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ auction: req.params.id });
    res.json({ msg: 'Auction deleted ✅' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET ALL FLAGGED BIDS
router.get('/flagged', async (req, res) => {
  try {
    const bids = await Bid.find({ isFlagged: true })
      .populate('bidder', 'username email')
      .populate('auction', 'title')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// END AUCTION MANUALLY
router.put('/auctions/end/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('highestBidder', 'username email')
      .populate('seller', 'username email');
    if (!auction) return res.status(404).json({ msg: 'Auction not found' });
    auction.isActive = false;
    auction.isEnded  = true;
    auction.winner   = auction.highestBidder?._id || null;
    await auction.save();
    res.json({ msg: 'Auction ended ✅', winner: auction.highestBidder, sellerInfo: { name: auction.seller.username, email: auction.seller.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;