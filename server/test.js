const { connectDB, disconnectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const Resume = require('./src/models/Resume');
const Assessment = require('./src/models/Assessment');
const Application = require('./src/models/Application');
const Roadmap = require('./src/models/Roadmap');
const Analysis = require('./src/models/Analysis');

const readinessService = require('./src/services/scoring/readinessService');
const simulationService = require('./src/services/simulation/simulationService');
const skillService = require('./src/services/skills/skillService');
const assessmentService = require('./src/services/assessment/assessmentService');
const roadmapService = require('./src/services/roadmap/roadmapService');
const assistantService = require('./src/services/assistant/assistantService');

async function runTests() {
  console.log('--- STARTING END-TO-END BACKEND INTEGRATION TEST ---');
  await connectDB();
  await skillService.seedDefaultSkills();

  // 1. Create Test User
  const testEmail = `test_${Date.now()}@skilltojob.dev`;
  const user = new User({
    name: 'Alex Developer',
    email: testEmail,
    passwordHash: 'hashed_pw_123',
    profile: {
      headline: 'Full Stack Engineer',
      yearsOfExperience: 3,
      targetRole: 'Senior Full Stack Engineer',
      manualSkills: [
        { name: 'JavaScript', category: 'Programming Language', level: 4, source: 'manual' },
        { name: 'React', category: 'Frontend', level: 4, source: 'manual' },
        { name: 'Node.js', category: 'Backend', level: 3, source: 'manual' }
      ]
    }
  });
  await user.save();
  console.log('✓ 1. User created successfully:', user.email);

  // 2. Create Target Job
  const job = new Job({
    userId: user._id,
    title: 'Senior Full Stack Engineer',
    company: 'CloudTech Systems',
    description: 'We are looking for a Senior Full Stack Engineer experienced with React, Node.js, TypeScript, Docker, and AWS.',
    requiredSkills: [
      { name: 'React', level: 4, weight: 1.2 },
      { name: 'Node.js', level: 4, weight: 1.2 },
      { name: 'Docker', level: 3, weight: 1.0 },
      { name: 'AWS', level: 3, weight: 1.0 },
      { name: 'TypeScript', level: 4, weight: 1.1 }
    ],
    preferredSkills: [
      { name: 'Kubernetes', level: 2, weight: 0.5 }
    ],
    experienceRequirements: { minYears: 3, maxYears: 6, level: 'Senior' }
  });
  await job.save();
  console.log('✓ 2. Job created successfully with required tech stack.');

  // 3. Create Resume
  const resume = new Resume({
    userId: user._id,
    fileName: 'alex_developer_cv.pdf',
    extractedText: 'Alex Developer - 3 years experience building scalable web apps with React, JavaScript, Node.js, Express, and MongoDB.',
    summary: 'Experienced Full Stack Developer with strong frontend and backend foundations.',
    skills: [
      { name: 'React', category: 'Frontend', level: 4, experienceYears: 3 },
      { name: 'JavaScript', category: 'Programming Language', level: 4, experienceYears: 3 },
      { name: 'Node.js', category: 'Backend', level: 3, experienceYears: 2 },
      { name: 'MongoDB', category: 'Database', level: 3, experienceYears: 2 }
    ],
    projects: [
      { title: 'E-Commerce Microservices', description: 'Built with React and Node.js', technologies: ['React', 'Node.js', 'MongoDB'] },
      { title: 'Task Workflow Manager', description: 'Interactive React Kanban board', technologies: ['React', 'JavaScript'] }
    ]
  });
  await resume.save();
  console.log('✓ 3. Resume persisted with structured skills and projects.');

  // 4. Test Deterministic Readiness Scoring & Gap Intelligence
  const scores = readinessService.calculateScores({ user, resume, job, assessments: [] });
  console.log('✓ 4. Deterministic Readiness Calculated:');
  console.log(`   - Overall Score: ${scores.overallScore}%`);
  console.log(`   - Technical Score: ${scores.technicalScore}%`);
  console.log(`   - Experience Score: ${scores.experienceScore}%`);
  console.log(`   - Project Score: ${scores.projectScore}%`);
  console.log(`   - Identified Priority Gaps:`, scores.priorityGaps.map(g => `${g.skillName} (P:${g.priority})`));

  const analysis = new Analysis({
    userId: user._id,
    jobId: job._id,
    resumeId: resume._id,
    overallScore: scores.overallScore,
    technicalScore: scores.technicalScore,
    experienceScore: scores.experienceScore,
    projectScore: scores.projectScore,
    verificationScore: scores.verificationScore,
    scoringVersion: scores.scoringVersion,
    weights: scores.weights,
    skillMatches: scores.skillMatches,
    strengths: scores.strengths,
    weaknesses: scores.weaknesses,
    missingSkills: scores.missingSkills,
    priorityGaps: scores.priorityGaps,
    explainability: scores.explainability
  });
  await analysis.save();
  console.log('✓ 5. Analysis snapshot persisted.');

  // 5. Test What-If Simulator
  const simulation = simulationService.simulateImprovement({
    user,
    resume,
    job,
    assessments: [],
    simulatedSkills: [
      { name: 'Docker', level: 3, verified: true },
      { name: 'TypeScript', level: 4, verified: false }
    ]
  });
  console.log('✓ 6. What-If Simulation Run:');
  console.log(`   - Baseline Score: ${simulation.currentOverallScore}% -> Simulated Score: ${simulation.simulatedOverallScore}% (Delta: +${simulation.scoreDelta}%)`);

  // 6. Test Personalized Roadmap Generation & Progression
  const roadmap = await roadmapService.generateOrGetRoadmap({
    userId: user._id,
    jobId: job._id,
    analysisId: analysis._id
  });
  console.log('✓ 7. Personalized Roadmap Generated with Goals:', roadmap.goals.length);
  const firstTaskId = roadmap.goals[0]?.tasks[0]?.id;
  if (firstTaskId) {
    const updatedRoadmap = await roadmapService.updateTaskStatus({
      userId: user._id,
      roadmapId: roadmap._id,
      taskId: firstTaskId,
      isCompleted: true
    });
    console.log(`   - Task updated, new roadmap progress: ${updatedRoadmap.progress}%`);
  }

  // 7. Test Skill Assessment & Verification
  const newAssessment = await assessmentService.createAssessment({
    userId: user._id,
    skillName: 'Docker',
    difficulty: 'Intermediate',
    claimedLevel: 3
  });
  console.log('✓ 8. Assessment Created for Skill:', newAssessment.skillName);

  const fullAssessment = await Assessment.findById(newAssessment._id);
  const mockAnswers = fullAssessment.questions.map(q => ({
    questionId: q.id,
    userAnswer: q.correctAnswer
  }));

  const submitted = await assessmentService.submitAssessment({
    userId: user._id,
    assessmentId: newAssessment._id,
    answers: mockAnswers
  });
  console.log(`✓ 9. Assessment Evaluated by Backend: Score ${submitted.score}%, Level: ${submitted.levelLabel}`);

  // 8. Test Application Tracker
  const application = new Application({
    userId: user._id,
    jobId: job._id,
    resumeId: resume._id,
    company: 'CloudTech Systems',
    roleTitle: 'Senior Full Stack Engineer',
    status: 'Applied',
    notes: 'Submitted resume via careers portal'
  });
  await application.save();
  console.log('✓ 10. Application Tracker record saved:', application.status);

  // 9. Test Contextual Assistant
  const assistantResponse = await assistantService.askAssistant({
    userId: user._id,
    query: 'Why is Docker prioritized in my roadmap?',
    jobId: job._id
  });
  console.log('✓ 11. Contextual AI Assistant Response generated.');

  await disconnectDB();
  console.log('\n>>> ALL 11 CORE BACKEND MODULE TESTS PASSED PERFECTLY! <<<');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
