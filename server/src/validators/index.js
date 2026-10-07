const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  headline: z.string().optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    graduationYear: z.string().optional()
  })).optional(),
  experienceLevel: z.enum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive']).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  targetRole: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),
  location: z.string().optional(),
  manualSkills: z.array(z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    level: z.number().min(1).max(5).optional(),
    source: z.enum(['resume', 'manual', 'assessment']).optional(),
    verified: z.boolean().optional(),
    verifiedScore: z.number().optional()
  })).optional()
});

const jobCreateSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().optional(),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  source: z.enum(['Manual', 'Pasted', 'AI Extracted']).optional(),
  extractedSkills: z.array(z.object({
    name: z.string(),
    category: z.string().optional(),
    level: z.number().min(1).max(5).optional(),
    importance: z.enum(['Required', 'Preferred', 'Nice-to-have']).optional()
  })).optional(),
  requiredSkills: z.array(z.object({
    name: z.string(),
    level: z.number().min(1).max(5).optional(),
    weight: z.number().optional()
  })).optional(),
  preferredSkills: z.array(z.object({
    name: z.string(),
    level: z.number().min(1).max(5).optional(),
    weight: z.number().optional()
  })).optional(),
  experienceRequirements: z.object({
    minYears: z.number().optional(),
    maxYears: z.number().optional(),
    level: z.string().optional()
  }).optional(),
  educationRequirements: z.string().optional(),
  responsibilities: z.array(z.string()).optional()
});

const analyzeRequestSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  resumeId: z.string().optional()
});

const simulateRequestSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  resumeId: z.string().optional(),
  simulatedSkills: z.array(z.object({
    name: z.string(),
    level: z.number().min(1).max(5),
    verified: z.boolean().optional()
  }))
});

const roadmapTaskUpdateSchema = z.object({
  taskId: z.string().min(1, 'taskId is required'),
  isCompleted: z.boolean()
});

const assessmentStartSchema = z.object({
  skillName: z.string().min(1, 'skillName is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  claimedLevel: z.number().min(1).max(5).optional()
});

const assessmentSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string()
  }))
});

const applicationCreateSchema = z.object({
  jobId: z.string().min(1, 'jobId is required'),
  resumeId: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  roleTitle: z.string().min(1, 'Role title is required'),
  status: z.enum(['Saved', 'Applied', 'Assessment', 'Interview', 'Rejected', 'Offer', 'Accepted']).optional(),
  appliedAt: z.string().optional(),
  interviewDate: z.string().optional(),
  salaryRange: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  jobCreateSchema,
  analyzeRequestSchema,
  simulateRequestSchema,
  roadmapTaskUpdateSchema,
  assessmentStartSchema,
  assessmentSubmitSchema,
  applicationCreateSchema
};
