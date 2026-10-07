import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Award, Map, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating career progression analytics..." />;
  }

  const funnelData = stats?.applicationFunnel
    ? Object.keys(stats.applicationFunnel).map((key) => ({
        stage: key,
        count: stats.applicationFunnel[key]
      }))
    : [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Progress & Growth Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical readiness trends, skill assessment outcomes, and job application funnel conversions.
        </p>
      </div>

      {/* Readiness Trend Chart */}
      <Card
        title="Historical Job Readiness Trajectory"
        subtitle="Snapshot of readiness scores over time as skills are learned and verified."
      >
        <div className="h-72 w-full pt-4">
          {stats?.readinessTrend && stats.readinessTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.readinessTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Overall Readiness %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical analyses recorded yet. Run multiple analyses to track your upward trajectory.
            </div>
          )}
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Application Funnel */}
        <Card
          title="Application Pipeline Conversion Funnel"
          subtitle="Distribution of tracked jobs across recruitment stages."
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" allowDecimals={false} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '0.75rem',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Applications" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Roadmap & Assessment Summary Cards */}
        <div className="space-y-6">
          <Card title="Assessment Verification Metrics">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Tests</span>
                <span className="text-2xl font-bold text-slate-100 mt-1 block">
                  {stats?.assessmentStats?.total || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Completed</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                  {stats?.assessmentStats?.completed || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 block">Avg Score</span>
                <span className="text-2xl font-bold text-sky-400 mt-1 block">
                  {stats?.assessmentStats?.avgScore || 0}%
                </span>
              </div>
            </div>
          </Card>

          <Card title="Roadmap Task Completion Rate">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Overall Task Execution</span>
                <span className="text-xl font-bold text-slate-100 mt-0.5 block">
                  {stats?.roadmapStats?.completedTasks || 0} / {stats?.roadmapStats?.totalTasks || 0} Tasks Done
                </span>
              </div>
              <span className="text-2xl font-extrabold text-brand-400">
                {stats?.roadmapStats?.overallCompletionRate || 0}%
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
