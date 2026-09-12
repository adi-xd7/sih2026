import React, { useState, useEffect } from 'react';
import Shell from './components/layout/Shell';
import DashboardPage from './pages/DashboardPage';
import ScreeningPage from './pages/ScreeningPage';
import PatientsPage from './pages/PatientsPage';
import HistoryPage from './pages/HistoryPage';
import PatientModal from './components/patients/PatientModal';
import { fetchAllPatients } from './api/patientApi';
import { fetchAllScreenings } from './api/screeningApi';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [inspectScreening, setInspectScreening] = useState(null);
  const [screenTargetPatientId, setScreenTargetPatientId] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      const [pts, scs] = await Promise.all([
        fetchAllPatients(),
        fetchAllScreenings()
      ]);
      setPatients(pts || []);
      setScreenings(scs || []);
    } catch (err) {
      console.warn('Error loading initial application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePatientCreated = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    showToast(`Patient ${newPatient.patientCode} successfully registered.`);
  };

  const handleScreeningCompleted = (newScreening) => {
    setScreenings((prev) => [newScreening, ...prev]);
    showToast(`AI Retinal screening #${newScreening.id} completed successfully.`);
  };

  const handleSelectPatientForScreening = (patientId) => {
    setScreenTargetPatientId(patientId);
    setInspectScreening(null);
    setCurrentTab('screening');
  };

  const handleInspectScreening = (screening) => {
    setInspectScreening(screening);
    setScreenTargetPatientId(screening.patientId);
    setCurrentTab('screening');
  };

  return (
    <Shell
      currentTab={currentTab}
      setCurrentTab={(tab) => {
        if (tab !== 'screening') {
          setInspectScreening(null);
        }
        setCurrentTab(tab);
      }}
      onOpenPatientModal={() => setIsPatientModalOpen(true)}
    >
      {/* Dynamic Tab Router */}
      {currentTab === 'dashboard' && (
        <DashboardPage
          patients={patients}
          screenings={screenings}
          setCurrentTab={setCurrentTab}
          onOpenPatientModal={() => setIsPatientModalOpen(true)}
          onInspectScreening={handleInspectScreening}
        />
      )}

      {currentTab === 'screening' && (
        <ScreeningPage
          patients={patients}
          initialPatientId={screenTargetPatientId}
          activeScreening={inspectScreening}
          onScreeningCompleted={handleScreeningCompleted}
          onOpenPatientModal={() => setIsPatientModalOpen(true)}
        />
      )}

      {currentTab === 'patients' && (
        <PatientsPage
          patients={patients}
          onOpenPatientModal={() => setIsPatientModalOpen(true)}
          onSelectPatientForScreening={handleSelectPatientForScreening}
          onInspectScreening={handleInspectScreening}
        />
      )}

      {currentTab === 'history' && (
        <HistoryPage
          screenings={screenings}
          onInspectScreening={handleInspectScreening}
        />
      )}

      {/* Global Patient Registration Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-white border border-teal-200 px-4 py-3 text-xs font-bold text-slate-800 shadow-xl shadow-slate-400/20 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </Shell>
  );
}
