// Mock Data for offline testing, demos, and graceful fallback

// Realistic SVG retinal fundus representations
export const SAMPLE_FUNDUS_IMAGES = [
  {
    id: 'sample-normal',
    title: 'Case A: Normal Healthy Retina',
    grade: 'LEVEL_0',
    description: 'Crisp optic disc margin, healthy macula, uniform arteriovenous ratio, zero microaneurysms.',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23b93815"/><stop offset="70%" stop-color="%237e1d09"/><stop offset="95%" stop-color="%233e0d04"/><stop offset="100%" stop-color="%231a0501"/></radialGradient><radialGradient id="disc" cx="45%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffeb99"/><stop offset="60%" stop-color="%23fbb034"/><stop offset="100%" stop-color="%23d85d15"/></radialGradient><radialGradient id="macula" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23450a0a"/><stop offset="80%" stop-color="%237e1d09"/><stop offset="100%" stop-color="%23991b1b"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="3"/></filter></defs><circle cx="300" cy="300" r="280" fill="url(%23bg)"/><circle cx="210" cy="300" r="38" fill="url(%23disc)" filter="url(%23blur)" opacity="0.95"/><circle cx="370" cy="315" r="26" fill="url(%23macula)" filter="url(%23blur)" opacity="0.85"/><path d="M210 300 Q180 200 230 110 T320 60" stroke="%235a0904" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M210 300 Q260 210 340 160 T460 120" stroke="%237f1008" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M210 300 Q160 380 220 480 T350 540" stroke="%235a0904" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M210 300 Q280 390 380 430 T500 460" stroke="%238a1209" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M340 160 Q390 140 430 80" stroke="%236c0a05" stroke-width="2.5" fill="none"/><path d="M380 430 Q440 460 480 510" stroke="%236c0a05" stroke-width="2.5" fill="none"/></svg>`
  },
  {
    id: 'sample-mild',
    title: 'Case B: Mild NPDR (Microaneurysms)',
    grade: 'LEVEL_1',
    description: 'Scattered red microaneurysms within posterior pole, preserved macular center.',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23aa2e10"/><stop offset="70%" stop-color="%23751706"/><stop offset="95%" stop-color="%233a0b03"/><stop offset="100%" stop-color="%23150301"/></radialGradient><radialGradient id="disc" cx="45%" cy="50%" r="50%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="70%" stop-color="%23ea580c"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="3"/></filter></defs><circle cx="300" cy="300" r="280" fill="url(%23bg)"/><circle cx="210" cy="300" r="38" fill="url(%23disc)" filter="url(%23blur)"/><circle cx="370" cy="315" r="26" fill="%23431407" filter="url(%23blur)" opacity="0.8"/><path d="M210 300 Q180 200 240 100 T330 60" stroke="%235a0904" stroke-width="6.5" fill="none"/><path d="M210 300 Q260 210 350 150 T480 130" stroke="%237f1008" stroke-width="5" fill="none"/><path d="M210 300 Q170 380 230 480" stroke="%235a0904" stroke-width="6" fill="none"/><circle cx="320" cy="270" r="3" fill="%23991b1b"/><circle cx="340" cy="250" r="2.5" fill="%237f1d1d"/><circle cx="290" cy="330" r="3" fill="%23991b1b"/><circle cx="410" cy="280" r="2.5" fill="%237f1d1d"/><circle cx="360" cy="380" r="2" fill="%23991b1b"/><circle cx="430" cy="340" r="2.5" fill="%23991b1b"/></svg>`
  },
  {
    id: 'sample-moderate',
    title: 'Case C: Moderate NPDR (Hard Exudates)',
    grade: 'LEVEL_2',
    description: 'Cotton wool spots, distinct hard lipid exudates near macula, venous dilation.',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23992209"/><stop offset="70%" stop-color="%23681404"/><stop offset="95%" stop-color="%23310701"/><stop offset="100%" stop-color="%23100200"/></radialGradient><radialGradient id="disc" cx="45%" cy="50%" r="50%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="70%" stop-color="%23ea580c"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="3"/></filter></defs><circle cx="300" cy="300" r="280" fill="url(%23bg)"/><circle cx="210" cy="300" r="38" fill="url(%23disc)" filter="url(%23blur)"/><path d="M210 300 Q270 200 360 150 T480 130" stroke="%237f1008" stroke-width="6.5" fill="none"/><path d="M210 300 Q280 390 380 430 T490 460" stroke="%238a1209" stroke-width="6" fill="none"/><ellipse cx="380" cy="330" rx="9" ry="5" fill="%23fef08a" opacity="0.9"/><ellipse cx="395" cy="320" rx="7" ry="4" fill="%23fef08a" opacity="0.9"/><ellipse cx="370" cy="345" rx="8" ry="4" fill="%23fef08a" opacity="0.85"/><circle cx="330" cy="240" r="7" fill="%23fee2e2" opacity="0.75" filter="url(%23blur)"/><circle cx="420" cy="380" r="8" fill="%23fee2e2" opacity="0.7" filter="url(%23blur)"/><circle cx="310" cy="290" r="4.5" fill="%237f1d1d"/><circle cx="350" cy="280" r="4" fill="%23991b1b"/><circle cx="440" cy="310" r="5" fill="%237f1d1d"/><circle cx="280" cy="360" r="3.5" fill="%23991b1b"/></svg>`
  },
  {
    id: 'sample-severe',
    title: 'Case D: Severe NPDR / Proliferative (High Risk)',
    grade: 'LEVEL_4',
    description: 'Extensive intraretinal hemorrhages in 4 quadrants, neovascularization, urgent referral.',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23881c06"/><stop offset="70%" stop-color="%23560f03"/><stop offset="95%" stop-color="%23240501"/><stop offset="100%" stop-color="%230c0200"/></radialGradient><radialGradient id="disc" cx="45%" cy="50%" r="50%"><stop offset="0%" stop-color="%23fdba74"/><stop offset="70%" stop-color="%23c2410c"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="300" cy="300" r="280" fill="url(%23bg)"/><circle cx="210" cy="300" r="38" fill="url(%23disc)"/><path d="M210 300 Q270 200 370 140 T500 130" stroke="%237f1008" stroke-width="7" fill="none"/><path d="M210 300 Q270 390 390 440 T510 470" stroke="%238a1209" stroke-width="7" fill="none"/><path d="M210 300 Q230 260 250 240 Q270 250 260 280 Z" fill="%23991b1b" opacity="0.8"/><ellipse cx="320" cy="220" rx="18" ry="8" fill="%237f1d1d" opacity="0.85"/><ellipse cx="430" cy="250" rx="22" ry="10" fill="%237f1d1d" opacity="0.85"/><ellipse cx="280" cy="390" rx="16" ry="9" fill="%237f1d1d" opacity="0.85"/><ellipse cx="390" cy="390" rx="20" ry="11" fill="%237f1d1d" opacity="0.85"/><circle cx="350" cy="320" r="14" fill="%23450a0a" opacity="0.9"/><circle cx="370" cy="305" r="5" fill="%23fef08a" opacity="0.9"/><circle cx="385" cy="315" r="4" fill="%23fef08a" opacity="0.9"/><circle cx="360" cy="335" r="6" fill="%23fef08a" opacity="0.9"/><circle cx="470" cy="300" r="12" fill="%237f1d1d" opacity="0.7" filter="url(%23blur)"/></svg>`
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 1,
    patientCode: 'PAT-2026-001',
    age: 58,
    gender: 'Male',
    diabetic: true
  },
  {
    id: 2,
    patientCode: 'PAT-2026-002',
    age: 46,
    gender: 'Female',
    diabetic: true
  },
  {
    id: 3,
    patientCode: 'PAT-2026-003',
    age: 64,
    gender: 'Male',
    diabetic: true
  },
  {
    id: 4,
    patientCode: 'PAT-2026-004',
    age: 39,
    gender: 'Female',
    diabetic: false
  },
  {
    id: 5,
    patientCode: 'PAT-2026-005',
    age: 71,
    gender: 'Male',
    diabetic: true
  }
];

export const INITIAL_SCREENINGS = [
  {
    id: 101,
    patientId: 1,
    patientCode: 'PAT-2026-001',
    status: 'COMPLETED',
    qualityScore: 0.96,
    gradable: true,
    drGrade: 'LEVEL_0',
    confidence: 0.964,
    referable: false,
    probabilities: {
      'No DR': 0.964,
      'Mild DR': 0.024,
      'Moderate DR': 0.007,
      'Severe DR': 0.003,
      'Proliferative DR': 0.002
    },
    imageUrl: SAMPLE_FUNDUS_IMAGES[0].dataUrl,
    createdAt: '2026-09-10T10:15:00'
  },
  {
    id: 102,
    patientId: 3,
    patientCode: 'PAT-2026-003',
    status: 'COMPLETED',
    qualityScore: 0.91,
    gradable: true,
    drGrade: 'LEVEL_3',
    confidence: 0.892,
    referable: true,
    probabilities: {
      'No DR': 0.012,
      'Mild DR': 0.034,
      'Moderate DR': 0.062,
      'Severe DR': 0.892,
      'Proliferative DR': 0.000
    },
    imageUrl: SAMPLE_FUNDUS_IMAGES[3].dataUrl,
    createdAt: '2026-09-11T14:40:00'
  },
  {
    id: 103,
    patientId: 2,
    patientCode: 'PAT-2026-002',
    status: 'COMPLETED',
    qualityScore: 0.94,
    gradable: true,
    drGrade: 'LEVEL_1',
    confidence: 0.875,
    referable: false,
    probabilities: {
      'No DR': 0.085,
      'Mild DR': 0.875,
      'Moderate DR': 0.030,
      'Severe DR': 0.006,
      'Proliferative DR': 0.004
    },
    imageUrl: SAMPLE_FUNDUS_IMAGES[1].dataUrl,
    createdAt: '2026-09-11T16:20:00'
  },
  {
    id: 104,
    patientId: 5,
    patientCode: 'PAT-2026-005',
    status: 'COMPLETED',
    qualityScore: 0.88,
    gradable: true,
    drGrade: 'LEVEL_4',
    confidence: 0.931,
    referable: true,
    probabilities: {
      'No DR': 0.006,
      'Mild DR': 0.014,
      'Moderate DR': 0.049,
      'Severe DR': 0.000,
      'Proliferative DR': 0.931
    },
    imageUrl: SAMPLE_FUNDUS_IMAGES[3].dataUrl,
    createdAt: '2026-09-12T05:10:00'
  }
];

// DR Clinical Grade Meta Info
export const DR_GRADE_INFO = {
  LEVEL_0: {
    label: 'Level 0 — No DR',
    shortLabel: 'Normal',
    severity: 'none',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    barColor: 'bg-emerald-500',
    referral: false,
    description: 'No microaneurysms or lesions detected. Retinal vasculature appears within normal clinical limits.',
    action: 'Schedule routine annual diabetic eye screening in 12 months.'
  },
  LEVEL_1: {
    label: 'Level 1 — Mild NPDR',
    shortLabel: 'Mild NPDR',
    severity: 'mild',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    barColor: 'bg-amber-500',
    referral: false,
    description: 'Microaneurysms only. Early disease progression without immediate macular threat.',
    action: 'Emphasize optimal glycemic and blood pressure control. Re-screen in 6-12 months.'
  },
  LEVEL_2: {
    label: 'Level 2 — Moderate NPDR',
    shortLabel: 'Moderate NPDR',
    severity: 'moderate',
    color: 'orange',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    barColor: 'bg-orange-500',
    referral: true,
    description: 'More than microaneurysms, with hard exudates or cotton-wool spots, but less than severe criteria.',
    action: 'Comprehensive ophthalmology evaluation within 3 to 6 months.'
  },
  LEVEL_3: {
    label: 'Level 3 — Severe NPDR',
    shortLabel: 'Severe NPDR',
    severity: 'severe',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    barColor: 'bg-rose-500',
    referral: true,
    description: 'Meets 4-2-1 rule: venous beading in ≥2 quadrants, IRMA in ≥1 quadrant, or extensive hemorrhages in 4 quadrants.',
    action: 'URGENT: Refer to vitreoretinal specialist within 2-4 weeks for anti-VEGF or laser evaluation.'
  },
  LEVEL_4: {
    label: 'Level 4 — Proliferative DR',
    shortLabel: 'Proliferative DR',
    severity: 'critical',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    barColor: 'bg-purple-500',
    referral: true,
    description: 'Presence of neovascularization (NVD/NVE), preretinal or vitreous hemorrhage. Critical vision threat.',
    action: 'CRITICAL: Prompt emergency ophthalmological referral (within 24-48 hours) for panretinal photocoagulation.'
  }
};
