class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master wind white-noise filter
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 350;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.0;

      whiteNoise.connect(windFilter);
      windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      whiteNoise.start();

      // Generator electromagnetic drone oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 85;

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 220;

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.0;

      osc.connect(droneFilter);
      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      osc.start();

      this.isInitialized = true;
    } catch {
      // Audio context might be restricted before gesture
    }
  }

  public update(enabled: boolean, windSpeed: number) {
    if (!enabled) {
      if (this.windGain) this.windGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
      return;
    }

    if (!this.isInitialized) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.windGain && this.ctx) {
      const targetGain = Math.min(0.12, (windSpeed / 20) * 0.12);
      this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }

    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.02, this.ctx.currentTime, 0.1);
    }
  }
}

export const audioSynth = new AudioSynthesizer();
