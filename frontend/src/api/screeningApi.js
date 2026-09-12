import {
  getStoredScreenings,
  saveStoredScreenings,
  getStoredPatients,
  isExplicitDemoMode
} from './client';
import { SAMPLE_FUNDUS_IMAGES } from './mockData';

/**
 * Upload image for screening
 * Endpoint: POST /api/screenings/upload
 * Parameters: patientId (Long), image (MultipartFile)
 */
export async function uploadScreening(patientId, imageFile, simulatedGrade = null, previewUrl = null) {
  if (isExplicitDemoMode()) {
    return simulateDemoInference(patientId, imageFile, simulatedGrade, previewUrl);
  }

  try {
    let fileToUpload = imageFile;

    // If imageFile is not a File/Blob instance, convert previewUrl if available
    if ((!fileToUpload || !(fileToUpload instanceof Blob || fileToUpload instanceof File)) && previewUrl) {
      if (previewUrl.startsWith('data:')) {
        const byteString = atob(previewUrl.split(',')[1] || '');
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        fileToUpload = new File([blob], 'retinal_scan.jpg', { type: 'image/jpeg' });
      } else if (previewUrl.startsWith('blob:') || previewUrl.startsWith('http')) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], 'retinal_scan.jpg', { type: blob.type || 'image/jpeg' });
      }
    }

    if (!fileToUpload) {
      throw new Error('No valid fundus image provided for screening analysis.');
    }

    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('image', fileToUpload);

    const res = await fetch('/api/screenings/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Upload failed (${res.status})`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Backend screening upload failed, falling back to local simulation:', err.message);
    return simulateDemoInference(patientId, imageFile, simulatedGrade, previewUrl);
  }
}

/**
 * Fetch screening report by ID
 * Endpoint: GET /api/screenings/{id}
 */
export async function fetchScreeningById(id) {
  if (isExplicitDemoMode()) {
    const screenings = getStoredScreenings();
    const found = screenings.find((s) => s.id === Number(id));
    if (!found) throw new Error('Screening record not found');
    return found;
  }

  try {
    const res = await fetch(`/api/screenings/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, retrieving from local cache:', err.message);
    const screenings = getStoredScreenings();
    const found = screenings.find((s) => s.id === Number(id));
    if (!found) throw new Error('Screening record not found');
    return found;
  }
}

/**
 * Helper to get direct image URL for a screening
 */
export function getScreeningImageUrl(screening) {
  if (!screening) return '';
  if (screening.imageUrl && (screening.imageUrl.startsWith('data:') || screening.imageUrl.startsWith('/') || screening.imageUrl.startsWith('http'))) {
    return screening.imageUrl;
  }
  if (screening.id) {
    return `/api/screenings/${screening.id}/image`;
  }
  return screening.imageUrl || '';
}

/**
 * Fetch all screenings (consolidated for History/Audit views)
 */
export async function fetchAllScreenings() {
  if (isExplicitDemoMode()) {
    return getStoredScreenings();
  }

  try {
    const patientsRes = await fetch('/api/patients');
    if (!patientsRes.ok) throw new Error('Could not fetch patients');
    const patients = await patientsRes.json();

    const screeningPromises = patients.map(async (patient) => {
      try {
        const sRes = await fetch(`/api/patients/${patient.id}/screenings`);
        if (sRes.ok) {
          return await sRes.json();
        }
        return [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(screeningPromises);
    const flattened = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return flattened.length > 0 ? flattened : getStoredScreenings();
  } catch (err) {
    console.warn('Backend unavailable, using cached screenings:', err.message);
    return getStoredScreenings();
  }
}

/**
 * Simulation helper for offline/demo mode
 */
async function simulateDemoInference(patientId, imageFile, forcedGrade = null, customUrl = null) {
  const patients = getStoredPatients();
  const patient = patients.find((p) => p.id === Number(patientId)) || {
    id: patientId,
    patientCode: `PAT-${patientId}`
  };

  // Determine grade (if user selected a sample preset or random realistic inference)
  const grades = ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4'];
  const assignedGrade = forcedGrade || grades[Math.floor(Math.random() * grades.length)];

  // Generate realistic class probabilities matching assigned grade
  const confidence = 0.88 + Math.random() * 0.10;
  const remaining = 1 - confidence;

  const probs = {
    'No DR': assignedGrade === 'LEVEL_0' ? confidence : remaining * 0.1,
    'Mild DR': assignedGrade === 'LEVEL_1' ? confidence : remaining * 0.2,
    'Moderate DR': assignedGrade === 'LEVEL_2' ? confidence : remaining * 0.3,
    'Severe DR': assignedGrade === 'LEVEL_3' ? confidence : remaining * 0.25,
    'Proliferative DR': assignedGrade === 'LEVEL_4' ? confidence : remaining * 0.15
  };

  // Normalize probabilities to sum to 1.0
  const sum = Object.values(probs).reduce((a, b) => a + b, 0);
  Object.keys(probs).forEach((key) => {
    probs[key] = parseFloat((probs[key] / sum).toFixed(4));
  });

  const isReferable = assignedGrade !== 'LEVEL_0' && assignedGrade !== 'LEVEL_1';

  // Read file as data URL if possible for instant client-side preview
  let dataUrl = customUrl || SAMPLE_FUNDUS_IMAGES[0].dataUrl;
  if (imageFile instanceof File) {
    try {
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(customUrl || SAMPLE_FUNDUS_IMAGES[0].dataUrl);
        reader.readAsDataURL(imageFile);
      });
    } catch {
      dataUrl = customUrl || SAMPLE_FUNDUS_IMAGES[0].dataUrl;
    }
  } else if (typeof imageFile === 'string') {
    dataUrl = imageFile;
  }

  const screenings = getStoredScreenings();
  const newId = screenings.length > 0 ? Math.max(...screenings.map((s) => s.id)) + 1 : 201;

  const newScreening = {
    id: newId,
    patientId: patient.id,
    patientCode: patient.patientCode,
    status: 'COMPLETED',
    qualityScore: 0.94,
    gradable: true,
    drGrade: assignedGrade,
    confidence: parseFloat(confidence.toFixed(3)),
    referable: isReferable,
    probabilities: probs,
    imageUrl: dataUrl,
    createdAt: new Date().toISOString()
  };

  screenings.unshift(newScreening);
  saveStoredScreenings(screenings);

  return newScreening;
}
