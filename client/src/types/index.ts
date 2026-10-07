export interface User {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile;
}

export interface UserSkill {
  name: string;
  category?: string;
  level: number;
  source?: 'resume' | 'manual' | 'assessment';
  verified?: boolean;
  verifiedScore?: number;
}

export interface EducationItem {
  institution?: string;
  degree?: string;
  field?: string;
  graduationYear?: string;
}

export interface UserProfile {
  headline?: string;
  education?: EducationItem[];
  experienceLevel?: 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  yearsOfExperience?: number;
  targetRole?: string;
  preferredRoles?: string[];
  location?: string;
  manualSkills?: UserSkill[];
}

export interface Resume {
  _id: string;
  fileName: string;
  summary: string;
  skills: {
    name: string;
    category?: string;
    level: number;
    experienceYears?: number;
    source?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    field: string;
    year: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
    skillsUsed: string[];
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  parsedAt: string;
  createdAt: string;
}

export interface JobSkill {
  name: string;
  level?: number;
  weight?: number;
  category?: string;
  importance?: 'Required' | 'Preferred' | 'Nice-to-have';
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  source: 'Manual' | 'Pasted' | 'AI Extracted';
  extractedSkills?: JobSkill[];
  requiredSkills: JobSkill[];
  preferredSkills: JobSkill[];
  experienceRequirements?: {
    minYears: number;
    maxYears: number;
    level: string;
  };
  educationRequirements?: string;
  responsibilities?: string[];
  createdAt: string;
}

export interface SkillMatchItem {
  skillName: string;
  category: string;
  userLevel: number;
  requiredLevel: number;
  evidence: {
    source: string;
    details: string;
    confidence: number;
  };
  status: 'STRONG' | 'MATCH' | 'PARTIAL' | 'WEAK' | 'MISSING';
  gapSeverity: number;
  jobImportance: number;
  dependencyWeight: number;
  priority: number;
}

export interface PriorityGap {
  skillName: string;
  category: string;
  gapSeverity: number;
  priority: number;
  reason: string;
  recommendedAction: string;
}

export interface Analysis {
  _id: string;
  jobId: Job | string;
  resumeId?: Resume | string;
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  projectScore: number;
  verificationScore: number;
  scoringVersion: string;
  weights: {
    technical: number;
    experience: number;
    project: number;
    verification: number;
  };
  skillMatches: SkillMatchItem[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  priorityGaps: PriorityGap[];
  explainability: {
    summary: string;
    keyDrivers: string[];
    recommendations: string[];
  };
  createdAt: string;
}

export interface RoadmapTask {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoadmapResource {
  title: string;
  url: string;
  type: 'Documentation' | 'Course' | 'Project' | 'Article' | 'Video';
}

export interface RoadmapGoal {
  _id?: string;
  skillName: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  priorityScore: number;
  estimatedDays: number;
  learningOutcome: string;
  resources: RoadmapResource[];
  tasks: RoadmapTask[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
}

export interface Roadmap {
  _id: string;
  jobId: Job | string;
  analysisId?: string;
  title: string;
  goals: RoadmapGoal[];
  progress: number;
  startDate: string;
  targetCompletionDate?: string;
  updatedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'mcq' | 'short_answer';
  prompt: string;
  options: string[];
  correctAnswer?: string;
  userAnswer?: string;
  explanation?: string;
  isCorrect?: boolean;
  points: number;
}

export interface Assessment {
  _id: string;
  skillName: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: AssessmentQuestion[];
  score: number;
  claimedLevel: number;
  verifiedLevel: number;
  levelLabel: 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced' | 'Unverified';
  confidence: number;
  status: 'Created' | 'In_Progress' | 'Completed';
  startedAt: string;
  completedAt?: string;
}

export interface Application {
  _id: string;
  jobId: Job | string;
  resumeId?: string;
  company: string;
  roleTitle: string;
  status: 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Rejected' | 'Offer' | 'Accepted';
  appliedAt: string;
  interviewDate?: string;
  salaryRange?: string;
  location?: string;
  notes?: string;
  result?: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
