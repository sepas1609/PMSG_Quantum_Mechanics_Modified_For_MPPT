export type WindMode = '3phase' | 'steady' | 'turbulence' | 'custom';

export type CameraPreset = 'dual' | 'classical_sensor' | 'quantum_sensor' | 'top_down' | 'xray';

export interface TelemetryState {
  time: number; // 0.0 to 6.0 s
  windSpeed: number; // m/s
  availablePower: number; // kW
  phaseNumber: 1 | 2 | 3;
  phaseLabel: string;
  phaseDescription: string;
  
  // Classical Turbine Telemetry
  classical: {
    rotorSpeedRpm: number;
    rotorSpeedRadS: number;
    backEmfTrue: number; // V
    backEmfSensed: number; // V (with noise + 50ms delay)
    dutyCycle: number; // 0.1 to 0.9
    extractedPower: number; // kW
    efficiency: number; // %
    cumulativeEnergy: number; // Wh
    emiNoiseLevel: number; // %
    sensorLagMs: number;
    mpptStateText: string;
  };

  // Quantum NV Turbine Telemetry
  quantum: {
    rotorSpeedRpm: number;
    rotorSpeedRadS: number;
    backEmfTrue: number; // V
    backEmfSensed: number; // V (shot-noise ±0.1%, 0 delay)
    dutyCycle: number; // 0.1 to 0.9
    extractedPower: number; // kW
    efficiency: number; // %
    cumulativeEnergy: number; // Wh
    shotNoiseLevel: number; // %
    odmrLatencyNs: number;
    magneticFieldGauss: number;
    zeemanShiftMhz: number;
    mpptStateText: string;
  };

  // Comparison
  deltaPowerKw: number;
  cumulativeGainWh: number;
  quantumGainPercent: number;
}

export type ActiveViewMode = '3d_sim' | 'side_by_side_specs' | 'waveforms' | 'quantum_lab';

export interface SectionVisibility {
  showTopTelemetry: boolean;
  showTurbineCards: boolean;
  showPhaseBanner: boolean;
  showWaveformOverlay: boolean;
  showControlsDock: boolean;
  immersionMode: boolean; // Hide all HUD for pristine 3D view
}

export interface SimulationConfig {
  isPlaying: boolean;
  playbackSpeed: number; // 0.2, 1, 2, 5
  windMode: WindMode;
  customWindSpeed: number; // 5 to 20 m/s
  cameraPreset: CameraPreset;
  xrayMode: boolean;
  showLabels: boolean;
  showStreamlines: boolean;
  showMagneticLines: boolean;
  audioEnabled: boolean;
}
