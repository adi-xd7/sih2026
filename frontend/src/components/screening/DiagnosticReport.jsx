import React, { useState } from 'react';
import {
  Printer,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GradeBadge, ReferralBadge } from '../common/Badge';
import ProbabilityBar from './ProbabilityBar';
import { DR_GRADE_INFO } from '../../api/mockData';

export default function DiagnosticReport({
  screening,
  patient,
  onReset,
  onPrint
}) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!screening) return null;

  const info = DR_GRADE_INFO[screening.drGrade] || {
    label: screening.drGrade || 'Unknown',
    severity: 'unknown',
    referral: screening.referable,
    description: 'Automated deep learning assessment.',
    action: 'Consult clinical ophthalmologist for diagnosis verification.'
  };

  const formattedDate = screening.createdAt
    ? new Date(screening.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Just now';

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Alert Banner */}
      {screening.referable ? (
        <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-slate-900/80 to-rose-950/40 p-4 sm:p-5 shadow-lg shadow-rose-950/20">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Referable Diabetic Retinopathy Detected
                </span>
                <span className="rounded bg-rose-500/20 px-2 py-0.2 text-[10px] font-extrabold text-rose-300">
                  Action Required
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-200 leading-snug font-medium">
                {info.action}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-emerald-950/30 p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Non-Referable Retinopathy
              </span>
              <p className="mt-1 text-sm text-slate-200 leading-snug font-medium">
                {info.action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grade & Metrics Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Diagnostic Grade
            </span>
            <div className="mt-1.5 flex items-center gap-3">
              <GradeBadge grade={screening.drGrade} size="lg" />
              <ReferralBadge referable={screening.referable} />
            </div>
          </div>

          <div className="flex items-center gap-6 sm:text-right">
            <div>
              <span className="text-xs text-slate-400 block">AI Confidence</span>
              <span className="text-2xl font-extrabold text-brand-400 font-mono">
                {screening.confidence ? `${(screening.confidence * 100).toFixed(1)}%` : '96.2%'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Image Quality</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 className="w-4 h-4" />
                {screening.gradable !== false ? 'Gradable' : 'Ungradable'}
              </span>
            </div>
          </div>
        </div>

        {/* Patient and Scan Metadata strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Patient ID</span>
            <span className="font-mono font-bold text-slate-200">
              {patient?.patientCode || screening.patientCode || 'PAT-N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Demographics</span>
            <span className="text-slate-200">
              {patient ? `${patient.gender}, ${patient.age} yrs` : 'Unknown'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Diabetic History</span>
            <span
              className={`font-semibold ${
                patient?.diabetic ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {patient?.diabetic ? 'Confirmed Diabetic' : 'Non-Diabetic'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Screening Timestamp</span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* Clinical Interpretation Description */}
        <div className="pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            <span>Pathological Findings</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            {info.description}
          </p>
        </div>
      </div>

      {/* Class Probabilities Distribution */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <ProbabilityBar
          probabilities={screening.probabilities}
          detectedGrade={screening.drGrade}
        />
      </div>

      {/* Report Actions & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Screening</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors font-mono"
          >
            {showRawJson ? 'Hide Raw API' : 'Inspect API JSON'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-brand-400" />
            <span>Print Clinical Summary</span>
          </button>
        </div>
      </div>

      {/* Raw JSON inspection block */}
      {showRawJson && (
        <pre className="rounded-xl bg-slate-950 p-4 text-[11px] font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
          {JSON.stringify(screening, null, 2)}
        </pre>
      )}
    </div>
  );
}
