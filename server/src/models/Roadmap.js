const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { _id: false });

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: '' },
  type: {
    type: String,
    enum: ['Documentation', 'Course', 'Project', 'Article', 'Video'],
    default: 'Documentation'
  }
}, { _id: false });

const GoalSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String, default: 'General' },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  priorityScore: { type: Number, default: 50 },
  estimatedDays: { type: Number, default: 7 },
  learningOutcome: { type: String, default: '' },
  resources: [ResourceSchema],
  tasks: [TaskSchema],
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Paused'],
    default: 'Not Started'
  }
});

const RoadmapSchema = new mongoose.Schema({
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
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    default: null
  },
  title: {
    type: String,
    default: 'Personalized Skill-to-Job Readiness Roadmap'
  },
  goals: [GoalSchema],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetCompletionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
