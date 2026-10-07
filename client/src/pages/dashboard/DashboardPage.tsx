import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Briefcase,
  CheckCircle2,
  Map,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Send,
  Sparkles,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/analytics/overview');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time career intelligence..." />;
  }

  const latestAnalysis = data?.latestAnalysis;
  const activeRoadmap = data?.activeRoadmap;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-900/40 via-indigo-900/20 to-slate-900/40 border border-brand-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Engine Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {data?.user?.name || 'Developer'}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Targeting <span className="font-semibold text-brand-300">{data?.user?.targetRole || 'Full Stack Engineer'}</span>. Track real skill matches, bridge verified gaps, and follow your actionable roadmap.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/resumes/upload"
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Upload Resume</span>
          </Link>
          <Link
            to="/jobs/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            <Briefcase className="w-4 h-4" />
            <span>Analyze Target Job</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Tracked Skills</span>
            <span className="text-2xl font-bold text-slate-100">{data?.user?.skillsCount || 0}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Verified Skills</span>
            <span className="text-2xl font-bold text-slate-100">{data?.completedAssessmentsCount || 0}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Roadmap Progress</span>
            <span className="text-2xl font-bold text-slate-100">
              {activeRoadmap ? `${activeRoadmap.progress}%` : 'N/A'}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Applications</span>
            <span className="text-2xl font-bold text-slate-100">{data?.applicationsCount || 0}</span>
          </div>
        </Card>
      </div>

      {/* Main Readiness Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Analysis Snapshot */}
        <div className="lg:col-span-2">
          {latestAnalysis ? (
            <Card
              title="Target Job Readiness"
              subtitle={`Latest evaluation for ${latestAnalysis.jobId?.title || 'Target Job'} at ${latestAnalysis.jobId?.company || 'Company'}`}
              action={
                <Link
                  to={`/analysis/${latestAnalysis._id}`}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>View Full Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 mb-6">
                <div className="flex justify-center">
                  <ScoreBadge score={latestAnalysis.overallScore} size="xl" />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Technical Skill Match</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.technicalScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${latestAnalysis.technicalScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Experience Alignment</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.experienceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${latestAnalysis.experienceScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Verified Evidence</span>
                      <span className="font-semibold text-slate-200">{latestAnalysis.verificationScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${latestAnalysis.verificationScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Gaps & Strengths Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Top Priority Gaps
                  </span>
                  {latestAnalysis.priorityGaps && latestAnalysis.priorityGaps.length > 0 ? (
                    <div className="space-y-2">
                      {latestAnalysis.priorityGaps.slice(0, 3).map((gap: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/40 p-2 rounded-lg">
                          <span className="font-medium text-slate-200">{gap.skillName}</span>
                          <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Priority {gap.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Zero Technical Gaps! You meet 100% of the required tech stack.</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Top Strengths
                  </span>
                  <div className="space-y-2">
                    {latestAnalysis.strengths?.slice(0, 3).map((str: string, idx: number) => (
                      <div key={idx} className="text-xs bg-slate-800/40 p-2 rounded-lg text-slate-300 truncate">
                        {str}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Target Job Readiness">
              <EmptyState
                title="No Analyses Performed Yet"
                description="Upload your resume and paste a target job description to calculate deterministic readiness scores."
                icon={Briefcase}
                action={
                  <Link
                    to="/jobs/new"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <span>Analyze First Job</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            </Card>
          )}
        </div>

        {/* Active Roadmap & Quick Actions */}
        <div className="space-y-6">
          <Card
            title="Active Learning Roadmap"
            subtitle={activeRoadmap ? activeRoadmap.title : 'Structured gap closure'}
            action={
              activeRoadmap && (
                <Link
                  to={`/roadmaps/${activeRoadmap._id}`}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  View Tasks
                </Link>
              )
            }
          >
            {activeRoadmap ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Total Completion</span>
                    <span className="font-bold text-brand-300">{activeRoadmap.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeRoadmap.progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  {activeRoadmap.goals?.slice(0, 3).map((goal: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">{goal.skillName}</span>
                        <span className="text-[11px] text-slate-400">{goal.estimatedDays} days est.</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        goal.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Active Roadmap"
                description="Run an analysis on any job to automatically generate a step-by-step roadmap."
                icon={Map}
              />
            )}
          </Card>

          {/* Quick AI Assistant Card */}
          <Card className="bg-gradient-to-br from-brand-950/40 via-slate-900 to-indigo-950/30 border-brand-500/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">AI Career Assistant</h4>
                <p className="text-xs text-slate-400">Ask strategic questions about your real career gaps.</p>
              </div>
            </div>
            <Link
              to="/assistant"
              className="w-full py-2 px-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-3"
            >
              <span>Ask Career Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
