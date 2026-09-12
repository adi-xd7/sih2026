import React from 'react';
import {
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { GradeBadge, ReferralBadge } from '../components/common/Badge';
import { DR_GRADE_INFO } from '../api/mockData';
import { getScreeningImageUrl } from '../api/screeningApi';

export default function DashboardPage({
  patients = [],
  screenings = [],
  setCurrentTab,
  onOpenPatientModal,
  onInspectScreening
}) {
  const totalPatients = patients.length;
  const totalScreenings = screenings.length;
  const referableCount = screenings.filter((s) => s.referable).length;
  const normalCount = screenings.filter((s) => s.drGrade === 'LEVEL_0').length;
  const normalRate = totalScreenings > 0 ? ((normalCount / totalScreenings) * 100).toFixed(0) : '0';

  // Calculate grade distribution
  const gradeCounts = {
    LEVEL_0: 0,
    LEVEL_1: 0,
    LEVEL_2: 0,
    LEVEL_3: 0,
    LEVEL_4: 0
  };

  screenings.forEach((s) => {
    if (s.drGrade && gradeCounts[s.drGrade] !== undefined) {
      gradeCounts[s.drGrade]++;
    }
  });

  const recentScreenings = screenings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Retinal Diagnostic System • Deep Learning ResNet-50</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Automated Diabetic Retinopathy <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              Screening & Early Detection
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl">
            Empowering ophthalmologists and primary care clinicians with deep learning-assisted fundus image classification, automated referral triage, and multi-class DR grading.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('screening')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:from-brand-600 hover:to-cyan-600 transition-all shadow-lg shadow-brand-500/25 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Start Fundus Screening</span>
            </button>

            <button
              onClick={onOpenPatientModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-brand-400" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative graphic */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block opacity-30 pointer-events-none">
          <div className="w-72 h-72 rounded-full border border-brand-500/30 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-cyan-500/20 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-brand-500/10 blur-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Patients Enrolled"
          value={totalPatients}
          subtitle="Registered clinical profiles"
          icon={Users}
          trend="+12% this mo"
          colorScheme="teal"
        />

        <StatCard
          title="Total Screenings"
          value={totalScreenings}
          subtitle="Retinal fundus scans"
          icon={Eye}
          trend="+28% growth"
          colorScheme="purple"
        />

        <StatCard
          title="Referable Alerts"
          value={referableCount}
          subtitle="Level 2+ or Vision-Threatening"
          icon={AlertTriangle}
          trendPositive={false}
          trend={`${totalScreenings > 0 ? ((referableCount / totalScreenings) * 100).toFixed(0) : 0}% triage`}
          colorScheme="rose"
        />

        <StatCard
          title="Normal Retinas"
          value={`${normalRate}%`}
          subtitle="Level 0 — No Retinopathy"
          icon={CheckCircle}
          trend="Healthy cohort"
          colorScheme="amber"
        />
      </div>

      {/* Two Column Section: Grade Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grade Breakdown */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h2 className="text-base font-bold text-white">DR Severity Distribution</h2>
              <p className="text-xs text-slate-400">
                ICDR (International Clinical Diabetic Retinopathy) 5-tier classification
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(DR_GRADE_INFO).map(([key, info]) => {
              const count = gradeCounts[key] || 0;
              const percent = totalScreenings > 0 ? ((count / totalScreenings) * 100).toFixed(1) : '0';

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          info.color === 'emerald'
                            ? 'bg-emerald-400'
                            : info.color === 'amber'
                            ? 'bg-amber-400'
                            : info.color === 'orange'
                            ? 'bg-orange-400'
                            : info.color === 'rose'
                            ? 'bg-rose-400'
                            : 'bg-purple-400'
                        }`}
                      />
                      <span className="font-semibold text-slate-200">{info.label}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">{count} cases</span>
                      <span className="text-slate-500 font-bold">({percent}%)</span>
                    </div>
                  </div>

                  {/* Progress meter */}
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${info.barColor}`}
                      style={{ width: `${Math.max(Number(percent), count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Screenings */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Fundus Screenings</h2>
              <p className="text-xs text-slate-400">Latest diagnostic evaluations</p>
            </div>

            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentScreenings.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No recent screenings found.
              </p>
            ) : (
              recentScreenings.map((sc) => {
                const formattedDate = sc.createdAt
                  ? new Date(sc.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Recent';

                return (
                  <div
                    key={sc.id}
                    onClick={() => onInspectScreening(sc)}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-800/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-black flex-shrink-0">
                        <img
                          src={getScreeningImageUrl(sc)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-white truncate">
                          {sc.patientCode || `Scan #${sc.id}`}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formattedDate}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-brand-400 font-mono">
                            {sc.confidence ? `${(sc.confidence * 100).toFixed(0)}%` : ''}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <GradeBadge grade={sc.drGrade} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
