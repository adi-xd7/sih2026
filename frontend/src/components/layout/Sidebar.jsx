import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Users,
  FileClock,
  ShieldCheck,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { DR_GRADE_INFO } from '../../api/mockData';

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'screening',
      label: 'AI Fundus Screening',
      icon: Eye,
      badge: 'ML'
    },
    {
      id: 'patients',
      label: 'Patient Registry',
      icon: Users,
      badge: null
    },
    {
      id: 'history',
      label: 'Screening History',
      icon: FileClock,
      badge: null
    }
  ];

  const handleSelect = (tabId) => {
    setCurrentTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-slate-800/80 bg-slate-950 p-4 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
              Platform Navigation
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/15 to-cyan-500/10 text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Grading Legend */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span>DR Classification Scale</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(DR_GRADE_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
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
                      }`}
                    />
                    <span className="text-slate-300 font-mono text-[11px]">
                      {key.replace('LEVEL_', 'L')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[110px]">
                    {info.shortLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Technical Spec */}
        <div className="border-t border-slate-800/80 pt-4">
          <div className="rounded-xl bg-slate-900/60 p-3 text-xs border border-slate-800/60">
            <div className="flex items-center gap-2 text-slate-300 font-medium mb-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backend Architecture</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Spring Boot REST API on port 8080. PyTorch ResNet / EfficientNet inference service on port 8000.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
