const express = require('express');
const router  = express.Router();
const Auction = require('../models/Auction');
const User    = require('../models/User');
const { upload } = require('../utils/cloudinary');

// CREATE AUCTION WITH IMAGE
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { title, description, basePrice, auctionType, endTime, seller } = req.body;

    const auction = new Auction({
      title,
      description,
      basePrice,
      currentHighest: Number(basePrice),
      auctionType,
      endTime,
      seller,
      image:         req.file ? req.file.path : '',
      imagePublicId: req.file ? req.file.filename : ''
    });

    await auction.save();
    res.json({ msg: 'Auction created ✅', auction });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET ALL ACTIVE AUCTIONS
router.get('/active', async (req, res) => {
  try {
    const auctions = await Auction.find({ isActive: true })
      .populate('seller', 'username email')
      .populate('highestBidder', 'username')
      .sort({ endTime: 1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET SINGLE AUCTION
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'username email')
      .populate('highestBidder', 'username email')
      .populate('winner', 'username email')
      .populate({ path: 'bids', populate: { path: 'bidder', select: 'username' } });
    if (!auction) return res.status(404).json({ msg: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// END AUCTION — declare winner + return seller details
router.put('/end/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('highestBidder', 'username email')
      .populate('seller', 'username email');

    if (!auction) return res.status(404).json({ msg: 'Auction not found' });

    auction.isActive = false;
    auction.isEnded  = true;
    auction.winner   = auction.highestBidder?._id || null;
    await auction.save();

    res.json({
      msg:        'Auction ended ✅',
      winner:     auction.highestBidder,
      winningBid: auction.currentHighest,
      sellerInfo: {
        name:  auction.seller.username,
        email: auction.seller.email
      },
      item: auction.title
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET AUCTIONS BY SELLER
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.params.sellerId });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;