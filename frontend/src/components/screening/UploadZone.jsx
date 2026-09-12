import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  Sparkles,
  ChevronRight,
  User,
  Plus,
  AlertOctagon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SAMPLE_FUNDUS_IMAGES } from '../../api/mockData';
import { validateFundusImage } from '../../utils/fundusValidator';
import QualityWarningModal from './QualityWarningModal';

export default function UploadZone({
  patients = [],
  selectedPatientId,
  setSelectedPatientId,
  onImageSelected,
  onStartAnalysis,
  isAnalyzing,
  onOpenPatientModal
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Optical validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = async (file) => {
    setError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const hasValidExt =
      fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError('Invalid format. Please provide a JPG, JPEG, or PNG retinal fundus photograph.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum supported image size is 15MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedPreset(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Run Optical Fundus Validation
    setIsValidating(true);
    const validation = await validateFundusImage(file);
    setIsValidating(false);
    setValidationResult(validation);

    if (!validation.isValid) {
      setSelectedFile(null);
      setShowWarningModal(true);
      setError(`Non-Retinal Image Detected: ${validation.category || 'Invalid format'}. Please upload a clinical retinal fundus scan.`);
      if (onImageSelected) {
        onImageSelected(null, objectUrl, null);
      }
      return;
    }

    if (onImageSelected) {
      onImageSelected(file, objectUrl, null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectPreset = async (sample) => {
    setError(null);
    setSelectedPreset(sample);
    setPreviewUrl(sample.dataUrl);

    let file = null;
    if (sample.dataUrl.startsWith('data:')) {
      const byteString = atob(sample.dataUrl.split(',')[1] || '');
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });
      file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
    } else {
      try {
        const res = await fetch(sample.dataUrl);
        const blob = await res.blob();
        file = new File([blob], `${sample.id}.jpg`, { type: blob.type || 'image/jpeg' });
      } catch {
        file = new File(['dummy'], `${sample.id}.jpg`, { type: 'image/jpeg' });
      }
    }

    setSelectedFile(file);

    // Run Optical Fundus Validation on Preset
    setIsValidating(true);
    const validation = await validateFundusImage(sample.dataUrl);
    setIsValidating(false);
    setValidationResult(validation);

    if (!validation.isValid) {
      setShowWarningModal(true);
    }

    if (onImageSelected) {
      onImageSelected(file, sample.dataUrl, sample.grade);
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedPatientId) {
      setError('Please select a patient to assign this retinal screening scan.');
      return;
    }
    if (!selectedFile && !selectedPreset) {
      setError('Please upload a retinal fundus image or choose a preset sample.');
      return;
    }
    if (validationResult && !validationResult.isValid) {
      setShowWarningModal(true);
      return;
    }
    setError(null);
    if (onStartAnalysis) {
      onStartAnalysis({
        patientId: selectedPatientId,
        file: selectedFile,
        presetGrade: selectedPreset ? selectedPreset.grade : null,
        previewUrl
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Patient Selection */}
      <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Select Screening Patient</span>
          </label>

          <button
            type="button"
            onClick={onOpenPatientModal}
            className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Patient</span>
          </button>
        </div>

        <div className="relative">
          <select
            value={selectedPatientId || ''}
            onChange={(e) => {
              setSelectedPatientId(e.target.value ? Number(e.target.value) : null);
              setError(null);
            }}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 appearance-none cursor-pointer"
          >
            <option value="">-- Choose Patient from Registry --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.patientCode} — {p.gender}, {p.age} yrs {p.diabetic ? '(Diabetic)' : '(Non-Diabetic)'}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Step 2: Drag and Drop Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 scale-[1.01]'
            : validationResult && !validationResult.isValid
            ? 'border-red-400 dark:border-red-800 bg-red-50/40 dark:bg-red-950/30'
            : previewUrl
            ? 'border-teal-500/60 dark:border-teal-500/40 bg-teal-50/30 dark:bg-teal-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-teal-500/80 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-850'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-teal-600 shadow-md p-1 bg-white dark:bg-slate-950">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {selectedFile ? selectedFile.name : selectedPreset?.title}
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                Click or drop another image to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Drop retinal fundus scan here, or <span className="text-teal-700 dark:text-teal-400 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standard macula/optic disc centered 45° fundus photo (JPG, JPEG, PNG up to 15MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Status Indicator */}
      {isValidating && (
        <div className="flex items-center gap-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-3 text-xs text-sky-800 dark:text-sky-300">
          <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying optical fundus characteristics & field quality...</span>
        </div>
      )}

      {/* Optical Validation Failure Warning Banner */}
      {validationResult && !validationResult.isValid && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-900 dark:text-red-200 animate-shake">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800 dark:text-red-300">
                Quality Check Failed: Non-Retinal Image Detected
              </p>
              <p className="mt-1 text-red-700 dark:text-red-300/90 leading-relaxed">
                The uploaded file does not match clinical fundus camera standards (e.g. desktop screenshot or non-ophthalmic image detected). Please upload a valid circular retinal fundus photograph.
              </p>
              <button
                type="button"
                onClick={() => setShowWarningModal(true)}
                className="mt-2 text-xs font-bold text-red-800 dark:text-red-400 underline hover:text-red-900 dark:hover:text-red-300"
              >
                View Comparison & Upload Proper Image →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 3: Fast Demo Presets */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Clinical Demo Presets
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Instant fundus test cases)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_FUNDUS_IMAGES.map((sample) => {
            const isSelected = selectedPreset?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className={`flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-all border ${
                  isSelected
                    ? 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0 bg-black">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{sample.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {sample.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA Button */}
      <button
        type="button"
        disabled={isAnalyzing || (!selectedFile && !selectedPreset) || !selectedPatientId || (validationResult && !validationResult.isValid)}
        onClick={handleAnalyzeClick}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm text-white shadow-sm transition-all ${
          isAnalyzing || (!selectedFile && !selectedPreset) || !selectedPatientId || (validationResult && !validationResult.isValid)
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span>Running Deep Learning Inference...</span>
          </>
        ) : validationResult && !validationResult.isValid ? (
          <>
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <span>Cannot Proceed: Non-Retinal Image Detected</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Execute AI Retinopathy Grading</span>
          </>
        )}
      </button>

      {/* Quality Warning Modal */}
      <QualityWarningModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setValidationResult(null);
          if (onImageSelected) onImageSelected(null, null, null);
        }}
        uploadedPreviewUrl={previewUrl}
        validationDetails={validationResult}
        onRetryUpload={() => {
          setShowWarningModal(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setValidationResult(null);
          if (onImageSelected) onImageSelected(null, null, null);
          fileInputRef.current?.click();
        }}
        onLoadValidPreset={() => {
          setShowWarningModal(false);
          handleSelectPreset(SAMPLE_FUNDUS_IMAGES[0]);
        }}
      />
    </div>
  );
}
