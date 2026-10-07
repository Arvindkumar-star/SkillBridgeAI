const Roadmap = require('../../models/Roadmap');
const Job = require('../../models/Job');
const Analysis = require('../../models/Analysis');
const { getAIProvider } = require('../ai/aiProvider');

class RoadmapService {
  async generateOrGetRoadmap({ userId, jobId, analysisId = null }) {
    // Check if an active roadmap exists for this job
    let roadmap = await Roadmap.findOne({ userId, jobId });

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error('Target job not found or unauthorized');
    }

    let analysis = null;
    if (analysisId) {
      analysis = await Analysis.findOne({ _id: analysisId, userId });
    } else {
      analysis = await Analysis.findOne({ jobId, userId }).sort({ createdAt: -1 });
    }

    const rawGaps = analysis?.priorityGaps || [];
    const priorityGaps = rawGaps.length > 0 ? rawGaps : job.requiredSkills.map(s => ({
      skillName: s.name,
      category: 'General',
      priority: 75,
      gapSeverity: 1
    }));

    const aiProvider = getAIProvider();
    const generated = await aiProvider.generateRoadmap({
      jobTitle: job.title,
      gaps: priorityGaps
    });

    if (roadmap) {
      roadmap.goals = generated.goals;
      roadmap.analysisId = analysis?._id || roadmap.analysisId;
      roadmap.progress = 0;
      await roadmap.save();
    } else {
      roadmap = new Roadmap({
        userId,
        jobId,
        analysisId: analysis?._id || null,
        title: generated.title || `Learning Roadmap for ${job.title}`,
        goals: generated.goals,
        progress: 0,
        startDate: new Date()
      });
      await roadmap.save();
    }

    return roadmap;
  }

  async updateTaskStatus({ userId, roadmapId, taskId, isCompleted }) {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      throw new Error('Roadmap not found or unauthorized');
    }

    let totalTasks = 0;
    let completedTasks = 0;

    for (const goal of roadmap.goals) {
      for (const task of goal.tasks) {
        totalTasks += 1;
        if (task.id === taskId) {
          task.isCompleted = isCompleted;
          task.completedAt = isCompleted ? new Date() : null;
        }
        if (task.isCompleted) {
          completedTasks += 1;
        }
      }

      // Check if all tasks in goal are completed
      const allGoalTasksDone = goal.tasks.length > 0 && goal.tasks.every(t => t.isCompleted);
      if (allGoalTasksDone) {
        goal.status = 'Completed';
      } else if (goal.tasks.some(t => t.isCompleted)) {
        goal.status = 'In Progress';
      }
    }

    roadmap.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await roadmap.save();
    return roadmap;
  }
}

module.exports = new RoadmapService();
