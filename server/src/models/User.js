const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  profile: {
    headline: { type: String, default: '' },
    education: [{
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      field: { type: String, default: '' },
      graduationYear: { type: String, default: '' }
    }],
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'],
      default: 'Junior'
    },
    yearsOfExperience: { type: Number, default: 0 },
    targetRole: { type: String, default: '' },
    preferredRoles: [{ type: String }],
    location: { type: String, default: '' },
    manualSkills: [{
      name: { type: String, required: true },
      category: { type: String, default: 'General' },
      level: { type: Number, min: 1, max: 5, default: 3 },
      source: {
        type: String,
        enum: ['resume', 'manual', 'assessment'],
        default: 'manual'
      },
      verified: { type: Boolean, default: false },
      verifiedScore: { type: Number, default: 0 }
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
