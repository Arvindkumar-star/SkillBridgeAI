const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  skills: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    level: { type: Number, min: 1, max: 5, default: 3 },
    experienceYears: { type: Number, default: 1 },
    source: { type: String, default: 'resume' }
  }],
  education: [{
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    field: { type: String, default: '' },
    year: { type: String, default: '' }
  }],
  experience: [{
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
    skillsUsed: [{ type: String }]
  }],
  projects: [{
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' }
  }],
  certifications: [{
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' }
  }],
  parsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);
