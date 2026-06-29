class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  setVolume(volume) {
    this.volume = volume;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playReelStop() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playSpinSweep(durationSeconds) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + durationSeconds);
      
      gain.gain.setValueAtTime(this.volume * 0.03, this.ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.03, this.ctx.currentTime + durationSeconds - 0.15);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, this.ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playWinTone(winType) {
    if (this.muted) return;
    this.init();
    try {
      let notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale notes
      let duration = 0.12;

      if (winType === 'jackpot') {
        this.playJackpot();
        return;
      } else if (winType === 'big') {
        notes = [...notes, ...notes.map(f => f * 2)];
        duration = 0.08;
      } else if (winType === 'medium') {
        notes = [329.63, 392.00, 523.25, 659.25, 783.99];
        duration = 0.1;
      } else {
        notes = [392.00, 523.25, 659.25];
        duration = 0.14;
      }

      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * duration);
        
        gain.gain.setValueAtTime(0, now + idx * duration);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, now + idx * duration + 0.02);
        gain.gain.linearRampToValueAtTime(0, now + idx * duration + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + idx * duration);
        osc.stop(now + idx * duration + duration);
      });
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }

  playJackpot() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const duration = 2.5;
      
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(180 + i * 3, now);
        
        // Siren sound modulation
        for (let t = 0; t < duration; t += 0.2) {
          osc.frequency.linearRampToValueAtTime(350 + i * 5, now + t);
          osc.frequency.linearRampToValueAtTime(750 + i * 5, now + t + 0.1);
        }
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.04, now + 0.1);
        gain.gain.setValueAtTime(this.volume * 0.04, now + duration - 0.25);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
      }
    } catch (e) {
      console.warn("Audio Context Error", e);
    }
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;
