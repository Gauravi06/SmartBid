const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  description:    { type: String },
  basePrice:      { type: Number, required: true },
  currentHighest: { type: Number, default: 0 },
  highestBidder:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  auctionType:    { type: String, enum: ['english','dutch','sealed'], default: 'english' },
  endTime:        { type: Date, required: true },
  isActive:       { type: Boolean, default: true },
  isFlagged:      { type: Boolean, default: false },
  image:          { type: String, default: '' },
  imagePublicId:  { type: String, default: '' },
  winner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isEnded:        { type: Boolean, default: false },
  bids:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }]
}, { timestamps: true });

module.exports = mongoose.model('Auction', AuctionSchema);