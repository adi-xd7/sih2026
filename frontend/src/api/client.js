import { INITIAL_PATIENTS, INITIAL_SCREENINGS, SAMPLE_FUNDUS_IMAGES } from './mockData';

// Local storage keys for demo persistence
const LS_PATIENTS_KEY = 'retina_ai_patients';
const LS_SCREENINGS_KEY = 'retina_ai_screenings';
const LS_MODE_KEY = 'retina_ai_use_mock';

export function getStoredPatients() {
  const data = localStorage.getItem(LS_PATIENTS_KEY);
  if (!data) {
    localStorage.setItem(LS_PATIENTS_KEY, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PATIENTS;
  }
}

export function saveStoredPatients(patients) {
  localStorage.setItem(LS_PATIENTS_KEY, JSON.stringify(patients));
}

export function getStoredScreenings() {
  const data = localStorage.getItem(LS_SCREENINGS_KEY);
  if (!data) {
    localStorage.setItem(LS_SCREENINGS_KEY, JSON.stringify(INITIAL_SCREENINGS));
    return INITIAL_SCREENINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SCREENINGS;
  }
}

export function saveStoredScreenings(screenings) {
  localStorage.setItem(LS_SCREENINGS_KEY, JSON.stringify(screenings));
}

// Check if demo fallback is explicitly enabled by user
export function isExplicitDemoMode() {
  return localStorage.getItem(LS_MODE_KEY) === 'true';
}

export function setExplicitDemoMode(enabled) {
  localStorage.setItem(LS_MODE_KEY, enabled ? 'true' : 'false');
}

/**
 * Health check to see if Spring Boot backend is reachable
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/patients', { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
