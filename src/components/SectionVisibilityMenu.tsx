import React from 'react';
import { SectionVisibility } from '../types';
import { 
  Sliders, 
  Eye, 
  EyeOff, 
  LayoutGrid, 
  Tv, 
  Maximize2, 
  Minimize2, 
  Check,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface SectionVisibilityMenuProps {
  visibility: SectionVisibility;
  onChange: (updater: (prev: SectionVisibility) => SectionVisibility) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SectionVisibilityMenu: React.FC<SectionVisibilityMenuProps> = ({
  visibility,
  onChange,
  isOpen,
  onToggleOpen,
}) => {
  const applyPreset = (preset: 'balanced' | 'minimal' | 'analytics' | 'immersion') => {
    if (preset === 'balanced') {
      onChange(() => ({
        showTopTelemetry: true,
        showTurbineCards: true,
        showPhaseBanner: true,
        showWaveformOverlay: true,
        showControlsDock: true,
        immersionMode: false,
      }));
    } else if (preset === 'minimal') {
      onChange(() => ({
        showTopTelemetry: false,
        showTurbineCards: false,
        showPhaseBanner: false,
        showWaveformOverlay: false,
        showControlsDock: true,
        immersionMode: false,
      }));
    } else if (preset === 'analytics') {
      onChange(() => ({
        showTopTelemetry: true,
        showTurbineCards: true,
        showPhaseBanner: true,
        showWaveformOverlay: true,
        showControlsDock: true,
        immersionMode: false,
      }));
    } else if (preset === 'immersion') {
      onChange(() => ({
        showTopTelemetry: false,
        showTurbineCards: false,
        showPhaseBanner: false,
        showWaveformOverlay: false,
        showControlsDock: false,
        immersionMode: true,
      }));
    }
  };

  return (
    <div className="relative font-mono-tech">
      <button
        id="btn-section-visibility-menu"
        onClick={onToggleOpen}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
          isOpen
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
            : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
        }`}
        title="Customize visible sections & layout"
      >
        <Sliders className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Sections</span>
      </button>

      {isOpen && (
        <div
          id="popover-section-visibility"
          className="absolute right-0 top-9 w-64 glass-panel rounded-2xl p-3 border border-slate-700/80 shadow-2xl bg-slate-950/95 backdrop-blur-xl z-50 text-xs space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
            <span className="font-bold text-slate-200">Visible Sections</span>
            <button
              onClick={() => applyPreset('immersion')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Immersion</span>
            </button>
          </div>

          {/* Quick Layout Presets */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Layout Presets</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                onClick={() => applyPreset('balanced')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 cursor-pointer text-left"
              >
                Standard HUD
              </button>
              <button
                onClick={() => applyPreset('minimal')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 cursor-pointer text-left"
              >
                Minimal 3D
              </button>
              <button
                onClick={() => applyPreset('analytics')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 cursor-pointer text-left"
              >
                Full Analytics
              </button>
              <button
                onClick={() => applyPreset('immersion')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-300 cursor-pointer text-left"
              >
                Clean Canvas
              </button>
            </div>
          </div>

          {/* Individual Section Toggles */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Toggle Sections</span>
            
            <div className="space-y-1 text-slate-300">
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                <span className="text-[11px]">Top Telemetry Bar</span>
                <input
                  type="checkbox"
                  checked={visibility.showTopTelemetry}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, showTopTelemetry: e.target.checked, immersionMode: false }))
                  }
                  className="rounded border-slate-700 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                <span className="text-[11px]">Turbine 3D Cards</span>
                <input
                  type="checkbox"
                  checked={visibility.showTurbineCards}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, showTurbineCards: e.target.checked, immersionMode: false }))
                  }
                  className="rounded border-slate-700 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                <span className="text-[11px]">Timeline Phase Banner</span>
                <input
                  type="checkbox"
                  checked={visibility.showPhaseBanner}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, showPhaseBanner: e.target.checked, immersionMode: false }))
                  }
                  className="rounded border-slate-700 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                <span className="text-[11px]">Live Waveforms Dock</span>
                <input
                  type="checkbox"
                  checked={visibility.showWaveformOverlay}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, showWaveformOverlay: e.target.checked, immersionMode: false }))
                  }
                  className="rounded border-slate-700 accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                <span className="text-[11px]">Bottom Controls Dock</span>
                <input
                  type="checkbox"
                  checked={visibility.showControlsDock}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, showControlsDock: e.target.checked, immersionMode: false }))
                  }
                  className="rounded border-slate-700 accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
