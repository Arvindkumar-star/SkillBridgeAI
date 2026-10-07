const Analysis = require('../models/Analysis');
const Assessment = require('../models/Assessment');
const Roadmap = require('../models/Roadmap');
const Application = require('../models/Application');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

const getDashboardOverview = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  const resumes = await require('../models/Resume').find({ userId });
  const latestAnalysis = await Analysis.findOne({ userId }).sort({ createdAt: -1 }).populate('jobId', 'title company');
  const activeRoadmap = await Roadmap.findOne({ userId }).sort({ updatedAt: -1 }).populate('jobId', 'title company');
  const assessments = await Assessment.find({ userId }).sort({ createdAt: -1 });
  const applications = await Application.find({ userId }).sort({ updatedAt: -1 });
  const recentAnalyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(5).populate('jobId', 'title company');

  // Compute total unique tracked skills across profile and resumes
  const uniqueSkills = new Set();
  user?.profile?.manualSkills?.forEach(s => uniqueSkills.add(s.name.toLowerCase()));
  resumes?.forEach(r => r.skills?.forEach(s => uniqueSkills.add(s.name.toLowerCase())));

  return sendSuccess(res, {
    user: {
      name: user.name,
      targetRole: user.profile?.targetRole || 'Software Engineer',
      skillsCount: uniqueSkills.size
    },
    latestAnalysis,
    activeRoadmap,
    assessmentsCount: assessments.length,
    completedAssessmentsCount: assessments.filter(a => a.status === 'Completed').length,
    applicationsCount: applications.length,
    recentAnalyses
  });
};

const getAnalyticsData = async (req, res) => {
  const userId = req.user._id;

  // 1. Readiness over time
  const analyses = await Analysis.find({ userId }).sort({ createdAt: 1 });
  const readinessTrend = analyses.map(a => ({
    date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: a.overallScore,
    technical: a.technicalScore,
    experience: a.experienceScore,
    project: a.projectScore,
    verification: a.verificationScore
  }));

  // 2. Application funnel
  const applications = await Application.find({ userId });
  const applicationFunnel = {
    Saved: applications.filter(a => a.status === 'Saved').length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Assessment: applications.filter(a => a.status === 'Assessment').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Offer: applications.filter(a => a.status === 'Offer').length,
    Accepted: applications.filter(a => a.status === 'Accepted').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length
  };

  // 3. Assessment stats
  const assessments = await Assessment.find({ userId });
  const assessmentStats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'Completed').length,
    avgScore: assessments.filter(a => a.status === 'Completed').length > 0
      ? Math.round(assessments.filter(a => a.status === 'Completed').reduce((acc, curr) => acc + curr.score, 0) / assessments.filter(a => a.status === 'Completed').length)
      : 0,
    byDifficulty: {
      Beginner: assessments.filter(a => a.difficulty === 'Beginner').length,
      Intermediate: assessments.filter(a => a.difficulty === 'Intermediate').length,
      Advanced: assessments.filter(a => a.difficulty === 'Advanced').length
    }
  };

  // 4. Roadmap completion
  const roadmaps = await Roadmap.find({ userId });
  let totalTasks = 0;
  let completedTasks = 0;
  for (const r of roadmaps) {
    for (const g of r.goals) {
      for (const t of g.tasks) {
        totalTasks += 1;
        if (t.isCompleted) completedTasks += 1;
      }
    }
  }

  const roadmapStats = {
    totalRoadmaps: roadmaps.length,
    totalTasks,
    completedTasks,
    overallCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };

  return sendSuccess(res, {
    readinessTrend,
    applicationFunnel,
    assessmentStats,
    roadmapStats
  });
};

module.exports = {
  getDashboardOverview,
  getAnalyticsData
};
