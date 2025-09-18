const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: String,     // hashed fingerprint
  name: String,         // user agent short
  lastSeen: Date,
  ip: String,
  geo: Object
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, default: 'User', enum: ['User','Moderator','Admin'] },
  emailVerified: { type: Boolean, default: false },
  devices: [DeviceSchema],
  mfaEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
