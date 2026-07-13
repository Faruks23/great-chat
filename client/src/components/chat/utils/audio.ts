'use client';

let ringtoneIntervalId: number | null = null;
let ringtoneNodes: Array<{ oscillator: OscillatorNode; gain: GainNode }> = [];

/**
 * playTone produces a short audio tone in the browser.
 * It uses the Web Audio API to generate an oscillator and fade the sound out smoothly.
 */
export function playTone(frequency: number, duration = 0.1, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
  if (typeof window === 'undefined') return;
  const ctx = window.AudioContext ? new window.AudioContext() : (window as any).webkitAudioContext && new (window as any).webkitAudioContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration + 0.02);
}

/**
 * playNotificationSound emits small feedback sounds for typing and incoming messages.
 * It avoids running in non-browser environments and resumes a suspended audio context if needed.
 */
export function playNotificationSound(kind: 'typing' | 'message') {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  if (kind === 'typing') {
    playTone(420, 0.06, 'triangle', 0.04);
    playTone(360, 0.06, 'triangle', 0.03, 0.05);
    return;
  }

  playTone(720, 0.08, 'sine', 0.12);
  playTone(980, 0.08, 'sine', 0.10, 0.08);
}

/**
 * stopRingtoneSound stops the incoming-call ringtone loop immediately.
 */
export function stopRingtoneSound() {
  if (ringtoneIntervalId !== null) {
    window.clearInterval(ringtoneIntervalId);
    ringtoneIntervalId = null;
  }

  ringtoneNodes.forEach(({ oscillator, gain }) => {
    try {
      oscillator.stop();
    } catch {
      // Ignore if the oscillator has already stopped.
    }
    oscillator.disconnect();
    gain.disconnect();
  });
  ringtoneNodes = [];
}

/**
 * playRingtoneSound emits a looping ring-like pattern for incoming calls until it is explicitly stopped.
 */
export function playRingtoneSound() {
  if (typeof window === 'undefined') return;
  stopRingtoneSound();

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const pattern = [440, 554, 659, 880];
  const playPattern = () => {
    const startTime = ctx.currentTime;

    pattern.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.06, startTime + index * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.18 + 0.14);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime + index * 0.18);
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(startTime + index * 0.18);
      oscillator.stop(startTime + index * 0.18 + 0.14);
      ringtoneNodes.push({ oscillator, gain });
    });
  };

  playPattern();
  ringtoneIntervalId = window.setInterval(playPattern, 1400);
}
