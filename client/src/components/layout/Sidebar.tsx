import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Layers,
  Map,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Send,
  BotMessageSquare,
  UserCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile & Skills', path: '/profile', icon: UserCheck },
  { name: 'Resumes', path: '/resumes', icon: FileText },
  { name: 'Target Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Skill Verification', path: '/assessments', icon: CheckCircle2 },
  { name: 'What-If Simulator', path: '/simulator', icon: Sliders },
  { name: 'Roadmaps', path: '/roadmaps', icon: Map },
  { name: 'Applications', path: '/applications', icon: Send },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'AI Career Assistant', path: '/assistant', icon: BotMessageSquare },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0D1322]/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/60 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-100 tracking-tight text-base block">SkillBridge AI</span>
          <span className="text-[11px] text-brand-400 font-medium tracking-wide uppercase">Intelligence Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Intelligence Engine Active</span>
        </div>
      </div>
    </aside>
  );
};
