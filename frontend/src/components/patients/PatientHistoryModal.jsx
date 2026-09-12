import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { GradeBadge, ReferralBadge } from '../common/Badge';
import { FileClock, Eye, Calendar, AlertCircle } from 'lucide-react';
import { fetchPatientScreenings } from '../../api/patientApi';
import { getScreeningImageUrl } from '../../api/screeningApi';

export default function PatientHistoryModal({
  isOpen,
  onClose,
  patient,
  onInspectScreening
}) {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !patient) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPatientScreenings(patient.id);
        setScreenings(data || []);
      } catch (err) {
        setError('Failed to load patient screenings.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical History: ${patient.patientCode}`}
      subtitle={`${patient.gender}, ${patient.age} years old • ${
        patient.diabetic ? 'Diabetic' : 'Non-Diabetic'
      }`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Fetching retinal screening timeline...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : screenings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
            <FileClock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No screenings recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              This patient has no recorded retinal fundus examinations.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {screenings.map((sc) => {
              const formattedDate = sc.createdAt
                ? new Date(sc.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : 'Recorded';

              return (
                <div
                  key={sc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-black flex-shrink-0">
                      <img
                        src={getScreeningImageUrl(sc)}
                        alt="Scan thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          Scan #{sc.id}
                        </span>
                        <GradeBadge grade={sc.drGrade} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-brand-400 font-mono">
                          {sc.confidence ? `${(sc.confidence * 100).toFixed(1)}% conf.` : ''}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:self-center">
                    <ReferralBadge referable={sc.referable} size="sm" />
                    <button
                      onClick={() => {
                        onClose();
                        if (onInspectScreening) {
                          onInspectScreening(sc);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Eye className="w-3 h-3 text-brand-400" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
