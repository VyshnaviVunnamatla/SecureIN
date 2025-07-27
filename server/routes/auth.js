import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP } from "../utils/sendOTP.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash });
    await user.save();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    res.status(400).json({ error: "User exists or error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, deviceId, ip } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid password" });

    let suspicious = false;

    if (!user.deviceHistory.includes(deviceId)) {
      user.deviceHistory.push(deviceId);
      suspicious = true;
    }

    if (!user.ipHistory.includes(ip)) {
      user.ipHistory.push(ip);
      suspicious = true;
    }

    user.suspiciousFlag = suspicious;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, suspicious });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});


// Generate OTP
router.post("/generate-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  await User.findOneAndUpdate({ email }, { otp, otpExpiry: expiry });
  await sendOTP(email, otp);

  res.json({ message: "OTP sent" });
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.otp !== otp || Date.now() > user.otpExpiry)
    return res.status(400).json({ error: "Invalid or expired OTP" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  user.otp = null;
  user.otpExpiry = null;
  user.suspiciousFlag = false;
  await user.save();

  res.json({ token });
});

export default router;
