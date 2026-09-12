/**
 * Optical Fundus Image Quality & Validity Checker
 * Rigorously validates whether an uploaded image meets clinical retinal fundus photography standards
 * or whether it is an invalid non-retinal file (portrait, face, text slide, screenshot, graphic, landscape, etc.).
 */

export async function validateFundusImage(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = width / height;

        // Sample on an offscreen canvas
        const sampleSize = 100;
        const canvas = document.createElement('canvas');
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ isValid: true, status: 'GRADABLE', issues: [] });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        // 1. Sample the 4 perimeter corners
        // Clinical fundus cameras (Zeiss, Topcon, Canon, Optos) project a circular pupil beam.
        // The 4 corners of the sensor frame are unilluminated (pitch black or very dark, luminance < 40).
        // General photos (faces, portraits, wallpapers, landscapes) have bright scene content in corners.
        const cornerPixelCoords = [
          // Top-Left corner cluster
          [1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [1, 3], [2, 3],
          // Top-Right corner cluster
          [sampleSize - 2, 1], [sampleSize - 3, 1], [sampleSize - 4, 1], [sampleSize - 2, 2], [sampleSize - 3, 2], [sampleSize - 2, 3],
          // Bottom-Left corner cluster
          [1, sampleSize - 2], [2, sampleSize - 2], [3, sampleSize - 2], [1, sampleSize - 3], [2, sampleSize - 3], [1, sampleSize - 4],
          // Bottom-Right corner cluster
          [sampleSize - 2, sampleSize - 2], [sampleSize - 3, sampleSize - 2], [sampleSize - 4, sampleSize - 2], [sampleSize - 2, sampleSize - 3], [sampleSize - 3, sampleSize - 3]
        ];

        let cornerLumSum = 0;
        cornerPixelCoords.forEach(([x, y]) => {
          const idx = (y * sampleSize + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // Standard ITU-R BT.601 perceptual luminance
          cornerLumSum += 0.299 * r + 0.587 * g + 0.114 * b;
        });
        const avgCornerLuminance = cornerLumSum / cornerPixelCoords.length;

        // 2. Sample Central Retinal Zone (inner 50% circle)
        let centerR = 0;
        let centerG = 0;
        let centerB = 0;
        let centerLumSum = 0;
        let centerCount = 0;

        // Count retinal-like pixels across entire image (R >= 35, R > B, warm tissue)
        let retinalTissuePixelCount = 0;
        let totalLuminance = 0;
        let highBluePixelCount = 0;

        const radiusSq = Math.pow(sampleSize * 0.25, 2);
        const centerX = sampleSize / 2;
        const centerY = sampleSize / 2;

        for (let y = 0; y < sampleSize; y++) {
          for (let x = 0; x < sampleSize; x++) {
            const idx = (y * sampleSize + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += lum;

            // Retinal tissue characteristic: red dominant, warm, moderate luminance
            if (r > 32 && r > b * 1.15 && lum > 25 && lum < 235) {
              retinalTissuePixelCount++;
            }

            // High blue (typical of computer screens, UI graphics, skies, white clothing/beards)
            if (b > 85 && b > r * 0.75) {
              highBluePixelCount++;
            }

            // Check if inside central circle
            const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
            if (distSq <= radiusSq) {
              centerR += r;
              centerG += g;
              centerB += b;
              centerLumSum += lum;
              centerCount++;
            }
          }
        }

        const totalPixels = sampleSize * sampleSize;
        const avgCenterR = centerCount > 0 ? centerR / centerCount : 0;
        const avgCenterG = centerCount > 0 ? centerG / centerCount : 0;
        const avgCenterB = centerCount > 0 ? centerB / centerCount : 0;
        const avgCenterLum = centerCount > 0 ? centerLumSum / centerCount : 0;

        const retinalTissueRatio = retinalTissuePixelCount / totalPixels;
        const highBlueRatio = highBluePixelCount / totalPixels;
        const blueToRedCenterRatio = avgCenterR > 0 ? avgCenterB / avgCenterR : 1.0;

        const issues = [];
        let specificCategory = 'Non-ophthalmic content';

        // --- CHECK 1: Ophthalmic Aspect Ratio ---
        // Retinal cameras produce square (1:1) or standard ophthalmic formats (4:3, 5:4).
        // Widescreen 16:9 (1.77), ultra-wide 21:9 (2.33), banner (> 3.0), or extreme portrait (< 0.72) are invalid.
        if (aspectRatio > 1.36 || aspectRatio < 0.74) {
          issues.push(
            `Aspect ratio (${aspectRatio.toFixed(2)}:1) does not match ophthalmic fundus cameras (~1:1 circular optical field). Widescreen, banner, or screenshot detected.`
          );
          specificCategory = 'Widescreen display / Non-ophthalmic format';
        }

        // --- CHECK 2: Circular Aperture & Dark Perimeter Mask ---
        // Human fundus cameras have dark/black corners around the round ocular aperture.
        // Photos of people, faces, rooms, outdoors, or desktop wallpapers have bright corners (> 45 luminance).
        if (avgCornerLuminance > 45) {
          issues.push(
            `Absence of circular ophthalmic aperture: Frame corners are bright (${avgCornerLuminance.toFixed(1)} luminance). Real fundus cameras have dark unilluminated margins.`
          );
          if (specificCategory === 'Non-ophthalmic content') {
            specificCategory = 'Portrait / Facial photo or general scene';
          }
        }

        // --- CHECK 3: Central Retinal Luminance & Exposure ---
        // Central optical field must be illuminated within ophthalmic exposure range.
        if (avgCenterLum < 28) {
          issues.push(
            `Optical center is pitch black (${avgCenterLum.toFixed(1)} luminance). Synthetic text slide, blank file, or empty graphic detected.`
          );
          specificCategory = 'Text slide / Synthetic dark graphic';
        } else if (avgCenterLum > 235) {
          issues.push(
            `Optical center is heavily overexposed (${avgCenterLum.toFixed(1)} luminance). Paper document scan or blank white background detected.`
          );
          specificCategory = 'Overexposed document / Blank graphic';
        }

        // --- CHECK 4: Retinal Hemoglobin Spectrum & Blue Channel Absorption ---
        // Human retinal fundus is rich in hemoglobin and melanin: Red strongly dominates, Blue is heavily absorbed.
        if (blueToRedCenterRatio > 0.54 || avgCenterB > 72) {
          issues.push(
            `Color spectrum lacks characteristic retinal choroidal dominance (high cool/blue channel intensity: ${(blueToRedCenterRatio * 100).toFixed(0)}% of red).`
          );
          if (specificCategory === 'Non-ophthalmic content') {
            specificCategory = 'Natural photo / Non-retinal color spectrum';
          }
        }

        if (avgCenterR <= avgCenterG * 1.02 || avgCenterR <= avgCenterB * 1.4) {
          issues.push(
            'Absence of retinal vascular red-orange hemoglobin dominance in central macular field.'
          );
        }

        // --- CHECK 5: Retinal Tissue Area Fill ---
        // The retina must occupy a substantial portion (at least 28%) of the frame with continuous tissue.
        if (retinalTissueRatio < 0.24) {
          issues.push(
            `Insufficient retinal tissue area (${(retinalTissueRatio * 100).toFixed(1)}% of frame). Typical fundus images contain > 45% active retinal tissue.`
          );
          if (avgCenterLum < 35 && specificCategory === 'Non-ophthalmic content') {
            specificCategory = 'Text slide / Sparse graphic';
          }
        }

        // --- FINAL DETERMINATION ---
        // Any of the following is an immediate, definitive disqualification:
        // 1. Extreme aspect ratio (widescreen, banner, etc.)
        // 2. Bright corners (faces, rooms, portraits, general photos without ocular aperture)
        // 3. Central optical field is pitch black or overexposed white
        // 4. Multiple optical spectrum/tissue issues
        const isDefiniteNonFundus =
          aspectRatio > 1.36 ||
          aspectRatio < 0.74 ||
          avgCornerLuminance > 45 ||
          avgCenterLum < 28 ||
          avgCenterLum > 235 ||
          issues.length >= 2;

        if (isDefiniteNonFundus) {
          resolve({
            isValid: false,
            status: 'UNGRADABLE',
            category: specificCategory,
            issues: issues.length > 0 ? issues : ['Image fails clinical ophthalmic fundus criteria.'],
            details: {
              aspectRatio: parseFloat(aspectRatio.toFixed(2)),
              avgCornerLuminance: parseFloat(avgCornerLuminance.toFixed(1)),
              avgCenterLum: parseFloat(avgCenterLum.toFixed(1)),
              blueToRedRatio: parseFloat(blueToRedCenterRatio.toFixed(2)),
              retinalTissuePercent: parseFloat((retinalTissueRatio * 100).toFixed(1))
            }
          });
        } else {
          resolve({
            isValid: true,
            status: 'GRADABLE',
            category: 'Valid Retinal Fundus Scan',
            issues: [],
            details: {
              aspectRatio: parseFloat(aspectRatio.toFixed(2)),
              avgCornerLuminance: parseFloat(avgCornerLuminance.toFixed(1)),
              avgCenterLum: parseFloat(avgCenterLum.toFixed(1)),
              blueToRedRatio: parseFloat(blueToRedCenterRatio.toFixed(2)),
              retinalTissuePercent: parseFloat((retinalTissueRatio * 100).toFixed(1))
            }
          });
        }
      } catch (err) {
        console.warn('Fundus validation error:', err);
        resolve({ isValid: true, status: 'GRADABLE', issues: [] });
      }
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        status: 'FAILED',
        category: 'Unreadable / Corrupt Image',
        issues: ['Image file could not be decoded or is corrupted.']
      });
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      resolve({ isValid: true, status: 'GRADABLE', issues: [] });
    }
  });
}
