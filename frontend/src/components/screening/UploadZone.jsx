import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  Sparkles,
  ChevronRight,
  User,
  Plus,
  Info
} from 'lucide-react';
import { SAMPLE_FUNDUS_IMAGES } from '../../api/mockData';

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

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file) => {
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

    // Size limit check (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum supported image size is 15MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedPreset(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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

  const handleSelectPreset = (sample) => {
    setError(null);
    setSelectedPreset(sample);
    setSelectedFile(null);
    setPreviewUrl(sample.dataUrl);

    // Convert SVG data URL to a dummy File object so it can be uploaded as multipart if needed
    const byteString = atob(sample.dataUrl.split(',')[1] || '');
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });

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
    <div className="space-y-6">
      {/* Step 1: Patient Selection Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-brand-400" />
            <span>Select Screening Patient</span>
          </label>

          <button
            type="button"
            onClick={onOpenPatientModal}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold transition-colors"
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
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
          >
            <option value="">-- Choose Patient from Registry --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.patientCode} — {p.gender}, {p.age} yrs {p.diabetic ? '(Diabetic)' : '(Non-Diabetic)'}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Step 2: Drag and Drop Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
            : previewUrl
            ? 'border-brand-500/40 bg-slate-900/40'
            : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-900/30'
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
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-brand-400/80 shadow-glow-teal p-1 bg-slate-950">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : selectedPreset?.title}
              </p>
              <p className="text-xs text-brand-400 mt-0.5">
                Click or drop another image to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <UploadCloud className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Drop retinal fundus photograph here, or <span className="text-brand-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Standard macula/optic disc centered 45° fundus photography (JPG, JPEG, PNG up to 15MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-300 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 3: Fast Demo Presets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            One-Click Clinical Demo Presets
          </h4>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (Instant fundus test cases)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_FUNDUS_IMAGES.map((sample) => {
            const isSelected = selectedPreset?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className={`flex items-start gap-3 rounded-xl p-2.5 text-left transition-all border ${
                  isSelected
                    ? 'border-brand-400 bg-brand-500/15 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-black">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate">{sample.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
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
        disabled={isAnalyzing || (!selectedFile && !selectedPreset) || !selectedPatientId}
        onClick={handleAnalyzeClick}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm text-white shadow-lg transition-all ${
          isAnalyzing || (!selectedFile && !selectedPreset) || !selectedPatientId
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-brand-500 via-teal-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 shadow-brand-500/25 active:scale-[0.99]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Inference in Progress...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Execute AI Retinopathy Grading</span>
          </>
        )}
      </button>
    </div>
  );
}
