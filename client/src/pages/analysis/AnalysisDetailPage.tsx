import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { StatusPill } from '../../components/common/StatusPill';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Analysis } from '../../types';
import {
  Briefcase,
  Sliders,
  Map,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/analyses/${id}`);
        if (res.data?.success) {
          setAnalysis(res.data.data.analysis);
        }
      } catch (err) {
        console.error('Failed to load analysis snapshot:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleGenerateRoadmap = async () => {
    if (!analysis) return;
    try {
      setGeneratingRoadmap(true);
      const jobId = typeof analysis.jobId === 'object' ? (analysis.jobId as any)._id : analysis.jobId;
      const res = await api.post('/roadmaps/generate', {
        jobId,
        analysisId: analysis._id
      });
      if (res.data?.success) {
        navigate(`/roadmaps/${res.data.data.roadmap._id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate roadmap');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating deterministic readiness matrix..." />;
  }

  if (!analysis) {
    return (
      <div className="text-center py-12 text-slate-400">
        Analysis snapshot not found.{' '}
        <Link to="/jobs" className="text-brand-400 underline">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const job = analysis.jobId as any;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 border border-brand-500/20">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Deterministic Match Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {job?.title || 'Target Job Analysis'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Company: <span className="font-semibold text-white">{job?.company || 'Target Company'}</span> · Location: {job?.location || 'Remote'} · Version: {analysis.scoringVersion}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/simulator?jobId=${job?._id || ''}`}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>What-If Simulator</span>
          </Link>

          <button
            onClick={handleGenerateRoadmap}
            disabled={generatingRoadmap}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {generatingRoadmap ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Map className="w-4 h-4" />
            )}
            <span>Generate Personalized Roadmap</span>
          </button>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="flex flex-col items-center justify-center text-center p-4">
          <ScoreBadge score={analysis.overallScore} size="xl" />
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Technical Skill Match
            </span>
            <span className="text-2xl font-bold text-brand-300">{analysis.technicalScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${analysis.technicalScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Weight: {analysis.weights.technical * 100}%</span>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Experience Match
            </span>
            <span className="text-2xl font-bold text-sky-300">{analysis.experienceScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${analysis.experienceScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Weight: {analysis.weights.experience * 100}%</span>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Project Evidence
            </span>
            <span className="text-2xl font-bold text-indigo-300">{analysis.projectScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${analysis.projectScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Weight: {analysis.weights.project * 100}%</span>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Verified Confidence
            </span>
            <span className="text-2xl font-bold text-emerald-300">{analysis.verificationScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.verificationScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Weight: {analysis.weights.verification * 100}%</span>
        </Card>
      </div>

      {/* Explainability Summary */}
      {analysis.explainability && (
        <Card title="Explainable Readiness Summary" subtitle="Deterministic drivers behind your score">
          <p className="text-xs text-slate-200 mb-4 font-medium">{analysis.explainability.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-brand-300 block mb-2">Key Drivers</span>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                {analysis.explainability.keyDrivers?.map((driver, i) => (
                  <li key={i}>{driver}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-emerald-300 block mb-2">Strategic Recommendations</span>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                {analysis.explainability.recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Full Skill Matrix Table */}
      <Card
        title="Skill Matrix & Gap Ranking"
        subtitle="Skill | User Level | Required Level | Status | Evidence | Priority Score"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">User Level</th>
                <th className="py-3 px-4 text-center">Required</th>
                <th className="py-3 px-4">Match Status</th>
                <th className="py-3 px-4">Evidence Source</th>
                <th className="py-3 px-4 text-right">Priority Gap</th>
                <th className="py-3 px-4 text-center">Verify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {analysis.skillMatches?.map((match, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">{match.skillName}</td>
                  <td className="py-3 px-4 text-slate-400">{match.category}</td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className={match.userLevel > 0 ? 'text-slate-200' : 'text-slate-500'}>
                      {match.userLevel}/5
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{match.requiredLevel}/5</td>
                  <td className="py-3 px-4">
                    <StatusPill status={match.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={match.evidence.details}>
                    {match.evidence.details}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {match.priority > 0 ? (
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        match.priority >= 75 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {match.priority}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/assessments?skill=${encodeURIComponent(match.skillName)}`}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline"
                    >
                      Test Skill
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
