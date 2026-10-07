const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    default: 'Target Company'
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  employmentType: {
    type: String,
    default: 'Full-time'
  },
  source: {
    type: String,
    enum: ['Manual', 'Pasted', 'AI Extracted', 'Benchmark Role', 'Imported', 'URL'],
    default: 'Manual'
  },
  extractedSkills: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    level: { type: Number, min: 1, max: 5, default: 3 },
    importance: {
      type: String,
      enum: ['Required', 'Preferred', 'Nice-to-have'],
      default: 'Required'
    }
  }],
  requiredSkills: [{
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 5, default: 3 },
    weight: { type: Number, default: 1.0 }
  }],
  preferredSkills: [{
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 5, default: 2 },
    weight: { type: Number, default: 0.5 }
  }],
  experienceRequirements: {
    minYears: { type: Number, default: 0 },
    maxYears: { type: Number, default: 10 },
    level: { type: String, default: 'Junior' }
  },
  educationRequirements: {
    type: String,
    default: 'Bachelor degree or equivalent experience'
  },
  responsibilities: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
