import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ActiveViewMode, 
  CameraPreset, 
  SectionVisibility, 
  SimulationConfig, 
  TelemetryState 
} from './types';
import { TurbinePhysicsEngine } from './physics/turbineEngine';
import { ThreeCanvas } from './components/ThreeCanvas';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { TimelinePhaseBanner } from './components/TimelinePhaseBanner';
import { QuantumPhysicsModal } from './components/QuantumPhysicsModal';
import { LiveTelemetryCharts } from './components/LiveTelemetryCharts';
import { SimulationControls } from './components/SimulationControls';
import { SideBySideSpecsView } from './components/SideBySideSpecsView';
import { WaveformOscilloscopeView } from './components/WaveformOscilloscopeView';
import { QuantumLabView } from './components/QuantumLabView';
import { audioSynth } from './utils/audioSynth';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';

export default function App() {
  const engine = useMemo(() => new TurbinePhysicsEngine(), []);

  const [activeView, setActiveView] = useState<ActiveViewMode>('3d_sim');

  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    showTopTelemetry: true,
    showTurbineCards: true,
    showPhaseBanner: true,
    showWaveformOverlay: true,
    showControlsDock: true,
    immersionMode: false,
  });

  const [isTopTelemetryExpanded, setIsTopTelemetryExpanded] = useState<boolean>(false);
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState<boolean>(false);
  const [isQuantumModalOpen, setIsQuantumModalOpen] = useState<boolean>(false);
  const [isChartsOpen, setIsChartsOpen] = useState<boolean>(true);

  const [config, setConfig] = useState<SimulationConfig>({
    isPlaying: true,
    playbackSpeed: 1.0,
    windMode: '3phase',
    customWindSpeed: 12.0,
    cameraPreset: 'dual',
    xrayMode: false,
    showLabels: true,
    showStreamlines: true,
    showMagneticLines: true,
    audioEnabled: false,
  });

  const [currentTime, setCurrentTime] = useState<number>(0.0);

  // Generate or update trajectory on windMode/customSpeed changes
  const trajectory = useMemo(() => {
    return engine.generateTrajectory(config.windMode, config.customWindSpeed);
  }, [engine, config.windMode, config.customWindSpeed]);

  // Derive current telemetry state from trajectory
  const currentTelemetry = useMemo<TelemetryState>(() => {
    if (!trajectory || trajectory.length === 0) {
      return engine.generateTrajectory('3phase', 12.0)[0];
    }
    const index = Math.min(
      trajectory.length - 1,
      Math.max(0, Math.floor((currentTime / 6.0) * trajectory.length))
    );
    return trajectory[index];
  }, [trajectory, currentTime, engine]);

  // Audio synthesis update
  useEffect(() => {
    audioSynth.update(config.audioEnabled, currentTelemetry.windSpeed);
  }, [config.audioEnabled, currentTelemetry.windSpeed]);

  // Simulation Clock Loop
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (config.isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec * config.playbackSpeed;
          return next >= 6.0 ? 0.0 : next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [config.isPlaying, config.playbackSpeed]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTime(0.0);
  }, []);

  const handlePresetChange = useCallback((preset: CameraPreset) => {
    setConfig((prev) => ({
      ...prev,
      cameraPreset: preset,
      xrayMode: preset === 'xray' ? true : prev.xrayMode,
    }));
  }, []);

  const isImmersion = sectionVisibility.immersionMode;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060913] text-slate-100 flex flex-col justify-between select-none">
      {/* 1. Top Section & Navigation Bar */}
      {sectionVisibility.showTopTelemetry && !isImmersion && (
        <TelemetryOverlay
          telemetry={currentTelemetry}
          activeView={activeView}
          onSelectView={setActiveView}
          visibility={sectionVisibility}
          onVisibilityChange={setSectionVisibility}
          isVisibilityMenuOpen={isVisibilityMenuOpen}
          onToggleVisibilityMenu={() => setIsVisibilityMenuOpen((prev) => !prev)}
          onOpenQuantumModal={() => setIsQuantumModalOpen(true)}
          isExpanded={isTopTelemetryExpanded}
          onToggleExpanded={() => setIsTopTelemetryExpanded((prev) => !prev)}
        />
      )}

      {/* 2. Main Viewport Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Section 1: 3D Twin Simulation */}
        {activeView === '3d_sim' && (
          <div className="relative w-full h-full">
            <ThreeCanvas
              telemetry={currentTelemetry}
              cameraPreset={config.cameraPreset}
              xrayMode={config.xrayMode}
              showLabels={config.showLabels}
              showStreamlines={config.showStreamlines}
              showMagneticLines={config.showMagneticLines}
              showTurbineCards={sectionVisibility.showTurbineCards && !isImmersion}
              onPresetChange={handlePresetChange}
            />

            {/* Timeline Phase Banner (Bottom-Center HUD) */}
            {sectionVisibility.showPhaseBanner && !isImmersion && (
              <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 pointer-events-none">
                <TimelinePhaseBanner
                  telemetry={currentTelemetry}
                  onSelectPhase={(targetTime) => handleSeek(targetTime)}
                />
              </div>
            )}

            {/* Live Synchronized Waveform Telemetry Overlay */}
            {sectionVisibility.showWaveformOverlay && !isImmersion && (
              <LiveTelemetryCharts
                telemetry={currentTelemetry}
                trajectory={trajectory}
                isOpen={isChartsOpen}
                onToggle={() => setIsChartsOpen((prev) => !prev)}
              />
            )}
          </div>
        )}

        {/* Section 2: Comparative Specs Matrix */}
        {activeView === 'side_by_side_specs' && (
          <SideBySideSpecsView
            telemetry={currentTelemetry}
            onOpenQuantumLab={() => setActiveView('quantum_lab')}
          />
        )}

        {/* Section 3: Multi-Channel Waveform Oscilloscope */}
        {activeView === 'waveforms' && (
          <WaveformOscilloscopeView
            telemetry={currentTelemetry}
            trajectory={trajectory}
          />
        )}

        {/* Section 4: Quantum NV Metrology Lab */}
        {activeView === 'quantum_lab' && (
          <QuantumLabView telemetry={currentTelemetry} />
        )}
      </main>

      {/* 3. Bottom Interactive Simulation Controls Dock */}
      {sectionVisibility.showControlsDock && !isImmersion && (
        <SimulationControls
          config={config}
          currentTime={currentTime}
          onConfigChange={setConfig}
          onSeek={handleSeek}
          onReset={handleReset}
          onPresetChange={handlePresetChange}
        />
      )}

      {/* 4. Minimalist Floating Pill for Immersion Mode */}
      {isImmersion && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-2xl backdrop-blur-md font-mono-tech text-xs">
          <button
            onClick={() => setConfig((c) => ({ ...c, isPlaying: !c.isPlaying }))}
            className="p-1 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            {config.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <span className="text-cyan-300 font-bold">{currentTime.toFixed(2)}s</span>
          <div className="h-3 w-px bg-slate-700" />
          <button
            onClick={() =>
              setSectionVisibility((prev) => ({
                ...prev,
                immersionMode: false,
                showTopTelemetry: true,
                showControlsDock: true,
              }))
            }
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800"
            title="Exit Immersion Mode"
          >
            <Minimize2 className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px]">Exit Immersion</span>
          </button>
        </div>
      )}

      {/* 5. Quantum Diamond Physics Callout Modal */}
      <QuantumPhysicsModal
        isOpen={isQuantumModalOpen}
        onClose={() => setIsQuantumModalOpen(false)}
        telemetry={currentTelemetry}
      />
    </div>
  );
}
