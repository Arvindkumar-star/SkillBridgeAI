const skillService = require('../services/skills/skillService');
const { sendSuccess } = require('../utils/apiResponse');

const getSkills = async (req, res) => {
  const { category, search } = req.query;
  let skills = [];
  if (search) {
    skills = await skillService.searchSkills(search);
  } else {
    skills = await skillService.getAllSkills(category);
  }
  return sendSuccess(res, { skills });
};

module.exports = {
  getSkills
};
