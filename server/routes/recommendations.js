const express      = require('express');
const router       = express.Router();
const Bid          = require('../models/Bid');
const Auction      = require('../models/Auction');
const AuctionGraph = require('../utils/AuctionGraph');

/**
 * GET /api/recommendations/:auctionId
 * Uses BFS on bidder-auction graph to find related active auctions
 */
router.get('/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;

    // Fetch all bids to build the graph
    const allBids = await Bid.find({}, 'bidder auction');

    // Build graph from bid relationships
    const graph = AuctionGraph.buildFromBids(allBids);

    // BFS — find auctions connected via shared bidders
    const relatedIds = graph.getRecommendations(auctionId, 5);

    if (relatedIds.length === 0) {
      // Fallback: return other active auctions
      const fallback = await Auction.find({
        isActive: true,
        _id: { $ne: auctionId }
      })
        .populate('seller', 'username')
        .limit(4);
      return res.json({ recommendations: fallback, graphStats: graph.stats(), source: 'fallback' });
    }

    // Fetch full auction details for the recommended IDs
    const recommendations = await Auction.find({
      _id:      { $in: relatedIds },
      isActive: true
    }).populate('seller', 'username');

    res.json({
      recommendations,
      graphStats: graph.stats(), // expose node/edge count for demo
      source: 'bfs'
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;