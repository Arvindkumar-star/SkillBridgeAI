const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env');
const groqProvider = require('./groqProvider');
const localRuleProvider = require('./localRuleProvider');

class GeminiProvider {
  constructor() {
    this.genAI = config.GEMINI_API_KEY ? new GoogleGenerativeAI(config.GEMINI_API_KEY) : null;
  }

  getModel(modelName = 'gemini-1.5-flash') {
    if (!this.genAI && config.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    }
    if (!this.genAI) return null;
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  async parseResume(text) {
    const model = this.getModel();
    if (!model) {
      if (config.GROQ_API_KEY) return groqProvider.parseResume(text);
      return localRuleProvider.parseResume(text);
    }

    try {
      const prompt = `You are an expert technical resume parser. Extract structured data from the following resume text.
Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "string",
  "skills": [{"name": "string", "category": "Frontend | Backend | Database | Programming Language | DevOps | Cloud | AI/ML | Data | Security | Testing | CS Fundamentals | Tools | Soft Skills", "level": 1-5, "experienceYears": number}],
  "education": [{"degree": "string", "institution": "string", "field": "string", "year": "string"}],
  "experience": [{"title": "string", "company": "string", "duration": "string", "description": "string", "skillsUsed": ["string"]}],
  "projects": [{"title": "string", "description": "string", "technologies": ["string"], "link": "string"}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string"}]
}

Resume Text:
${text.slice(0, 6000)}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('Gemini resume parsing failed, switching to Groq/local provider:', err.message);
      if (config.GROQ_API_KEY) return groqProvider.parseResume(text);
      return localRuleProvider.parseResume(text);
    }
  }

  async parseJobDescription(text) {
    const model = this.getModel();
    if (!model) {
      if (config.GROQ_API_KEY) return groqProvider.parseJobDescription(text);
      return localRuleProvider.parseJobDescription(text);
    }

    try {
      const prompt = `You are a technical job description analyzer. Extract requirements from the following job posting.
Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string",
  "company": "string",
  "location": "string",
  "employmentType": "string",
  "extractedSkills": [{"name": "string", "category": "Frontend | Backend | Database | Programming Language | DevOps | Cloud | AI/ML | Data | Security | Testing | CS Fundamentals | Tools | Soft Skills", "level": 1-5, "importance": "Required | Preferred | Nice-to-have"}],
  "requiredSkills": [{"name": "string", "level": 1-5, "weight": number}],
  "preferredSkills": [{"name": "string", "level": 1-5, "weight": number}],
  "experienceRequirements": {"minYears": number, "maxYears": number, "level": "Junior | Mid | Senior | Lead"},
  "educationRequirements": "string",
  "responsibilities": ["string"]
}

Job Description Text:
${text.slice(0, 6000)}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('Gemini JD parsing failed, switching to Groq/local provider:', err.message);
      if (config.GROQ_API_KEY) return groqProvider.parseJobDescription(text);
      return localRuleProvider.parseJobDescription(text);
    }
  }

  async generateRoadmap(params) {
    const model = this.getModel();
    if (!model) {
      if (config.GROQ_API_KEY) return groqProvider.generateRoadmap(params);
      return localRuleProvider.generateRoadmap(params);
    }

    try {
      const prompt = `You are a career development architect. Generate a targeted, step-by-step learning roadmap to close the following skill gaps for target job "${params.jobTitle}":
Gaps: ${JSON.stringify(params.gaps)}

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string",
  "goals": [
    {
      "skillName": "string",
      "category": "string",
      "priority": "High | Medium | Low",
      "priorityScore": number,
      "estimatedDays": number,
      "learningOutcome": "string",
      "resources": [{"title": "string", "url": "string", "type": "Documentation | Course | Project | Article | Video"}],
      "tasks": [{"id": "string", "description": "string", "isCompleted": false}]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('Gemini roadmap generation failed, switching to Groq/local provider:', err.message);
      if (config.GROQ_API_KEY) return groqProvider.generateRoadmap(params);
      return localRuleProvider.generateRoadmap(params);
    }
  }

  async generateAssessmentQuestions(params) {
    const model = this.getModel();
    if (!model) {
      if (config.GROQ_API_KEY) return groqProvider.generateAssessmentQuestions(params);
      return localRuleProvider.generateAssessmentQuestions(params);
    }

    try {
      const prompt = `Generate ${params.count || 5} high-quality ${params.difficulty || 'Intermediate'} technical assessment questions for the skill: "${params.skillName}".
Respond ONLY with a valid JSON array matching this schema:
[
  {
    "id": "string",
    "type": "mcq",
    "prompt": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string (must match one of options exactly)",
    "explanation": "string",
    "points": 20
  }
]`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('Gemini assessment generation failed, switching to Groq/local provider:', err.message);
      if (config.GROQ_API_KEY) return groqProvider.generateAssessmentQuestions(params);
      return localRuleProvider.generateAssessmentQuestions(params);
    }
  }

  async answerAssistantQuery(params) {
    const model = this.getModel();
    if (!model) {
      if (config.GROQ_API_KEY) return groqProvider.answerAssistantQuery(params);
      return localRuleProvider.answerAssistantQuery(params);
    }

    try {
      const prompt = `You are the AI Career Intelligence Assistant for a developer. Answer their question specifically, accurately, and encouragingly using ONLY their real career context data provided below. Do not invent imaginary achievements.

User Career Context:
${JSON.stringify(params.userContext, null, 2)}

User Question:
${params.query}`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn('Gemini assistant query failed, switching to Groq/local provider:', err.message);
      if (config.GROQ_API_KEY) return groqProvider.answerAssistantQuery(params);
      return localRuleProvider.answerAssistantQuery(params);
    }
  }
}

module.exports = new GeminiProvider();
