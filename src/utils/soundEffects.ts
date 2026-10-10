// Web Audio API Synthesizer for Trumpet Fanfare, UI Feedback, and Read-Aloud Speech

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playBookPull(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playCorrectChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startTime = now + idx * 0.075;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.11, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  public playIncorrectNudge(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [261.63, 233.08]; // C4 -> Bb3 gentle low tone
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + idx * 0.11;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  }

  /**
   * Celebratory Royal Trumpet Fanfare for the "Story Complete!" screen
   */
  public playTrumpetFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { freq: 392.0, harmony: 261.63, start: 0.0, duration: 0.14 },
      { freq: 523.25, harmony: 329.63, start: 0.15, duration: 0.14 },
      { freq: 659.25, harmony: 392.0, start: 0.3, duration: 0.14 },
      { freq: 783.99, harmony: 523.25, start: 0.45, duration: 0.24 },
      { freq: 659.25, harmony: 392.0, start: 0.72, duration: 0.14 },
      { freq: 783.99, harmony: 523.25, start: 0.88, duration: 0.65 },
    ];

    melody.forEach(({ freq, harmony, start, duration }) => {
      const noteStart = now + start;
      const oscLead = ctx.createOscillator();
      const oscHarmony = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      oscLead.type = 'sawtooth';
      oscHarmony.type = 'triangle';

      oscLead.frequency.setValueAtTime(freq, noteStart);
      oscHarmony.frequency.setValueAtTime(harmony, noteStart);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, noteStart);
      filter.frequency.linearRampToValueAtTime(2400, noteStart + 0.04);
      filter.frequency.exponentialRampToValueAtTime(1400, noteStart + duration);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.11, noteStart + 0.025);
      gain.gain.setValueAtTime(0.09, noteStart + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      oscLead.connect(filter);
      oscHarmony.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      oscLead.start(noteStart);
      oscHarmony.start(noteStart);
      oscLead.stop(noteStart + duration + 0.02);
      oscHarmony.stop(noteStart + duration + 0.02);
    });
  }

  public stopSpeaking(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }

  public speakWord(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }
}

export const soundManager = new SoundManager();
