/**
 * Web Audio API synthesizer for high-quality Japanese ASMR sound effects.
 * 100% client-side, zero external audio asset dependencies.
 */

let soundEnabled = true;

// Retrieve initial state from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('panda_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch (e) {
    console.warn('Failed to load sound preferences:', e);
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('panda_sound_enabled', String(enabled));
    } catch (e) {
      console.warn('Failed to save sound preferences:', e);
    }
  }
}

let audioCtx: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

// Auto-unlock on first user gesture
if (typeof window !== 'undefined') {
  const handleFirstGesture = () => {
    unlockAudio();
    window.removeEventListener('click', handleFirstGesture);
    window.removeEventListener('touchstart', handleFirstGesture);
    window.removeEventListener('keydown', handleFirstGesture);
  };
  window.addEventListener('click', handleFirstGesture, { passive: true });
  window.addEventListener('touchstart', handleFirstGesture, { passive: true });
  window.addEventListener('keydown', handleFirstGesture, { passive: true });
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * 0. High priority LOUD kitchen order bell/alarm
 * Rich loud multi-tone bell ring (1046Hz, 1318Hz, 1567Hz, 2093Hz) designed to cut through noisy kitchen background
 */
export function playNewOrderAlarm() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // High-energy loud dual-strike sequence
  const notes = [
    // Strike 1
    { freq: 1046.5, start: 0.0, dur: 0.25, gain: 0.8 },
    { freq: 1318.5, start: 0.12, dur: 0.30, gain: 0.85 },
    { freq: 1567.9, start: 0.24, dur: 0.35, gain: 0.9 },
    { freq: 2093.0, start: 0.38, dur: 0.60, gain: 1.0 },

    // Strike 2
    { freq: 1046.5, start: 0.80, dur: 0.25, gain: 0.8 },
    { freq: 1318.5, start: 0.92, dur: 0.30, gain: 0.85 },
    { freq: 1567.9, start: 1.04, dur: 0.35, gain: 0.9 },
    { freq: 2093.0, start: 1.18, dur: 0.80, gain: 1.0 },

    // Strike 3 (Final confirm chime)
    { freq: 1567.9, start: 1.70, dur: 0.40, gain: 0.85 },
    { freq: 2093.0, start: 1.85, dur: 1.0, gain: 1.0 }
  ];

  notes.forEach(({ freq, start, dur, gain = 0.8 }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + start);

    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
}

/**
 * 1. Gentle Japanese wind chime (Furin)
 * Uses high-frequency metal resonant frequencies with decay
 */
export function playFurinChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [880, 1200, 1500, 2200]; // high silver bells

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.015); // Stagger slightly for a dynamic chime strike

    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.04 - idx * 0.008, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);
  });
}

/**
 * 2. Crisp Wood/Bamboo Snap
 * Fast noise burst with bandpass filtering and quick decay
 */
export function playBambooSnap() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.08; // very short click/snap
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // White noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now); // mid wood resonance
  filter.Q.setValueAtTime(8, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseNode.start(now);
  noiseNode.stop(now + duration);

  // Add a quick secondary low-frequency woody thud
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

  oscGain.gain.setValueAtTime(0.15, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * 3. Cookie Crack / Crisp Crumble
 * Crackle noise pattern (series of micro pops)
 */
export function playCookieCrack() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Schedule 4 micro snaps in rapid succession to sound like a crackle
  for (let i = 0; i < 5; i++) {
    const delay = i * 0.02 + Math.random() * 0.015;
    const crackTime = now + delay;
    const duration = 0.04 + Math.random() * 0.03;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 + Math.random() * 500, crackTime);
    osc.frequency.exponentialRampToValueAtTime(300, crackTime + duration);

    gain.gain.setValueAtTime(0.08, crackTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, crackTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(crackTime);
    osc.stop(crackTime + duration + 0.05);
  }
}

/**
 * 4. Panda Purr / Happy Reward chime
 * Warm upward arpeggio and a low rolling sound
 */
export function playPandaPurr() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Warm pentatonic upward chime
  const notes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // E4, G4, A4, C5, D5, E5
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.6);
  });

  // Panda purr vibration
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90 + (i % 2) * 10, now + i * 0.15); // low purring hum

    oscGain.gain.setValueAtTime(0, now + i * 0.15);
    oscGain.gain.linearRampToValueAtTime(0.08, now + i * 0.15 + 0.05);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.14);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.2);
  }
}
