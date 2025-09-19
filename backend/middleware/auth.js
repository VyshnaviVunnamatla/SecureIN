const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 
const { JWT_ACCESS_SECRET } = process.env; 
async function authMiddleware(req, res, next) { 
  const auth = req.headers.authorization; 
  if (!auth) return res.status(401).json({ 
    error: 'Missing token' 
  }); 
  const token = auth.split(' ')[1]; 
  try { 
    const payload = jwt.verify(token, JWT_ACCESS_SECRET); 
    const user = await User.findById(payload.sub); 
    if (!user) return res.status(401).json({ 
      error: 'Invalid token' 
    }); 
    req.user = user; 
    next(); 
  } 
  catch (err) {
    return res.status(401).json({ 
      error: 'Invalid token' 
    }); 
  } 
} 
module.exports = authMiddleware;
