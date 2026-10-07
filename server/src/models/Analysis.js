const mongoose = require('mongoose');

const SkillMatchItemSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String, default: 'General' },
  userLevel: { type: Number, default: 0 },
  requiredLevel: { type: Number, default: 3 },
  evidence: {
    source: { type: String, default: 'none' }, // resume, projects, manual, assessment
    details: { type: String, default: '' },
    confidence: { type: Number, default: 50 }
  },
  status: {
    type: String,
    enum: ['STRONG', 'MATCH', 'PARTIAL', 'WEAK', 'MISSING'],
    required: true
  },
  gapSeverity: { type: Number, default: 0 }, // 0 to 4
  jobImportance: { type: Number, default: 1.0 }, // 0.5 to 2.0
  dependencyWeight: { type: Number, default: 1.0 },
  priority: { type: Number, default: 0 } // Normalized priority score 0-100
}, { _id: false });

const PriorityGapSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String, default: 'General' },
  gapSeverity: { type: Number, default: 0 },
  priority: { type: Number, required: true },
  reason: { type: String, default: '' },
  recommendedAction: { type: String, default: '' }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  technicalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  experienceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  projectScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  verificationScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  scoringVersion: {
    type: String,
    default: '1.0.0'
  },
  weights: {
    technical: { type: Number, default: 0.45 },
    experience: { type: Number, default: 0.20 },
    project: { type: Number, default: 0.20 },
    verification: { type: Number, default: 0.15 }
  },
  skillMatches: [SkillMatchItemSchema],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingSkills: [{ type: String }],
  priorityGaps: [PriorityGapSchema],
  explainability: {
    summary: { type: String, default: '' },
    keyDrivers: [{ type: String }],
    recommendations: [{ type: String }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
