require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Session = require('../models/Session');
const LoginLog = require('../models/LoginLog');
const { fingerprint } = require('../utils/device');
const { geoFromIp, computeRisk } = require('../utils/riskEngine');
const { sendMail } = require('../utils/mailer');

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES = '15m',
  REFRESH_TOKEN_EXPIRES = '7d',
  CLIENT_URL
} = process.env;

function signAccessToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function signRefreshToken(sessionId) {
  return jwt.sign({ sid: sessionId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash: hash, emailVerified: false });
  // In production: send verification mail with token
  await sendMail(user.email, 'Welcome to NextGenAuth', `<p>Welcome ${user.name}!</p>`);
  res.json({ ok: true, id: user._id });
}

async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  const { deviceId, name, meta } = fingerprint(ua, ip);

  const geo = geoFromIp(ip);
  const user = await User.findOne({ email });
  const log = { email, ip, geo, device: { deviceId, name, meta }, success: false, reason: '', riskScore: 0 };
  if (!user) {
    log.reason = 'no-user';
    await LoginLog.create(log);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password || '', user.passwordHash || '');
  if (!ok) {
    // log failed attempt
    log.reason = 'bad-password';
    log.success = false;
    // basic compute risk:
    log.riskScore = computeRisk({ knownDevices: user.devices.map(d => d.deviceId), deviceId, failedAttempts: 1, loginHour: new Date().getHours() });
    await LoginLog.create({ ...log, user: user._id });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // compute risk: new country? last device seen hours?
  const knownDevices = user.devices.map(d => d.deviceId);
  const lastDevice = user.devices.find(d => d.deviceId === deviceId);
  let lastSeenHours = lastDevice ? (Date.now() - new Date(lastDevice.lastSeen).getTime())/ (1000*3600) : 99999;
  const newCountry = lastDevice && lastDevice.geo && lastDevice.geo.country ? (lastDevice.geo.country !== geo.country) : false;
  const riskScore = computeRisk({ knownDevices, deviceId, lastSeenHours, failedAttempts: 0, newCountry, loginHour: new Date().getHours() });
  log.riskScore = riskScore;
  log.success = true;

  // if high risk -> require OTP (MFA)
  if (riskScore >= 50 || user.mfaEnabled) {
    // generate short OTP, store temporarily in session (for demo we return OTP in response; in prod send mail/SMS)
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    // store OTP in ephemeral session collection or in-memory store. For demo: create session with otp field.
    const session = await Session.create({
      user: user._id,
      refreshToken: 'PENDING_OTP',
      deviceId,
      ip,
      geo,
      userAgent: ua,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000*60*10), // 10 minutes
      revoked: false,
      otp
    });
    // Send email OTP
    await sendMail(user.email, 'Your Login OTP', `<p>Your one-time code is <b>${otp}</b>. It expires in 10 minutes.</p>`);
    await LoginLog.create({ ...log, user: user._id });
    return res.json({ challenge: true, msg: 'OTP sent to registered email', sessionId: session._id });
  }

  // finalize normal login: create session + tokens
  const session = await Session.create({
    user: user._id,
    refreshToken: uuidv4(),
    deviceId,
    ip,
    geo,
    userAgent: ua,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000*60*60*24*7)
  });

  // update user devices
  const deviceEntry = { deviceId, name, lastSeen: new Date(), ip, geo };
  const existingIndex = user.devices.findIndex(d => d.deviceId === deviceId);
  if (existingIndex >= 0) user.devices[existingIndex] = deviceEntry;
  else user.devices.push(deviceEntry);
  await user.save();

  const access = signAccessToken(user);
  const refresh = signRefreshToken(session._id.toString());
  session.refreshToken = refresh;
  await session.save();

  await LoginLog.create({ ...log, user: user._id });
  res.json({ accessToken: access, refreshToken: refresh, user: { id: user._id, email: user.email, role: user.role } });
}

async function verifyOtp(req, res) {
  const { sessionId, otp } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  const session = await Session.findById(sessionId);
  if (!session) return res.status(400).json({ error: 'Invalid session' });
  if (session.revoked) return res.status(400).json({ error: 'Session revoked' });
  if (!session.otp || session.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

  // finalize login
  const user = await User.findById(session.user);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const { deviceId, name, meta } = { deviceId: session.deviceId, name: 'OTP device', meta: {} }; // keep as-is
  const refresh = signRefreshToken(session._id.toString());
  const access = signAccessToken(user);
  session.refreshToken = refresh;
  session.otp = null;
  session.expiresAt = new Date(Date.now() + 1000*60*60*24*7);
  await session.save();

  // add device to user if new
  const existingIndex = user.devices.findIndex(d => d.deviceId === deviceId);
  const deviceEntry = { deviceId, name, lastSeen: new Date(), ip, geo: session.geo };
  if (existingIndex >= 0) user.devices[existingIndex] = deviceEntry;
  else user.devices.push(deviceEntry);
  await user.save();

  res.json({ accessToken: access, refreshToken: refresh, user: { id: user._id, email: user.email, role: user.role } });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const sid = payload.sid;
    const session = await Session.findById(sid);
    if (!session || session.revoked) return res.status(401).json({ error: 'Invalid session' });
    const user = await User.findById(session.user);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const access = signAccessToken(user);
    res.json({ accessToken: access });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const { sid } = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    await Session.findByIdAndUpdate(sid, { revoked: true });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token' });
  }
}

module.exports = { signup, login, verifyOtp, refresh, logout };
