const express = require('express');
const router = express.Router();
const { registerUser, authUser, googleLogin, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
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

module.exports = router;
