const Deal = require('../models/Deal');

// @desc    Get all deals for the pipeline
// @route   GET /api/deals
exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ createdBy: req.user._id })
      .populate('leadId', 'name company email aiScore')
      .sort({ updatedAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update deal stage (for drag & drop)
// @route   PUT /api/deals/:id/stage
exports.updateDealStage = async (req, res) => {
  try {
    const { stage } = req.body;
    let deal = await Deal.findById(req.params.id);
    
    if (!deal || deal.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    deal.stage = stage;
    const updatedDeal = await deal.save();
    
    // Repopulate lead info before returning
    await updatedDeal.populate('leadId', 'name company email aiScore');
    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal || deal.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    await Deal.deleteOne({ _id: deal._id });
    res.json({ message: 'Deal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto Sort Deals based on AI heuristics
// @route   POST /api/deals/auto-sort
exports.autoSortDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ createdBy: req.user._id }).populate('leadId', 'aiScore');
    let updatedCount = 0;

    for (const deal of deals) {
      if (!deal.leadId) continue;
      
      let newStage = deal.stage;
      const score = deal.leadId.aiScore || 0;

      if (deal.stage === 'New Lead' && score >= 75) {
        newStage = 'Contacted';
      } else if (deal.stage === 'Contacted' && score >= 85) {
        newStage = 'Meeting Scheduled';
      }

      if (deal.stage === 'Meeting Scheduled' && deal.value >= 100000) {
        newStage = 'Negotiation';
      }

      if (newStage !== deal.stage) {
        deal.stage = newStage;
        await deal.save();
        updatedCount++;
      }
    }

    res.json({ message: `AI successfully optimized ${updatedCount} deals.`, updatedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
