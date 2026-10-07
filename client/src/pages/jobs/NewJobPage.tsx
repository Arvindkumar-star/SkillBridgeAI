import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  Sliders
} from 'lucide-react';

export const NewJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'paste' | 'manual'>('paste');

  // Paste JD state
  const [jobDescription, setJobDescription] = useState('');
  const [parsing, setParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual state
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [manualDescription, setManualDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, Node.js, TypeScript, Docker, AWS');

  const handleParseJD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setErrorMsg('Please paste a comprehensive job description (at least 15 characters).');
      return;
    }

    try {
      setParsing(true);
      setErrorMsg(null);
      const res = await api.post('/jobs/parse-jd', {
        description: jobDescription
      });

      if (res.data?.success) {
        const createdJob = res.data.data.job;
        // Automatically run analysis on the new job
        const analysisRes = await api.post('/analyses/run', {
          jobId: createdJob._id
        });
        if (analysisRes.data?.success) {
          navigate(`/analysis/${analysisRes.data.data.analysis._id}`);
        } else {
          navigate(`/jobs/${createdJob._id}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse job description.');
    } finally {
      setParsing(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Job title is required.');
      return;
    }

    try {
      setParsing(true);
      setErrorMsg(null);
      const parsedReqSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, level: 3, weight: 1.0 }));

      const res = await api.post('/jobs', {
        title,
        company: company || 'Target Organization',
        description: manualDescription || `Job description for ${title}`,
        location,
        employmentType,
        source: 'Manual',
        requiredSkills: parsedReqSkills,
        preferredSkills: [],
        experienceRequirements: { minYears: 2, maxYears: 5, level: 'Mid' }
      });

      if (res.data?.success) {
        const createdJob = res.data.data.job;
        const analysisRes = await api.post('/analyses/run', {
          jobId: createdJob._id
        });
        if (analysisRes.data?.success) {
          navigate(`/analysis/${analysisRes.data.data.analysis._id}`);
        } else {
          navigate(`/jobs/${createdJob._id}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create job.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analyze Target Job</h1>
        <p className="text-xs text-slate-400 mt-1">
          Paste a real job posting or configure requirements manually. Our intelligence engine extracts skill requirements and immediately calculates deterministic readiness.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setTab('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'paste'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paste Job Description (AI Extract)</span>
        </button>

        <button
          onClick={() => setTab('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === 'manual'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manual Job Configuration</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {tab === 'paste' ? (
        <Card title="Paste Full Job Posting">
          <form onSubmit={handleParseJD} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Job Description Text
              </label>
              <textarea
                rows={12}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the entire job posting here (e.g. from LinkedIn, Indeed, Greenhouse, Lever)...
Example:
We are seeking a Senior Full Stack Engineer.
Required Skills: React, Node.js, TypeScript, Docker, AWS, PostgreSQL.
Experience: 3-5 years building distributed web systems."
                className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-500 leading-relaxed placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={parsing || !jobDescription.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {parsing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Extracting Requirements & Calculating Readiness...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Requirements & Calculate Match</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="Manual Job Requirements">
          <form onSubmit={handleManualCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Netflix, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Node.js, TypeScript, Docker, AWS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Skills will be automatically normalized and mapped to the intelligence catalog.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Notes / Responsibilities
              </label>
              <textarea
                rows={4}
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Optional responsibilities or notes..."
                className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={parsing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
              >
                <span>Save Job & Run Match Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
