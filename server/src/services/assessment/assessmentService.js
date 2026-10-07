const Assessment = require('../../models/Assessment');
const User = require('../../models/User');
const { getAIProvider } = require('../ai/aiProvider');
const { normalizeSkillName, getSkillCategory } = require('../skills/skillNormalizer');

class AssessmentService {
  async createAssessment({ userId, skillName, difficulty = 'Intermediate', claimedLevel = 3 }) {
    const normSkill = normalizeSkillName(skillName);
    const category = getSkillCategory(normSkill);

    const aiProvider = getAIProvider();
    const questions = await aiProvider.generateAssessmentQuestions({
      skillName: normSkill,
      difficulty,
      count: 5
    });

    const assessment = new Assessment({
      userId,
      skillName: normSkill,
      category,
      difficulty,
      claimedLevel,
      questions,
      score: 0,
      verifiedLevel: 1,
      levelLabel: 'Unverified',
      status: 'Created'
    });

    await assessment.save();

    // Mask correctAnswer when sending to client for active assessment
    const clientSafe = assessment.toObject();
    clientSafe.questions = clientSafe.questions.map(q => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });

    return clientSafe;
  }

  async submitAssessment({ userId, assessmentId, answers }) {
    const assessment = await Assessment.findOne({ _id: assessmentId, userId });
    if (!assessment) {
      throw new Error('Assessment not found or unauthorized');
    }

    let earnedPoints = 0;
    let totalPoints = 0;

    const answerMap = new Map();
    for (const a of answers) {
      answerMap.set(a.questionId, (a.userAnswer || '').trim().toLowerCase());
    }

    for (const q of assessment.questions) {
      const userAns = answerMap.get(q.id) || '';
      q.userAnswer = userAns;
      totalPoints += q.points || 20;

      const correct = (q.correctAnswer || '').trim().toLowerCase();
      if (userAns && (userAns === correct || userAns.includes(correct) || correct.includes(userAns))) {
        q.isCorrect = true;
        earnedPoints += q.points || 20;
      } else {
        q.isCorrect = false;
      }
    }

    const calculatedScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    assessment.score = calculatedScore;
    assessment.status = 'Completed';
    assessment.completedAt = new Date();

    // Map score to verified level
    let verifiedLevel = 1;
    let levelLabel = 'Beginner';
    if (calculatedScore >= 80) {
      verifiedLevel = 4;
      levelLabel = 'Advanced';
    } else if (calculatedScore >= 60) {
      verifiedLevel = 3;
      levelLabel = 'Intermediate';
    } else if (calculatedScore >= 40) {
      verifiedLevel = 2;
      levelLabel = 'Basic';
    } else {
      verifiedLevel = 1;
      levelLabel = 'Beginner';
    }

    assessment.verifiedLevel = verifiedLevel;
    assessment.levelLabel = levelLabel;
    assessment.confidence = Math.min(100, Math.round(50 + (calculatedScore * 0.5)));

    await assessment.save();

    // Update user profile manualSkills with verification
    const user = await User.findById(userId);
    if (user && user.profile) {
      const skillIdx = user.profile.manualSkills.findIndex(
        s => normalizeSkillName(s.name) === assessment.skillName
      );

      if (skillIdx >= 0) {
        user.profile.manualSkills[skillIdx].verified = calculatedScore >= 50;
        user.profile.manualSkills[skillIdx].verifiedScore = calculatedScore;
        user.profile.manualSkills[skillIdx].level = Math.max(user.profile.manualSkills[skillIdx].level, verifiedLevel);
      } else {
        user.profile.manualSkills.push({
          name: assessment.skillName,
          category: assessment.category,
          level: verifiedLevel,
          source: 'assessment',
          verified: calculatedScore >= 50,
          verifiedScore: calculatedScore
        });
      }
      await user.save();
    }

    return assessment;
  }
}

module.exports = new AssessmentService();
