const Assessment = require('../models/Assessment');
const assessmentService = require('../services/assessment/assessmentService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const startAssessment = async (req, res) => {
  const { skillName, difficulty, claimedLevel } = req.body;
  if (!skillName) {
    return sendError(res, 'skillName is required', 400, 'BAD_REQUEST');
  }

  try {
    const assessment = await assessmentService.createAssessment({
      userId: req.user._id,
      skillName,
      difficulty,
      claimedLevel
    });

    return sendSuccess(res, { assessment }, 201);
  } catch (err) {
    return sendError(res, err.message, 500, 'ASSESSMENT_CREATE_FAILED');
  }
};

const submitAssessment = async (req, res) => {
  const { answers } = req.body;
  const { id } = req.params;

  try {
    const assessment = await assessmentService.submitAssessment({
      userId: req.user._id,
      assessmentId: id,
      answers: answers || []
    });

    return sendSuccess(res, { assessment });
  } catch (err) {
    return sendError(res, err.message, 400, 'SUBMIT_FAILED');
  }
};

const getAssessments = async (req, res) => {
  const assessments = await Assessment.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return sendSuccess(res, { assessments });
};

const getAssessmentById = async (req, res) => {
  const assessment = await Assessment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!assessment) {
    return sendError(res, 'Assessment not found', 404, 'NOT_FOUND');
  }

  // If not completed, mask the answers
  const obj = assessment.toObject();
  if (obj.status !== 'Completed') {
    obj.questions = obj.questions.map(q => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });
  }

  return sendSuccess(res, { assessment: obj });
};

module.exports = {
  startAssessment,
  submitAssessment,
  getAssessments,
  getAssessmentById
};
