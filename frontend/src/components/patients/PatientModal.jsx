import React, { useState } from 'react';
import Modal from '../common/Modal';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { createPatient } from '../../api/patientApi';

export default function PatientModal({ isOpen, onClose, onPatientCreated }) {
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState(50);
  const [gender, setGender] = useState('Male');
  const [diabetic, setDiabetic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRandomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPatientCode(`PAT-2026-${randomNum}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = patientCode.trim();
    if (!trimmedCode) {
      setError('Patient code is required.');
      return;
    }

    const numAge = Number(age);
    if (!numAge || numAge < 1 || numAge > 120) {
      setError('Age must be an integer between 1 and 120.');
      return;
    }

    setLoading(true);
    try {
      const created = await createPatient({
        patientCode: trimmedCode,
        age: numAge,
        gender,
        diabetic
      });

      // Reset form
      setPatientCode('');
      setAge(50);
      setGender('Male');
      setDiabetic(true);

      if (onPatientCreated) {
        onPatientCreated(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Patient"
      subtitle="Create a verified clinical patient record for DR screening"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Code with Generator */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Patient Code / Medical ID *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. PAT-2026-1049"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
            />
            <button
              type="button"
              onClick={generateRandomCode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Generate next available ID"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Auto ID</span>
            </button>
          </div>
        </div>

        {/* Age and Gender grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Age (Years: 1-120) *
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Gender *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Diabetic Status Toggle */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Diabetic Status *
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Patient has confirmed diagnosis of Type 1 or Type 2 Diabetes
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDiabetic(!diabetic)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                diabetic ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  diabetic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            <span>Register Patient</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
