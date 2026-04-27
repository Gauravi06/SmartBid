/**
 * HashTable.js — Custom Hash Table with chaining (collision resolution)
 * Used by: fraudCheck.js for O(1) per-user bid tracking
 *
 * DSA Concepts:
 *  - Hash function (djb2 algorithm)
 *  - Separate chaining for collision resolution
 *  - Load factor tracking & rehashing
 */

class HashTable {
  constructor(size = 53) {
    this.buckets  = new Array(size).fill(null).map(() => []);
    this.size     = size;
    this.count    = 0;
  }

  // djb2 hash function — good distribution for string keys
  _hash(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33) ^ key.charCodeAt(i);
    }
    return Math.abs(hash) % this.size;
  }

  // Load factor: if > 0.7, rehash to keep performance near O(1)
  _loadFactor() {
    return this.count / this.size;
  }

  _rehash() {
    const oldBuckets = this.buckets;
    this.size     = this.size * 2 + 1;
    this.buckets  = new Array(this.size).fill(null).map(() => []);
    this.count    = 0;

    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        this.set(key, value); // reinsert into new table
      }
    }
  }

  set(key, value) {
    const index  = this._hash(key);
    const bucket = this.buckets[index];

    // Update existing key (chaining: search the list at this bucket)
    const existing = bucket.find(pair => pair[0] === key);
    if (existing) {
      existing[1] = value;
      return;
    }

    bucket.push([key, value]);
    this.count++;

    if (this._loadFactor() > 0.7) this._rehash();
  }

  get(key) {
    const index  = this._hash(key);
    const bucket = this.buckets[index];
    const pair   = bucket.find(pair => pair[0] === key);
    return pair ? pair[1] : undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const index  = this._hash(key);
    const bucket = this.buckets[index];
    const idx    = bucket.findIndex(pair => pair[0] === key);
    if (idx !== -1) {
      bucket.splice(idx, 1);
      this.count--;
      return true;
    }
    return false;
  }

  // For debugging — show table stats
  stats() {
    return {
      size:       this.size,
      count:      this.count,
      loadFactor: this._loadFactor().toFixed(2),
      collisions: this.buckets.filter(b => b.length > 1).length
    };
  }
}

module.exports = HashTable;