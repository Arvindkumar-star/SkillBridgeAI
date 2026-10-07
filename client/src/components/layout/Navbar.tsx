import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#0D1322]/80 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-300">
          Career Intelligence Workspace
        </h2>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
          MERN + AI Platform
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-xs font-semibold text-brand-300">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-medium text-slate-200 leading-tight">
                {user?.name || 'Developer'}
              </span>
              <span className="block text-[11px] text-slate-400 leading-tight">
                {user?.profile?.targetRole || 'Software Engineer'}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
