import React from 'react';
import { DR_GRADE_INFO } from '../../api/mockData';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

export function GradeBadge({ grade, size = 'md', showDescription = false }) {
  const badgeStyles = {
    LEVEL_0: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    LEVEL_1: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    LEVEL_2: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    LEVEL_3: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    LEVEL_4: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  const dotColors = {
    LEVEL_0: 'bg-emerald-500',
    LEVEL_1: 'bg-amber-500',
    LEVEL_2: 'bg-orange-500',
    LEVEL_3: 'bg-rose-500',
    LEVEL_4: 'bg-purple-500'
  };

  const info = DR_GRADE_INFO[grade] || {
    label: grade || 'Unknown',
    shortLabel: 'Unknown',
    color: 'slate',
    referral: false
  };

  const badgeClass = badgeStyles[grade] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  const dotClass = dotColors[grade] || 'bg-slate-400';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs md:text-sm px-2.5 py-1',
    lg: 'text-sm md:text-base px-3.5 py-1.5 font-semibold'
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-xs ${sizeClasses[size]} ${badgeClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        {info.label}
      </span>
      {showDescription && (
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{info.shortLabel}</span>
      )}
    </div>
  );
}

export function ReferralBadge({ referable, size = 'md' }) {
  if (referable) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold shadow-xs ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        Referral Recommended
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      Routine Follow-up
    </span>
  );
}

export function StatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Completed
        </span>
      );
    case 'GRADING':
    case 'LESION_ANALYSIS':
    case 'QUALITY_CHECK':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold animate-pulse">
          <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          {status === 'GRADING' ? 'Grading...' : status}
        </span>
      );
    case 'UNGRADABLE':
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold">
          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
          {status === 'UNGRADABLE' ? 'Ungradable' : 'Failed'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
          {status || 'Unknown'}
        </span>
      );
  }
}
