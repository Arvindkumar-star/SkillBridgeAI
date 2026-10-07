import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Job } from '../../types';
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface SimulatedSkill {
  name: string;
  level: number;
  verified: boolean;
}

export const SimulatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulation inputs
  const [simulatedSkills, setSimulatedSkills] = useState<SimulatedSkill[]>([
    { name: 'Docker', level: 4, verified: true },
    { name: 'AWS', level: 3, verified: false }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [newSkillVerified, setNewSkillVerified] = useState(false);

  // Simulation results
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data?.success) {
          setJobs(res.data.data.jobs);
          if (!selectedJobId && res.data.data.jobs.length > 0) {
            setSelectedJobId(res.data.data.jobs[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load jobs for simulator:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const runSimulation = async (skillsToSimulate: SimulatedSkill[]) => {
    if (!selectedJobId) return;

    try {
      setSimulating(true);
      const res = await api.post('/analyses/simulate', {
        jobId: selectedJobId,
        simulatedSkills: skillsToSimulate
      });
      if (res.data?.success) {
        setSimulationResult(res.data.data.simulation);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      runSimulation(simulatedSkills);
    }
  }, [selectedJobId]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const updated = [
      ...simulatedSkills,
      { name: newSkillName.trim(), level: newSkillLevel, verified: newSkillVerified }
    ];
    setSimulatedSkills(updated);
    setNewSkillName('');
    runSimulation(updated);
  };

  const handleRemoveSkill = (index: number) => {
    const updated = simulatedSkills.filter((_, i) => i !== index);
    setSimulatedSkills(updated);
    runSimulation(updated);
  };

  if (loading) {
    return <LoadingSpinner message="Initializing What-If simulator engine..." />;
  }

  const selectedJob = jobs.find((j) => j._id === selectedJobId);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 border border-brand-500/20">
        <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Career Sandbox</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          What-If Career Simulator
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Simulate acquiring new technical skills or passing verification tests without modifying saved profile data. Re-computes deterministic readiness in real-time.
        </p>
      </div>

      {/* Target Job Selector */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Target Job for Simulation
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-brand-500"
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} — {j.company || 'Company'} ({j.location})
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Required Stack: </span>
              {selectedJob.requiredSkills?.map((s) => s.name).join(', ')}
            </div>
          )}
        </div>
      </Card>

      {/* Simulation Result Comparator */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Current Baseline Readiness
            </span>
            <ScoreBadge score={simulationResult.currentOverallScore} size="xl" />
          </Card>

          <Card className="flex flex-col items-center justify-center text-center p-6 bg-brand-950/30 border-brand-500/30">
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">
              Simulated Future Readiness
            </span>
            <ScoreBadge score={simulationResult.simulatedOverallScore} size="xl" />
          </Card>

          <Card className="flex flex-col justify-between p-6 bg-slate-900/60">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Projected Improvement Delta
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-extrabold ${
                  simulationResult.scoreDelta > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {simulationResult.scoreDelta > 0 ? `+${simulationResult.scoreDelta}%` : `${simulationResult.scoreDelta}%`}
                </span>
                {simulationResult.scoreDelta > 0 && (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Technical Score Gain:</span>
                <span className="font-bold text-slate-200">
                  +{simulationResult.breakdownDelta?.technicalDelta || 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Boost:</span>
                <span className="font-bold text-emerald-400">
                  +{simulationResult.breakdownDelta?.verificationDelta || 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Simulated Skill Form */}
        <div className="lg:col-span-1">
          <Card title="Simulate Skill Gain" subtitle="Hypothesize new capabilities">
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kubernetes, TypeScript, AWS"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Simulated Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value={1}>Level 1 - Beginner</option>
                  <option value={2}>Level 2 - Basic</option>
                  <option value={3}>Level 3 - Intermediate</option>
                  <option value={4}>Level 4 - Advanced</option>
                  <option value={5}>Level 5 - Expert</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyCheckbox"
                  checked={newSkillVerified}
                  onChange={(e) => setNewSkillVerified(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-0"
                />
                <label htmlFor="verifyCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  Simulate passing verification assessment
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply Simulation Variable</span>
              </button>
            </form>
          </Card>
        </div>

        {/* Applied Simulated Skills List */}
        <div className="lg:col-span-2">
          <Card title="Active Simulation Variables" subtitle="Current hypothetical profile adjustments">
            {simulatedSkills.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No simulated variables added. Add a skill on the left to see readiness changes.
              </div>
            ) : (
              <div className="space-y-3">
                {simulatedSkills.map((sim, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xs">
                        +{sim.level}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-100 block">{sim.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Level {sim.level}/5</span>
                          {sim.verified && (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
