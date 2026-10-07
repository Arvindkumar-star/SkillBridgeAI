const Analysis = require('../models/Analysis');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const readinessService = require('../services/scoring/readinessService');
const simulationService = require('../services/simulation/simulationService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const runAnalysis = async (req, res) => {
  const { jobId, resumeId } = req.body;

  const job = await Job.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return sendError(res, 'Target job not found', 404, 'JOB_NOT_FOUND');
  }

  let resume = null;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  } else {
    resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  }

  const user = await User.findById(req.user._id);
  const assessments = await Assessment.find({ userId: req.user._id, status: 'Completed' });

  const scoreResult = readinessService.calculateScores({
    user,
    resume,
    job,
    assessments
  });

  const analysis = new Analysis({
    userId: req.user._id,
    jobId: job._id,
    resumeId: resume?._id || null,
    overallScore: scoreResult.overallScore,
    technicalScore: scoreResult.technicalScore,
    experienceScore: scoreResult.experienceScore,
    projectScore: scoreResult.projectScore,
    verificationScore: scoreResult.verificationScore,
    scoringVersion: scoreResult.scoringVersion,
    weights: scoreResult.weights,
    skillMatches: scoreResult.skillMatches,
    strengths: scoreResult.strengths,
    weaknesses: scoreResult.weaknesses,
    missingSkills: scoreResult.missingSkills,
    priorityGaps: scoreResult.priorityGaps,
    explainability: scoreResult.explainability
  });

  await analysis.save();
  return sendSuccess(res, { analysis }, 201);
};

const getAnalysisById = async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('jobId', 'title company location')
    .populate('resumeId', 'fileName');

  if (!analysis) {
    return sendError(res, 'Analysis snapshot not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, { analysis });
};

const getJobAnalysis = async (req, res) => {
  const { jobId } = req.params;
  const analysis = await Analysis.findOne({ jobId, userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('jobId', 'title company location')
    .populate('resumeId', 'fileName');

  if (!analysis) {
    return sendError(res, 'No analysis found for this job', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, { analysis });
};

const getAnalysisHistory = async (req, res) => {
  const history = await Analysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('jobId', 'title company')
    .limit(20);

  return sendSuccess(res, { history });
};

const simulateWhatIf = async (req, res) => {
  const { jobId, resumeId, simulatedSkills } = req.body;

  const job = await Job.findOne({ _id: jobId, userId: req.user._id });
  if (!job) {
    return sendError(res, 'Job not found', 404, 'JOB_NOT_FOUND');
  }

  let resume = null;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  } else {
    resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  }

  const user = await User.findById(req.user._id);
  const assessments = await Assessment.find({ userId: req.user._id, status: 'Completed' });

  const result = simulationService.simulateImprovement({
    user,
    resume,
    job,
    assessments,
    simulatedSkills: simulatedSkills || []
  });

  return sendSuccess(res, { simulation: result });
};

module.exports = {
  runAnalysis,
  getAnalysisById,
  getJobAnalysis,
  getAnalysisHistory,
  simulateWhatIf
};
