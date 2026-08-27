import React, { useRef, useEffect, useState } from 'react';
import { TelemetryState } from '../types';
import { Activity, Zap, Gauge, TrendingUp, Radio, RefreshCw } from 'lucide-react';

interface WaveformOscilloscopeViewProps {
  telemetry: TelemetryState;
  trajectory: TelemetryState[];
}

export const WaveformOscilloscopeView: React.FC<WaveformOscilloscopeViewProps> = ({
  telemetry,
  trajectory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'power' | 'emf' | 'mppt' | 'energy'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const paddingLeft = 65;
    const paddingRight = 30;
    const plotWidth = width - paddingLeft - paddingRight;
    const totalTime = 6.0;

    const getX = (t: number) => paddingLeft + (t / totalTime) * plotWidth;

    const channelList =
      selectedChannel === 'all'
        ? [
            { id: 'power', label: 'Extracted Power P(t) [kW]', min: 0, max: 5.5, unit: 'kW' },
            { id: 'emf', label: 'Back-EMF Sensing V_emf(t) [V]', min: 50, max: 320, unit: 'V' },
            { id: 'mppt', label: 'MPPT Duty Cycle D(t) [0-1]', min: 0.2, max: 0.8, unit: 'D' },
            { id: 'energy', label: 'Cumulative Energy [Wh]', min: 0, max: 8.0, unit: 'Wh' },
          ]
        : selectedChannel === 'power'
        ? [{ id: 'power', label: 'Extracted Power P(t) [kW]', min: 0, max: 5.5, unit: 'kW' }]
        : selectedChannel === 'emf'
        ? [{ id: 'emf', label: 'Back-EMF Sensing V_emf(t) [V]', min: 50, max: 320, unit: 'V' }]
        : selectedChannel === 'mppt'
        ? [{ id: 'mppt', label: 'MPPT Duty Cycle D(t) [0-1]', min: 0.2, max: 0.8, unit: 'D' }]
        : [{ id: 'energy', label: 'Cumulative Energy [Wh]', min: 0, max: 8.0, unit: 'Wh' }];

    const numLanes = channelList.length;
    const laneGap = 16;
    const laneHeight = (height - 40 - (numLanes - 1) * laneGap) / numLanes;

    channelList.forEach((lane, idx) => {
      const topY = 25 + idx * (laneHeight + laneGap);
      const h = laneHeight;

      // Channel background card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(paddingLeft, topY, plotWidth, h, 6);
      ctx.fill();
      ctx.stroke();

      // Grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.setLineDash([4, 4]);
      for (let g = 1; g < 4; g++) {
        const gy = topY + (h / 4) * g;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, gy);
        ctx.lineTo(paddingLeft + plotWidth, gy);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Y-Axis labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(lane.label, paddingLeft - 10, topY + 12);
      ctx.fillText(`${lane.max.toFixed(1)}`, paddingLeft - 10, topY + 22);
      ctx.fillText(`${lane.min.toFixed(1)}`, paddingLeft - 10, topY + h - 4);

      if (trajectory.length < 2) return;

      const normalize = (val: number) => {
        return Math.max(0, Math.min(1, (val - lane.min) / (lane.max - lane.min)));
      };

      // Draw Curves based on Channel
      if (lane.id === 'power') {
        // Classical Power (Red)
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.classical.extractedPower) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Quantum Power (Emerald)
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.quantum.extractedPower) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (lane.id === 'emf') {
        // True EMF (Dashed Slate)
        ctx.beginPath();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.quantum.backEmfTrue) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Classical Sensed EMF (Noisy Red)
        ctx.beginPath();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.classical.backEmfSensed) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Quantum Sensed EMF (Cyan True Track)
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.quantum.backEmfSensed) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (lane.id === 'mppt') {
        // Classical Duty Cycle D(t) (Amber Oscillations)
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.classical.dutyCycle) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Quantum Duty Cycle D(t) (Emerald Smooth Optimum)
        ctx.beginPath();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.quantum.dutyCycle) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (lane.id === 'energy') {
        // Classical Cumulative (Red)
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.classical.cumulativeEnergy) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Quantum Cumulative (Emerald)
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        trajectory.forEach((pt, i) => {
          const x = getX(pt.time);
          const y = topY + h - normalize(pt.quantum.cumulativeEnergy) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      // Current Time Needle
      const needleX = getX(telemetry.time);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(needleX, topY);
      ctx.lineTo(needleX, topY + h);
      ctx.stroke();
    });

    // Time Axis at bottom
    const bottomAxisY = height - 10;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 6; t += 1) {
      const tx = getX(t);
      ctx.fillText(`${t}.0s`, tx, bottomAxisY);
    }
  }, [telemetry, trajectory, selectedChannel]);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 bg-slate-950/95 text-slate-100 font-mono-tech">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="h-4 w-4" />
            <span>Multi-Channel Waveform Oscilloscope</span>
          </div>
          <h2 className="text-lg md:text-xl font-display font-bold text-white mt-0.5">
            Dynamic MPPT Trajectory & Sensor Waveforms
          </h2>
        </div>

        {/* Channel Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {[
            { id: 'all', label: 'All 4 Channels' },
            { id: 'power', label: 'Power P(t)' },
            { id: 'emf', label: 'Back-EMF V_emf' },
            { id: 'mppt', label: 'Duty Cycle D(t)' },
            { id: 'energy', label: 'Harvested Energy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedChannel === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Oscilloscope Viewport */}
      <div className="flex-1 w-full min-h-[300px] mt-4 relative rounded-xl border border-slate-800/80 bg-slate-950/80 overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500" />
            <span className="text-red-400 font-bold">Classical PMSG (Noisy/Lagged)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-emerald-400 font-bold">Quantum NV-Center (Zero-Lag Precision)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t border-dashed border-slate-400" />
            <span className="text-slate-400">Ground-Truth Reference</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Current Simulation Time: <strong className="text-cyan-300">{telemetry.time.toFixed(2)}s</strong> | Wind: <strong className="text-amber-300">{telemetry.windSpeed.toFixed(1)} m/s</strong>
        </div>
      </div>
    </div>
  );
};
