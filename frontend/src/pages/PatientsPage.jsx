import React, { useState } from 'react';
import PatientTable from '../components/patients/PatientTable';
import PatientHistoryModal from '../components/patients/PatientHistoryModal';
import { UserPlus } from 'lucide-react';

export default function PatientsPage({
  patients = [],
  onOpenPatientModal,
  onSelectPatientForScreening,
  onInspectScreening
}) {
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleViewHistory = (patient) => {
    setSelectedPatientForHistory(patient);
    setIsHistoryOpen(true);
  };

  const handleInspect = (screening) => {
    setIsHistoryOpen(false);
    if (onInspectScreening) {
      onInspectScreening(screening);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Patient Registry & Clinical Cohort</span>
            <span className="rounded bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
              {patients.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain verified medical records, diabetic profiles, and screening history
          </p>
        </div>

        <button
          onClick={onOpenPatientModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-all shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Patient Table */}
      <PatientTable
        patients={patients}
        onSelectPatientForScreening={onSelectPatientForScreening}
        onViewPatientHistory={handleViewHistory}
      />

      {/* Patient History Modal */}
      <PatientHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        patient={selectedPatientForHistory}
        onInspectScreening={handleInspect}
      />
    </div>
  );
}
