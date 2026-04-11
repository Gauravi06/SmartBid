class MaxHeap {
  constructor() { this.heap = []; }

  insert(bid) {
    this.heap.push(bid);
    this._bubbleUp(this.heap.length - 1);
  }

  getMax() { return this.heap[0] || null; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].amount >= this.heap[i].amount) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
}

module.exports = MaxHeap;