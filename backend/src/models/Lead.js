const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Meeting Scheduled', 'Lost'], default: 'New' },
  aiScore: { type: Number, min: 0, max: 100, default: 0 },
  source: { type: String, default: 'Manual' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
