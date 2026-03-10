const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  isAIGenerated: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const aiInsightSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  type: { type: String, enum: ['scoring', 'recommendation', 'summary'], required: true },
  content: { type: String, required: true },
  confidenceScore: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);
const Note = mongoose.model('Note', noteSchema);
const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

module.exports = { Task, Note, AIInsight };
