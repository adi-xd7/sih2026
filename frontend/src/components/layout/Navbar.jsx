import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  RefreshCw,
  PlusCircle,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { checkBackendHealth, isExplicitDemoMode, setExplicitDemoMode } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  const testConnection = async () => {
    setChecking(true);
    const healthy = await checkBackendHealth();
    setBackendHealthy(healthy);
    setChecking(false);
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    setExplicitDemoMode(next);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-sm text-white group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Retina<span className="text-teal-600 dark:text-teal-400">AI</span>
                </span>
                <span className="rounded bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Diabetic Retinopathy Diagnostic Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Action & Status Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
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
              <span className="hidden md:inline font-mono font-medium">
                {demoMode
                  ? 'Demo Mode (Mock DB)'
                  : backendHealthy
                  ? 'Spring Boot Live :8080'
                  : 'Backend Offline (Demo)'}
              </span>
              <span className="md:hidden font-mono font-medium">
                {backendHealthy && !demoMode ? ':8080' : 'Demo'}
              </span>
            </div>

            <button
              onClick={testConnection}
              title="Ping Spring Boot Backend"
              className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            <button
              onClick={handleToggleDemoMode}
              className="ml-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-teal-600"
              title="Toggle between real Spring Boot API and offline interactive mock"
            >
              {demoMode ? 'Live API' : 'Demo DB'}
            </button>
          </div>

          {/* Theme Switcher Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* New Patient CTA */}
          <button
            onClick={onOpenPatientModal}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>New Patient</span>
          </button>

          {/* Quick Screening Action */}
          <button
            onClick={() => setCurrentTab('screening')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Screen</span>
          </button>
        </div>
      </div>
    </header>
  );
}
