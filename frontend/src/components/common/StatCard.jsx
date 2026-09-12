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
      border: 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700',
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400',
      badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    },
    rose: {
      border: 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
      badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
    amber: {
      border: 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    purple: {
      border: 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400',
      badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.teal;

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 border bg-white dark:bg-slate-900 ${scheme.border} shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              trendPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
