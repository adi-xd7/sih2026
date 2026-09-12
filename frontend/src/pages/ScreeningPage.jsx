import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import FundusViewer from '../components/screening/FundusViewer';
import UploadZone from '../components/screening/UploadZone';
import DiagnosticReport from '../components/screening/DiagnosticReport';
import Eye3DModel from '../components/common/Eye3DModel';
import { uploadScreening, getScreeningImageUrl } from '../api/screeningApi';
import { CheckCircle2, Cpu, AlertCircle, Rotate3d, Image as ImageIcon } from 'lucide-react';

const PIPELINE_STEPS = [
  'Ingesting Retinal Image & Field Verification...',
  'Checking Fundus Quality & Optical Gradability...',
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

  // Toggle between 2D optical fundus viewer and 3D eye model
  const [opticalMode, setOpticalMode] = useState('2d'); // '2d' or '3d'

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

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

    const stepInterval = setInterval(() => {
      setPipelineStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      const result = await uploadScreening(patientId, file, presetGrade, previewUrl);

      clearInterval(stepInterval);
      setCompletedScreening(result);
      setWorkflowState('completed');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>AI Retinal Screening Diagnostic Console</span>
            <span className="rounded bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Live Analyzer
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep learning computer vision for automated diabetic retinopathy classification
          </p>
        </div>

        {workflowState === 'completed' && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <span>+ Screen Another Patient</span>
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3.5 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout: Viewer & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ophthalmology Fundus Viewer / 3D Anatomical Guide */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1 font-bold uppercase tracking-wider">
            <span>Retinal Fundus Optical Workspace</span>

            {/* 2D / 3D Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-850 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
              <button
                onClick={() => setOpticalMode('2d')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  opticalMode === '2d'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>2D Scan</span>
              </button>

              <button
                onClick={() => setOpticalMode('3d')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  opticalMode === '3d'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Rotate3d className="w-3 h-3" />
                <span>Movable 3D Eye</span>
              </button>
            </div>
          </div>

          <div className="relative">
            {opticalMode === '2d' ? (
              <FundusViewer
                imageUrl={previewUrl}
                patientCode={selectedPatient?.patientCode}
                screeningId={completedScreening?.id}
              />
            ) : (
              <Eye3DModel height={460} />
            )}

            {/* Laser scanning beam overlay during inference */}
            {workflowState === 'analyzing' && opticalMode === '2d' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#14b8a6] animate-laser" />
              </div>
            )}
          </div>

          {/* Quick guidance pill */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between shadow-xs">
            <span>{opticalMode === '2d' ? 'Controls: Drag to pan when zoomed • Toggle "Red-Free" for vessel contrast' : 'Controls: Click & drag to rotate 3D Eye • Click anatomical markers below'}</span>
            <span className="font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">{opticalMode === '2d' ? '45° FOV' : 'Interactive 3D'}</span>
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
            <div className="clinical-card rounded-2xl p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[440px]">
              <div className="relative flex items-center justify-center">
                <div className="w-18 h-18 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-teal-600 border-r-teal-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-teal-600 dark:text-teal-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Executing Deep Learning Screening
                </h3>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-mono mt-1 font-semibold">
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
                          ? 'text-slate-900 dark:text-white font-bold opacity-100'
                          : isDone
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium opacity-90'
                          : 'text-slate-400 dark:text-slate-600 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : isCurrent
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
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
