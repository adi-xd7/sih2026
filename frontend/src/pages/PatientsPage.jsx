import React, { useState } from 'react';
import PatientTable from '../components/patients/PatientTable';
import PatientHistoryModal from '../components/patients/PatientHistoryModal';
import { UserPlus, Users, Sparkles } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Patient Registry & Clinical Cohort</span>
            <span className="rounded bg-brand-500/10 px-2 py-0.5 text-xs font-bold text-brand-400 border border-brand-500/20 font-mono">
              {patients.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain verified medical records, diabetic profiles, and screening history
          </p>
        </div>

        <button
          onClick={onOpenPatientModal}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2 text-xs font-bold text-white hover:from-brand-600 hover:to-cyan-600 transition-all shadow-md shadow-brand-500/20 active:scale-95"
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
