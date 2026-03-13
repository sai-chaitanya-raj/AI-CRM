const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mailService = require('../services/mailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, passwordHash: password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
    
    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      if (!req.body.twoFactorCode) {
        // User needs to provide 2FA code
        return res.json({ requires2FA: true, email: user.email });
      } else {
        // Verify the provided 2FA code
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: req.body.twoFactorCode,
          window: 1 // Allow 30 seconds of drift
        });

        if (!verified) {
          return res.status(401).json({ message: 'Invalid 2FA code' });
        }
      }
    }

      // Normal successful login (or successful 2FA login)
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        hasCustomPassword: user.hasCustomPassword,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user via Google OAuth
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    // If user doesn't exist, auto-register them via Google
    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash: sub, // Using Google sub ID as placeholder password
        authProvider: 'google',
        hasCustomPassword: false
      });
    }

    // Check if 2FA is enabled for this user
    if (user.isTwoFactorEnabled) {
      return res.json({ 
        requires2FA: true, 
        email: user.email 
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      authProvider: user.authProvider,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      hasCustomPassword: user.hasCustomPassword,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Login Backend Error:', error);
    res.status(401).json({ message: 'Google Authentication failed', error: error.message });
  }
};

// @desc    Generate 2FA Secret and QR Code
// @route   POST /api/auth/2fa/generate
// @access  Private
exports.generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate secret
    const secret = speakeasy.generateSecret({ 
      name: `Nova CRM (${user.email})` 
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code Data URL
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({ qrCodeUrl: dataUrl, secret: secret.base32 });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify 2FA Token and Enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA has been successfully enabled' });
    } else {
      res.status(400).json({ message: 'Invalid authentication code' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save();
    
    res.json({ success: true, message: '2FA has been disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // If user passed a currentPassword to verify identity for major changes
      if (req.body.currentPassword && !(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.company = req.body.company !== undefined ? req.body.company : user.company;
      
      if (req.body.emailPreferences) {
        user.emailPreferences = req.body.emailPreferences;
      }
      
      if (req.body.password) {
        user.passwordHash = req.body.password;
        user.hasCustomPassword = true;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        emailPreferences: updatedUser.emailPreferences,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider,
        hasCustomPassword: updatedUser.hasCustomPassword,
        token: generateToken(updatedUser._id) // re-issue token if email changed
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host').replace('5000', '5173')}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await mailService.sendEmail(
        user.email,
        'Password Reset Token',
        message
      );
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error('Email sending failed:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent', error: err.message });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.hasCustomPassword = true;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
