// Web Audio API synthesizer for dispatch, success, and alert chimes
class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public playAlert() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio might be blocked until user interaction
    }
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }

  public playClick() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playEmergency() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.1);
      osc.frequency.setValueAtTime(600, now + 0.2);
      osc.frequency.setValueAtTime(900, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio fallback
    }
  }

  public playFireRoar() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = 1.35;

      // 1. Noise buffer for fire friction/wind rush
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(3.0, now);
      bandpass.frequency.setValueAtTime(140, now);
      bandpass.frequency.exponentialRampToValueAtTime(1800, now + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.02, now);
      noiseGain.gain.linearRampToValueAtTime(0.4, now + duration * 0.85);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      // 2. Roaring throat oscillator (sawtooth with low-pass)
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + duration);

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(180, now);
      lowpass.frequency.linearRampToValueAtTime(450, now + duration);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.05, now);
      oscGain.gain.linearRampToValueAtTime(0.35, now + duration * 0.9);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(lowpass);
      lowpass.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + duration);
      osc.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  public playBoomExplosion() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Sub-bass shockwave drop (95Hz -> 20Hz)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 1.2);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.65, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      // 2. Crunchy noise detonation burst
      const burstSize = Math.floor(this.ctx.sampleRate * 0.45);
      const burstBuf = this.ctx.createBuffer(1, burstSize, this.ctx.sampleRate);
      const bData = burstBuf.getChannelData(0);
      for (let i = 0; i < burstSize; i++) {
        bData[i] = Math.random() * 2 - 1;
      }
      const burstSource = this.ctx.createBufferSource();
      burstSource.buffer = burstBuf;

      const burstFilter = this.ctx.createBiquadFilter();
      burstFilter.type = 'lowpass';
      burstFilter.frequency.setValueAtTime(600, now);
      burstFilter.frequency.exponentialRampToValueAtTime(90, now + 0.45);

      const burstGain = this.ctx.createGain();
      burstGain.gain.setValueAtTime(0.5, now);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      burstSource.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(this.ctx.destination);

      subOsc.start(now);
      burstSource.start(now);
      subOsc.stop(now + 1.3);
      burstSource.stop(now + 0.45);
    } catch {
      // Audio fallback
    }
  }
}

export const soundManager = new SoundManager();

