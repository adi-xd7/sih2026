import React from 'react';
import {
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowRight,
  Sparkles,
  Clock,
  Rotate3d
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { GradeBadge } from '../components/common/Badge';
import { DR_GRADE_INFO } from '../api/mockData';
import { getScreeningImageUrl } from '../api/screeningApi';
import Eye3DModel from '../components/common/Eye3DModel';

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
      {/* Hero Welcome Banner with Integrated 3D Interactive Component */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Deep Learning Retinal Intelligence • ResNet-50</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Diabetic Retinopathy Screening & <br className="hidden sm:inline" />
              <span className="text-teal-600 dark:text-teal-400">Early Clinical Triage</span>
            </h1>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Empowering clinicians with automated 5-class ICDR fundus evaluation, optical quality validation, and real-time ophthalmology referral recommendation.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentTab('screening')}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-all shadow-sm active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Start Fundus Screening</span>
              </button>

              <button
                onClick={onOpenPatientModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Right 3D Interactive Component */}
          <div className="lg:col-span-5">
            <Eye3DModel height={280} />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Patients Enrolled"
          value={totalPatients}
          subtitle="Registered clinical cohort"
          icon={Users}
          trend="+12% active"
          colorScheme="teal"
        />

        <StatCard
          title="Total Screenings"
          value={totalScreenings}
          subtitle="Retinal fundus scans"
          icon={Eye}
          trend="Evaluated"
          colorScheme="purple"
        />

        <StatCard
          title="Referable Alerts"
          value={referableCount}
          subtitle="Level 2+ Vision Threats"
          icon={AlertTriangle}
          trendPositive={false}
          trend={`${totalScreenings > 0 ? ((referableCount / totalScreenings) * 100).toFixed(0) : 0}% triage`}
          colorScheme="rose"
        />

        <StatCard
          title="Normal Retinas"
          value={`${normalRate}%`}
          subtitle="Level 0 — Non-diabetic"
          icon={CheckCircle}
          trend="Healthy"
          colorScheme="amber"
        />
      </div>

      {/* Two Column Section: Grade Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grade Breakdown */}
        <div className="lg:col-span-6 clinical-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">DR Severity Distribution</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                International Clinical Diabetic Retinopathy (ICDR) 5-tier classification
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(DR_GRADE_INFO).map(([key, info]) => {
              const count = gradeCounts[key] || 0;
              const percent = totalScreenings > 0 ? ((count / totalScreenings) * 100).toFixed(1) : '0';

              const barBgColors = {
                LEVEL_0: 'bg-emerald-500',
                LEVEL_1: 'bg-amber-500',
                LEVEL_2: 'bg-orange-500',
                LEVEL_3: 'bg-rose-500',
                LEVEL_4: 'bg-purple-500'
              };

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          info.color === 'emerald'
                            ? 'bg-emerald-500'
                            : info.color === 'amber'
                            ? 'bg-amber-500'
                            : info.color === 'orange'
                            ? 'bg-orange-500'
                            : info.color === 'rose'
                            ? 'bg-rose-500'
                            : 'bg-purple-500'
                        }`}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{info.label}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-600 dark:text-slate-300">{count} cases</span>
                      <span className="text-slate-400 dark:text-slate-500 font-bold">({percent}%)</span>
                    </div>
                  </div>

                  {/* Progress meter */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barBgColors[key] || 'bg-teal-500'}`}
                      style={{ width: `${Math.max(Number(percent), count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Screenings */}
        <div className="lg:col-span-6 clinical-card rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Fundus Screenings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest diagnostic evaluations</p>
            </div>

            <button
              onClick={() => setCurrentTab('history')}
              className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentScreenings.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
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
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black flex-shrink-0">
                        <img
                          src={getScreeningImageUrl(sc)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                          {sc.patientCode || `Scan #${sc.id}`}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{formattedDate}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-teal-700 dark:text-teal-400 font-mono font-bold">
                            {sc.confidence ? `${(sc.confidence * 100).toFixed(0)}%` : ''}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <GradeBadge grade={sc.drGrade} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
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
