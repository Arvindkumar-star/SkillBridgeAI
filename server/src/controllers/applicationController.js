const Application = require('../models/Application');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createApplication = async (req, res) => {
  const { jobId, resumeId, company, roleTitle, status, appliedAt, interviewDate, salaryRange, location, notes } = req.body;

  const application = new Application({
    userId: req.user._id,
    jobId,
    resumeId: resumeId || null,
    company,
    roleTitle,
    status: status || 'Saved',
    appliedAt: appliedAt || new Date(),
    interviewDate: interviewDate || null,
    salaryRange: salaryRange || '',
    location: location || 'Remote',
    notes: notes || ''
  });

  await application.save();
  return sendSuccess(res, { application }, 201);
};

const getApplications = async (req, res) => {
  const applications = await Application.find({ userId: req.user._id })
    .populate('jobId', 'title company')
    .sort({ updatedAt: -1 });

  return sendSuccess(res, { applications });
};

const updateApplication = async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, userId: req.user._id });
  if (!application) {
    return sendError(res, 'Application not found', 404, 'NOT_FOUND');
  }

  Object.assign(application, req.body);
  await application.save();
  return sendSuccess(res, { application });
};

const deleteApplication = async (req, res) => {
  const deleted = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) {
    return sendError(res, 'Application not found', 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { message: 'Application deleted successfully' });
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication
};
