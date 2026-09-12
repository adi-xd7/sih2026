import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Zap,
  RefreshCw,
  PlusCircle,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { checkBackendHealth, isExplicitDemoMode, setExplicitDemoMode } from '../../api/client';

export default function Navbar({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen,
  onOpenPatientModal
}) {
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [demoMode, setDemoMode] = useState(isExplicitDemoMode());

  const testConnection = async () => {
    setChecking(true);
    const healthy = await checkBackendHealth();
    setBackendHealthy(healthy);
    setChecking(false);
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000); // ping every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    setExplicitDemoMode(next);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Activity className="h-5 w-5 text-brand-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-sans">
                  Retina<span className="text-brand-400">AI</span>
                </span>
                <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/20">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Diabetic Retinopathy Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Right Action & Status Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Backend Status Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {backendHealthy && !demoMode ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </>
                )}
              </span>
              <span className="hidden md:inline font-mono">
                {demoMode
                  ? 'Demo Mode (Mock DB)'
                  : backendHealthy
                  ? 'Spring Boot Online :8080'
                  : 'Backend Offline (Fallback Active)'}
              </span>
              <span className="md:hidden font-mono">
                {backendHealthy && !demoMode ? ':8080 Live' : 'Demo'}
              </span>
            </div>

            <button
              onClick={testConnection}
              title="Ping Spring Boot Backend"
              className="text-slate-400 hover:text-brand-400 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-brand-400' : ''}`} />
            </button>

            <button
              onClick={handleToggleDemoMode}
              className="ml-1 text-[10px] uppercase font-semibold tracking-wider text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-brand-400"
              title="Toggle between real Spring Boot API and offline interactive mock"
            >
              {demoMode ? 'Use Live API' : 'Use Demo DB'}
            </button>
          </div>

          {/* New Patient CTA */}
          <button
            onClick={onOpenPatientModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
            New Patient
          </button>

          {/* Quick Screening Action */}
          <button
            onClick={() => setCurrentTab('screening')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white hover:from-brand-600 hover:to-cyan-600 transition-all shadow-md shadow-brand-500/25 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Screen</span>
          </button>
        </div>
      </div>
    </header>
  );
}
