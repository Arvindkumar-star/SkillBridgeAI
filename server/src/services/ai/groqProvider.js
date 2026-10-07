const config = require('../../config/env');
const localRuleProvider = require('./localRuleProvider');

class GroqProvider {
  constructor() {
    this.apiKey = config.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'openai/gpt-oss-120b';
  }

  async callGroq(messages, jsonMode = true) {
    if (!this.apiKey) {
      throw new Error('Groq API Key is not configured');
    }

    const body = {
      model: this.model,
      messages,
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  cleanJsonString(raw) {
    if (!raw) return '{}';
    return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  }

  async parseResume(text) {
    if (!this.apiKey) return localRuleProvider.parseResume(text);

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert technical resume parser. Extract structured data from the resume into valid JSON.'
        },
        {
          role: 'user',
          content: `Extract structured resume data from this text.
Schema to return:
{
  "summary": "string",
  "skills": [{"name": "string", "category": "Frontend | Backend | Database | Programming Language | DevOps | Cloud | AI/ML | Data | Security | Testing | CS Fundamentals | Tools | Soft Skills", "level": 1-5, "experienceYears": number}],
  "education": [{"degree": "string", "institution": "string", "field": "string", "year": "string"}],
  "experience": [{"title": "string", "company": "string", "duration": "string", "description": "string", "skillsUsed": ["string"]}],
  "projects": [{"title": "string", "description": "string", "technologies": ["string"], "link": "string"}],
  "certifications": [{"name": "string", "issuer": "string", "date": "string"}]
}

Resume:
${text.slice(0, 6000)}`
        }
      ];

      const content = await this.callGroq(messages, true);
      return JSON.parse(this.cleanJsonString(content));
    } catch (err) {
      console.warn('Groq resume parsing failed, falling back to local provider:', err.message);
      return localRuleProvider.parseResume(text);
    }
  }

  async parseJobDescription(text) {
    if (!this.apiKey) return localRuleProvider.parseJobDescription(text);

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert technical job requirement analyzer. Extract structured job requirements into valid JSON.'
        },
        {
          role: 'user',
          content: `Extract structured job requirements from this text:
Schema:
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

Job Description:
${text.slice(0, 6000)}`
        }
      ];

      const content = await this.callGroq(messages, true);
      return JSON.parse(this.cleanJsonString(content));
    } catch (err) {
      console.warn('Groq JD parsing failed, falling back to local provider:', err.message);
      return localRuleProvider.parseJobDescription(text);
    }
  }

  async generateRoadmap(params) {
    if (!this.apiKey) return localRuleProvider.generateRoadmap(params);

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a career development architect. Generate a targeted, step-by-step learning roadmap into valid JSON.'
        },
        {
          role: 'user',
          content: `Generate a roadmap for ${params.jobTitle} with these gaps: ${JSON.stringify(params.gaps)}
Schema:
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
}`
        }
      ];

      const content = await this.callGroq(messages, true);
      return JSON.parse(this.cleanJsonString(content));
    } catch (err) {
      console.warn('Groq roadmap generation failed, falling back to local provider:', err.message);
      return localRuleProvider.generateRoadmap(params);
    }
  }

  async generateAssessmentQuestions(params) {
    if (!this.apiKey) return localRuleProvider.generateAssessmentQuestions(params);

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are a technical assessment question generator. Respond with a JSON object containing a "questions" array.'
        },
        {
          role: 'user',
          content: `Generate ${params.count || 5} ${params.difficulty || 'Intermediate'} technical assessment questions for "${params.skillName}".
Schema:
{
  "questions": [
    {
      "id": "string",
      "type": "mcq",
      "prompt": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string",
      "points": 20
    }
  ]
}`
        }
      ];

      const content = await this.callGroq(messages, true);
      const parsed = JSON.parse(this.cleanJsonString(content));
      return parsed.questions || parsed;
    } catch (err) {
      console.warn('Groq assessment generation failed, falling back to local provider:', err.message);
      return localRuleProvider.generateAssessmentQuestions(params);
    }
  }

  async answerAssistantQuery(params) {
    if (!this.apiKey) return localRuleProvider.answerAssistantQuery(params);

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an AI Career Intelligence Advisor. Answer questions using only the user\'s real career context data.'
        },
        {
          role: 'user',
          content: `User Career Context:\n${JSON.stringify(params.userContext, null, 2)}\n\nUser Question:\n${params.query}`
        }
      ];

      const content = await this.callGroq(messages, false);
      return content;
    } catch (err) {
      console.warn('Groq assistant query failed, falling back to local provider:', err.message);
      return localRuleProvider.answerAssistantQuery(params);
    }
  }
}

module.exports = new GroqProvider();
