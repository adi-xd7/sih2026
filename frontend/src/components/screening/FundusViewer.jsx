import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  Eye,
  Grid,
  SunMedium,
  Contrast
} from 'lucide-react';

export default function FundusViewer({ imageUrl, patientCode, screeningId }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [redFree, setRedFree] = useState(false);
  const [invert, setInvert] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.8));

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setRedFree(false);
    setInvert(false);
    setShowGrid(false);
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
      setIsFullscreen(false);
    }
  };

  // Build CSS filter string
  const filterStyle = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    ${invert ? 'invert(1)' : ''}
    ${redFree ? 'hue-rotate(90deg) saturate(1.8) contrast(1.2)' : ''}
  `;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 ${
        isFullscreen ? 'h-screen w-screen p-4' : 'h-[440px] md:h-[500px]'
      }`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="rounded-lg bg-slate-900/85 px-3 py-1 text-xs font-mono text-slate-300 border border-slate-700/80 backdrop-blur-md">
            {patientCode || 'Retinal Fundus Image'}
          </span>
          {screeningId && (
            <span className="rounded-lg bg-brand-500/20 px-2.5 py-1 text-xs font-mono text-brand-300 border border-brand-500/30 backdrop-blur-md">
              Scan #{screeningId}
            </span>
          )}
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md">
          <button
            onClick={() => setRedFree(!redFree)}
            title="Toggle Red-Free Filter (Ophthalmic Green Channel)"
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
              redFree
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Red-Free
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Retinal Quadrant Grid"
            className={`rounded-lg p-1.5 text-xs transition-all ${
              showGrid
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setInvert(!invert)}
            title="Invert Colors"
            className={`rounded-lg p-1.5 text-xs transition-all ${
              invert
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Area */}
      <div
        className={`relative flex-1 flex items-center justify-center overflow-hidden select-none ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {imageUrl ? (
          <div
            className="transition-transform duration-75 origin-center will-change-transform max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              filter: filterStyle
            }}
          >
            <img
              src={imageUrl}
              alt="Retinal Fundus Scan"
              className="max-h-[380px] md:max-h-[440px] w-auto object-contain rounded-full shadow-2xl pointer-events-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Eye className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-slate-600" />
            <p className="text-sm">No fundus image loaded</p>
          </div>
        )}

        {/* Retinal Quadrant Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[360px] h-[360px] rounded-full border-2 border-dashed border-cyan-400/40 relative">
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50" />
              {/* Vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50" />
              {/* Labels */}
              <span className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400/80">
                Superior-Temporal
              </span>
              <span className="absolute top-2 right-3 text-[10px] font-mono text-cyan-400/80">
                Superior-Nasal
              </span>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-400/80">
                Inferior-Temporal
              </span>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono text-cyan-400/80">
                Inferior-Nasal
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Inspection Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 p-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md pointer-events-auto">
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-1 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sliders for Brightness / Contrast */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/85 px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md pointer-events-auto text-xs">
          <div className="flex items-center gap-1.5">
            <SunMedium className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="160"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-16 accent-brand-500 cursor-pointer h-1"
              title="Brightness"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Contrast className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="50"
              max="180"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-16 accent-brand-500 cursor-pointer h-1"
              title="Contrast"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
