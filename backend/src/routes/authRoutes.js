const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  authUser, 
  googleLogin, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  generate2FA,
  verify2FA,
  disable2FA
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);

// Example protected route for fetching current user profile
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// 2FA Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
