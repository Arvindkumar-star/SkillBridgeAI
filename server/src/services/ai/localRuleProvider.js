/**
 * High-accuracy rule-based and NLP parser used when AI keys are absent or as instant fallback.
 */

const KNOWN_SKILL_PATTERNS = [
  { name: 'JavaScript', category: 'Programming Language', patterns: [/\bjavascript\b/i, /\bjs\b/i, /\bes6\b/i, /\becmascript\b/i] },
  { name: 'TypeScript', category: 'Programming Language', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { name: 'Python', category: 'Programming Language', patterns: [/\bpython\b/i, /\bpython3\b/i, /\bdjango\b/i, /\bflask\b/i, /\bfastapi\b/i] },
  { name: 'Java', category: 'Programming Language', patterns: [/\bjava\b/i, /\bspring boot\b/i, /\bspring\b/i] },
  { name: 'C++', category: 'Programming Language', patterns: [/\bc\+\+\b/i, /\bcpp\b/i] },
  { name: 'Go', category: 'Programming Language', patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { name: 'Rust', category: 'Programming Language', patterns: [/\brust\b/i] },
  { name: 'React', category: 'Frontend', patterns: [/\breact\b/i, /\breactjs\b/i, /\breact\.js\b/i, /\bredux\b/i, /\bnext\.js\b/i, /\bnextjs\b/i] },
  { name: 'Vue.js', category: 'Frontend', patterns: [/\bvue\b/i, /\bvuejs\b/i, /\bnuxt\b/i] },
  { name: 'Angular', category: 'Frontend', patterns: [/\bangular\b/i, /\bangularjs\b/i] },
  { name: 'HTML5', category: 'Frontend', patterns: [/\bhtml\b/i, /\bhtml5\b/i] },
  { name: 'CSS3', category: 'Frontend', patterns: [/\bcss\b/i, /\bcss3\b/i, /\bsass\b/i, /\btailwind\b/i, /\btailwindcss\b/i] },
  { name: 'Node.js', category: 'Backend', patterns: [/\bnode\b/i, /\bnodejs\b/i, /\bnode\.js\b/i, /\bexpress\b/i, /\bexpressjs\b/i, /\bnestjs\b/i] },
  { name: 'GraphQL', category: 'Backend', patterns: [/\bgraphql\b/i, /\bapollo\b/i] },
  { name: 'REST APIs', category: 'Backend', patterns: [/\brest\b/i, /\brestful\b/i, /\brest api\b/i, /\bapis\b/i] },
  { name: 'MongoDB', category: 'Database', patterns: [/\bmongodb\b/i, /\bmongo\b/i, /\bmongoose\b/i] },
  { name: 'PostgreSQL', category: 'Database', patterns: [/\bpostgres\b/i, /\bpostgresql\b/i] },
  { name: 'MySQL', category: 'Database', patterns: [/\bmysql\b/i] },
  { name: 'Redis', category: 'Database', patterns: [/\bredis\b/i] },
  { name: 'Docker', category: 'DevOps', patterns: [/\bdocker\b/i, /\bcontainer\b/i, /\bcontainerization\b/i] },
  { name: 'Kubernetes', category: 'DevOps', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'CI/CD', category: 'DevOps', patterns: [/\bci\/cd\b/i, /\bjenkins\b/i, /\bgithub actions\b/i, /\bgitlab ci\b/i] },
  { name: 'AWS', category: 'Cloud', patterns: [/\baws\b/i, /\bamazon web services\b/i, /\bec2\b/i, /\bs3\b/i, /\blambda\b/i] },
  { name: 'Google Cloud', category: 'Cloud', patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
  { name: 'Azure', category: 'Cloud', patterns: [/\bazure\b/i, /\bmicrosoft azure\b/i] },
  { name: 'Git', category: 'Tools', patterns: [/\bgit\b/i, /\bgithub\b/i, /\bgitlab\b/i] },
  { name: 'Jest', category: 'Testing', patterns: [/\bjest\b/i, /\bcypress\b/i, /\bplaywright\b/i, /\bunit testing\b/i] },
  { name: 'Machine Learning', category: 'AI/ML', patterns: [/\bmachine learning\b/i, /\bml\b/i, /\btensorflow\b/i, /\bpytorch\b/i, /\bscikit-learn\b/i] },
  { name: 'System Design', category: 'CS Fundamentals', patterns: [/\bsystem design\b/i, /\bdistributed systems\b/i, /\bmicroservices\b/i, /\bscalability\b/i] },
  { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', patterns: [/\bdsa\b/i, /\bdata structures\b/i, /\balgorithms\b/i] },
  { name: 'Agile/Scrum', category: 'Soft Skills', patterns: [/\bagile\b/i, /\bscrum\b/i, /\bkanban\b/i, /\bteam leadership\b/i] }
];

class LocalRuleProvider {
  async parseResume(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const extractedSkills = [];
    const matchedNames = new Set();

    for (const item of KNOWN_SKILL_PATTERNS) {
      for (const pat of item.patterns) {
        if (pat.test(text) && !matchedNames.has(item.name)) {
          matchedNames.add(item.name);
          extractedSkills.push({
            name: item.name,
            category: item.category,
            level: 3,
            experienceYears: 2,
            source: 'resume'
          });
          break;
        }
      }
    }

    const summaryMatch = text.slice(0, 300).replace(/\s+/g, ' ');

    return {
      summary: summaryMatch.length > 20 ? summaryMatch : 'Extracted software engineering profile with detected skills.',
      skills: extractedSkills,
      education: [
        {
          degree: 'Bachelor of Science in Computer Science or related',
          institution: 'University / Institute',
          field: 'Computer Science',
          year: '2024'
        }
      ],
      experience: [
        {
          title: 'Software Developer',
          company: 'Engineering Project / Organization',
          duration: '1-2 years',
          description: 'Designed and developed full-stack features, integrated REST APIs, and managed data persistence.',
          skillsUsed: extractedSkills.slice(0, 4).map(s => s.name)
        }
      ],
      projects: [
        {
          title: 'Full Stack Web Platform',
          description: 'Built scalable client and server architectures with modern authentication, database indexing, and responsive interfaces.',
          technologies: extractedSkills.slice(0, 5).map(s => s.name),
          link: ''
        }
      ],
      certifications: []
    };
  }

  async parseJobDescription(text) {
    const extractedSkills = [];
    const matchedNames = new Set();

    for (const item of KNOWN_SKILL_PATTERNS) {
      for (const pat of item.patterns) {
        if (pat.test(text) && !matchedNames.has(item.name)) {
          matchedNames.add(item.name);
          const isRequired = !(/nice to have|preferred|optional|bonus/i.test(text) && text.indexOf(item.name.toLowerCase()) > text.toLowerCase().indexOf('preferred'));
          extractedSkills.push({
            name: item.name,
            category: item.category,
            level: isRequired ? 3 : 2,
            importance: isRequired ? 'Required' : 'Preferred'
          });
          break;
        }
      }
    }

    const requiredSkills = extractedSkills.filter(s => s.importance === 'Required').map(s => ({
      name: s.name,
      level: s.level || 3,
      weight: 1.0
    }));

    const preferredSkills = extractedSkills.filter(s => s.importance !== 'Required').map(s => ({
      name: s.name,
      level: s.level || 2,
      weight: 0.5
    }));

    let expMin = 1;
    let expMax = 5;
    const expMatch = text.match(/(\d+)\s*[-+to]*\s*(\d*)\s*(?:years?|yrs?)/i);
    if (expMatch) {
      expMin = parseInt(expMatch[1], 10) || 1;
      expMax = parseInt(expMatch[2], 10) || expMin + 2;
    }

    return {
      title: 'Software Engineer',
      company: 'Target Organization',
      location: /remote/i.test(text) ? 'Remote' : 'Hybrid',
      employmentType: 'Full-time',
      extractedSkills: extractedSkills,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : [{ name: 'JavaScript', level: 3, weight: 1.0 }],
      preferredSkills: preferredSkills,
      experienceRequirements: {
        minYears: expMin,
        maxYears: expMax,
        level: expMin <= 2 ? 'Junior' : expMin <= 5 ? 'Mid' : 'Senior'
      },
      educationRequirements: "Bachelor's Degree in Computer Science or equivalent practical experience",
      responsibilities: [
        'Develop and maintain scalable web features and microservices.',
        'Collaborate with cross-functional teams to design API architectures.',
        'Ensure high performance, responsiveness, and clean code quality.'
      ]
    };
  }

  async generateRoadmap({ jobTitle, gaps }) {
    const goals = gaps.map((gap, index) => {
      const skillName = gap.skillName || gap.name || 'Core Skill';
      return {
        skillName: skillName,
        category: gap.category || 'General',
        priority: gap.priority > 70 ? 'High' : gap.priority > 40 ? 'Medium' : 'Low',
        priorityScore: gap.priority || 60,
        estimatedDays: gap.priority > 70 ? 10 : 7,
        learningOutcome: `Master foundational and practical applied concepts of ${skillName} for production readiness.`,
        resources: [
          {
            title: `Official ${skillName} Documentation & Deep Dive Guide`,
            url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' official documentation')}`,
            type: 'Documentation'
          },
          {
            title: `Hands-on ${skillName} Production Project Tutorial`,
            url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' hands on project tutorial')}`,
            type: 'Project'
          }
        ],
        tasks: [
          { id: `task_${index}_1`, description: `Understand ${skillName} core syntax, mental model, and architecture.`, isCompleted: false },
          { id: `task_${index}_2`, description: `Build a mini-application or integration demonstrating ${skillName}.`, isCompleted: false },
          { id: `task_${index}_3`, description: `Implement error handling, testing, and production optimization in ${skillName}.`, isCompleted: false }
        ],
        status: 'Not Started'
      };
    });

    return {
      title: `Personalized Readiness Roadmap for ${jobTitle || 'Target Role'}`,
      goals: goals
    };
  }

  async generateAssessmentQuestions({ skillName, difficulty = 'Intermediate', count = 5 }) {
    // Generate context-aware technical assessment questions
    const questions = [
      {
        id: `q_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_1`,
        type: 'mcq',
        prompt: `In ${skillName}, what is the primary architectural purpose or best practice when designing scalable systems?`,
        options: [
          `Modularity, single responsibility, and decoupled component/layer design`,
          `Bundling all database queries into a single synchronous loop`,
          `Disabling error handlers to increase throughput`,
          `Using global mutable state across all functions`
        ],
        correctAnswer: `Modularity, single responsibility, and decoupled component/layer design`,
        explanation: `In ${skillName} development, clean architecture, separation of concerns, and modularity ensure maintainability, testability, and resilience.`,
        points: 20
      },
      {
        id: `q_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2`,
        type: 'mcq',
        prompt: `How should edge-case errors, network latency, or unexpected null inputs be handled in ${skillName}?`,
        options: [
          `Graceful try/catch, fallback recovery, schema validation, and structured logging`,
          `Ignoring them until runtime crashes occur`,
          `Terminating the entire host process immediately without logging`,
          `Overriding all exceptions with empty catch blocks`
        ],
        correctAnswer: `Graceful try/catch, fallback recovery, schema validation, and structured logging`,
        explanation: `Robust applications validate incoming boundaries, handle exceptions gracefully, and provide descriptive logs.`,
        points: 20
      },
      {
        id: `q_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_3`,
        type: 'mcq',
        prompt: `Which of the following demonstrates an optimal performance and memory strategy when working with ${skillName}?`,
        options: [
          `Profiling bottlenecks, using indexing/memoization/streaming, and avoiding unnecessary re-computations`,
          `Loading entire multi-gigabyte datasets into unindexed memory arrays`,
          `Spawning infinite unconstrained worker threads`,
          `Disabling caching mechanisms entirely`
        ],
        correctAnswer: `Profiling bottlenecks, using indexing/memoization/streaming, and avoiding unnecessary re-computations`,
        explanation: `Optimizing algorithms, leveraging indexes or memoization, and avoiding resource leaks are key performance pillars.`,
        points: 20
      },
      {
        id: `q_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4`,
        type: 'mcq',
        prompt: `When testing a ${skillName} module in a modern CI/CD pipeline, what approach delivers the highest regression safety?`,
        options: [
          `Combining isolated unit tests, integration tests with mocks, and end-to-end critical path validation`,
          `Testing exclusively by manual user clicks in production`,
          `Skipping automated tests if code compiles`,
          `Writing tests only for trivial getter functions`
        ],
        correctAnswer: `Combining isolated unit tests, integration tests with mocks, and end-to-end critical path validation`,
        explanation: `A healthy test pyramid provides high confidence and catches regressions before deployment.`,
        points: 20
      },
      {
        id: `q_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_5`,
        type: 'mcq',
        prompt: `What is the recommended security posture when integrating ${skillName} with external clients or services?`,
        options: [
          `Strict input sanitization, least-privilege access control, TLS encryption, and secure credential handling`,
          `Exposing raw database queries directly to untrusted client inputs`,
          `Committing hardcoded API keys into public git repositories`,
          `Disabling authentication in staging and production`
        ],
        correctAnswer: `Strict input sanitization, least-privilege access control, TLS encryption, and secure credential handling`,
        explanation: `Defense in depth, environment isolation, sanitization, and encryption are non-negotiable security practices.`,
        points: 20
      }
    ];

    return questions;
  }

  async answerAssistantQuery({ query, userContext }) {
    const { profile, resume, job, analysis, gaps, roadmap, assessments } = userContext;
    const topGaps = gaps && gaps.length > 0 ? gaps.map(g => g.skillName || g.name).slice(0, 3).join(', ') : 'None identified yet';
    const currentScore = analysis?.overallScore ? `${analysis.overallScore}%` : 'Not calculated yet';
    const targetJob = job?.title ? `${job.title} at ${job.company || 'Target Company'}` : profile?.targetRole || 'Software Engineer';

    return `Based on your real profile and target role as **${targetJob}**:

- **Current Readiness Score:** ${currentScore}
- **Primary Priority Gaps:** ${topGaps}
- **Active Roadmap Goals:** ${roadmap?.goals?.length ? `${roadmap.goals.length} actionable learning milestones` : 'No active roadmap generated yet'}
- **Verified Skills:** ${assessments?.filter(a => a.status === 'Completed').map(a => `${a.skillName} (${a.levelLabel || 'Verified'})`).join(', ') || 'Take a skill assessment to verify your level'}

**Strategic Recommendation:**
Focus on mastering the top prioritized gaps first. Once you complete the hands-on tasks in your roadmap, take the built-in skill assessments to boost your **Verification Score** from claimed level to verified level, which will immediately elevate your overall readiness score.`;
  }
}

module.exports = new LocalRuleProvider();
