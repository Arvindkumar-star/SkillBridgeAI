const Job = require('../models/Job');
const { getAIProvider } = require('../services/ai/aiProvider');
const skillService = require('../services/skills/skillService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createJob = async (req, res) => {
  const { title, company, description, location, employmentType, source, requiredSkills, preferredSkills, experienceRequirements, responsibilities } = req.body;

  const job = new Job({
    userId: req.user._id,
    title,
    company: company || 'Target Company',
    description,
    location: location || 'Remote',
    employmentType: employmentType || 'Full-time',
    source: source || 'Manual',
    requiredSkills: requiredSkills || [],
    preferredSkills: preferredSkills || [],
    experienceRequirements: experienceRequirements || { minYears: 1, maxYears: 5, level: 'Mid' },
    responsibilities: responsibilities || []
  });

  await job.save();
  return sendSuccess(res, { job }, 201);
};

const parseJobDescription = async (req, res) => {
  const { description } = req.body;
  if (!description || description.trim().length < 10) {
    return sendError(res, 'Job description must be at least 10 characters', 400, 'INVALID_INPUT');
  }

  const aiProvider = getAIProvider();
  const parsed = await aiProvider.parseJobDescription(description);

  const job = new Job({
    userId: req.user._id,
    title: parsed.title || 'Target Job Role',
    company: parsed.company || 'Target Organization',
    description,
    location: parsed.location || 'Remote',
    employmentType: parsed.employmentType || 'Full-time',
    source: 'Pasted',
    extractedSkills: parsed.extractedSkills || [],
    requiredSkills: parsed.requiredSkills || [],
    preferredSkills: parsed.preferredSkills || [],
    experienceRequirements: parsed.experienceRequirements || { minYears: 1, maxYears: 5, level: 'Junior' },
    educationRequirements: parsed.educationRequirements || "Bachelor's Degree or Equivalent",
    responsibilities: parsed.responsibilities || []
  });

  await job.save();
  return sendSuccess(res, { job }, 201);
};

const getJobs = async (req, res) => {
  let jobs = await Job.find({ userId: req.user._id }).sort({ createdAt: -1 });

  if (jobs.length === 0) {
    const defaultJobs = [
      {
        userId: req.user._id,
        title: 'Full Stack Engineer (MERN + Cloud)',
        company: 'InnovateTech Solutions',
        location: 'Remote / Bengaluru',
        employmentType: 'Full-time',
        source: 'Manual',
        description: 'We are seeking an ambitious Full Stack Engineer to build high-scale web platforms with React, Node.js, Express, MongoDB, TypeScript, and Docker containerization.',
        requiredSkills: [
          { name: 'React', level: 4, category: 'Frontend', weight: 1.2 },
          { name: 'Node.js', level: 4, category: 'Backend', weight: 1.2 },
          { name: 'MongoDB', level: 3, category: 'Database', weight: 1.0 },
          { name: 'Express.js', level: 3, category: 'Backend', weight: 1.0 },
          { name: 'TypeScript', level: 3, category: 'Programming Language', weight: 1.0 },
          { name: 'Docker', level: 3, category: 'DevOps', weight: 0.9 }
        ],
        preferredSkills: [
          { name: 'AWS', level: 3, category: 'Cloud', weight: 0.8 },
          { name: 'Redis', level: 3, category: 'Database', weight: 0.7 },
          { name: 'GraphQL', level: 3, category: 'Backend', weight: 0.6 }
        ],
        experienceRequirements: { minYears: 1, maxYears: 3, level: 'Junior' },
        responsibilities: [
          'Design and maintain scalable REST and GraphQL APIs.',
          'Build responsive, dynamic UI components using React and modern CSS.',
          'Optimize database queries and implement caching with Redis.',
          'Participate in CI/CD pipeline deployment and Docker containerization.'
        ]
      },
      {
        userId: req.user._id,
        title: 'AI Full Stack Developer',
        company: 'NextGen AI Labs',
        location: 'Remote / Pune',
        employmentType: 'Full-time',
        source: 'Manual',
        description: 'Join our cutting-edge AI engineering team to build intelligent agents, LLM tool-calling backends, and responsive generative AI workflows.',
        requiredSkills: [
          { name: 'Python', level: 4, category: 'Programming Language', weight: 1.2 },
          { name: 'React', level: 3, category: 'Frontend', weight: 1.0 },
          { name: 'FastAPI', level: 3, category: 'Backend', weight: 1.0 },
          { name: 'LangChain', level: 3, category: 'AI/ML', weight: 1.1 },
          { name: 'PostgreSQL', level: 3, category: 'Database', weight: 0.9 }
        ],
        preferredSkills: [
          { name: 'Docker', level: 3, category: 'DevOps', weight: 0.8 },
          { name: 'Vector Databases', level: 3, category: 'Database', weight: 0.8 }
        ],
        experienceRequirements: { minYears: 1, maxYears: 3, level: 'Junior' },
        responsibilities: [
          'Integrate LLMs, prompt pipelines, and embeddings into interactive web apps.',
          'Build clean frontend interfaces for generative AI workspaces.',
          'Deploy and monitor microservices and vector indices.'
        ]
      }
    ];

    jobs = await Job.insertMany(defaultJobs);
  }

  return sendSuccess(res, { jobs });
};

const getJobById = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
  if (!job) {
    return sendError(res, 'Job not found', 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { job });
};

const deleteJob = async (req, res) => {
  const deleted = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) {
    return sendError(res, 'Job not found', 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { message: 'Job deleted successfully' });
};

module.exports = {
  createJob,
  parseJobDescription,
  getJobs,
  getJobById,
  deleteJob
};
