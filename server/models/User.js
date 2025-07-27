import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
  timestamp: { type: Date },
  ip: { type: String },
  deviceId: { type: String },
  city: { type: String },
  country: { type: String },
  riskScore: { type: Number },
  flagged: { type: Boolean },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  deviceHistory: [String],
  ipHistory: [String],
  suspiciousFlag: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  loginLogs: [loginLogSchema]
});

const User = mongoose.model("User", userSchema);
export default User;
