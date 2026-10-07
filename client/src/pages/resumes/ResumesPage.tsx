import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Resume } from '../../types';
import { FileText, Plus, Calendar, Trash2, ArrowRight } from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.data?.success) {
        setResumes(res.data.data.resumes);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDeleteResume = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await api.delete(`/resumes/${id}`);
      if (res.data?.success) {
        setResumes(resumes.filter((r) => r._id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching parsed resumes..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Structured Resumes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted candidate profiles parsed into structured skill matrices and experience models.
          </p>
        </div>
        <Link
          to="/resumes/upload"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resume</span>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <EmptyState
            title="No Resumes Uploaded"
            description="Upload your PDF resume to extract structured technical skills, projects, and work history for automated gap analysis."
            icon={FileText}
            action={
              <Link
                to="/resumes/upload"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <span>Upload First Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumes.map((resume) => (
            <Card key={resume._id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{resume.fileName}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Parsed {new Date(resume.parsedAt || resume.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(resume._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {resume.summary || 'Structured resume profile with extracted skills.'}
                </p>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Extracted Skills ({resume.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills?.slice(0, 8).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px] border border-slate-700/60"
                      >
                        {s.name} (Lvl {s.level})
                      </span>
                    ))}
                    {(resume.skills?.length || 0) > 8 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-500 text-[11px]">
                        +{(resume.skills?.length || 0) - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {resume.projects?.length || 0} projects · {resume.experience?.length || 0} roles
                </span>
                <Link
                  to="/jobs/new"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Match Against Job</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
