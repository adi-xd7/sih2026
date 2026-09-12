import React from 'react';

const CLASS_CONFIG = {
  'No DR': {
    code: 'L0',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-800',
    bgLight: 'bg-emerald-50/80',
    border: 'border-emerald-300'
  },
  'Mild DR': {
    code: 'L1',
    color: 'bg-amber-500',
    textColor: 'text-amber-800',
    bgLight: 'bg-amber-50/80',
    border: 'border-amber-300'
  },
  'Moderate DR': {
    code: 'L2',
    color: 'bg-orange-500',
    textColor: 'text-orange-800',
    bgLight: 'bg-orange-50/80',
    border: 'border-orange-300'
  },
  'Severe DR': {
    code: 'L3',
    color: 'bg-rose-500',
    textColor: 'text-rose-800',
    bgLight: 'bg-rose-50/80',
    border: 'border-rose-300'
  },
  'Proliferative DR': {
    code: 'L4',
    color: 'bg-purple-500',
    textColor: 'text-purple-800',
    bgLight: 'bg-purple-50/80',
    border: 'border-purple-300'
  }
};

export default function ProbabilityBar({ probabilities, detectedGrade }) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        No class probability metrics available
      </div>
    );
  }

  const entries = Object.entries(probabilities);
  const maxProb = Math.max(...entries.map(([, v]) => Number(v) || 0));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        <span>Deep Learning Class Confidence</span>
        <span>Probability</span>
      </div>

      <div className="space-y-2">
        {entries.map(([className, probValue]) => {
          const numValue = Number(probValue) || 0;
          const percentage = (numValue * 100).toFixed(1);
          const config = CLASS_CONFIG[className] || {
            code: '??',
            color: 'bg-teal-500',
            textColor: 'text-teal-800 dark:text-teal-300',
            bgLight: 'bg-teal-50 dark:bg-teal-950/40',
            border: 'border-teal-200 dark:border-teal-800'
          };
          const isHighest = numValue === maxProb && numValue > 0.1;

          return (
            <div
              key={className}
              className={`rounded-xl p-2.5 transition-all ${
                isHighest
                  ? `${config.bgLight} dark:bg-slate-800/90 border ${config.border} dark:border-teal-600/50 shadow-xs`
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                      isHighest
                        ? `${config.color} text-white`
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {config.code}
                  </span>
                  <span className={`font-semibold ${isHighest ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {className}
                  </span>
                  {isHighest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                      Top Match
                    </span>
                  )}
                </div>

                <span className={`font-mono font-bold ${isHighest ? `${config.textColor} dark:text-teal-300` : 'text-slate-600 dark:text-slate-400'}`}>
                  {percentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${config.color}`}
                  style={{ width: `${Math.min(Math.max(percentage, 2), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
