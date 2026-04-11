const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');
const checkFraud = require('../utils/fraudCheck');
const checkSoftClose = require('../utils/softClose');
const MaxHeap = require('../utils/BidHeap');

// One heap per auction stored in memory
const auctionHeaps = new Map();

// PLACE BID
router.post('/place', async (req, res) => {
  try {
    const { auctionId, bidderId, amount } = req.body;

    // Step 1: Get auction
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ msg: 'Auction not found' });
    if (!auction.isActive) return res.status(400).json({ msg: 'Auction has ended' });

    // Step 2: Check auction time
    if (new Date() > new Date(auction.endTime)) {
      auction.isActive = false;
      await auction.save();
      return res.status(400).json({ msg: 'Auction has expired' });
    }

    // Step 3: Validate bid amount
    if (amount <= auction.currentHighest) {
      return res.status(400).json({ msg: `Bid must be higher than current highest: ${auction.currentHighest}` });
    }

    // Step 4: Fraud check
    const fraud = checkFraud(bidderId, amount, auction.currentHighest);
    if (fraud.flagged) {
      return res.status(400).json({ msg: `Bid flagged: ${fraud.reason}` });
    }

    // Step 5: Soft close check
    const extended = checkSoftClose(auction);

    // Step 6: Save bid to DB
    const bid = new Bid({
      auction: auctionId,
      bidder: bidderId,
      amount,
      isFlagged: false
    });
    await bid.save();

    // Step 7: Update auction
    auction.currentHighest = amount;
    auction.highestBidder = bidderId;
    auction.bids.push(bid._id);
    await auction.save();

    // Step 8: Update user bid history
    await User.findByIdAndUpdate(bidderId, { $push: { bidHistory: bid._id } });

    // Step 9: Update heap
    if (!auctionHeaps.has(auctionId)) {
      auctionHeaps.set(auctionId, new MaxHeap());
    }
    auctionHeaps.get(auctionId).insert({ amount, bidderId });

    res.json({
      msg: 'Bid placed successfully ✅',
      bid,
      currentHighest: amount,
      extended,
      newEndTime: auction.endTime
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET ALL BIDS FOR AN AUCTION
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'username')
      .sort({ amount: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET BID HISTORY OF A USER
router.get('/user/:userId', async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.params.userId })
      .populate('auction', 'title currentHighest isActive')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;