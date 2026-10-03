/**
 * Audio synthesis & Web Audio effects for kid-friendly pronunciation & sound cues
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play a happy bubble pop sound (for card taps & balloons)
  public playPop() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio context error ignore
    }
  }

  // Play a rewarding chord chime for correct answers
  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.36);
      });
    } catch {
      // Audio context error ignore
    }
  }

  // Play a gentle "try again" wobble sound
  public playWrong() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.15);
      osc.frequency.linearRampToValueAtTime(220, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.31);
    } catch {
      // Audio context error ignore
    }
  }

  // Play a sparkly star sound
  public playStar() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Audio context error ignore
    }
  }

  // Play victory fanfare on game completion
  public playFanfare() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      // Arpeggio fanfare
      const melody = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.35, t: 0.36 },
      ];
      const now = ctx.currentTime;

      melody.forEach(({ f, d, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.25, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Audio context error ignore
    }
  }
}

export const sfx = new SoundEffectsEngine();

// Speech Synthesis Engine for English pronunciation
class SpeechEngine {
  private voice: SpeechSynthesisVoice | null = null;
  private speechRate: number = 0.85; // Kid friendly slightly slower cadence

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectBestEnglishVoice();
      };
      this.selectBestEnglishVoice();
    }
  }

  private selectBestEnglishVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer friendly English voices (en-US, Google US English, Samantha, Victoria)
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google US English') ||
          v.name.includes('Daniel') ||
          v.name.includes('Jenny') ||
          v.name.includes('Zira'))
    );
    this.voice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  public setSpeed(speed: number) {
    this.speechRate = Math.max(0.6, Math.min(1.2, speed));
  }

  public getSpeed(): number {
    return this.speechRate;
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Pronounce an alphabet letter (uppercase or lowercase) with phonics option
  public speakLetter(letter: string, soundType: 'letter' | 'phonics' | 'both' = 'both', exampleWord?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cancel();

    let textToSpeak = letter.toUpperCase();
    if (soundType === 'phonics' && exampleWord) {
      textToSpeak = `${letter.toUpperCase()} says ... ${exampleWord}!`;
    } else if (soundType === 'both' && exampleWord) {
      textToSpeak = `${letter.toUpperCase()}... for ${exampleWord}!`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'en-US';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.15; // Slightly higher, friendly pitch for kids

    window.speechSynthesis.speak(utterance);
  }

  // Pronounce a specific word clearly
  public speakWord(word: string, sentence?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cancel();

    const textToSpeak = sentence ? `${word}. ${sentence}` : word;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'en-US';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
  }

  // Speak instructional text (e.g. for quiz instructions or hints)
  public speakText(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'en-US';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  }
}

export const speech = new SpeechEngine();
