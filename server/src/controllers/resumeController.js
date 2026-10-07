const Resume = require('../models/Resume');
const resumeService = require('../services/resume/resumeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const uploadAndParseResume = async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No PDF file uploaded. Please upload a valid PDF document.', 400, 'NO_FILE');
  }

  try {
    const resume = await resumeService.parseAndSaveResume({
      userId: req.user._id,
      fileName: req.file.originalname,
      pdfBuffer: req.file.buffer
    });

    return sendSuccess(res, { resume }, 201);
  } catch (err) {
    return sendError(res, err.message, 500, 'RESUME_PARSE_FAILED');
  }
};

const getResumes = async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return sendSuccess(res, { resumes });
};

const getResumeById = async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) {
    return sendError(res, 'Resume not found', 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { resume });
};

const updateResume = async (req, res) => {
  try {
    const resume = await resumeService.updateResume(req.params.id, req.user._id, req.body);
    return sendSuccess(res, { resume });
  } catch (err) {
    return sendError(res, err.message, 400, 'UPDATE_FAILED');
  }
};

const deleteResume = async (req, res) => {
  const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) {
    return sendError(res, 'Resume not found', 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { message: 'Resume deleted successfully' });
};

module.exports = {
  uploadAndParseResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume
};
