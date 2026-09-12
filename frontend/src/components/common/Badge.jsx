import React from 'react';
import { DR_GRADE_INFO } from '../../api/mockData';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

export function GradeBadge({ grade, size = 'md', showDescription = false }) {
  const info = DR_GRADE_INFO[grade] || {
    label: grade || 'Unknown',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    color: 'slate',
    referral: false
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs md:text-sm px-2.5 py-1',
    lg: 'text-sm md:text-base px-3.5 py-1.5 font-semibold'
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium glass-badge ${sizeClasses[size]} ${info.badgeClass}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            info.color === 'emerald'
              ? 'bg-emerald-400'
              : info.color === 'amber'
              ? 'bg-amber-400'
              : info.color === 'orange'
              ? 'bg-orange-400'
              : info.color === 'rose'
              ? 'bg-rose-400'
              : 'bg-purple-400'
          } animate-pulse`}
        />
        {info.label}
      </span>
      {showDescription && (
        <span className="text-xs text-slate-400 mt-1">{info.shortLabel}</span>
      )}
    </div>
  );
}

export function ReferralBadge({ referable, size = 'md' }) {
  if (referable) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/40 text-rose-300 font-medium ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        Referral Recommended
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      Routine Follow-up
    </span>
  );
}

export function StatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    case 'GRADING':
    case 'LESION_ANALYSIS':
    case 'QUALITY_CHECK':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
          <Clock className="w-3 h-3" />
          {status === 'GRADING' ? 'Grading...' : status}
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {status || 'Unknown'}
        </span>
      );
  }
}
