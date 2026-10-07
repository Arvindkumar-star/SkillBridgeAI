const pdfModule = require('pdf-parse');
const { getAIProvider } = require('../ai/aiProvider');
const Resume = require('../../models/Resume');
const User = require('../../models/User');
const skillService = require('../skills/skillService');

class ResumeService {
  async extractTextFromPDF(buffer) {
    try {
      if (typeof pdfModule === 'function') {
        const res = await pdfModule(buffer);
        return res.text || '';
      } else if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        if (typeof result === 'string') return result;
        if (result && result.text) return result.text;
        return '';
      } else if (pdfModule && typeof pdfModule.default === 'function') {
        const res = await pdfModule.default(buffer);
        return res.text || '';
      }

      // Fallback extraction
      const rawString = buffer.toString('utf-8');
      const printable = rawString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
      return printable;
    } catch (err) {
      console.warn('PDF parsing error, trying raw buffer fallback:', err.message);
      try {
        const rawString = buffer.toString('utf-8');
        return rawString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
      } catch (e) {
        throw new Error(`Failed to extract text from PDF: ${err.message}`);
      }
    }
  }

  async parseAndSaveResume({ userId, fileName, pdfBuffer }) {
    const extractedText = await this.extractTextFromPDF(pdfBuffer);
    if (!extractedText || !extractedText.trim()) {
      throw new Error('Could not extract readable text from the uploaded PDF document.');
    }

    const aiProvider = getAIProvider();
    const parsedData = await aiProvider.parseResume(extractedText);

    // Normalize skills
    const normalizedSkills = skillService.normalizeUserSkills(parsedData.skills || []);

    const resume = new Resume({
      userId,
      fileName,
      extractedText,
      summary: parsedData.summary || '',
      skills: normalizedSkills,
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      parsedAt: new Date()
    });

    await resume.save();

    // Sync extracted skills with User profile
    try {
      const user = await User.findById(userId);
      if (user) {
        if (!user.profile) user.profile = {};
        if (!user.profile.manualSkills) user.profile.manualSkills = [];

        const existingSkillNames = new Set(user.profile.manualSkills.map(s => s.name.toLowerCase()));
        for (const skill of normalizedSkills) {
          if (!existingSkillNames.has(skill.name.toLowerCase())) {
            user.profile.manualSkills.push({
              name: skill.name,
              category: skill.category,
              level: skill.level || 3,
              source: 'resume',
              verified: false,
              verifiedScore: 0
            });
            existingSkillNames.add(skill.name.toLowerCase());
          }
        }
        await user.save();
      }
    } catch (syncErr) {
      console.warn('Could not auto-sync profile skills from resume:', syncErr.message);
    }

    return resume;
  }

  async updateResume(resumeId, userId, updateData) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    if (updateData.skills) {
      updateData.skills = skillService.normalizeUserSkills(updateData.skills);
    }

    Object.assign(resume, updateData);
    await resume.save();

    // Sync to user profile as well
    if (updateData.skills) {
      try {
        const user = await User.findById(userId);
        if (user && user.profile) {
          const existingNames = new Set(user.profile.manualSkills.map(s => s.name.toLowerCase()));
          for (const s of updateData.skills) {
            if (!existingNames.has(s.name.toLowerCase())) {
              user.profile.manualSkills.push(s);
              existingNames.add(s.name.toLowerCase());
            }
          }
          await user.save();
        }
      } catch (err) {
        console.warn('Profile skill sync note:', err.message);
      }
    }

    return resume;
  }
}

module.exports = new ResumeService();
