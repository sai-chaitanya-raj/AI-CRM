const Lead = require('../models/Lead');
const Deal = require('../models/Deal');

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Also fetch associated deals
    const deals = await Deal.find({ leadId: lead._id });
    res.json({ lead, deals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { name, email, company, status, source } = req.body;
    const lead = await Lead.create({
      name,
      email,
      company,
      status,
      source,
      createdBy: req.user._id
    });
    
    // Automatically create a 'New' Deal in the pipeline for this lead
    await Deal.create({
      title: `${company || name} Deal`,
      leadId: lead._id,
      value: 0,
      stage: 'New Lead',
      createdBy: req.user._id
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    await Lead.deleteOne({ _id: lead._id });
    // Also delete associated deals
    await Deal.deleteMany({ leadId: lead._id });
    
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mailService = require('../services/mailService');

// @desc    Send an email to a lead
// @route   POST /api/leads/:id/send-email
exports.sendLeadEmail = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const lead = await Lead.findById(req.params.id);
    
    if (!lead || lead.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!lead.email) {
      return res.status(400).json({ message: 'Lead has no email address' });
    }

    const emailSubject = subject || `Follow up - ${lead.company}`;
    const result = await mailService.sendEmail(lead.email, emailSubject, body);
    
    // Auto-update deal stage to Contacted if it exists
    await Deal.findOneAndUpdate({ leadId: lead._id, stage: 'New Lead' }, { stage: 'Contacted' });
    
    // Update lead status
    lead.status = 'Contacted';
    await lead.save();

    res.json({ message: 'Email sent successfully', previewUrl: result.previewUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
