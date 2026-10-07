import React from 'react';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  label,
  size = 'md',
  showProgress = false,
}) => {
  const getColors = (val: number) => {
    if (val >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', stroke: '#34d399' };
    if (val >= 60) return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', stroke: '#38bdf8' };
    if (val >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', stroke: '#fbbf24' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', stroke: '#fb7185' };
  };

  const colors = getColors(score);

  if (size === 'xl') {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center relative p-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={colors.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-extrabold tracking-tight ${colors.text}`}>
              {score}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">
              Readiness
            </span>
          </div>
        </div>
        {label && <span className="text-xs text-slate-400 font-medium mt-2">{label}</span>}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg font-bold px-4 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}>
      <span>{score}%</span>
      {label && <span className="text-slate-400 font-normal text-xs">{label}</span>}
    </div>
  );
};
