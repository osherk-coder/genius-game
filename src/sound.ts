let ctx: AudioContext | null = null;
let enabled = true;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
};

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* audio unavailable */
  }
}

export const sounds = {
  correct: () => {
    tone(660, 0, 0.15);
    tone(880, 0.1, 0.25);
  },
  wrong: () => tone(220, 0, 0.3, 'triangle', 0.12),
  tap: () => tone(500, 0, 0.06, 'sine', 0.06),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3)),
  coin: () => {
    tone(988, 0, 0.08, 'square', 0.05);
    tone(1319, 0.08, 0.2, 'square', 0.05);
  },
};
