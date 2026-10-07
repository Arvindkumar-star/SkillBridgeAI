import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Job } from '../../types';
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  BarChart2
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data?.success) {
        setJobs(res.data.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Delete this target job?')) return;
    try {
      const res = await api.delete(`/jobs/${id}`);
      if (res.data?.success) {
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading target jobs..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Target Job Postings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate skill readiness against parsed job descriptions and extracted market requirements.
          </p>
        </div>
        <Link
          to="/jobs/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Paste New Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            title="No Target Jobs Saved"
            description="Paste a real job description to extract structured requirements and evaluate your deterministic readiness score."
            icon={Briefcase}
            action={
              <Link
                to="/jobs/new"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <span>Add Your First Target Job</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job._id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{job.title}</h3>
                      <span className="text-xs text-brand-300 font-medium">{job.company || 'Target Company'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{job.employmentType}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Required Skills ({job.requiredSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.slice(0, 6).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-brand-300 text-[11px] border border-brand-500/20 font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                    {(job.requiredSkills?.length || 0) > 6 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-500 text-[11px]">
                        +{(job.requiredSkills?.length || 0) - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <Link
                  to={`/jobs/${job._id}`}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  View Details
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/simulator?jobId=${job._id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Simulate</span>
                  </Link>

                  <button
                    onClick={async () => {
                      const res = await api.post('/analyses/run', { jobId: job._id });
                      if (res.data?.success) {
                        window.location.href = `/analysis/${res.data.data.analysis._id}`;
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Run Analysis</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
