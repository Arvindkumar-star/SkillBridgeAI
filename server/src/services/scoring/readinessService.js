const matchingEngine = require('../matching/matchingEngine');

class ReadinessService {
  calculateScores({ user, resume, job, assessments = [], simulatedSkillMap = null }) {
    const userSkillMap = simulatedSkillMap || matchingEngine.aggregateUserProfileSkills(user, resume, assessments);
    const matchResult = matchingEngine.matchSkills(userSkillMap, job);

    const matches = matchResult.skillMatches;

    // 1. Technical Score
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const m of matches) {
      const weight = (m.jobImportance || 1.0) * (m.dependencyWeight || 1.0);
      totalWeight += weight;

      if (m.status === 'STRONG') {
        earnedWeight += weight * 1.0;
      } else if (m.status === 'MATCH') {
        earnedWeight += weight * 1.0;
      } else if (m.status === 'PARTIAL') {
        earnedWeight += weight * 0.7;
      } else if (m.status === 'WEAK') {
        earnedWeight += weight * 0.35;
      } else {
        earnedWeight += 0;
      }
    }

    const technicalScore = totalWeight > 0 ? Math.min(100, Math.round((earnedWeight / totalWeight) * 100)) : 70;

    // 2. Experience Score
    const userYears = user?.profile?.yearsOfExperience || (resume?.experience?.length ? resume.experience.length * 1.5 : 1);
    const reqMinYears = job?.experienceRequirements?.minYears || 1;
    const reqMaxYears = job?.experienceRequirements?.maxYears || 5;

    let experienceScore = 50;
    if (userYears >= reqMinYears) {
      const ratio = (userYears - reqMinYears + 1) / (reqMaxYears - reqMinYears + 1);
      experienceScore = Math.min(100, Math.round(75 + Math.min(25, ratio * 25)));
    } else {
      experienceScore = Math.max(20, Math.round((userYears / reqMinYears) * 70));
    }

    // 3. Project Evidence Score
    const projects = resume?.projects || [];
    let projectScore = 40;
    if (projects.length >= 3) {
      projectScore = 90;
    } else if (projects.length === 2) {
      projectScore = 75;
    } else if (projects.length === 1) {
      projectScore = 60;
    } else {
      projectScore = 40;
    }

    // 4. Verification Score
    const completedAssessments = assessments.filter(a => a.status === 'Completed');
    let verificationScore = 0;
    if (completedAssessments.length > 0) {
      const avgScore = completedAssessments.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAssessments.length;
      verificationScore = Math.min(100, Math.round(avgScore));
    } else {
      verificationScore = 15; // Baseline unverified
    }

    // Configurable weights
    const weights = {
      technical: 0.45,
      experience: 0.20,
      project: 0.20,
      verification: 0.15
    };

    const overallScore = Math.min(100, Math.max(0, Math.round(
      (technicalScore * weights.technical) +
      (experienceScore * weights.experience) +
      (projectScore * weights.project) +
      (verificationScore * weights.verification)
    )));

    // Explainability summary
    const keyDrivers = [];
    if (technicalScore >= 80) keyDrivers.push('Strong technical skill alignment with required stack.');
    else keyDrivers.push('Core required tech stack has gaps that need focused development.');

    if (experienceScore >= 80) keyDrivers.push('Professional experience aligns well with target seniority.');
    else keyDrivers.push('Experience level is slightly below target role expectations.');

    if (verificationScore >= 60) keyDrivers.push('Demonstrated skill credibility through completed assessments.');
    else keyDrivers.push('Higher readiness can be unlocked by taking skill verification tests.');

    const recommendations = matchResult.priorityGaps.length > 0
      ? matchResult.priorityGaps.slice(0, 3).map(g =>
          `Prioritize ${g.skillName}: close gap of severity ${g.gapSeverity} to gain immediate readiness points.`
        )
      : [
          'You meet 100% of the required technical stack for this job!',
          'Take skill assessments in the Skill Verification tab to upgrade your Verified Evidence score from 15% to 90%+'
        ];

    return {
      overallScore,
      technicalScore,
      experienceScore,
      projectScore,
      verificationScore,
      scoringVersion: '1.0.0',
      weights,
      skillMatches: matchResult.skillMatches,
      strengths: matchResult.strengths,
      weaknesses: matchResult.weaknesses,
      missingSkills: matchResult.missingSkills,
      priorityGaps: matchResult.priorityGaps,
      explainability: {
        summary: `Your readiness score is ${overallScore}% for ${job.title} at ${job.company || 'the target company'}. Technical match is at ${technicalScore}%.`,
        keyDrivers,
        recommendations
      }
    };
  }
}

module.exports = new ReadinessService();
