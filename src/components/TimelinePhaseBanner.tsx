import React from 'react';
import { TelemetryState } from '../types';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TimelinePhaseBannerProps {
  telemetry: TelemetryState;
  onSelectPhase: (targetTime: number) => void;
}

export const TimelinePhaseBanner: React.FC<TimelinePhaseBannerProps> = ({
  telemetry,
  onSelectPhase,
}) => {
  const getPhaseColor = () => {
    switch (telemetry.phaseNumber) {
      case 2:
        return 'border-amber-500/60 bg-amber-950/70 text-amber-200 shadow-amber-500/10';
      case 3:
        return 'border-emerald-500/60 bg-emerald-950/70 text-emerald-200 shadow-emerald-500/10';
      case 1:
      default:
        return 'border-cyan-500/60 bg-cyan-950/70 text-cyan-200 shadow-cyan-500/10';
    }
  };

  const getPhaseIcon = () => {
    switch (telemetry.phaseNumber) {
      case 2:
        return <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />;
      case 3:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 1:
      default:
        return <Clock className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div
      id="timeline-phase-banner"
      className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-auto"
    >
      <div
        className={`glass-panel border rounded-xl p-3 backdrop-blur-md shadow-2xl transition-all duration-300 ${getPhaseColor()}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Phase Title & Description */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60">
              {getPhaseIcon()}
            </div>
            <div>
              <div className="font-display font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
                <span>{telemetry.phaseLabel}</span>
                <span className="font-mono-tech text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                  t = {telemetry.time.toFixed(2)}s / 6.00s
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 max-w-2xl leading-tight">
                {telemetry.phaseDescription}
              </p>
            </div>
          </div>

          {/* Direct Phase Jump Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-center font-mono-tech text-[10px]">
            <button
              onClick={() => onSelectPhase(0.5)}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                telemetry.phaseNumber === 1
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Phase 1 (8 m/s)
            </button>
            <button
              onClick={() => onSelectPhase(2.8)}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                telemetry.phaseNumber === 2
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Phase 2 (14 m/s Gust)
            </button>
            <button
              onClick={() => onSelectPhase(4.5)}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                telemetry.phaseNumber === 3
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Phase 3 (9 m/s Recov)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
