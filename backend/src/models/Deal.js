const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  value: { type: Number, required: true, default: 0 },
  stage: { 
    type: String, 
    enum: ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New Lead'
  },
  expectedCloseDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Deal = mongoose.model('Deal', dealSchema);
module.exports = Deal;
