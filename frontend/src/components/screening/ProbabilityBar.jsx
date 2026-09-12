import React from 'react';

const CLASS_CONFIG = {
  'No DR': {
    code: 'L0',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    bgLight: 'bg-emerald-500/15',
    border: 'border-emerald-500/30'
  },
  'Mild DR': {
    code: 'L1',
    color: 'bg-amber-500',
    textColor: 'text-amber-400',
    bgLight: 'bg-amber-500/15',
    border: 'border-amber-500/30'
  },
  'Moderate DR': {
    code: 'L2',
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    bgLight: 'bg-orange-500/15',
    border: 'border-orange-500/30'
  },
  'Severe DR': {
    code: 'L3',
    color: 'bg-rose-500',
    textColor: 'text-rose-400',
    bgLight: 'bg-rose-500/15',
    border: 'border-rose-500/30'
  },
  'Proliferative DR': {
    code: 'L4',
    color: 'bg-purple-500',
    textColor: 'text-purple-300',
    bgLight: 'bg-purple-500/15',
    border: 'border-purple-500/30'
  }
};

export default function ProbabilityBar({ probabilities, detectedGrade }) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
        No class probability metrics available
      </div>
    );
  }

  // Find max probability to highlight
  const entries = Object.entries(probabilities);
  const maxProb = Math.max(...entries.map(([, v]) => Number(v) || 0));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span>Deep Learning Class Confidence</span>
        <span>Probability</span>
      </div>

      <div className="space-y-2.5">
        {entries.map(([className, probValue]) => {
          const numValue = Number(probValue) || 0;
          const percentage = (numValue * 100).toFixed(1);
          const config = CLASS_CONFIG[className] || {
            code: '??',
            color: 'bg-brand-500',
            textColor: 'text-brand-400',
            bgLight: 'bg-brand-500/15',
            border: 'border-brand-500/30'
          };
          const isHighest = numValue === maxProb && numValue > 0.1;

          return (
            <div
              key={className}
              className={`rounded-xl p-2.5 transition-all ${
                isHighest
                  ? `${config.bgLight} border ${config.border} shadow-sm`
                  : 'bg-slate-900/40 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                      isHighest
                        ? `${config.color} text-slate-950`
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {config.code}
                  </span>
                  <span className={`font-medium ${isHighest ? 'text-white font-bold' : 'text-slate-300'}`}>
                    {className}
                  </span>
                  {isHighest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-white">
                      Predicted
                    </span>
                  )}
                </div>

                <span className={`font-mono font-bold ${isHighest ? config.textColor : 'text-slate-400'}`}>
                  {percentage}%
                </span>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
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
