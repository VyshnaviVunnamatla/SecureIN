const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: "User exists or error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, deviceId, ip } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Zero Trust Checks
    const isNewDevice = !user.deviceHistory.includes(deviceId);
    const isNewIP = !user.ipHistory.includes(ip);

    if (isNewDevice || isNewIP) {
      user.suspiciousFlag = true;
    }

    // Save device/IP history
    if (isNewDevice) user.deviceHistory.push(deviceId);
    if (isNewIP) user.ipHistory.push(ip);

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, suspicious: user.suspiciousFlag });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
