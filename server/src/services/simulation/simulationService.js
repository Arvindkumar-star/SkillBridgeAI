const matchingEngine = require('../matching/matchingEngine');
const readinessService = require('../scoring/readinessService');
const { normalizeSkillName, getSkillCategory } = require('../skills/skillNormalizer');

class SimulationService {
  simulateImprovement({ user, resume, job, assessments = [], simulatedSkills = [] }) {
    // 1. Calculate baseline current score
    const currentScores = readinessService.calculateScores({ user, resume, job, assessments });

    // 2. Clone and augment user skill map
    const baseSkillMap = matchingEngine.aggregateUserProfileSkills(user, resume, assessments);
    const augmentedSkillMap = new Map(baseSkillMap);

    const simulatedAssessments = [...assessments];

    for (const sim of simulatedSkills) {
      const norm = normalizeSkillName(sim.name);
      if (!norm) continue;

      const existing = augmentedSkillMap.get(norm);
      const newLevel = Math.max(existing?.level || 0, Number(sim.level) || 3);
      const isVerified = sim.verified !== undefined ? Boolean(sim.verified) : (existing?.verified || false);

      augmentedSkillMap.set(norm, {
        name: norm,
        category: sim.category || existing?.category || getSkillCategory(norm),
        level: newLevel,
        source: 'simulated',
        evidence: `Simulated proficiency level ${newLevel}/5 ${isVerified ? '(Verified)' : ''}`,
        confidence: isVerified ? 95 : 80,
        verified: isVerified,
        verifiedScore: isVerified ? 85 : (existing?.verifiedScore || 0)
      });

      if (isVerified) {
        simulatedAssessments.push({
          skillName: norm,
          category: getSkillCategory(norm),
          difficulty: 'Intermediate',
          score: 85,
          verifiedLevel: newLevel,
          levelLabel: 'Intermediate',
          status: 'Completed'
        });
      }
    }

    // 3. Re-run scoring with augmented profile
    const simulatedScores = readinessService.calculateScores({
      user,
      resume,
      job,
      assessments: simulatedAssessments,
      simulatedSkillMap: augmentedSkillMap
    });

    const scoreDelta = simulatedScores.overallScore - currentScores.overallScore;
    const technicalDelta = simulatedScores.technicalScore - currentScores.technicalScore;
    const verificationDelta = simulatedScores.verificationScore - currentScores.verificationScore;

    return {
      currentOverallScore: currentScores.overallScore,
      simulatedOverallScore: simulatedScores.overallScore,
      scoreDelta,
      breakdownDelta: {
        technicalDelta,
        verificationDelta
      },
      currentScores,
      simulatedScores,
      appliedSimulations: simulatedSkills
    };
  }
}

module.exports = new SimulationService();
