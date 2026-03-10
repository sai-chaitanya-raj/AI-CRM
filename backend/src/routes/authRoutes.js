const express = require('express');
const router = express.Router();
const { registerUser, authUser, googleLogin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);

// Example protected route for fetching current user profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
