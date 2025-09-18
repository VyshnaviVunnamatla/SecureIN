import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorSecret: { type: String },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loginHistory: [
    {
      ip: String,
      location: String,
      device: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('User', userSchema);