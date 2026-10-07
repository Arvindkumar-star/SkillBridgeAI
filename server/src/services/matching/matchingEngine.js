const { normalizeSkillName, getSkillCategory } = require('../skills/skillNormalizer');

class MatchingEngine {
  /**
   * Aggregate all skills from User Profile, Resumes, and Assessments.
   */
  aggregateUserProfileSkills(user, resume = null, assessments = []) {
    const skillMap = new Map();

    // 1. Resume skills
    if (resume && Array.isArray(resume.skills)) {
      for (const s of resume.skills) {
        const norm = normalizeSkillName(s.name);
        if (!norm) continue;
        skillMap.set(norm, {
          name: norm,
          category: s.category || getSkillCategory(norm),
          level: Number(s.level) || 3,
          source: 'resume',
          evidence: `Extracted from uploaded resume (${resume.fileName || 'CV'})`,
          confidence: 70,
          verified: false,
          verifiedScore: 0
        });
      }
    }

    // 2. Profile manual skills
    if (user.profile && Array.isArray(user.profile.manualSkills)) {
      for (const s of user.profile.manualSkills) {
        const norm = normalizeSkillName(s.name);
        if (!norm) continue;
        const existing = skillMap.get(norm);
        skillMap.set(norm, {
          name: norm,
          category: s.category || existing?.category || getSkillCategory(norm),
          level: Math.max(existing?.level || 0, Number(s.level) || 3),
          source: existing ? `${existing.source}, manual` : 'manual',
          evidence: existing ? `${existing.evidence} + User profile` : 'Added in user profile',
          confidence: existing ? 80 : 60,
          verified: s.verified || existing?.verified || false,
          verifiedScore: s.verifiedScore || existing?.verifiedScore || 0
        });
      }
    }

    // 3. Verified assessments
    if (Array.isArray(assessments)) {
      for (const a of assessments) {
        if (a.status === 'Completed') {
          const norm = normalizeSkillName(a.skillName);
          if (!norm) continue;
          const existing = skillMap.get(norm);
          skillMap.set(norm, {
            name: norm,
            category: a.category || existing?.category || getSkillCategory(norm),
            level: Math.max(existing?.level || 0, Number(a.verifiedLevel) || 1),
            source: existing ? `${existing.source}, assessment` : 'assessment',
            evidence: `Verified via Skill Assessment (Score: ${a.score}%, Level: ${a.levelLabel})`,
            confidence: 95,
            verified: true,
            verifiedScore: a.score
          });
        }
      }
    }

    return skillMap;
  }

  /**
   * Compare user skill map against target job skills.
   */
  matchSkills(userSkillMap, job) {
    const jobSkills = [];
    const seenSkills = new Set();

    // Required skills
    if (Array.isArray(job.requiredSkills)) {
      for (const s of job.requiredSkills) {
        const norm = normalizeSkillName(s.name);
        if (!norm || seenSkills.has(norm)) continue;
        seenSkills.add(norm);
        jobSkills.push({
          name: norm,
          category: getSkillCategory(norm),
          requiredLevel: Number(s.level) || 3,
          weight: Number(s.weight) || 1.0,
          isRequired: true
        });
      }
    }

    // Extracted / Preferred skills
    if (Array.isArray(job.extractedSkills)) {
      for (const s of job.extractedSkills) {
        const norm = normalizeSkillName(s.name);
        if (!norm || seenSkills.has(norm)) continue;
        seenSkills.add(norm);
        const isReq = s.importance === 'Required';
        jobSkills.push({
          name: norm,
          category: s.category || getSkillCategory(norm),
          requiredLevel: Number(s.level) || (isReq ? 3 : 2),
          weight: isReq ? 1.0 : 0.6,
          isRequired: isReq
        });
      }
    }

    const matches = [];
    const strengths = [];
    const weaknesses = [];
    const missingSkills = [];
    const priorityGaps = [];

    for (const jobSkill of jobSkills) {
      const userSkill = userSkillMap.get(jobSkill.name);
      const userLevel = userSkill ? userSkill.level : 0;
      const reqLevel = jobSkill.requiredLevel;

      let status = 'MISSING';
      let gapSeverity = reqLevel;

      if (userLevel === 0) {
        status = 'MISSING';
        gapSeverity = reqLevel;
        missingSkills.push(jobSkill.name);
      } else if (userLevel > reqLevel) {
        status = 'STRONG';
        gapSeverity = 0;
        strengths.push(`${jobSkill.name} (Lvl ${userLevel} vs Req ${reqLevel})`);
      } else if (userLevel === reqLevel) {
        status = 'MATCH';
        gapSeverity = 0;
        strengths.push(`${jobSkill.name} (Matched Req Lvl ${reqLevel})`);
      } else if (userLevel === reqLevel - 1) {
        status = 'PARTIAL';
        gapSeverity = 1;
        weaknesses.push(`${jobSkill.name} (Lvl ${userLevel} vs Req ${reqLevel})`);
      } else {
        status = 'WEAK';
        gapSeverity = reqLevel - userLevel;
        weaknesses.push(`${jobSkill.name} (Lvl ${userLevel} vs Req ${reqLevel})`);
      }

      const jobImportance = jobSkill.isRequired ? 1.5 : 1.0;
      const dependencyWeight = jobSkill.weight || 1.0;

      // Priority formula: gapSeverity * jobImportance * dependencyWeight normalized to 0-100
      let priority = 0;
      if (gapSeverity > 0) {
        priority = Math.min(100, Math.round(((gapSeverity / 4) * 0.45 + (jobImportance / 1.5) * 0.35 + (dependencyWeight / 1.5) * 0.20) * 100));
        priorityGaps.push({
          skillName: jobSkill.name,
          category: jobSkill.category,
          gapSeverity,
          priority,
          reason: status === 'MISSING'
            ? `Missing required skill for ${job.title}`
            : `Current proficiency level (${userLevel}/5) is below target requirement (${reqLevel}/5)`,
          recommendedAction: `Complete guided learning modules and verify ${jobSkill.name} via technical assessment.`
        });
      }

      matches.push({
        skillName: jobSkill.name,
        category: jobSkill.category,
        userLevel,
        requiredLevel: reqLevel,
        evidence: {
          source: userSkill ? userSkill.source : 'none',
          details: userSkill ? userSkill.evidence : 'No evidence found in profile or resume',
          confidence: userSkill ? userSkill.confidence : 0
        },
        status,
        gapSeverity,
        jobImportance,
        dependencyWeight,
        priority
      });
    }

    priorityGaps.sort((a, b) => b.priority - a.priority);

    return {
      skillMatches: matches,
      strengths,
      weaknesses,
      missingSkills,
      priorityGaps
    };
  }
}

module.exports = new MatchingEngine();
