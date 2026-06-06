const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  domain:    { type: String, required: true, trim: true },
  timeSpent: { type: Number, required: true, min: 0 },  // seconds
  date:      { type: String, required: true, index: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
  clientId:  { type: String },  // deduplification key
}, { timestamps: true });

// Compound index for efficient daily queries
timeLogSchema.index({ userId: 1, date: 1, domain: 1 });
// Unique constraint on clientId to prevent duplicates
timeLogSchema.index({ clientId: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model('TimeLog', timeLogSchema);
