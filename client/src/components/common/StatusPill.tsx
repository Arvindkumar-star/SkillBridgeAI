import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';

interface StatusPillProps {
  status: 'STRONG' | 'MATCH' | 'PARTIAL' | 'WEAK' | 'MISSING' | string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'STRONG':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: Sparkles,
          label: 'Strong'
        };
      case 'MATCH':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          icon: CheckCircle,
          label: 'Match'
        };
      case 'PARTIAL':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: AlertCircle,
          label: 'Partial'
        };
      case 'WEAK':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertCircle,
          label: 'Weak'
        };
      case 'MISSING':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: XCircle,
          label: 'Missing'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: HelpCircle,
          label: status
        };
    }
  };

  const { bg, icon: Icon, label } = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${bg} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
};
