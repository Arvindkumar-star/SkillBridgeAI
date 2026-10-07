import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Job } from '../../types';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  BarChart2,
  Sliders,
  ArrowLeft,
  Tag
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data?.success) {
          setJob(res.data.data.job);
        }
      } catch (err) {
        console.error('Failed to load job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!job) return;
    try {
      const res = await api.post('/analyses/run', { jobId: job._id });
      if (res.data?.success) {
        navigate(`/analysis/${res.data.data.analysis._id}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to run analysis');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading job posting details..." />;
  }

  if (!job) {
    return (
      <div className="text-center py-12 text-slate-400">
        Job not found.{' '}
        <Link to="/jobs" className="text-brand-400 underline">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Jobs</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/simulator?jobId=${job._id}`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Skills</span>
          </Link>

          <button
            onClick={handleRunAnalysis}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Run Readiness Analysis</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{job.title}</h1>
            <span className="text-sm font-semibold text-brand-400 block mt-0.5">
              {job.company || 'Target Organization'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {job.employmentType}
            </span>
          </div>
        </div>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Required Technical Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-brand-900/30 text-brand-300 text-xs font-medium border border-brand-500/30"
                >
                  {s.name} (Lvl {s.level || 3})
                </span>
              ))}
            </div>
          </div>

          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Preferred / Nice-to-Have Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700"
                  >
                    {s.name} (Lvl {s.level || 2})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Original Job Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
