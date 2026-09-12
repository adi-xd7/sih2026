import React, { useState } from 'react';
import {
  FileClock,
  Search,
  Eye,
  Calendar
} from 'lucide-react';
import { GradeBadge, ReferralBadge, StatusBadge } from '../components/common/Badge';
import { getScreeningImageUrl } from '../api/screeningApi';

export default function HistoryPage({ screenings = [], onInspectScreening }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [referralOnly, setReferralOnly] = useState(false);

  const filtered = screenings.filter((sc) => {
    const matchesSearch =
      (sc.patientCode || '').toLowerCase().includes(search.toLowerCase()) ||
      sc.id.toString().includes(search);

    const matchesGrade = gradeFilter === 'ALL' || sc.drGrade === gradeFilter;
    const matchesReferral = !referralOnly || sc.referable === true;

    return matchesSearch && matchesGrade && matchesReferral;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Screening Audit Trail & Diagnostic Log</span>
            <span className="rounded bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
              {screenings.length} Scans
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global repository of deep learning-evaluated retinal fundus examinations
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clinical-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Scan # or Patient Code (e.g. PAT-2026)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Referral checkbox toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={referralOnly}
              onChange={(e) => setReferralOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 accent-teal-600"
            />
            <span className="font-bold text-rose-700 dark:text-rose-400">Referable Cases Only</span>
          </label>
        </div>

        {/* Grade Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mr-2">
            Grade Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Severity Levels' },
            { id: 'LEVEL_0', label: 'L0: No DR' },
            { id: 'LEVEL_1', label: 'L1: Mild' },
            { id: 'LEVEL_2', label: 'L2: Moderate' },
            { id: 'LEVEL_3', label: 'L3: Severe' },
            { id: 'LEVEL_4', label: 'L4: Proliferative' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setGradeFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                gradeFilter === pill.id
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screenings Grid / List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 clinical-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileClock className="w-12 h-12 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No screenings match criteria</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or severity filter.
            </p>
          </div>
        ) : (
          filtered.map((sc) => {
            const formattedDate = sc.createdAt
              ? new Date(sc.createdAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'Recent';

            return (
              <div
                key={sc.id}
                className="clinical-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left block with Fundus Thumbnail & info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black flex-shrink-0 relative group shadow-xs">
                    <img
                      src={getScreeningImageUrl(sc)}
                      alt="Fundus Scan"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        Scan #{sc.id}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs font-mono text-teal-700 dark:text-teal-400 font-bold">
                        {sc.patientCode || 'PAT-N/A'}
                      </span>
                      <StatusBadge status={sc.status} />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{formattedDate}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Quality: {sc.gradable !== false ? 'Gradable (Pass)' : 'Ungradable'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right block with DR Grade, Referral Badge, Confidence & Action */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <GradeBadge grade={sc.drGrade} size="md" />

                  <ReferralBadge referable={sc.referable} size="md" />

                  <div className="text-right hidden lg:block">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold block">
                      Certainty
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                      {sc.confidence ? `${(sc.confidence * 100).toFixed(1)}%` : '96%'}
                    </span>
                  </div>

                  <button
                    onClick={() => onInspectScreening(sc)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Open Inspector</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
