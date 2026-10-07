import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Application, Job } from '../../types';
import {
  Send,
  Plus,
  Building,
  Calendar,
  DollarSign,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

const STATUS_COLUMNS = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected'
];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [salaryRange, setSalaryRange] = useState('$130k - $160k');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs')
      ]);
      if (appRes.data?.success) setApplications(appRes.data.data.applications);
      if (jobRes.data?.success) {
        setJobs(jobRes.data.data.jobs);
        if (jobRes.data.data.jobs.length > 0) {
          setSelectedJobId(jobRes.data.data.jobs[0]._id);
          setCompany(jobRes.data.data.jobs[0].company || '');
          setRoleTitle(jobRes.data.data.jobs[0].title || '');
        }
      }
    } catch (err) {
      console.error('Failed to load application tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/applications', {
        jobId: selectedJobId,
        company,
        roleTitle,
        status,
        salaryRange,
        notes
      });
      if (res.data?.success) {
        setApplications([res.data.data.application, ...applications]);
        setShowModal(false);
        setNotes('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create application');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await api.put(`/applications/${appId}`, { status: newStatus });
      if (res.data?.success) {
        setApplications(applications.map((a) => (a._id === appId ? res.data.data.application : a)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete application?')) return;
    try {
      const res = await api.delete(`/applications/${id}`);
      if (res.data?.success) {
        setApplications(applications.filter((a) => a._id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete application');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application tracker..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track job applications, interviews, notes, and offer outcomes across all target opportunities.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Application</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Track Job Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Job</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    const jId = e.target.value;
                    setSelectedJobId(jId);
                    const j = jobs.find((item) => item._id === jId);
                    if (j) {
                      setCompany(j.company || '');
                      setRoleTitle(j.title || '');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  >
                    {STATUS_COLUMNS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $140k - $170k"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes / Referral</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Referred by engineer; 1st round scheduled next Tuesday."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Table / Kanban List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card key={app._id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{app.roleTitle}</h3>
                  <span className="text-xs font-semibold text-brand-300 block mt-0.5">
                    {app.company}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(app._id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
                {app.salaryRange && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>{app.salaryRange}</span>
                  </div>
                )}
                {app.notes && (
                  <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 mt-2">
                    {app.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={app.status}
                onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                {STATUS_COLUMNS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
