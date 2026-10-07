const Roadmap = require('../models/Roadmap');
const roadmapService = require('../services/roadmap/roadmapService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateRoadmap = async (req, res) => {
  const { jobId, analysisId } = req.body;
  if (!jobId) {
    return sendError(res, 'jobId is required to generate a roadmap', 400, 'BAD_REQUEST');
  }

  try {
    const roadmap = await roadmapService.generateOrGetRoadmap({
      userId: req.user._id,
      jobId,
      analysisId
    });

    return sendSuccess(res, { roadmap }, 201);
  } catch (err) {
    return sendError(res, err.message, 500, 'ROADMAP_GEN_FAILED');
  }
};

const getRoadmaps = async (req, res) => {
  const roadmaps = await Roadmap.find({ userId: req.user._id })
    .populate('jobId', 'title company')
    .sort({ updatedAt: -1 });

  return sendSuccess(res, { roadmaps });
};

const getRoadmapById = async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('jobId', 'title company location');

  if (!roadmap) {
    return sendError(res, 'Roadmap not found', 404, 'NOT_FOUND');
  }

  return sendSuccess(res, { roadmap });
};

const updateTask = async (req, res) => {
  const { taskId, isCompleted } = req.body;

  try {
    const roadmap = await roadmapService.updateTaskStatus({
      userId: req.user._id,
      roadmapId: req.params.id,
      taskId,
      isCompleted
    });

    return sendSuccess(res, { roadmap });
  } catch (err) {
    return sendError(res, err.message, 400, 'UPDATE_FAILED');
  }
};

module.exports = {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateTask
};
