import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'teal'
}) {
  const colorMap = {
    teal: {
      border: 'border-brand-500/20 hover:border-brand-500/40',
      iconBg: 'bg-brand-500/10 text-brand-400',
      glow: 'hover:shadow-glow-teal'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: 'hover:shadow-glow-rose'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.teal;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
