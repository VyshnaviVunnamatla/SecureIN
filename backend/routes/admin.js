const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const LoginLog = require('../models/LoginLog');
const Session = require('../models/Session');
const User = require('../models/User');

router.get('/logs', authMiddleware, requireRole('Admin'), async (req, res) => {
  const logs = await LoginLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

router.get('/sessions', authMiddleware, requireRole('Admin'), async (req, res) => {
  const sessions = await Session.find().sort({ createdAt: -1 }).limit(200).populate('user', 'email role');
  res.json(sessions);
});

router.post('/revoke-session', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { sessionId } = req.body;
  await Session.findByIdAndUpdate(sessionId, { revoked: true });
  res.json({ ok: true });
});

router.get('/users', authMiddleware, requireRole('Admin'), async (req, res) => {
  const users = await User.find().select('-passwordHash').limit(200);
  res.json(users);
});

module.exports = router;
