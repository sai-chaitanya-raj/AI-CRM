const express = require('express');
const router = express.Router();
const { getDeals, updateDealStage, deleteDeal, autoSortDeals } = require('../controllers/dealController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getDeals);

router.post('/auto-sort', protect, autoSortDeals);

router.route('/:id/stage')
  .put(protect, updateDealStage);

router.route('/:id')
  .delete(protect, deleteDeal);

module.exports = router;
