import React, { useState } from 'react';
import { TelemetryState } from '../types';
import { Sparkles, Zap, Activity, Cpu, Compass, Atom, Layers, HelpCircle } from 'lucide-react';

interface QuantumLabViewProps {
  telemetry: TelemetryState;
}

export const QuantumLabView: React.FC<QuantumLabViewProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'odmr' | 'zeeman' | 'optics'>('odmr');

  const bGauss = telemetry.quantum.magneticFieldGauss;
  const zeemanShiftMhz = telemetry.quantum.zeemanShiftMhz;
  const centralFreqGhz = 2.87;
  const fMinusGhz = centralFreqGhz - zeemanShiftMhz / 1000;
  const fPlusGhz = centralFreqGhz + zeemanShiftMhz / 1000;

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-950/95 text-slate-100 font-mono-tech">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Atom className="h-4 w-4" />
              <span>Quantum Diamond NV Metrology</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mt-1">
              Nitrogen-Vacancy (NV) Center Quantum Sensor Physics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Optically Detected Magnetic Resonance (ODMR) & Zeeman Effect in PMSG Generators
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {[
              { id: 'odmr', label: 'ODMR Dip Spectrum' },
              { id: 'zeeman', label: 'Zeeman Physics & Math' },
              { id: 'optics', label: 'Optical Hardware Stack' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Magnetic State Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase">Live Rotor Magnetic Field (B_rotor)</span>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {bGauss.toFixed(1)} Gauss
            </div>
            <span className="text-[10px] text-slate-500">{(bGauss * 0.1).toFixed(2)} mT on NV axis</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase">Zeeman Spin Frequency Shift (Δf)</span>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              ±{zeemanShiftMhz.toFixed(2)} MHz
            </div>
            <span className="text-[10px] text-slate-500">γ_e = 28 GHz/Tesla (2.80 MHz/G)</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] text-slate-400 uppercase">ODMR Readout Latency</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              &lt; 300 ns (Real-time)
            </div>
            <span className="text-[10px] text-slate-500">Zero group-delay filter lag</span>
          </div>
        </div>

        {/* Dynamic Interactive Visual Tab Content */}
        {activeTab === 'odmr' && (
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Real-Time Optically Detected Magnetic Resonance (ODMR) Spectrum</span>
            </h3>

            {/* ODMR Curve Visualization */}
            <div className="h-44 w-full bg-slate-950/90 rounded-xl border border-slate-800 p-4 relative flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                {/* Baseline 100% PL line */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#334155" strokeDasharray="3,3" />

                {/* ODMR Lorentzian Dips */}
                {/* Center zero-field marker: 250px */}
                {/* Left dip: 250 - (zeemanShiftMhz / 80) * 180 */}
                {/* Right dip: 250 + (zeemanShiftMhz / 80) * 180 */}
                {(() => {
                  const shiftPx = Math.min(190, (zeemanShiftMhz / 65) * 160);
                  const xLeft = 250 - shiftPx;
                  const xRight = 250 + shiftPx;
                  return (
                    <>
                      {/* Left dip curve path */}
                      <path
                        d={`M 0 20 L ${xLeft - 40} 20 Q ${xLeft - 15} 20 ${xLeft} 90 Q ${xLeft + 15} 20 ${xLeft + 40} 20 L ${xRight - 40} 20 Q ${xRight - 15} 20 ${xRight} 90 Q ${xRight + 15} 20 ${xRight + 40} 20 L 500 20`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      {/* Left Dip Marker */}
                      <circle cx={xLeft} cy="90" r="4" fill="#38bdf8" />
                      {/* Right Dip Marker */}
                      <circle cx={xRight} cy="90" r="4" fill="#38bdf8" />
                      {/* Zero Field Reference center */}
                      <line x1="250" y1="10" x2="250" y2="100" stroke="#64748b" strokeDasharray="2,2" />
                    </>
                  );
                })()}
              </svg>

              {/* Axis labels */}
              <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <span>{fMinusGhz.toFixed(3)} GHz (|-1⟩)</span>
                <span className="text-slate-300 font-bold">2.870 GHz (Zero-Field D)</span>
                <span>{fPlusGhz.toFixed(3)} GHz (|+1⟩)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When the 6-pole PMSG rotor magnets spin near the diamond crystal, the local magnetic field{' '}
              <strong className="text-cyan-300">B_rotor</strong> splits the ground spin state triplet (ms = 0 to ms = ±1) via the Zeeman interaction. When microwave excitation matches these split frequencies, electrons transition into the non-radiative metastable state, causing sharp <strong className="text-emerald-400">photoluminescence contrast dips</strong> captured continuously by the photodetector.
            </p>
          </div>
        )}

        {activeTab === 'zeeman' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Fundamental Hamiltonian & Zeeman Splitting Equations</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-amber-300 font-bold text-sm">
                Ĥ = D · Ŝ_z² + g_e · μ_B · B · Ŝ
              </div>
              <p className="text-slate-400 text-[11px]">
                Where <strong className="text-slate-200">D = 2.87 GHz</strong> (Zero-Field Splitting parameter), <strong className="text-slate-200">g_e ≈ 2.0028</strong> (electron g-factor), and <strong className="text-slate-200">μ_B</strong> is the Bohr magneton.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">Frequency Splitting:</span>
                <p className="text-slate-300 mt-1">Δf = 2 · γ_e · B_|| = 2 · (2.80 MHz/Gauss) · B_||</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">Absolute Invariant:</span>
                <p className="text-slate-300 mt-1">No calibration drift. Measurement accuracy is bounded solely by fundamental atomic constants.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optics' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Integrated Optical & Solid-State Hardware Stack</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-emerald-300">532 nm Pump Laser</span>
                <p className="text-slate-400 text-[11px]">Polarizes NV electron spins to ground state |0⟩ with &gt;95% fidelity.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="font-bold text-cyan-300">CVD Diamond Sensor</span>
                <p className="text-slate-400 text-[11px]">1 mm³ high-purity single-crystal diamond with 10¹⁷ cm⁻³ engineered NV⁻ defects.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="font-bold text-red-300">637 nm Photodiode</span>
                <p className="text-slate-400 text-[11px]">Captures red fluorescence with zero sensitivity to electric switching EMI noise.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
