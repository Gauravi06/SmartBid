# SmartBid 🏷️
### Real-Time Auction Platform with Advanced Data Structures
---

## Overview

SmartBid is a full-stack real-time auction platform where users can create auctions, place bids, and win items — all with live updates across browsers using WebSockets. The platform implements several core data structures from the ADSA syllabus directly in its business logic, not as isolated exercises.

The system supports three auction types (English, Dutch, Sealed), automatic fraud detection, soft-close anti-sniping, and a BFS-powered recommendation engine.

---

## Features

| Feature | Description |
|---|---|
| 🔴 Real-time bidding | Live bid updates across all connected browsers via Socket.io |
| 🏔️ Highest bid tracking | Max Heap maintains the leading bid in O(1) |
| 🛡️ Fraud detection | Custom Hash Table + Sliding Window catches bid spamming |
| ⏱️ Soft close | Auction auto-extends 2 minutes if a bid arrives in the final window |
| 🔁 Recommendations | BFS on a bidder-auction graph surfaces related auctions |
| 🖼️ Image uploads | Cloudinary integration for auction item photos |
| 👮 Admin dashboard | Ban users, view flagged bids, end auctions manually |

---

## Data Structures & Algorithms

This section maps every DSA concept to the exact file and use case in the project.

---

### 1. Max Heap — `server/utils/BidHeap.js`
**Syllabus: Unit III — Heap Data Structure, Min and Max Heap**

A from-scratch Max Heap keeps the highest bid at the root at all times. Each auction has its own heap instance stored in memory.

```
Insert bid → bubble up → O(log n)
Get highest → root access → O(1)
```

**Implementation highlights:**
- Array-based heap storage
- `_bubbleUp()` restores heap property after every insert
- One heap per auction, stored in a Map keyed by auctionId

```js
// Every bid placed triggers a heap insert
heap.insert({ amount: 2100, bidderId: 'abc' });
heap.getMax(); // → { amount: 2100, bidderId: 'abc' } in O(1)
```

---

### 2. Custom Hash Table — `server/utils/HashTable.js`
**Syllabus: Unit III — Hash Table, Hash Functions, Collision Resolution, Load Factor & Rehashing**

A fully custom hash table using the **djb2 hash function** and **separate chaining** for collision resolution. This is used by the fraud detection module — replacing JavaScript's built-in `Map` with a hand-built implementation.

```
hash(key) → bucket index → O(1) average
collision → chaining (linked list per bucket)
load factor > 0.7 → rehash (double table size)
```

**Implementation highlights:**
- djb2 hashing: `hash = (hash * 33) XOR charCode`
- Separate chaining: each bucket holds an array of `[key, value]` pairs
- Load factor tracking: rehashes automatically when `count / size > 0.7`
- `stats()` method exposes load factor and collision count for debugging

```js
const table = new HashTable(53);
table.set('user_123', { count: 3, lastTime: Date.now() });
table.get('user_123'); // O(1) lookup
// Rehashes automatically if load factor exceeds 0.7
```

---

### 3. Bidder-Auction Graph + BFS — `server/utils/AuctionGraph.js`
**Syllabus: Unit II — Graphs, Adjacency List, Breadth First Search (Iterative)**

An undirected graph is built at runtime from all bid records in the database. Nodes are user IDs and auction IDs. An edge exists between a user and an auction if the user placed a bid on it. BFS traverses this graph to recommend related auctions.

```
Nodes:  userIds + auctionIds
Edges:  user ↔ auction (bid placed)
BFS depth 2: auction → bidders → their other auctions
```

**Implementation highlights:**
- Adjacency list using `Map<nodeId, Set<neighbourId>>`
- Iterative BFS with an explicit queue and visited set
- `buildFromBids(bids)` static factory constructs the graph from DB records
- Depth-limited to 2 hops to keep recommendations relevant

```
sourceAuction
    │
    ├── bidder_A ──── auctionX  ← recommended
    │                auctionY  ← recommended
    │
    └── bidder_B ──── auctionZ  ← recommended
```

---

### 4. Sliding Window — `server/utils/fraudCheck.js`
**Syllabus: Unit III — Hashing Techniques (applied)**

A time-based sliding window rate-limits bids per user. Combined with the custom Hash Table, it detects bot-like behaviour in O(1) per check.

- Window: 60 seconds
- Limit: 5 bids per window
- Resets the window automatically when the interval expires

---

### 5. Dynamic Arrays — Mongoose Models
**Syllabus: Linear Data Structures**

Mongoose schemas use arrays as embedded reference lists. MongoDB's `$push` operator appends new entries, making them dynamic ordered lists:

```js
auction.bids     → ObjectId[]   // ordered list of all bids
user.bidHistory  → ObjectId[]   // user's full bid trail
```

---

### 6. Graph via Document References (Implicit)
**Syllabus: Unit II — Graph Storage Representation**

The three core models form a directed graph through MongoDB ObjectId references. Mongoose's `.populate()` performs graph traversal to resolve connected documents:

```
User ──(seller)──▶ Auction
User ──(bidder)──▶ Bid ──▶ Auction
Auction ──(bids[])──▶ Bid[]
Auction ──(winner)──▶ User
```

---

### DSA Summary Table

| Concept | File | Syllabus Unit |
|---|---|---|
| Max Heap (custom) | `utils/BidHeap.js` | Unit III |
| Hash Table + djb2 + Chaining + Rehashing | `utils/HashTable.js` | Unit III |
| Graph (Adjacency List) + BFS (Iterative) | `utils/AuctionGraph.js` | Unit II |
| Sliding Window | `utils/fraudCheck.js` | Unit III |
| Dynamic Array | Mongoose models | Linear DS |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   React Client                  │
│              (localhost:3000)                   │
└────────────────────┬────────────────────────────┘
                     │  HTTP + WebSocket
┌────────────────────▼────────────────────────────┐
│              Express Server                     │
│              (localhost:5000)                   │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ MaxHeap  │  │HashTable │  │AuctionGraph  │  │
│  │(per bid) │  │(fraud)   │  │(BFS recs)    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                 │
│  Socket.io — real-time bid broadcasting         │
└────────────────────┬────────────────────────────┘
                     │  Mongoose ODM
┌────────────────────▼────────────────────────────┐
│                  MongoDB                        │
│         Users | Auctions | Bids                 │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
smartbid/
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.js
│
└── server/                     # Node/Express backend
    ├── models/
    │   ├── User.js
    │   ├── Auction.js
    │   └── Bid.js
    ├── routes/
    │   ├── users.js            # register, login, profile
    │   ├── auctions.js         # create, list, end
    │   ├── bids.js             # place bid (heap + fraud + softclose)
    │   ├── recommendations.js  # BFS-based related auctions
    │   └── admin.js            # stats, ban users, flagged bids
    ├── utils/
    │   ├── BidHeap.js          # ← Max Heap (Unit III)
    │   ├── HashTable.js        # ← Custom Hash Table (Unit III)
    │   ├── AuctionGraph.js     # ← Graph + BFS (Unit II)
    │   ├── fraudCheck.js       # ← Sliding Window (Unit III)
    │   ├── softClose.js        # ← Anti-sniping timer extension
    │   └── cloudinary.js       # Image upload config
    ├── seed.js                 # Demo data seeder
    ├── createAdmin.js          # Admin user helper
    └── server.js               # Entry point + Socket.io
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or Atlas)
- Cloudinary account (credentials pre-configured in `.env`)

### Installation

**1. Clone and navigate into the project:**
```bash
git clone <repo-url>
cd smartbid
```

**2. Install server dependencies:**
```bash
cd server
npm install
```

**3. Configure environment variables** — edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/smartbid
JWT_SECRET=smartbid_secret_key_123
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**4. Seed the database with demo data:**
```bash
node seed.js
```

**5. Start the server:**
```bash
npm run dev        # development (auto-restart)
# or
npm start          # production
```

**6. In a new terminal — install and start the client:**
```bash
cd client
npm install
npm start
```

The app is now running at **http://localhost:3000**

---

## Demo Walkthrough

### Demo Credentials (after running `node seed.js`)

| Email | Password | Role |
|---|---|---|
| admin@smartbid.com | admin123 | Admin |
| alice@demo.com | alice123 | Seller |
| bob@demo.com | bob123 | Bidder |
| charlie@demo.com | charlie123 | Bidder |

### Demonstration Steps

**Step 1 — Browse live auctions**  
Log in as Alice. The home page shows active auctions seeded with real bid history.

**Step 2 — Create an auction**  
As Alice, create a new auction with a 5-minute end time and upload an image.

**Step 3 — Real-time bidding**  
Open a second browser window as Bob. Place a bid — watch it appear in Alice's window instantly via Socket.io, without refreshing.

**Step 4 — Soft Close**  
Open the Banksy print auction (seeded to expire in ~2 minutes). Place a bid — the end time automatically extends by 2 minutes, preventing last-second sniping.

**Step 5 — Fraud Detection**  
As Bob, place 6+ bids rapidly. The 6th bid is blocked: `"Bid flagged: Too many bids in short time"`. This is the sliding window + hash table firing.

**Step 6 — Recommendations**  
Visit `GET /api/recommendations/<auctionId>` — the BFS graph engine returns auctions that shared bidders have participated in.

**Step 7 — Admin Panel**  
Log in as admin. View dashboard stats, inspect the flagged bid from Step 5, and manually end an auction to declare a winner.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Real-time | Socket.io (WebSockets) |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Image Storage | Cloudinary |
| DSA Layer | Vanilla JavaScript (no libraries) |

---

## API Reference

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login, returns JWT |
| GET | `/api/users/profile/:id` | Get user profile |
| POST | `/api/users/rate/:id` | Rate a user after auction |

### Auctions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auctions/create` | Create auction (with image upload) |
| GET | `/api/auctions/active` | List all active auctions |
| GET | `/api/auctions/:id` | Get single auction with bids |
| PUT | `/api/auctions/end/:id` | End auction, declare winner |
| GET | `/api/auctions/seller/:id` | Get auctions by seller |

### Bids
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bids/place` | Place a bid (runs heap + fraud + softclose) |
| GET | `/api/bids/auction/:id` | All bids for an auction |
| GET | `/api/bids/user/:id` | Bid history for a user |

### Recommendations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recommendations/:auctionId` | BFS-based related auctions |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/ban/:id` | Ban / unban a user |
| GET | `/api/admin/auctions` | All auctions |
| DELETE | `/api/admin/auctions/:id` | Delete auction |
| GET | `/api/admin/flagged` | All flagged bids |
| PUT | `/api/admin/auctions/end/:id` | Manually end an auction |

### Socket.io Events
| Event | Direction | Payload |
|---|---|---|
| `joinAuction` | Client → Server | `auctionId` |
| `placeBid` | Client → Server | `{ auctionId, amount }` |
| `bidUpdate` | Server → Client | `{ auctionId, amount, bidder }` |

---

