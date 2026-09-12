import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import FundusViewer from '../components/screening/FundusViewer';
import UploadZone from '../components/screening/UploadZone';
import DiagnosticReport from '../components/screening/DiagnosticReport';
import { uploadScreening, getScreeningImageUrl } from '../api/screeningApi';
import { CheckCircle2, Cpu, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

const PIPELINE_STEPS = [
  'Ingesting Retinal Image & Field Verification...',
  'Checking Fundus Quality & Gradability...',
  'Analyzing Microvascular Lesions & Exudates...',
  'Evaluating Deep Learning ResNet-50 Classifier...',
  'Compiling ICDR Clinical Diagnostic Report...'
];

export default function ScreeningPage({
  patients = [],
  initialPatientId = null,
  activeScreening = null,
  onScreeningCompleted,
  onOpenPatientModal
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [currentImageFile, setCurrentImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [presetGrade, setPresetGrade] = useState(null);

  const [workflowState, setWorkflowState] = useState(activeScreening ? 'completed' : 'idle');
  const [completedScreening, setCompletedScreening] = useState(activeScreening);
  const [pipelineStepIndex, setPipelineStepIndex] = useState(0);
  const [error, setError] = useState(null);

  // Sync initial patient if set externally (e.g. from Patient Table "Screen Now")
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // Sync if activeScreening passed in (e.g. from Dashboard or History "Inspect")
  useEffect(() => {
    if (activeScreening) {
      setCompletedScreening(activeScreening);
      setSelectedPatientId(activeScreening.patientId);
      setPreviewUrl(getScreeningImageUrl(activeScreening));
      setWorkflowState('completed');
    }
  }, [activeScreening]);

  const handleImageSelected = (file, url, preset) => {
    setCurrentImageFile(file);
    setPreviewUrl(url);
    setPresetGrade(preset);
  };

  const handleStartAnalysis = async ({ patientId, file, presetGrade, previewUrl }) => {
    setError(null);
    setWorkflowState('analyzing');
    setPipelineStepIndex(0);

    // Multi-step visual pipeline transition
    const stepInterval = setInterval(() => {
      setPipelineStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      // Call backend API / demo fallback
      const result = await uploadScreening(patientId, file, presetGrade);

      clearInterval(stepInterval);
      setCompletedScreening(result);
      setWorkflowState('completed');

      // Trigger celebratory confetti for completion
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      if (onScreeningCompleted) {
        onScreeningCompleted(result);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setWorkflowState('idle');
      setError(err.message || 'Screening analysis failed.');
    }
  };

  const handleReset = () => {
    setWorkflowState('idle');
    setCompletedScreening(null);
    setCurrentImageFile(null);
    setPreviewUrl(null);
    setPresetGrade(null);
    setError(null);
  };

  const selectedPatient = patients.find((p) => p.id === Number(selectedPatientId));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>AI Retinal Screening Diagnostic Console</span>
            <span className="rounded bg-brand-500/10 px-2 py-0.5 text-xs font-bold text-brand-400 border border-brand-500/20">
              Live Analyzer
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep Learning-Powered Computer Vision for Automated Diabetic Retinopathy Assessment
          </p>
        </div>

        {workflowState === 'completed' && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>+ Screen Another Patient</span>
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout: Viewer & Control/Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ophthalmology Fundus Viewer */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
            <span>Retinal Fundus Optical Workspace</span>
            <span className="text-[11px] text-brand-400 font-mono">
              {workflowState === 'analyzing' ? 'Scanning...' : 'Interactive Inspection'}
            </span>
          </div>

          <div className="relative">
            <FundusViewer
              imageUrl={previewUrl}
              patientCode={selectedPatient?.patientCode}
              screeningId={completedScreening?.id}
            />

            {/* Laser scanning beam overlay during inference */}
            {workflowState === 'analyzing' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser" />
              </div>
            )}
          </div>

          {/* Quick instructions pill */}
          <div className="rounded-xl bg-slate-900/40 p-3 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Controls: Drag to pan when zoomed • Toggle "Red-Free" for vessel contrast</span>
            <span className="font-mono text-slate-500 hidden sm:inline">45° FOV</span>
          </div>
        </div>

        {/* Right Column: Upload / Analysis Pipeline / Diagnostic Report */}
        <div className="lg:col-span-6">
          {workflowState === 'idle' && (
            <UploadZone
              patients={patients}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
              onImageSelected={handleImageSelected}
              onStartAnalysis={handleStartAnalysis}
              isAnalyzing={false}
              onOpenPatientModal={onOpenPatientModal}
            />
          )}

          {workflowState === 'analyzing' && (
            <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-brand-500 border-r-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-brand-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Executing Deep Learning Screening
                </h3>
                <p className="text-xs text-brand-400 font-mono mt-1">
                  {PIPELINE_STEPS[pipelineStepIndex]}
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="w-full max-w-sm space-y-2">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isDone = idx < pipelineStepIndex;
                  const isCurrent = idx === pipelineStepIndex;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 text-xs transition-opacity ${
                        isCurrent
                          ? 'text-white font-semibold opacity-100'
                          : isDone
                          ? 'text-emerald-400 opacity-80'
                          : 'text-slate-600 opacity-40'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-brand-500 text-slate-950 font-bold animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="truncate">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {workflowState === 'completed' && completedScreening && (
            <DiagnosticReport
              screening={completedScreening}
              patient={selectedPatient}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
