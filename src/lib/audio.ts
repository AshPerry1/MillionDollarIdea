let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.08,
  when = 0,
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime + when);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + when);
  osc.stop(c.currentTime + when + duration + 0.05);
}

export function playScanTick() {
  tone(880, 0.04, "sine", 0.04);
}

export function playReveal() {
  tone(220, 0.3, "sine", 0.1);
  tone(440, 0.25, "triangle", 0.06, 0.08);
  tone(660, 0.4, "sine", 0.05, 0.15);
}

export function playBeat(hue: number) {
  const base = 180 + (hue % 120);
  tone(base, 0.08, "square", 0.05);
}

export function playPerfect() {
  tone(523, 0.1, "sine", 0.07);
  tone(784, 0.15, "sine", 0.05, 0.05);
}

export function playGood() {
  tone(392, 0.1, "triangle", 0.05);
}

export function playMiss() {
  tone(110, 0.2, "sawtooth", 0.04);
}

export function playVictory() {
  [0, 0.1, 0.2, 0.35].forEach((t, i) => {
    tone(261 * (i + 1) * 0.5 + 130, 0.2, "sine", 0.06, t);
  });
}

export function resumeAudio() {
  void getCtx()?.resume();
}
