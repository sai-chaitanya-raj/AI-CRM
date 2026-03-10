const express = require('express');
const router = express.Router();
const { 
  getLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  deleteLead,
  sendLeadEmail
} = require('../controllers/leadController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.post('/:id/send-email', protect, sendLeadEmail);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

module.exports = router;
