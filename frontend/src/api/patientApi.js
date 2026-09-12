import {
  getStoredPatients,
  saveStoredPatients,
  getStoredScreenings,
  isExplicitDemoMode
} from './client';

/**
 * Fetch all patients
 */
export async function fetchAllPatients() {
  if (isExplicitDemoMode()) {
    return getStoredPatients();
  }

  try {
    const res = await fetch('/api/patients');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend unavailable, falling back to local dataset:', err.message);
    return getStoredPatients();
  }
}

/**
 * Fetch single patient by ID
 */
export async function fetchPatientById(id) {
  if (isExplicitDemoMode()) {
    const list = getStoredPatients();
    const found = list.find((p) => p.id === Number(id));
    if (!found) throw new Error('Patient not found');
    return found;
  }

  try {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local dataset:', err.message);
    const list = getStoredPatients();
    const found = list.find((p) => p.id === Number(id));
    if (!found) throw new Error('Patient not found');
    return found;
  }
}

/**
 * Register a new patient
 * payload: { patientCode: string, age: number, gender: string, diabetic: boolean }
 */
export async function createPatient(patientData) {
  if (isExplicitDemoMode()) {
    const list = getStoredPatients();
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    const newPatient = {
      id: newId,
      patientCode: patientData.patientCode.trim(),
      age: Number(patientData.age),
      gender: patientData.gender,
      diabetic: Boolean(patientData.diabetic)
    };
    list.unshift(newPatient);
    saveStoredPatients(list);
    return newPatient;
  }

  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Failed to create patient (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, saving patient locally in demo mode:', err.message);
    const list = getStoredPatients();
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    const newPatient = {
      id: newId,
      patientCode: patientData.patientCode.trim(),
      age: Number(patientData.age),
      gender: patientData.gender,
      diabetic: Boolean(patientData.diabetic)
    };
    list.unshift(newPatient);
    saveStoredPatients(list);
    return newPatient;
  }
}

/**
 * Get all screenings for a specific patient
 */
export async function fetchPatientScreenings(patientId) {
  if (isExplicitDemoMode()) {
    const screenings = getStoredScreenings();
    return screenings.filter((s) => s.patientId === Number(patientId));
  }

  try {
    const res = await fetch(`/api/patients/${patientId}/screenings`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, falling back to local screenings:', err.message);
    const screenings = getStoredScreenings();
    return screenings.filter((s) => s.patientId === Number(patientId));
  }
}
