import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Assessment } from '../../types';
import {
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // New assessment trigger state
  const defaultSkill = searchParams.get('skill') || '';
  const [skillName, setSkillName] = useState(defaultSkill);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [starting, setStarting] = useState(false);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments');
      if (res.data?.success) {
        setAssessments(res.data.data.assessments);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    if (defaultSkill) {
      setSkillName(defaultSkill);
    }
  }, [defaultSkill]);

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      setStarting(true);
      const res = await api.post('/assessments/start', {
        skillName: skillName.trim(),
        difficulty,
        claimedLevel: 3
      });
      if (res.data?.success) {
        navigate(`/assessments/${res.data.data.assessment._id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate test');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching verified skill assessments..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Skill Verification Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate claimed resume skills with standardized tests to upgrade your verified readiness score.
          </p>
        </div>
      </div>

      {/* Start New Test Card */}
      <Card title="Start Skill Verification Test" subtitle="Generate a 5-question technical quiz evaluated by the backend.">
        <form onSubmit={handleStartTest} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Skill Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, React, AWS, Python"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Difficulty Tier
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="Beginner">Beginner (Foundational)</option>
              <option value="Intermediate">Intermediate (Standard)</option>
              <option value="Advanced">Advanced (Deep Dive)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={starting || !skillName.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {starting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Generate & Start Quiz</span>
          </button>
        </form>
      </Card>

      {/* Assessment History */}
      <Card title="Assessment History & Verified Levels">
        {assessments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No assessments taken yet. Launch your first test above to establish verified proficiency!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a) => (
              <div
                key={a._id}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-100">{a.skillName}</h4>
                      <span className="text-[11px] text-slate-400">
                        Difficulty: {a.difficulty} · Started {new Date(a.startedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      a.status === 'Completed'
                        ? a.score >= 70
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {a.status === 'Completed' ? `${a.score}% Score` : 'In Progress'}
                    </span>
                  </div>

                  {a.status === 'Completed' ? (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <span className="text-[10px] text-slate-400 block">Claimed</span>
                        <span className="text-xs font-bold text-slate-200">Lvl {a.claimedLevel}/5</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <span className="text-[10px] text-slate-400 block">Verified Level</span>
                        <span className="text-xs font-bold text-emerald-300">{a.levelLabel}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <span className="text-[10px] text-slate-400 block">Confidence</span>
                        <span className="text-xs font-bold text-sky-300">{a.confidence}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">Test has not been submitted yet.</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                  <Link
                    to={`/assessments/${a._id}`}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>{a.status === 'Completed' ? 'Review Answers' : 'Resume Quiz'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
