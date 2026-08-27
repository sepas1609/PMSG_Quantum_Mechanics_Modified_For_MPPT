import React, { useRef, useEffect } from 'react';
import { TelemetryState } from '../types';
import { Activity, Zap, Gauge, TrendingUp, Cpu, Sliders } from 'lucide-react';

interface LiveTelemetryChartsProps {
  telemetry: TelemetryState;
  trajectory: TelemetryState[];
  isOpen: boolean;
  onToggle: () => void;
}

export const LiveTelemetryCharts: React.FC<LiveTelemetryChartsProps> = ({
  telemetry,
  trajectory,
  isOpen,
  onToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Render 4 comparison chart lanes:
    // Lane 1: Power Extracted [kW] (Classical vs Quantum vs Max)
    // Lane 2: Back-EMF Voltage [V] (V_true vs V_sensed Classical vs V_sensed Quantum)
    // Lane 3: MPPT Duty Cycle D(t) (Classical hunting vs Quantum lock)
    // Lane 4: Cumulative Energy [Wh] (Classical vs Quantum)

    const laneHeight = (height - 30) / 4;
    const paddingX = 45;
    const plotWidth = width - paddingX - 15;

    // Background grids
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';

    for (let l = 0; l < 4; l++) {
      const topY = l * laneHeight + 15;
      const bottomY = topY + laneHeight - 6;

      // Lane container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(paddingX, topY, plotWidth, laneHeight - 6);

      // Horizontal dashed line
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(paddingX, topY + (laneHeight - 6) / 2);
      ctx.lineTo(paddingX + plotWidth, topY + (laneHeight - 6) / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (trajectory.length < 2) return;

    const totalTime = 6.0;
    const getX = (t: number) => paddingX + (t / totalTime) * plotWidth;

    // --- Lane 1: Power P_cl vs P_qm [kW] ---
    {
      const topY = 15;
      const h = laneHeight - 6;
      const maxP = 5.2;

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText('P [kW]', paddingX - 6, topY + 12);
      ctx.fillText('5.0', paddingX - 6, topY + 22);
      ctx.fillText('0.0', paddingX - 6, topY + h - 2);

      // Classical Power (Red)
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.classical.extractedPower / maxP) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Quantum Power (Emerald)
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.quantum.extractedPower / maxP) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // --- Lane 2: Back-EMF Voltage V_true vs V_sensed [V] ---
    {
      const topY = laneHeight + 15;
      const h = laneHeight - 6;
      const maxV = 180;

      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText('EMF [V]', paddingX - 6, topY + 12);
      ctx.fillText('160', paddingX - 6, topY + 22);
      ctx.fillText('0', paddingX - 6, topY + h - 2);

      // Classical Sensed (Red with EMI noise & 50ms lag)
      ctx.beginPath();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.classical.backEmfSensed / maxV) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Quantum Sensed (Cyan pristine)
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.quantum.backEmfSensed / maxV) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // --- Lane 3: Duty Cycle D(t) ---
    {
      const topY = laneHeight * 2 + 15;
      const h = laneHeight - 6;

      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText('Duty D', paddingX - 6, topY + 12);
      ctx.fillText('0.6', paddingX - 6, topY + 22);
      ctx.fillText('0.4', paddingX - 6, topY + h - 2);

      const dMin = 0.4;
      const dMax = 0.6;
      const normD = (d: number) => Math.max(0, Math.min(1, (d - dMin) / (dMax - dMin)));

      // Classical D (Hunting)
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - normD(pt.classical.dutyCycle) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Quantum D (Decisive)
      ctx.beginPath();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - normD(pt.quantum.dutyCycle) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // --- Lane 4: Cumulative Energy [Wh] ---
    {
      const topY = laneHeight * 3 + 15;
      const h = laneHeight - 6;
      const maxE = 8.5;

      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText('E [Wh]', paddingX - 6, topY + 12);
      ctx.fillText('8.0', paddingX - 6, topY + 22);
      ctx.fillText('0.0', paddingX - 6, topY + h - 2);

      // Classical Energy
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.classical.cumulativeEnergy / maxE) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Quantum Energy
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      trajectory.forEach((pt, i) => {
        const x = getX(pt.time);
        const y = topY + h - (pt.quantum.cumulativeEnergy / maxE) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Current Time Cursor Indicator
    const curX = getX(telemetry.time);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(curX, 15);
    ctx.lineTo(curX, height - 15);
    ctx.stroke();

    // Cursor tag
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(curX, 15, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [telemetry, trajectory, isOpen]);

  return (
    <div
      id="live-telemetry-panel"
      className={`fixed bottom-24 right-4 z-40 transition-all duration-300 ${
        isOpen ? 'w-96 md:w-[480px] h-[390px]' : 'w-auto h-auto'
      }`}
    >
      {isOpen ? (
        <div className="w-full h-full glass-panel rounded-2xl p-4 border border-slate-700/80 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="font-display font-bold text-xs tracking-wider text-slate-200">
                LIVE WAVEFORM TELEMETRY (SYNCHRONIZED)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-[10px] text-emerald-300 font-mono-tech font-bold">
                +{telemetry.quantumGainPercent.toFixed(2)}% Gain
              </span>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                Hide
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="flex-1 w-full my-2 relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Legend Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Classical PMSG
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" /> Quantum NV PMSG
              </span>
            </div>
            <span className="text-cyan-300 font-bold">t = {telemetry.time.toFixed(2)}s</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 shadow-xl font-mono-tech text-xs cursor-pointer transition-all hover:scale-105"
        >
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>Show Live Waveforms</span>
        </button>
      )}
    </div>
  );
};
