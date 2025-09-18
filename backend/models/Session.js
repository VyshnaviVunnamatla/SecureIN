const mongoose = require('mongoose'); 
const SessionSchema = new mongoose.Schema({ 
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, 
  refreshToken: String, 
  deviceId: String, 
  ip: String, 
  geo: Object, 
  userAgent: String, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, 
  expiresAt: Date, 
  revoked: { 
    type: Boolean, 
    default: false 
  } 
}); 
module.exports = mongoose.model('Session', SessionSchema);
