const AIService = require('../services/aiService');
const Lead = require('../models/Lead');
const { AIInsight } = require('../models/AuxiliaryModels');

exports.scoreLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const aiResult = await AIService.scoreLead(lead);
    
    // Update Lead with AI Score
    lead.aiScore = aiResult.score || lead.aiScore;
    await lead.save();

    // Store the insight
    await AIInsight.create({
      leadId: lead._id,
      type: 'scoring',
      content: aiResult.reason,
      confidenceScore: 0.9
    });

    res.json({ score: lead.aiScore, reason: aiResult.reason });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateEmail = async (req, res) => {
  try {
    const { context } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const emailDraft = await AIService.generateEmail(lead, context);
    res.json({ draft: emailDraft });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommendation = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const recommendation = await AIService.getNextBestAction(lead);
    
    await AIInsight.create({
      leadId: lead._id,
      type: 'recommendation',
      content: recommendation,
      confidenceScore: 0.85
    });

    res.json({ recommendation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
