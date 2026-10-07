import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Roadmap } from '../../types';
import {
  Map,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';

export const RoadmapsPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoadmaps = async () => {
    try {
      const res = await api.get('/roadmaps');
      if (res.data?.success) {
        setRoadmaps(res.data.data.roadmaps || []);
      }
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your customized career roadmaps..." />;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Learning Roadmaps</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono">
              AI Personalized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Goal-oriented, step-by-step career roadmaps customized to bridge your specific skill gaps.
          </p>
        </div>

        <Link
          to="/jobs"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Target Jobs</span>
        </Link>
      </div>

      {/* Roadmaps Grid */}
      {roadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmaps.map((rm) => {
            const job = rm.jobId as any;
            const totalGoals = rm.goals?.length || 0;
            const totalTasks = rm.goals?.reduce((sum, g) => sum + (g.tasks?.length || 0), 0) || 0;
            const completedTasks = rm.goals?.reduce((sum, g) => sum + (g.tasks?.filter((t) => t.isCompleted).length || 0), 0) || 0;
            const totalDays = rm.goals?.reduce((sum, g) => sum + (g.estimatedDays || 0), 0) || 0;

            return (
              <div
                key={rm._id}
                className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                      <Map className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {rm.progress}% Completed
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {rm.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 mb-4">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job?.title || 'Target Job Role'}</span>
                    {job?.company && <span>• {job.company}</span>}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Tasks Done</span>
                      <span className="font-mono">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${rm.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      <Layers className="w-3.5 h-3.5 text-brand-400" />
                      <span>{totalGoals} Milestones</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>~{totalDays} Days Plan</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/roadmaps/${rm._id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-brand-500 transition-all"
                >
                  <span>Open Interactive Roadmap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16 px-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Active Roadmaps Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Run an AI job readiness analysis on any target job to automatically formulate a customized, step-by-step milestone learning roadmap.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Target Jobs & Run Analysis</span>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
