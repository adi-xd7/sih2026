import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d, Play, Pause, Info, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Creates a photorealistic procedural texture for the human eyeball
 */
function generateRealisticEyeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // 1. Natural Sclera Base (subtle ivory-white gradient)
  const scleraGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  scleraGrad.addColorStop(0, '#f8fafc');
  scleraGrad.addColorStop(0.3, '#f1f5f9');
  scleraGrad.addColorStop(0.5, '#ffffff');
  scleraGrad.addColorStop(0.7, '#f1f5f9');
  scleraGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = scleraGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Microvascular Scleral Capillaries (fine branching red vessels)
  ctx.save();
  const vesselSeeds = [
    { startX: 180, startY: 120, len: 160, angle: 0.3 },
    { startX: 220, startY: 380, len: 140, angle: -0.25 },
    { startX: 840, startY: 150, len: 150, angle: Math.PI - 0.3 },
    { startX: 800, startY: 360, len: 130, angle: Math.PI + 0.2 },
    { startX: 320, startY: 90, len: 110, angle: 0.8 },
    { startX: 710, startY: 420, len: 120, angle: Math.PI + 0.7 },
    { startX: 250, startY: 260, len: 130, angle: 0.05 },
    { startX: 770, startY: 250, len: 140, angle: Math.PI - 0.05 }
  ];

  vesselSeeds.forEach(({ startX, startY, len, angle }) => {
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.22)'; // Delicate blood vessel crimson
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let curX = startX;
    let curY = startY;
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      curX += Math.cos(angle) * (len / steps) + (Math.random() - 0.5) * 8;
      curY += Math.sin(angle) * (len / steps) + (Math.random() - 0.5) * 8;
      ctx.lineTo(curX, curY);

      // Small secondary branch
      if (i === 6 || i === 10) {
        ctx.save();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.16)';
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(curX + (Math.random() - 0.5) * 25, curY + (Math.random() - 0.5) * 25);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.stroke();
  });
  ctx.restore();

  // 3. Anterior Center: Iris & Pupil (located at u=0.5, v=0.5 -> x=512, y=256)
  const centerX = 512;
  const centerY = 256;
  const irisRadius = 135;
  const pupilRadius = 42;

  // Outer Limbal Ring (dark border around iris)
  const limbusGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    irisRadius - 15,
    centerX,
    centerY,
    irisRadius + 6
  );
  limbusGrad.addColorStop(0, '#042f2e');
  limbusGrad.addColorStop(0.7, '#0f172a');
  limbusGrad.addColorStop(1, 'rgba(248, 250, 252, 0)');
  ctx.fillStyle = limbusGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, irisRadius + 6, 0, Math.PI * 2);
  ctx.fill();

  // Iris Base Color (rich medical hazel-cyan/teal)
  const irisBaseGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    pupilRadius,
    centerX,
    centerY,
    irisRadius
  );
  irisBaseGrad.addColorStop(0, '#0f766e'); // Deep teal pupillary zone
  irisBaseGrad.addColorStop(0.35, '#0d9488'); // Vibrant ciliary zone
  irisBaseGrad.addColorStop(0.7, '#115e59'); // Mid striae
  irisBaseGrad.addColorStop(0.95, '#042f2e'); // Outer edge
  ctx.fillStyle = irisBaseGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Realistic Radial Iris Fibers & Trabecular Striae
  ctx.save();
  const fiberCount = 520;
  for (let i = 0; i < fiberCount; i++) {
    const theta = (i / fiberCount) * Math.PI * 2;
    const rStart = pupilRadius + (Math.random() * 4);
    const rEnd = irisRadius - (Math.random() * 5);

    const x1 = centerX + Math.cos(theta) * rStart;
    const y1 = centerY + Math.sin(theta) * rStart;

    // Slight organic wave
    const midR = (rStart + rEnd) * 0.5;
    const waveOffset = (Math.random() - 0.5) * 0.04;
    const xMid = centerX + Math.cos(theta + waveOffset) * midR;
    const yMid = centerY + Math.sin(theta + waveOffset) * midR;

    const x2 = centerX + Math.cos(theta) * rEnd;
    const y2 = centerY + Math.sin(theta) * rEnd;

    ctx.strokeStyle =
      i % 4 === 0
        ? 'rgba(204, 251, 241, 0.45)' // Highlight striae
        : i % 3 === 0
        ? 'rgba(45, 212, 191, 0.35)' // Soft cyan
        : i % 2 === 0
        ? 'rgba(15, 118, 110, 0.65)'
        : 'rgba(4, 47, 46, 0.5)';
    ctx.lineWidth = Math.random() * 1.4 + 0.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(xMid, yMid, x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // Iris Contraction Furrows (delicate concentric rings in ciliary zone)
  ctx.save();
  [pupilRadius + 45, pupilRadius + 65, pupilRadius + 82].forEach((ringR, ringIdx) => {
    ctx.strokeStyle = ringIdx % 2 === 0 ? 'rgba(4, 47, 46, 0.35)' : 'rgba(15, 118, 110, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.04) {
      const wobble = Math.sin(a * 12 + ringIdx) * 1.5;
      const rx = centerX + Math.cos(a) * (ringR + wobble);
      const ry = centerY + Math.sin(a) * (ringR + wobble);
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.stroke();
  });
  ctx.restore();

  // Crypts of Fuchs (diamond/oval trabecular openings)
  ctx.save();
  const cryptCount = 14;
  for (let c = 0; c < cryptCount; c++) {
    const angle = (c / cryptCount) * Math.PI * 2 + 0.2;
    const cryptDist = pupilRadius + 36 + (Math.random() * 12);
    const cx = centerX + Math.cos(angle) * cryptDist;
    const cy = centerY + Math.sin(angle) * cryptDist;
    
    ctx.fillStyle = 'rgba(4, 47, 46, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3.5, 2, angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(204, 251, 241, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();

  // Collarette ring (zigzag border separating pupillary and ciliary zones)
  ctx.save();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.28)'; // subtle warm collarette
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const collaretteR = pupilRadius + 32;
  for (let a = 0; a <= Math.PI * 2; a += 0.05) {
    const r = collaretteR + Math.sin(a * 18) * 3;
    const px = centerX + Math.cos(a) * r;
    const py = centerY + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // Pupil Void (Deep black center)
  ctx.fillStyle = '#020408';
  ctx.beginPath();
  ctx.arc(centerX, centerY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Sphincter Pupillae (soft inner muscle ring around pupil)
  ctx.strokeStyle = 'rgba(13, 148, 136, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, pupilRadius + 2, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Posterior Pole: Internal Retinal Window (at u=0 / u=1)
  // Anatomical fundus disc visible from rear: choroid red, branching vessels, optic disc
  [0, 1024].forEach((backCenterX) => {
    const backCenterY = 256;
    const retinaR = 120;

    const fundusGrad = ctx.createRadialGradient(
      backCenterX,
      backCenterY,
      10,
      backCenterX,
      backCenterY,
      retinaR
    );
    fundusGrad.addColorStop(0, '#991b1b');
    fundusGrad.addColorStop(0.7, '#7f1d1d');
    fundusGrad.addColorStop(1, '#f1f5f9');

    ctx.fillStyle = fundusGrad;
    ctx.beginPath();
    ctx.arc(backCenterX, backCenterY, retinaR, 0, Math.PI * 2);
    ctx.fill();

    // Optic Disc on posterior pole
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(backCenterX + (backCenterX === 0 ? 35 : -35), backCenterY - 10, 16, 0, Math.PI * 2);
    ctx.fill();

    // Macula / Fovea
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(backCenterX + (backCenterX === 0 ? -30 : 30), backCenterY + 5, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
}

export default function Eye3DModel({ height = 340 }) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activePart, setActivePart] = useState('Anterior Cornea');
  const { theme } = useTheme();

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const eyeGroupRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const h = height;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 1000);
    camera.position.set(0, 0, 3.8);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and physical tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // 4. Clinical Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (Upper right soft light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.0);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Specular highlight light (sharp glint on cornea)
    const glintLight = new THREE.PointLight(0xffffff, 2.5, 12);
    glintLight.position.set(1.5, 2.5, 3.5);
    scene.add(glintLight);

    // 5. Eye Group
    const eyeGroup = new THREE.Group();
    eyeGroupRef.current = eyeGroup;
    scene.add(eyeGroup);

    // Eye Globe with Photorealistic Texture
    const texture = generateRealisticEyeTexture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const eyeGeo = new THREE.SphereGeometry(1.15, 64, 64);
    // Rotate texture so anterior (u=0.5) faces the camera (+Z)
    eyeGeo.rotateY(Math.PI * 0.5);

    const eyeMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9
    });

    const eyeball = new THREE.Mesh(eyeGeo, eyeMat);
    eyeGroup.add(eyeball);

    // Bulging Transparent Cornea Dome sitting on anterior pole
    const corneaGeo = new THREE.SphereGeometry(0.58, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.02,
      transmission: 0.96,
      ior: 1.376, // Real refractive index of human cornea
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 2.0
    });

    const cornea = new THREE.Mesh(corneaGeo, corneaMat);
    cornea.position.set(0, 0, 0.98);
    cornea.rotation.x = Math.PI * 0.5;
    eyeGroup.add(cornea);

    // Optic Nerve Protrusion at the Posterior Pole (Back)
    const nerveGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.7, 24);
    const nerveMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.6,
      metalness: 0.05
    });
    const nerve = new THREE.Mesh(nerveGeo, nerveMat);
    nerve.position.set(-0.15, 0.05, -1.35);
    nerve.rotation.x = Math.PI * 0.5;
    nerve.rotation.y = 0.15;
    eyeGroup.add(nerve);

    // Initial anatomical display orientation (slight three-quarter tilt)
    eyeGroup.rotation.y = 0.25;
    eyeGroup.rotation.x = 0.12;

    // 6. Smooth Mouse & Touch Drag Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      eyeGroup.rotation.y += deltaX * 0.007;
      eyeGroup.rotation.x += deltaY * 0.007;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      eyeGroup.rotation.y += deltaX * 0.007;
      eyeGroup.rotation.x += deltaY * 0.007;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 7. Render Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        eyeGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      texture.dispose();
    };
  }, [height, autoRotate]);

  const viewAnterior = () => {
    setAutoRotate(false);
    if (eyeGroupRef.current) {
      eyeGroupRef.current.rotation.set(0.1, 0, 0);
      setActivePart('Anterior Cornea');
    }
  };

  const viewRetinalFundus = () => {
    setAutoRotate(false);
    if (eyeGroupRef.current) {
      eyeGroupRef.current.rotation.set(0, Math.PI, 0);
      setActivePart('Retinal Fundus (Posterior)');
    }
  };

  const viewOpticNerve = () => {
    setAutoRotate(false);
    if (eyeGroupRef.current) {
      eyeGroupRef.current.rotation.set(-0.25, Math.PI - 0.45, 0);
      setActivePart('Optic Disc & Nerve');
    }
  };

  return (
    <div className="relative rounded-2xl p-4 overflow-hidden select-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Rotate3d className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Photorealistic 3D Human Eye
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Drag to rotate 360° • Corneal reflection & Sclera veins
            </p>
          </div>
        </div>

        {/* Rotation toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
            autoRotate
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title="Toggle auto-spin"
        >
          {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="relative w-full cursor-grab active:cursor-grabbing flex items-center justify-center rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-950 dark:to-slate-900 border border-slate-100 dark:border-slate-800/80"
        style={{ height }}
      >
        {/* Floating anatomical navigation pills */}
        <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-center gap-1.5 z-10 pointer-events-auto">
          <button
            onClick={viewAnterior}
            className={`text-[11px] px-2.5 py-1 rounded-full border shadow-xs transition-all ${
              activePart === 'Anterior Cornea'
                ? 'bg-teal-600 text-white border-teal-600 font-bold'
                : 'bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            Cornea & Iris
          </button>
          <button
            onClick={viewRetinalFundus}
            className={`text-[11px] px-2.5 py-1 rounded-full border shadow-xs transition-all ${
              activePart === 'Retinal Fundus (Posterior)'
                ? 'bg-teal-600 text-white border-teal-600 font-bold'
                : 'bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            Retinal Fundus (Rear)
          </button>
          <button
            onClick={viewOpticNerve}
            className={`text-[11px] px-2.5 py-1 rounded-full border shadow-xs transition-all ${
              activePart === 'Optic Disc & Nerve'
                ? 'bg-teal-600 text-white border-teal-600 font-bold'
                : 'bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
            }`}
          >
            Optic Nerve Head
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1 font-medium">
          <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Anatomical reference for diabetic microvascular pathology
        </span>
        <span className="font-mono text-slate-400">Three.js WebGL</span>
      </div>
    </div>
  );
}
