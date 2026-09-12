import React, { useState } from 'react';
import {
  Search,
  Filter,
  User,
  Eye,
  Calendar,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  FileClock,
  ArrowUpDown
} from 'lucide-react';
import { GradeBadge } from '../common/Badge';

export default function PatientTable({
  patients = [],
  onSelectPatientForScreening,
  onViewPatientHistory
}) {
  const [search, setSearch] = useState('');
  const [diabeticFilter, setDiabeticFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-desc');

  // Filtering
  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      p.gender.toLowerCase().includes(search.toLowerCase()) ||
      p.age.toString().includes(search);

    if (diabeticFilter === 'DIABETIC') {
      return matchesSearch && p.diabetic === true;
    }
    if (diabeticFilter === 'NON_DIABETIC') {
      return matchesSearch && p.diabetic === false;
    }
    return matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'id-desc') return b.id - a.id;
    if (sortBy === 'id-asc') return a.id - b.id;
    if (sortBy === 'age-desc') return b.age - a.age;
    if (sortBy === 'age-asc') return a.age - b.age;
    if (sortBy === 'code-asc') return a.patientCode.localeCompare(b.patientCode);
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Code, Age, Gender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDiabeticFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                diabeticFilter === 'ALL'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({patients.length})
            </button>
            <button
              onClick={() => setDiabeticFilter('DIABETIC')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                diabeticFilter === 'DIABETIC'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Diabetic
            </button>
            <button
              onClick={() => setDiabeticFilter('NON_DIABETIC')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                diabeticFilter === 'NON_DIABETIC'
                  ? 'bg-slate-700 text-slate-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Non-Diabetic
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="id-desc">Newest First</option>
            <option value="id-asc">Oldest First</option>
            <option value="age-desc">Age: High to Low</option>
            <option value="age-asc">Age: Low to High</option>
            <option value="code-asc">Code: A to Z</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-semibold tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4">
                  Patient Code
                </th>
                <th scope="col" className="py-3 px-4">
                  Age & Gender
                </th>
                <th scope="col" className="py-3 px-4">
                  Diabetic Profile
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                sorted.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-sans font-bold">
                          {patient.gender === 'Female' ? 'F' : 'M'}
                        </div>
                        <span>{patient.patientCode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{patient.age} yrs</span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span className="text-slate-400">{patient.gender}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {patient.diabetic ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Diabetic (At Risk)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Non-Diabetic
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewPatientHistory(patient)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="View all fundus screenings for this patient"
                        >
                          <FileClock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Scans</span>
                        </button>

                        <button
                          onClick={() => onSelectPatientForScreening(patient.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-500/20 border border-brand-500/40 px-3 py-1 font-semibold text-brand-300 hover:bg-brand-500 hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Screen Now</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
