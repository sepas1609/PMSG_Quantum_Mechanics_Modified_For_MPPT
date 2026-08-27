import React from 'react';
import { TelemetryState } from '../types';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Radio, 
  Compass, 
  Gauge, 
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SideBySideSpecsViewProps {
  telemetry: TelemetryState;
  onOpenQuantumLab?: () => void;
}

export const SideBySideSpecsView: React.FC<SideBySideSpecsViewProps> = ({
  telemetry,
  onOpenQuantumLab,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-950/95 text-slate-100 font-mono-tech">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
              <Layers className="h-4 w-4" />
              <span>Architectural Benchmark</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mt-1">
              Classical PMSG vs. Quantum Diamond NV-Center Sensor Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side physical, electrical, and control loop specifications under dynamic wind gust conditions.
            </p>
          </div>

          {/* Live Net Summary Card */}
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-4">
            <div>
              <div className="text-[10px] text-emerald-300/80 font-bold uppercase">Quantum Power Delta</div>
              <div className="text-xl font-bold text-emerald-300">
                +{(telemetry.deltaPowerKw * 1000).toFixed(0)} W
              </div>
            </div>
            <div className="h-8 w-px bg-emerald-500/30" />
            <div>
              <div className="text-[10px] text-emerald-300/80 font-bold uppercase">Cumulative Harvest Gain</div>
              <div className="text-xl font-bold text-cyan-300">
                +{telemetry.quantumGainPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT: Classical PMSG System */}
          <div className="rounded-2xl border border-red-500/40 bg-red-950/15 p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="font-display font-bold text-lg text-red-400">Classical PMSG Turbine</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[11px] text-red-300">
                  Hall-Effect / Encoders
                </span>
              </div>

              {/* Live Status Indicators */}
              <div className="grid grid-cols-2 gap-3 bg-red-950/30 rounded-xl p-3 border border-red-500/20 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Extracted Power:</span>
                  <div className="text-base font-bold text-white">
                    {telemetry.classical.extractedPower.toFixed(2)} kW
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">MPPT Efficiency:</span>
                  <div className="text-base font-bold text-red-300">
                    {telemetry.classical.efficiency.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Duty Cycle (D):</span>
                  <div className="text-sm font-bold text-amber-300">
                    {telemetry.classical.dutyCycle.toFixed(3)} (Hunting)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Cumulative Energy:</span>
                  <div className="text-sm font-bold text-slate-200">
                    {telemetry.classical.cumulativeEnergy.toFixed(3)} Wh
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-2">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Activity className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Sensor Mechanism:</strong>
                    <p className="text-slate-400 text-[11px]">Solid-state Hall-effect semiconductors & optical pulse disk.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Electromagnetic Interference (EMI):</strong>
                    <p className="text-slate-400 text-[11px]">High noise susceptibility (±5.0% noise floor) from inverter switching.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Clock className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-300">Sampling Latency:</strong>
                    <p className="text-slate-400 text-[11px]">50 μs ADC conversion + 50 ms low-pass filter group delay causes tracking lag.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Radio className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-orange-300">MPPT Dynamic Tracking:</strong>
                    <p className="text-slate-400 text-[11px]">Perturb & Observe oscillates in wrong gradient direction during rapid gusts.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-500/20 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Generator: 5 kW PMSG (6-Pole)</span>
              <span className="text-red-400 font-bold">Standard Baseline</span>
            </div>
          </div>

          {/* RIGHT: Quantum Diamond NV-Center System */}
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/20 p-5 flex flex-col justify-between shadow-xl ring-1 ring-emerald-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  <h3 className="font-display font-bold text-lg text-emerald-400">Quantum NV-Center PMSG</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-[11px] text-emerald-300">
                  Diamond NV Quantum Sensor
                </span>
              </div>

              {/* Live Status Indicators */}
              <div className="grid grid-cols-2 gap-3 bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/30 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Extracted Power:</span>
                  <div className="text-base font-bold text-emerald-300">
                    {telemetry.quantum.extractedPower.toFixed(2)} kW
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">MPPT Efficiency:</span>
                  <div className="text-base font-bold text-emerald-300">
                    {telemetry.quantum.efficiency.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Duty Cycle (D):</span>
                  <div className="text-sm font-bold text-cyan-300">
                    {telemetry.quantum.dutyCycle.toFixed(3)} (Locked)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Cumulative Energy:</span>
                  <div className="text-sm font-bold text-emerald-200">
                    {telemetry.quantum.cumulativeEnergy.toFixed(3)} Wh
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-2">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Sensor Mechanism:</strong>
                    <p className="text-slate-400 text-[11px]">Nitrogen-Vacancy electron spin resonance with 532 nm laser & ODMR readout.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300">Immunity to EMI:</strong>
                    <p className="text-slate-400 text-[11px]">Optical detection is 100% immune to inverter EMI. Shot-noise limited (±0.1%).</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300">Sampling Latency:</strong>
                    <p className="text-slate-400 text-[11px]">&lt; 300 ns photodiode sampling with instantaneous Zeeman frequency shifts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300">MPPT Dynamic Tracking:</strong>
                    <p className="text-slate-400 text-[11px]">Zero-lag Back-EMF tracking delivers prompt, decisive gradient steps without hunting.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/30 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Generator: 5 kW PMSG (6-Pole)</span>
              <span className="text-emerald-400 font-bold">+{telemetry.quantumGainPercent.toFixed(2)}% Energy Harvest</span>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Comprehensive Parameter Comparison Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Performance Parameter</th>
                  <th className="py-2.5 px-3 text-red-400">Classical Hall-Effect System</th>
                  <th className="py-2.5 px-3 text-emerald-400">Quantum Diamond NV-Center</th>
                  <th className="py-2.5 px-3 text-cyan-400">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-medium text-white">Magnetic Sensitivity</td>
                  <td className="py-3 px-3 text-red-300">~10 μT / √Hz</td>
                  <td className="py-3 px-3 text-emerald-300">~1 pT / √Hz (Quantum Zeeman)</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">10,000x Higher Resolution</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-white">Response Time / Delay</td>
                  <td className="py-3 px-3 text-red-300">50 ms low-pass filter lag</td>
                  <td className="py-3 px-3 text-emerald-300">&lt; 300 ns optical ODMR</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">160,000x Lower Latency</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-white">EMI / Switching Noise Floor</td>
                  <td className="py-3 px-3 text-red-300">±5.0% Amplitude Jitter</td>
                  <td className="py-3 px-3 text-emerald-300">±0.1% Optical Shot-Noise</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">50x Noise Reduction</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-white">Turbulent Gust MPPT Efficiency</td>
                  <td className="py-3 px-3 text-red-300">82.4% (Severe hunting/overshoot)</td>
                  <td className="py-3 px-3 text-emerald-300">97.8% (Near-optimal peak lock)</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">+15.4% MPPT Tracking η</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-white">Thermal Drift Coefficient</td>
                  <td className="py-3 px-3 text-red-300">0.05% / °C (Semiconductor drift)</td>
                  <td className="py-3 px-3 text-emerald-300">-74 kHz / K (Known zero-field invariant)</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">Self-Calibrating Physics</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
