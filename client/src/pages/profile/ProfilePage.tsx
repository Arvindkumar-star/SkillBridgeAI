import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User, UserSkill } from '../../types';
import {
  User as UserIcon,
  Briefcase,
  GraduationCap,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Skill Modal/Input State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data?.success) {
        setProfile(res.data.data.user);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      const res = await api.put('/users/profile', {
        name: profile.name,
        headline: profile.profile?.headline,
        experienceLevel: profile.profile?.experienceLevel,
        yearsOfExperience: Number(profile.profile?.yearsOfExperience),
        targetRole: profile.profile?.targetRole,
        location: profile.profile?.location,
        manualSkills: profile.profile?.manualSkills
      });
      if (res.data?.success) {
        setSuccessMsg('Profile updated successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/users/skills', {
        name: newSkillName.trim(),
        level: newSkillLevel,
        category: newSkillCategory
      });
      if (res.data?.success) {
        setProfile((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            manualSkills: res.data.data.manualSkills
          }
        }));
        setNewSkillName('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    try {
      const res = await api.delete(`/users/skills/${encodeURIComponent(skillName)}`);
      if (res.data?.success) {
        setProfile((prev: any) => ({
          ...prev,
          profile: {
            ...prev.profile,
            manualSkills: res.data.data.manualSkills
          }
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile & skill graph..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Professional Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your background, target roles, and normalized skill inventory.
          </p>
        </div>
        {successMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Career Demographics">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={profile?.profile?.targetRole || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, targetRole: e.target.value }
                      })
                    }
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={profile?.profile?.headline || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profile: { ...profile.profile, headline: e.target.value }
                    })
                  }
                  placeholder="e.g. Full Stack Developer specializing in React, Node.js, and Cloud Architectures"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={profile?.profile?.experienceLevel || 'Junior'}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, experienceLevel: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead / Architect</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={profile?.profile?.yearsOfExperience || 0}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, yearsOfExperience: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile?.profile?.location || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, location: e.target.value }
                      })
                    }
                    placeholder="e.g. Remote / San Francisco"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Skill Management Sidebar */}
        <div className="space-y-6">
          <Card title="Add Manual Skill" subtitle="Directly add skills to your profile">
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, TypeScript, AWS"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Programming Language">Prog Language</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Cloud">Cloud</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Testing">Testing</option>
                    <option value="CS Fundamentals">CS Fund.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Level (1-5)</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Basic</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 mt-2"
              >
                <Plus className="w-3.5 h-3.5 text-brand-400" />
                <span>Add Skill</span>
              </button>
            </form>
          </Card>
        </div>
      </div>

      {/* Tracked Skills Table */}
      <Card
        title="Active Normalized Skill Inventory"
        subtitle="Skills aggregated from profile declarations, uploaded resumes, and verified assessments."
      >
        {profile?.profile?.manualSkills && profile.profile.manualSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.profile.manualSkills.map((skill: UserSkill, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100 truncate block">
                      {skill.name}
                    </span>
                    {skill.verified && (
                      <span title={`Verified via Assessment (${skill.verifiedScore}%)`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Level {skill.level}/5
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {skill.source || 'manual'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSkill(skill.name)}
                  title="Remove skill"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No skills recorded yet. Add manual skills above or upload your resume.
          </div>
        )}
      </Card>
    </div>
  );
};
