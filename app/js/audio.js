// Efectos de sonido sintetizados con WebAudio (sin archivos). Activar/desactivar con el botón 🔊.
let sndCtx = null, sndOn = true;
try { sndOn = JSON.parse(localStorage.getItem('tow_snd') ?? 'true'); } catch { /* */ }
export const sndEnabled = () => sndOn;
export function sndToggle() { sndOn = !sndOn; try { localStorage.setItem('tow_snd', JSON.stringify(sndOn)); } catch { /* */ } return sndOn; }
function sndCtxGet() {
  if (!sndCtx) { try { sndCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (sndCtx.state === 'suspended') sndCtx.resume();
  return sndCtx;
}
function sndNoise(c, dur, f0, f1, vol, type = 'lowpass', t0 = 0) {
  const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = type;
  const t = c.currentTime + t0; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
function sndTone(c, f0, f1, dur, vol, type = 'sine', t0 = 0) {
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0; o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
// kind: move | charge | shoot | cannon | cast | combat | destroy | turn | flee | win
export function sndPlay(kind) {
  if (!sndOn) return; const c = sndCtxGet(); if (!c) return;
  switch (kind) {
    case 'move': sndNoise(c, 0.18, 900, 300, 0.05, 'bandpass'); sndNoise(c, 0.16, 800, 260, 0.04, 'bandpass', 0.1); break;
    case 'charge': sndTone(c, 110, 70, 0.35, 0.12, 'sawtooth'); sndNoise(c, 0.5, 1400, 300, 0.1, 'bandpass'); sndNoise(c, 0.25, 600, 200, 0.12, 'lowpass', 0.2); break;
    case 'shoot': sndNoise(c, 0.12, 4000, 1200, 0.08, 'highpass'); sndNoise(c, 0.22, 3000, 800, 0.05, 'highpass', 0.12); break;
    case 'cannon': sndNoise(c, 0.7, 700, 60, 0.4, 'lowpass'); sndTone(c, 90, 38, 0.5, 0.3, 'sine'); break;
    case 'cast': sndTone(c, 300, 1100, 0.5, 0.07, 'triangle'); sndTone(c, 450, 1650, 0.5, 0.05, 'sine', 0.05); sndNoise(c, 0.45, 3000, 6000, 0.03, 'highpass'); break;
    case 'combat': sndNoise(c, 0.12, 2500, 600, 0.12, 'bandpass'); sndNoise(c, 0.12, 2000, 500, 0.1, 'bandpass', 0.14); sndTone(c, 160, 70, 0.14, 0.12, 'square', 0.05); break;
    case 'destroy': sndTone(c, 220, 55, 0.5, 0.14, 'sawtooth'); sndNoise(c, 0.4, 900, 100, 0.12, 'lowpass'); break;
    case 'flee': sndNoise(c, 0.35, 700, 1600, 0.05, 'bandpass'); break;
    case 'turn': sndTone(c, 392, 392, 0.14, 0.08, 'triangle'); sndTone(c, 523, 523, 0.2, 0.08, 'triangle', 0.14); break;
    case 'win': [523, 659, 784, 1046].forEach((f, i) => sndTone(c, f, f, 0.3, 0.09, 'triangle', i * 0.16)); break;
    default: break;
  }
}
