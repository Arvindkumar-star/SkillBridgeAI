const Skill = require('../../models/Skill');
const { normalizeSkillName, getSkillCategory } = require('./skillNormalizer');

const SEED_SKILLS = [
  { name: 'JavaScript', category: 'Programming Language', aliases: ['js', 'ecmascript', 'es6'], relatedSkills: ['TypeScript', 'Node.js', 'React'], importanceWeight: 1.2 },
  { name: 'TypeScript', category: 'Programming Language', aliases: ['ts'], relatedSkills: ['JavaScript', 'React', 'Node.js'], importanceWeight: 1.2 },
  { name: 'Python', category: 'Programming Language', aliases: ['py', 'python3'], relatedSkills: ['Django', 'FastAPI', 'Machine Learning'], importanceWeight: 1.1 },
  { name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'], relatedSkills: ['JavaScript', 'TypeScript', 'Next.js', 'Redux'], importanceWeight: 1.3 },
  { name: 'Node.js', category: 'Backend', aliases: ['node', 'nodejs'], relatedSkills: ['Express.js', 'JavaScript', 'TypeScript', 'MongoDB'], importanceWeight: 1.3 },
  { name: 'Express.js', category: 'Backend', aliases: ['express', 'expressjs'], relatedSkills: ['Node.js', 'REST APIs'], importanceWeight: 1.0 },
  { name: 'MongoDB', category: 'Database', aliases: ['mongo', 'mongoose'], relatedSkills: ['Node.js', 'Express.js', 'Database'], importanceWeight: 1.1 },
  { name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'psql'], relatedSkills: ['SQL', 'Database'], importanceWeight: 1.2 },
  { name: 'Docker', category: 'DevOps', aliases: ['container', 'containerization'], relatedSkills: ['Kubernetes', 'CI/CD', 'DevOps'], importanceWeight: 1.3 },
  { name: 'Kubernetes', category: 'DevOps', aliases: ['k8s'], relatedSkills: ['Docker', 'Cloud', 'DevOps'], importanceWeight: 1.2 },
  { name: 'AWS', category: 'Cloud', aliases: ['amazon web services'], relatedSkills: ['Docker', 'Cloud', 'DevOps'], importanceWeight: 1.3 },
  { name: 'REST APIs', category: 'Backend', aliases: ['rest', 'restful', 'api'], relatedSkills: ['Node.js', 'Express.js'], importanceWeight: 1.1 },
  { name: 'Git', category: 'Tools', aliases: ['github', 'gitlab'], relatedSkills: ['CI/CD'], importanceWeight: 1.0 },
  { name: 'Jest', category: 'Testing', aliases: ['unit testing'], relatedSkills: ['JavaScript', 'Testing'], importanceWeight: 1.0 },
  { name: 'System Design', category: 'CS Fundamentals', aliases: ['distributed systems'], relatedSkills: ['Architecture', 'Database'], importanceWeight: 1.2 },
  { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', aliases: ['dsa', 'algorithms'], relatedSkills: ['Problem Solving'], importanceWeight: 1.1 }
];

class SkillService {
  async seedDefaultSkills() {
    try {
      const count = await Skill.countDocuments();
      if (count === 0) {
        console.log('Seeding initial skill catalog...');
        await Skill.insertMany(SEED_SKILLS);
        console.log('Default skills seeded.');
      }
    } catch (err) {
      console.warn('Skill seeding note:', err.message);
    }
  }

  async getAllSkills(category = null) {
    const query = category ? { category } : {};
    return await Skill.find(query).sort({ name: 1 });
  }

  async searchSkills(term) {
    if (!term) return [];
    const regex = new RegExp(term, 'i');
    return await Skill.find({
      $or: [
        { name: regex },
        { aliases: regex },
        { category: regex }
      ]
    }).limit(20);
  }

  normalizeUserSkills(skills = []) {
    return skills.map(skill => {
      const normalizedName = normalizeSkillName(skill.name || skill);
      const category = skill.category || getSkillCategory(normalizedName);
      return {
        name: normalizedName,
        category: category,
        level: Number(skill.level) || 3,
        source: skill.source || 'manual',
        verified: Boolean(skill.verified),
        verifiedScore: Number(skill.verifiedScore) || 0,
        experienceYears: Number(skill.experienceYears) || 1
      };
    });
  }
}

module.exports = new SkillService();
