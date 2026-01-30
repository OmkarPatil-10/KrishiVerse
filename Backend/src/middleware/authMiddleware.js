const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Middleware for specific user types
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied for this user type' 
      });
    }
    next();
  };
};

module.exports = { authMiddleware, requireUserType };