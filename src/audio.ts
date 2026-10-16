/* Efeitos sonoros sintetizados com Web Audio — sem arquivos, sem permissão
   de rede, zero bytes de download. Curto e seco, estilo game de arcade. */

let ctx: AudioContext | null = null;
let ligado = true;

function ac(): AudioContext | null {
  if (!ligado) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export const setSom = (v: boolean) => { ligado = v; };
export const getSom = () => ligado;

function blip(freq: number, dur: number, tipo: OscillatorType = 'square', vol = 0.05, atraso = 0) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + atraso;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const somClique = () => blip(620, 0.08, 'square', 0.035);
export const somEscolha = () => { blip(520, 0.09, 'triangle', 0.05); blip(780, 0.1, 'triangle', 0.05, 0.07); };
export const somVirada = () => {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.22);
  g.gain.setValueAtTime(0.045, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc.connect(g).connect(c.destination);
  osc.start(t); osc.stop(t + 0.27);
};
export const somAcerto = () => { blip(660, 0.12, 'square', 0.05); blip(880, 0.12, 'square', 0.05, 0.1); blip(1320, 0.22, 'square', 0.045, 0.2); };
export const somErro = () => { blip(300, 0.16, 'sawtooth', 0.04); blip(190, 0.28, 'sawtooth', 0.04, 0.12); };
export const somFim = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.18, 'triangle', 0.05, i * 0.12)); };
