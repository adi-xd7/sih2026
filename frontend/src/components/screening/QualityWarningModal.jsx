import React from 'react';
import Modal from '../common/Modal';
import { AlertOctagon, CheckCircle2, XCircle, Upload, Sparkles, AlertTriangle } from 'lucide-react';
import { SAMPLE_FUNDUS_IMAGES } from '../../api/mockData';

export default function QualityWarningModal({
  isOpen,
  onClose,
  uploadedPreviewUrl,
  validationDetails,
  onLoadValidPreset,
  onRetryUpload
}) {
  if (!isOpen) return null;

  const category = validationDetails?.category || 'Non-retinal content detected';
  const issues = validationDetails?.issues || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Verification Failed: Non-Retinal Image Detected"
      subtitle="The uploaded file does not match clinical retinal fundus photography specifications."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Warning Alert Banner */}
        <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/50 p-4 text-xs text-red-900 dark:text-red-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-800 dark:text-red-300">
              Cannot Proceed with DR Grading
            </h4>
            <p className="mt-1 text-red-700 dark:text-red-300/90 leading-relaxed">
              The deep learning inference model requires a legitimate circular fundus scan with visible optic disc, retinal vessels, and macula. Uploading desktop screenshots, portraits/faces, UI graphics, text slides, or everyday photos is strictly blocked to prevent false clinical classifications.
            </p>
          </div>
        </div>

        {/* Visual Comparison: Uploaded vs Expected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Uploaded invalid image */}
          <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-slate-50 dark:bg-slate-850 p-3.5 flex flex-col items-center text-center">
            <div className="w-full h-36 rounded-lg overflow-hidden border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 flex items-center justify-center relative mb-2.5">
              {uploadedPreviewUrl ? (
                <img
                  src={uploadedPreviewUrl}
                  alt="Uploaded file"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">Preview unavailable</span>
              )}
              <div className="absolute top-2 right-2 rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <XCircle className="w-3 h-3" />
                <span>Invalid File</span>
              </div>
            </div>
            <p className="text-xs font-bold text-red-800 dark:text-red-400">Your Uploaded Image</p>
            <p className="text-[11px] text-red-700 dark:text-red-300 font-semibold mt-0.5">
              {category}
            </p>
          </div>

          {/* Expected valid fundus scan */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 flex flex-col items-center text-center">
            <div className="w-full h-36 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-black flex items-center justify-center relative mb-2.5">
              <img
                src={SAMPLE_FUNDUS_IMAGES[0].dataUrl}
                alt="Valid fundus example"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Standard Fundus</span>
              </div>
            </div>
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Required Retinal Fundus Scan</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Circular 45° macular or optic disc centered photo
            </p>
          </div>
        </div>

        {/* Specific Diagnostic Guardrail Violations */}
        {issues.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Optical Guardrail Violations Detected:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 font-medium pl-1">
              {issues.map((issue, idx) => (
                <li key={idx} className="leading-snug">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel & Clear
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRetryUpload) onRetryUpload();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Choose Another File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLoadValidPreset) onLoadValidPreset();
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Valid Fundus Sample</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
