const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Frontend',
      'Backend',
      'Database',
      'Programming Language',
      'DevOps',
      'Cloud',
      'AI/ML',
      'Data',
      'Security',
      'Testing',
      'CS Fundamentals',
      'Tools',
      'Soft Skills',
      'General'
    ],
    default: 'General'
  },
  aliases: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  parentSkill: {
    type: String,
    default: null
  },
  relatedSkills: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  importanceWeight: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

SkillSchema.index({ aliases: 1 });

module.exports = mongoose.model('Skill', SkillSchema);
