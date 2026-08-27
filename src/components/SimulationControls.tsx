import React from 'react';
import { CameraPreset, SimulationConfig, WindMode } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Layers,
  Wind,
  Eye,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SimulationControlsProps {
  config: SimulationConfig;
  currentTime: number;
  onConfigChange: (updater: (prev: SimulationConfig) => SimulationConfig) => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  onPresetChange: (preset: CameraPreset) => void;
  isCompact?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  config,
  currentTime,
  onConfigChange,
  onSeek,
  onReset,
  onPresetChange,
  isCompact = false,
}) => {
  const [localCompact, setLocalCompact] = React.useState<boolean>(isCompact);

  return (
    <div
      id="simulation-control-dock"
      className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-[96%] max-w-5xl glass-panel rounded-xl p-2 sm:p-2.5 border border-slate-700/80 shadow-2xl z-40 bg-slate-950/90 backdrop-blur-lg transition-all"
    >
      <div className="flex flex-col gap-2">
        {/* Top Control Line: Timeline Scrubber + Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Play / Pause / Reset & Speed */}
          <div className="flex items-center gap-1.5 font-mono-tech text-xs">
            <button
              id="btn-play-pause"
              onClick={() => onConfigChange((c) => ({ ...c, isPlaying: !c.isPlaying }))}
              className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center"
              title={config.isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            >
              {config.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              id="btn-reset-timeline"
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title="Reset Timeline to 0.0s"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Playback speed buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-1">
              {[0.2, 1.0, 2.0, 5.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onConfigChange((c) => ({ ...c, playbackSpeed: spd }))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    config.playbackSpeed === spd
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd === 0.2 ? '0.2x' : `${spd}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Time Scrubber (0.0s to 6.0s) */}
          <div className="flex-1 min-w-[180px] flex items-center gap-2.5 font-mono-tech">
            <span className="text-xs font-bold text-cyan-300 min-w-[42px]">
              {currentTime.toFixed(2)}s
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                id="timeline-scrubber"
                type="range"
                min={0}
                max={6}
                step={0.02}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-400 min-w-[32px]">6.0s</span>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => onConfigChange((c) => ({ ...c, audioEnabled: !c.audioEnabled }))}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                config.audioEnabled
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title={config.audioEnabled ? 'Mute Audio Synth' : 'Enable Audio Synth'}
            >
              {config.audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => onConfigChange((c) => ({ ...c, showLabels: !c.showLabels }))}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono-tech ${
                config.showLabels
                  ? 'bg-slate-800 text-slate-100 border-slate-600'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Toggle Labels"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onConfigChange((c) => ({ ...c, xrayMode: !c.xrayMode }))}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono-tech ${
                config.xrayMode
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
              title="Toggle Generator Cutaway X-Ray"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setLocalCompact((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] cursor-pointer"
              title={localCompact ? 'Show wind & camera options' : 'Hide wind & camera options'}
            >
              {localCompact ? 'More ▾' : 'Less ▴'}
            </button>
          </div>
        </div>

        {/* Expandable Bottom Row: Wind Modes & Camera Presets */}
        {!localCompact && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-xs font-mono-tech">
            {/* Wind Mode Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                <Wind className="h-3 w-3 text-cyan-400" /> Wind:
              </span>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {[
                  { id: '3phase', label: '3-Phase Gust' },
                  { id: 'steady', label: 'Steady 12m/s' },
                  { id: 'turbulence', label: 'Turbulence' },
                  { id: 'custom', label: 'Custom' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onConfigChange((c) => ({ ...c, windMode: m.id as WindMode }))}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      config.windMode === m.id
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Wind Speed Slider when mode is custom */}
            {config.windMode === 'custom' && (
              <div className="flex items-center gap-2 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Speed:</span>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={0.5}
                  value={config.customWindSpeed}
                  onChange={(e) =>
                    onConfigChange((c) => ({ ...c, customWindSpeed: parseFloat(e.target.value) }))
                  }
                  className="w-16 h-1 bg-slate-700 rounded appearance-none accent-cyan-400"
                />
                <span className="text-[10px] text-cyan-300 font-bold">{config.customWindSpeed} m/s</span>
              </div>
            )}

            {/* Camera View Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                <Camera className="h-3 w-3 text-slate-400" /> Camera:
              </span>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {[
                  { id: 'dual', label: 'Dual View' },
                  { id: 'classical_sensor', label: 'Classical' },
                  { id: 'quantum_sensor', label: 'Quantum' },
                  { id: 'top_down', label: 'Top-Down' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => onPresetChange(cam.id as CameraPreset)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      config.cameraPreset === cam.id
                        ? 'bg-slate-700 text-cyan-300 font-bold border border-slate-600'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
