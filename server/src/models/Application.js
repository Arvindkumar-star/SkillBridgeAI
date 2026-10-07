const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  roleTitle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Assessment', 'Interview', 'Rejected', 'Offer', 'Accepted'],
    default: 'Saved'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  interviewDate: {
    type: Date,
    default: null
  },
  salaryRange: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Remote'
  },
  notes: {
    type: String,
    default: ''
  },
  result: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema);
