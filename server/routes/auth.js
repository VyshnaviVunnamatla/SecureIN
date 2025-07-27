import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP } from "../utils/sendOTP.js";
import fetch from "node-fetch";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, role = "user" } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, role });
    await user.save();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    res.status(400).json({ error: "User already exists or error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, deviceId, ip } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Incorrect password" });

    // Risk scoring logic
    let risk = 0;
    let suspicious = false;
    //const geo = await fetch(`https://ipapi.co/${ip}/json`).then(res => res.json());
    let geo = {};
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json`);
      geo = await geoRes.json();
    } catch (e) {
      console.error("GeoIP lookup failed", e);
      geo = { city: "Unknown", country_name: "Unknown" };
    }

    if (!user.deviceHistory.includes(deviceId)) {
      user.deviceHistory.push(deviceId);
      risk += 5;
      suspicious = true;
    }

    if (!user.ipHistory.includes(ip)) {
      user.ipHistory.push(ip);
      risk += 3;
      suspicious = true;
    }

    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      risk += 2;
      suspicious = true;
    }

    // Add login log
    user.loginLogs.push({
      timestamp: new Date(),
      ip,
      deviceId,
      city: geo.city || "Unknown",
      country: geo.country_name || "Unknown",
      riskScore: risk,
      flagged: risk >= 5,
    });

    user.suspiciousFlag = suspicious;

    if (suspicious) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000;
      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();
      await sendOTP(email, otp);
      return res.json({ message: "OTP sent", suspicious: true });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await user.save();

    res.json({ token, suspicious: false, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpiry)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    user.otp = null;
    user.otpExpiry = null;
    user.suspiciousFlag = false;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
});

router.get("/admin/logs", async (req, res) => {
  const users = await User.find({}, "email loginLogs").lean();
  res.json(users);
});

// Get all users (admin-only route)
router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, "email role").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Delete a user by email
router.delete("/admin/users/:email", async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.params.email });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

// Change role (user ↔ admin)
router.put("/admin/users/role", async (req, res) => {
  const { email, newRole } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = newRole;
    await user.save();
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});


export default router;
