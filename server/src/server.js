const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const skillService = require('./services/skills/skillService');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

// Routes
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillRoutes = require('./routes/skillRoutes');
const jobRoutes = require('./routes/jobRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  if (config.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/assistant', assistantRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await skillService.seedDefaultSkills();

    const server = app.listen(config.PORT, () => {
      console.log(`====================================================`);
      console.log(`Skill-to-Job Intelligence API running on port ${config.PORT}`);
      console.log(`Health check: http://localhost:${config.PORT}/api/health`);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
