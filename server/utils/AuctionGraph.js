/**
 * AuctionGraph.js — Bidder-Auction Graph with BFS recommendation engine
 *
 * DSA Concepts:
 *  - Undirected Graph using Adjacency List (Map of Sets)
 *  - BFS traversal to find related auctions
 *  - "Users who bid on X also bid on Y" pattern
 *
 * Graph structure:
 *   Nodes  → userIds and auctionIds
 *   Edges  → user ↔ auction (bidder participated in that auction)
 *
 * BFS from a given auctionId finds:
 *   auction → bidders on it → other auctions those bidders participated in
 */

class AuctionGraph {
  constructor() {
    this.adjacencyList = new Map(); // node → Set of neighbours
  }

  addNode(id) {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Set());
    }
  }

  addEdge(userId, auctionId) {
    this.addNode(userId);
    this.addNode(auctionId);
    this.adjacencyList.get(userId).add(auctionId);
    this.adjacencyList.get(auctionId).add(userId);
  }

  // BFS from a source auction — returns related auction IDs (depth 2)
  // Path: sourceAuction → bidders → their other auctions
  getRecommendations(sourceAuctionId, limit = 5) {
    if (!this.adjacencyList.has(sourceAuctionId)) return [];

    const visited = new Set();
    const queue   = [{ node: sourceAuctionId, depth: 0 }];
    const recommended = [];

    visited.add(sourceAuctionId);

    while (queue.length > 0 && recommended.length < limit) {
      const { node, depth } = queue.shift(); // dequeue — BFS

      if (depth > 2) break; // only go 2 hops deep

      const neighbours = this.adjacencyList.get(node) || new Set();

      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);

          // Depth 2 nodes are auctions connected via shared bidders
          if (depth === 1 && neighbour !== sourceAuctionId) {
            recommended.push(neighbour);
          }

          queue.push({ node: neighbour, depth: depth + 1 });
        }
      }
    }

    return recommended.slice(0, limit);
  }

  // Build the graph from bid records fetched from DB
  static buildFromBids(bids) {
    const graph = new AuctionGraph();
    for (const bid of bids) {
      const userId    = bid.bidder.toString();
      const auctionId = bid.auction.toString();
      graph.addEdge(userId, auctionId);
    }
    return graph;
  }

  stats() {
    return {
      nodes: this.adjacencyList.size,
      edges: [...this.adjacencyList.values()]
        .reduce((sum, set) => sum + set.size, 0) / 2
    };
  }
}

module.exports = AuctionGraph;