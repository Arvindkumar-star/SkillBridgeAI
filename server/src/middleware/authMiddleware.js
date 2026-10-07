const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return sendError(res, 'User no longer exists. Please log in again.', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    return sendError(res, 'Invalid authorization token.', 401, 'INVALID_TOKEN');
  }
};

module.exports = { requireAuth };
