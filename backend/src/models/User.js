const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  hasCustomPassword: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  company: { type: String, default: '' },
  twoFactorSecret: { type: String, default: '' },
  isTwoFactorEnabled: { type: Boolean, default: false },
  emailPreferences: {
    dailyDigest: { type: Boolean, default: true },
    aiAlerts: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
