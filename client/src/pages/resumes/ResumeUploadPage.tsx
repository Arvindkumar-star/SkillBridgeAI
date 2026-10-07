import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [savingChanges, setSavingChanges] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setErrorMsg('Please select a valid PDF document.');
        return;
      }
      setFile(selected);
      setErrorMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        setParsedResume(res.data.data.resume);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract text from resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!parsedResume) return;
    try {
      setSavingChanges(true);
      const res = await api.put(`/resumes/${parsedResume._id}`, {
        summary: parsedResume.summary,
        skills: parsedResume.skills,
        experience: parsedResume.experience,
        projects: parsedResume.projects
      });
      if (res.data?.success) {
        navigate('/resumes');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update resume');
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume Intelligence Parser</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload your PDF resume. Our AI extraction pipeline extracts skills, experiences, and projects for deterministic readiness matching.
        </p>
      </div>

      {!parsedResume ? (
        <Card>
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-8 text-center hover:border-brand-500/50 transition-all bg-slate-900/30">
              <input
                type="file"
                id="resumeInput"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resumeInput"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/10">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {file ? file.name : 'Click to select or drag and drop your PDF resume'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF (Maximum size 5MB)
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Extracting Structured Skills...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process & Extract CV Intelligence</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        /* Review & Correct Extracted Resume Data */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume extracted successfully! Please review and adjust detected skills before finalizing.</span>
            </div>
            <button
              onClick={handleSaveEdits}
              disabled={savingChanges}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <span>{savingChanges ? 'Saving...' : 'Confirm & Save Resume'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Card title="Candidate Summary">
            <textarea
              rows={3}
              value={parsedResume.summary || ''}
              onChange={(e) => setParsedResume({ ...parsedResume, summary: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </Card>

          <Card
            title="Extracted Normalized Skills"
            subtitle="These skills will be matched against target jobs."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {parsedResume.skills?.map((skill: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{skill.name}</span>
                    <span className="text-[10px] text-slate-400">{skill.category || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={skill.level}
                      onChange={(e) => {
                        const updated = [...parsedResume.skills];
                        updated[idx].level = Number(e.target.value);
                        setParsedResume({ ...parsedResume, skills: updated });
                      }}
                      className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700"
                    >
                      <option value={1}>Lvl 1</option>
                      <option value={2}>Lvl 2</option>
                      <option value={3}>Lvl 3</option>
                      <option value={4}>Lvl 4</option>
                      <option value={5}>Lvl 5</option>
                    </select>
                    <button
                      onClick={() => {
                        const updated = parsedResume.skills.filter((_: any, i: number) => i !== idx);
                        setParsedResume({ ...parsedResume, skills: updated });
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Projects & Experience Extracted">
            <div className="space-y-4">
              {parsedResume.projects?.map((proj: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-200 block">{proj.title}</span>
                  <p className="text-slate-400 mt-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.technologies?.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-brand-900/30 text-brand-300 text-[10px] border border-brand-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
