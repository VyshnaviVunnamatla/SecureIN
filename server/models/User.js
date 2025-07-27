import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  deviceHistory: [String],
  ipHistory: [String],
  suspiciousFlag: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date }
  loginLogs: [{
    timestamp: Date,
    ip: String,
    deviceId: String,
    city: String,
    country: String,
    riskScore: Number,
    flagged: Boolean
  }]
});

export default mongoose.model("User", userSchema);
