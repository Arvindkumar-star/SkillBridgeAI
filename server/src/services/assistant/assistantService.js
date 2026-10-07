const User = require('../../models/User');
const Resume = require('../../models/Resume');
const Job = require('../../models/Job');
const Analysis = require('../../models/Analysis');
const Roadmap = require('../../models/Roadmap');
const Assessment = require('../../models/Assessment');
const { getAIProvider } = require('../ai/aiProvider');

class AssistantService {
  async buildUserContext(userId, jobId = null) {
    const user = await User.findById(userId).select('-passwordHash');
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    let job = null;
    if (jobId) {
      job = await Job.findOne({ _id: jobId, userId });
    } else {
      job = await Job.findOne({ userId }).sort({ createdAt: -1 });
    }

    let analysis = null;
    if (job) {
      analysis = await Analysis.findOne({ jobId: job._id, userId }).sort({ createdAt: -1 });
    }

    const roadmap = job ? await Roadmap.findOne({ jobId: job._id, userId }) : null;
    const assessments = await Assessment.find({ userId });

    return {
      profile: {
        name: user?.name,
        targetRole: user?.profile?.targetRole,
        yearsOfExperience: user?.profile?.yearsOfExperience,
        experienceLevel: user?.profile?.experienceLevel,
        skills: user?.profile?.manualSkills
      },
      resume: resume ? {
        fileName: resume.fileName,
        summary: resume.summary,
        skillsCount: resume.skills?.length,
        projectCount: resume.projects?.length
      } : null,
      job: job ? {
        title: job.title,
        company: job.company,
        requiredSkills: job.requiredSkills
      } : null,
      analysis: analysis ? {
        overallScore: analysis.overallScore,
        technicalScore: analysis.technicalScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        priorityGaps: analysis.priorityGaps
      } : null,
      roadmap: roadmap ? {
        title: roadmap.title,
        progress: roadmap.progress,
        goals: roadmap.goals?.map(g => ({
          skill: g.skillName,
          status: g.status,
          tasksCompleted: g.tasks?.filter(t => t.isCompleted).length,
          tasksTotal: g.tasks?.length
        }))
      } : null,
      assessments: assessments.map(a => ({
        skillName: a.skillName,
        score: a.score,
        levelLabel: a.levelLabel,
        status: a.status
      }))
    };
  }

  async askAssistant({ userId, query, jobId = null }) {
    const userContext = await this.buildUserContext(userId, jobId);
    const aiProvider = getAIProvider();
    const answer = await aiProvider.answerAssistantQuery({
      query,
      userContext
    });

    return {
      answer,
      contextUsed: {
        targetJob: userContext.job?.title || 'General Profile',
        currentReadiness: userContext.analysis?.overallScore || 'N/A'
      }
    };
  }
}

module.exports = new AssistantService();
