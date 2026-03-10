const express = require('express');
const router = express.Router();
const { scoreLead, generateEmail, getRecommendation } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

router.post('/lead/:id/score', protect, scoreLead);
router.post('/lead/:id/email', protect, generateEmail);
router.get('/lead/:id/recommend', protect, getRecommendation);

module.exports = router;
