import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Roadmap, RoadmapGoal } from '../../types';
import {
  Map,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowLeft,
  Clock,
  RotateCcw
} from 'lucide-react';

export const RoadmapDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get(`/roadmaps/${id}`);
      if (res.data?.success) {
        setRoadmap(res.data.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!roadmap) return;
    try {
      setUpdatingTaskId(taskId);
      const res = await api.patch(`/roadmaps/${roadmap._id}/tasks`, {
        taskId,
        isCompleted: !currentStatus
      });
      if (res.data?.success) {
        setRoadmap(res.data.data.roadmap);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleRegenerate = async () => {
    if (!roadmap) return;
    try {
      setLoading(true);
      const jobId = typeof roadmap.jobId === 'object' ? (roadmap.jobId as any)._id : roadmap.jobId;
      const res = await api.post('/roadmaps/generate', {
        jobId,
        analysisId: roadmap.analysisId
      });
      if (res.data?.success) {
        setRoadmap(res.data.data.roadmap);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling personalized learning milestones..." />;
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12 text-slate-400">
        Roadmap not found.{' '}
        <Link to="/dashboard" className="text-brand-400 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const job = roadmap.jobId as any;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Target Job: <span className="font-semibold text-brand-300">{job?.title || 'Target Role'}</span> at {job?.company || 'Organization'}
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Regenerate Roadmap</span>
        </button>
      </div>

      {/* Progress Bar Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border-brand-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Roadmap Progress
            </span>
            <span className="text-2xl font-extrabold text-white">{roadmap.progress}% Completed</span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span>{roadmap.goals?.length || 0} Gap Milestones</span>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${roadmap.progress}%` }}
          />
        </div>
      </Card>

      {/* Goals / Milestones */}
      <div className="space-y-6">
        {roadmap.goals?.map((goal: RoadmapGoal, idx: number) => {
          const completedTasksCount = goal.tasks?.filter((t) => t.isCompleted).length || 0;
          const totalTasksCount = goal.tasks?.length || 0;
          const isAllDone = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

          return (
            <Card key={idx} className={isAllDone ? 'border-emerald-500/30' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isAllDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{goal.skillName}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        goal.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {goal.priority} Priority
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{goal.learningOutcome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {goal.estimatedDays} days
                  </span>
                  <span className="font-semibold text-slate-300">
                    {completedTasksCount}/{totalTasksCount} tasks
                  </span>
                </div>
              </div>

              <div className="py-4 space-y-4">
                {/* Task Checklist */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Actionable Milestones
                  </span>
                  <div className="space-y-2">
                    {goal.tasks?.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id, task.isCompleted)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          task.isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curated Resources */}
                {goal.resources && goal.resources.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Curated Study Materials & Guides
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {goal.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                          <span>{res.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
