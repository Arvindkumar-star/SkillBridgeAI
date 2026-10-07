const User = require('../models/User');
const Resume = require('../models/Resume');
const Assessment = require('../models/Assessment');
const skillService = require('../services/skills/skillService');
const matchingEngine = require('../services/matching/matchingEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    return sendError(res, 'User not found', 404, 'NOT_FOUND');
  }

  // Aggregate skills across profile, resumes, and assessments
  const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const latestResume = resumes[0] || null;
  const assessments = await Assessment.find({ userId: req.user._id, status: 'Completed' });

  const skillMap = matchingEngine.aggregateUserProfileSkills(user, latestResume, assessments);
  const aggregatedSkills = Array.from(skillMap.values());

  // If user profile has no manualSkills saved yet but has resume skills, populate them
  if ((!user.profile?.manualSkills || user.profile.manualSkills.length === 0) && aggregatedSkills.length > 0) {
    if (!user.profile) user.profile = {};
    user.profile.manualSkills = aggregatedSkills;
    await user.save();
  }

  const userObj = user.toObject();
  userObj.profile = userObj.profile || {};
  userObj.profile.manualSkills = aggregatedSkills;

  return sendSuccess(res, {
    user: userObj,
    aggregatedSkillsCount: aggregatedSkills.length,
    resumesCount: resumes.length
  });
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
  }

  const { name, headline, education, experienceLevel, yearsOfExperience, targetRole, preferredRoles, location, manualSkills } = req.body;

  if (name) user.name = name;
  if (!user.profile) user.profile = {};

  if (headline !== undefined) user.profile.headline = headline;
  if (education !== undefined) user.profile.education = education;
  if (experienceLevel !== undefined) user.profile.experienceLevel = experienceLevel;
  if (yearsOfExperience !== undefined) user.profile.yearsOfExperience = yearsOfExperience;
  if (targetRole !== undefined) user.profile.targetRole = targetRole;
  if (preferredRoles !== undefined) user.profile.preferredRoles = preferredRoles;
  if (location !== undefined) user.profile.location = location;

  if (manualSkills !== undefined) {
    user.profile.manualSkills = skillService.normalizeUserSkills(manualSkills);
  }

  await user.save();
  return sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, profile: user.profile } });
};

const addManualSkill = async (req, res) => {
  const { name, level = 3, category = 'General' } = req.body;
  if (!name) {
    return sendError(res, 'Skill name is required', 400, 'BAD_REQUEST');
  }

  const user = await User.findById(req.user._id);
  if (!user.profile) user.profile = {};
  if (!user.profile.manualSkills) user.profile.manualSkills = [];

  const normalized = skillService.normalizeUserSkills([{ name, level, category, source: 'manual' }])[0];

  const existingIdx = user.profile.manualSkills.findIndex(s => s.name.toLowerCase() === normalized.name.toLowerCase());
  if (existingIdx >= 0) {
    user.profile.manualSkills[existingIdx].level = level;
    user.profile.manualSkills[existingIdx].category = normalized.category;
  } else {
    user.profile.manualSkills.push(normalized);
  }

  await user.save();
  return sendSuccess(res, { manualSkills: user.profile.manualSkills });
};

const deleteManualSkill = async (req, res) => {
  const { skillName } = req.params;
  const user = await User.findById(req.user._id);

  if (user.profile && user.profile.manualSkills) {
    user.profile.manualSkills = user.profile.manualSkills.filter(
      s => s.name.toLowerCase() !== decodeURIComponent(skillName).toLowerCase()
    );
    await user.save();
  }

  return sendSuccess(res, { manualSkills: user.profile?.manualSkills || [] });
};

module.exports = {
  getProfile,
  updateProfile,
  addManualSkill,
  deleteManualSkill
};
