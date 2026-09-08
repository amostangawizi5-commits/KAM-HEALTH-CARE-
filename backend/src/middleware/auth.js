const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

// Role-based middleware
exports.roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

// Permission middleware for specific actions
exports.hasPermission = (action) => {
  return (req, res, next) => {
    const permissions = {
      'CREATE_USER': ['ADMIN'],
      'VIEW_USERS': ['ADMIN'],
      'EDIT_USER': ['ADMIN'],
      'DELETE_USER': ['ADMIN'],
      'CREATE_PATIENT': ['ADMIN', 'RECEPTIONIST'],
      'VIEW_PATIENTS': ['ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'],
      'CREATE_VISIT': ['ADMIN', 'RECEPTIONIST'],
      'VIEW_VISITS': ['ADMIN', 'DOCTOR', 'CONSULTANT', 'RECEPTIONIST'],
      'CREATE_PRESCRIPTION': ['ADMIN', 'DOCTOR'],
      'VIEW_PRESCRIPTIONS': ['ADMIN', 'DOCTOR', 'PHARMACIST'],
      'DISPENSE_MEDICINE': ['ADMIN', 'PHARMACIST'],
      'VIEW_MEDICINES': ['ADMIN', 'PHARMACIST', 'DOCTOR'],
      'CREATE_CONSULTATION': ['ADMIN', 'DOCTOR'],
      'CREATE_ASSESSMENT': ['ADMIN', 'CONSULTANT'],
      'VIEW_LAB_REQUESTS': ['ADMIN', 'LABORATORY', 'DOCTOR'],
      'CREATE_LAB_RESULT': ['ADMIN', 'LABORATORY'],
      'VIEW_BILLS': ['ADMIN', 'CASHIER'],
      'CREATE_PAYMENT': ['ADMIN', 'CASHIER']
    };

    const allowedRoles = permissions[action];
    if (!allowedRoles) {
      return res.status(403).json({
        success: false,
        message: 'Invalid permission'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};
