import React from 'react';
import { TelemetryState } from '../types';
import { Sparkles, X, Atom, Zap, ShieldCheck, Radio, Eye } from 'lucide-react';

interface QuantumPhysicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryState;
}

export const QuantumPhysicsModal: React.FC<QuantumPhysicsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  if (!isOpen) return null;

  const bGauss = telemetry.quantum.magneticFieldGauss;
  const zeemanMhz = telemetry.quantum.zeemanShiftMhz;
  const d0Ghz = 2.87; // Zero-field splitting in GHz

  return (
    <div
      id="quantum-physics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="quantum-diamond-physics-box"
        className="w-full max-w-3xl glass-panel-quantum rounded-2xl p-6 border border-emerald-500/40 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
              <Atom className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-emerald-300 tracking-wider">
                DIAMOND NV-CENTER QUANTUM MAGNETOMETRY
              </h2>
              <p className="text-xs text-slate-300 font-mono-tech">
                Optically Detected Magnetic Resonance (ODMR) for PMSG Rotor Sensing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Standardized Quantum Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 font-mono-tech text-xs">
          {/* Callout 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Laser Excitation</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong>532 nm Green Laser</strong> &rarr; Spin Triplet Polarization (<sup>3</sup>A<sub>2</sub> ground state to <sup>3</sup>E excited state).
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950 text-[10px] text-emerald-300 border border-emerald-800">
              Optical Pumping into m<sub>s</sub> = 0
            </span>
          </div>

          {/* Callout 2 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1.5">
              <Zap className="h-4 w-4" />
              <span>Zeeman Shift</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong>&Delta;f = &gamma;<sub>NV</sub> &middot; B<sub>local</sub></strong> (&gamma; = 28 GHz/Tesla = 28 MHz/mT).
            </p>
            <div className="mt-2 text-[10px] text-cyan-300 font-bold">
              Current B-Field: {bGauss} Gauss &rarr; &Delta;f = &plusmn;{zeemanMhz.toFixed(1)} MHz
            </div>
          </div>

          {/* Callout 3 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-1.5">
              <Eye className="h-4 w-4" />
              <span>Photoluminescence Readout</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong>637 nm Red Fluorescence</strong> directed into an ultra-fast optical photodetector.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-red-950 text-[10px] text-red-300 border border-red-800">
              Zero-Phonon Line (ZPL) + Vibronic Band
            </span>
          </div>

          {/* Callout 4 */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>EMI Immunity</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              <strong>Optical Photonic Channel</strong> — Completely Decoupled from Stator Fields & PWM switching noise.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950 text-[10px] text-emerald-300 border border-emerald-800">
              Shot-Noise Limited (±0.1%) | &lt;300 ns Delay
            </span>
          </div>
        </div>

        {/* Live ODMR Resonance Curve Canvas */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mt-2">
          <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
            <span className="font-bold text-slate-300">Live Optically Detected Magnetic Resonance (ODMR) Spectrum</span>
            <span className="text-emerald-400">Zero-Field Splitting D = {d0Ghz} GHz</span>
          </div>

          <div className="relative h-28 w-full bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* SVG ODMR Dip Waveform */}
            <svg className="w-full h-full p-2" viewBox="0 0 500 100" preserveAspectRatio="none">
              {/* Baseline Photoluminescence Level */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="4" strokeWidth="1" />
              
              {/* Splitting Dips based on current magnetic field */}
              {/* Dip 1: 2.87 GHz - deltaF, Dip 2: 2.87 GHz + deltaF */}
              {(() => {
                const shiftPx = Math.min(100, Math.max(15, (zeemanMhz / 200) * 80));
                const dip1X = 250 - shiftPx;
                const dip2X = 250 + shiftPx;
                const d = `M 0,20 L ${dip1X - 30},20 Q ${dip1X},85 ${dip1X + 30},20 L ${dip2X - 30},20 Q ${dip2X},85 ${dip2X + 30},20 L 500,20`;
                return (
                  <>
                    <path d={d} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    <circle cx={dip1X} cy="82" r="4" fill="#06b6d4" />
                    <circle cx={dip2X} cy="82" r="4" fill="#06b6d4" />
                    <text x={dip1X - 25} y="96" fill="#67e8f9" fontSize="10" fontFamily="monospace">
                      {(2.87 - zeemanMhz / 1000).toFixed(3)} GHz
                    </text>
                    <text x={dip2X - 25} y="96" fill="#67e8f9" fontSize="10" fontFamily="monospace">
                      {(2.87 + zeemanMhz / 1000).toFixed(3)} GHz
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono-tech mt-1.5 px-1">
            <span>2.70 GHz</span>
            <span className="text-cyan-400 font-bold">Resonance Splitting &Delta;f = &plusmn;{zeemanMhz.toFixed(1)} MHz</span>
            <span>3.05 GHz</span>
          </div>
        </div>

        {/* Comparison Summary Table */}
        <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono-tech transition-colors cursor-pointer"
          >
            Close & Return to 3D Scene
          </button>
        </div>
      </div>
    </div>
  );
};
