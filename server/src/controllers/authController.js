const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email: email.toLowerCase(),
    passwordHash,
    profile: {
      headline: 'Aspiring Software Engineer',
      experienceLevel: 'Junior',
      yearsOfExperience: 1,
      targetRole: 'Full Stack Engineer',
      preferredRoles: ['Full Stack Engineer', 'Frontend Developer', 'Backend Developer'],
      location: 'Remote',
      manualSkills: []
    }
  });

  await user.save();

  const token = generateToken(user._id);

  return sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile
    },
    token
  }, 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user._id);

  return sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile
    },
    token
  });
};

const getMe = async (req, res) => {
  return sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profile: req.user.profile
    }
  });
};

const logout = async (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
