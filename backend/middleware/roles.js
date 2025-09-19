function requireRole(role) { 
  return (req, res, next) => { 
    if (!req.user) return res.status(401).json({ 
      error: 'Unauthenticated' 
    }); 
    const rolesHierarchy = { 
      User: 1, 
      Moderator: 2, 
      Admin: 3 
    }; 
    if (rolesHierarchy[req.user.role] >= rolesHierarchy[role]) return next();
    return res.status(403).json({ 
      error: 'Forbidden' 
    }); 
  }; 
} 
module.exports = { requireRole };
