const mongoose = require('mongoose'); 
const LoginLogSchema = new mongoose.Schema({ 
  user: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', 
    required: false 
  }, 
  email: String, 
  success: Boolean, 
  ip: String, 
  geo: Object, 
  device: Object, 
  riskScore: Number, 
  reason: String, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  } 
}); 
module.exports = mongoose.model('LoginLog', LoginLogSchema);
