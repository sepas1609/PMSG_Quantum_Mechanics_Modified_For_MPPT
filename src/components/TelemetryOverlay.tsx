import React from 'react';
import { ActiveViewMode, SectionVisibility, TelemetryState } from '../types';
import { 
  Wind, 
  Zap, 
  Sparkles, 
  Box, 
  FileText, 
  Radio, 
  Atom, 
  ChevronDown, 
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { SectionVisibilityMenu } from './SectionVisibilityMenu';

interface TelemetryOverlayProps {
  telemetry: TelemetryState;
  activeView: ActiveViewMode;
  onSelectView: (view: ActiveViewMode) => void;
  visibility: SectionVisibility;
  onVisibilityChange: (updater: (prev: SectionVisibility) => SectionVisibility) => void;
  isVisibilityMenuOpen: boolean;
  onToggleVisibilityMenu: () => void;
  onOpenQuantumModal: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  telemetry,
  activeView,
  onSelectView,
  visibility,
  onVisibilityChange,
  isVisibilityMenuOpen,
  onToggleVisibilityMenu,
  onOpenQuantumModal,
  isExpanded,
  onToggleExpanded,
}) => {
  const isGust = telemetry.phaseNumber === 2;

  const views: { id: ActiveViewMode; label: string; icon: React.ReactNode }[] = [
    { id: '3d_sim', label: '3D Twin Simulator', icon: <Box className="h-3.5 w-3.5" /> },
    { id: 'side_by_side_specs', label: 'Comparative Specs', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'waveforms', label: 'Waveform Oscilloscope', icon: <Radio className="h-3.5 w-3.5" /> },
    { id: 'quantum_lab', label: 'Quantum NV Lab', icon: <Atom className="h-3.5 w-3.5" /> },
  ];

  return (
    <header
      id="telemetry-top-overlay"
      className="w-full glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-2.5 shadow-2xl z-30 transition-all font-mono-tech select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Navigation & Section Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand & Section Tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
              </div>
              <span className="font-display font-bold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-emerald-300 hidden sm:inline">
                PMSG MPPT
              </span>
            </div>

            {/* View Mode Switcher */}
            <nav className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 text-xs">
              {views.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  onClick={() => onSelectView(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeView === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Wind & Power Live Telemetry Badge + Controls */}
          <div className="flex items-center gap-2">
            {/* Live Metrics Pill */}
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1">
                <Wind className={`h-3.5 w-3.5 ${isGust ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className="text-[11px] text-slate-400">Wind:</span>
                <span className={`font-bold ${isGust ? 'text-amber-300' : 'text-cyan-300'}`}>
                  {telemetry.windSpeed.toFixed(1)} m/s
                </span>
              </div>

              <div className="h-3 w-px bg-slate-800" />

              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] text-slate-400">Avail:</span>
                <span className="font-bold text-amber-300">
                  {telemetry.availablePower.toFixed(2)} kW
                </span>
              </div>

              <div className="h-3 w-px bg-slate-800 hidden sm:block" />

              {/* Live Quantum Delta Pill */}
              <div className="items-center gap-1 text-emerald-400 hidden sm:flex">
                <span className="text-[10px] text-emerald-500 font-bold">GAIN:</span>
                <span className="font-bold">
                  +{(telemetry.deltaPowerKw * 1000).toFixed(0)}W
                </span>
              </div>
            </div>

            {/* Section Visibility Popover Menu */}
            <SectionVisibilityMenu
              visibility={visibility}
              onChange={onVisibilityChange}
              isOpen={isVisibilityMenuOpen}
              onToggleOpen={onToggleVisibilityMenu}
            />

            {/* Toggle Detailed Telemetry Metrics Grid */}
            <button
              id="btn-toggle-telemetry-expand"
              onClick={onToggleExpanded}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse Telemetry Grid' : 'Expand Telemetry Grid'}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Side-by-side Telemetry Data Grid */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80 transition-all duration-200">
            {/* Classical Turbine Metrics Box */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-red-400">CLASSICAL:</span>
                <span className="font-bold text-slate-100">{telemetry.classical.extractedPower.toFixed(2)} kW</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span>MPPT η: <strong className="text-red-300">{telemetry.classical.efficiency.toFixed(1)}%</strong></span>
                <span>D: <strong className="text-amber-300">{telemetry.classical.dutyCycle.toFixed(3)}</strong></span>
                <span>Energy: <strong className="text-red-300">{telemetry.classical.cumulativeEnergy.toFixed(2)} Wh</strong></span>
              </div>
            </div>

            {/* Quantum Turbine Metrics Box */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-3 py-1.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span className="font-bold text-emerald-400">QUANTUM NV:</span>
                <span className="font-bold text-emerald-200">{telemetry.quantum.extractedPower.toFixed(2)} kW</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span>MPPT η: <strong className="text-emerald-300">{telemetry.quantum.efficiency.toFixed(1)}%</strong></span>
                <span>D: <strong className="text-cyan-300">{telemetry.quantum.dutyCycle.toFixed(3)}</strong></span>
                <span>Energy: <strong className="text-emerald-300">{telemetry.quantum.cumulativeEnergy.toFixed(2)} Wh</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
