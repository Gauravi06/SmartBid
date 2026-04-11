const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  wallet:       { type: Number, default: 1000 },
  reputation:   { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  role:         { type: String, enum: ['user','admin'], default: 'user' },
  isBanned:     { type: Boolean, default: false },
  bidHistory:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);