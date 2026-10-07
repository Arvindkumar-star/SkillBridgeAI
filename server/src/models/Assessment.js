const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'short_answer'],
    default: 'mcq'
  },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  userAnswer: { type: String, default: null },
  explanation: { type: String, default: '' },
  isCorrect: { type: Boolean, default: null },
  points: { type: Number, default: 20 }
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skillName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  questions: [QuestionSchema],
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  claimedLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  verifiedLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  levelLabel: {
    type: String,
    enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Unverified'],
    default: 'Unverified'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['Created', 'In_Progress', 'Completed'],
    default: 'Created'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
