// Sons d'ambiance fabriqués dans le navigateur (WebAudio) : aucun fichier audio, donc aucun droit à gérer.
// Air de la pièce, ventilateur du PC, ronflement de l'ampoule, petits tics du disque dur.
// Tout se coupe avec setMuted().

const KEY = 'muted'
let ctx = null
let master = null
let hum = null

export function isMuted() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

function noise(c, seconds, brown) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2 } else d[i] = w
  }
  return b
}

function burst(freq, dur, gain, q = 1.2) {
  if (!ctx) return
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx, 0.2, false)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q
  const g = ctx.createGain()
  const t = ctx.currentTime
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp).connect(g).connect(master)
  src.start(t); src.stop(t + dur + 0.02)
}

function scheduleTicks() {
  const next = () => {
    const n = 2 + Math.floor(Math.random() * 4)
    for (let i = 0; i < n; i++) setTimeout(() => burst(1500 + Math.random() * 900, 0.035, 0.05), i * (60 + Math.random() * 90))
    setTimeout(next, 3000 + Math.random() * 7000)
  }
  setTimeout(next, 2500)
}

export function startAudio() {
  if (ctx) { ctx.resume(); return }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = isMuted() ? 0 : 1
  master.connect(ctx.destination)

  // air de la pièce
  const air = ctx.createBufferSource()
  air.buffer = noise(ctx, 6, true); air.loop = true
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360
  const airG = ctx.createGain(); airG.gain.value = 0.16
  air.connect(lp).connect(airG).connect(master); air.start()

  // ventilateur du PC
  const fan = ctx.createBufferSource()
  fan.buffer = noise(ctx, 4, false); fan.loop = true
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.7
  const fanG = ctx.createGain(); fanG.gain.value = 0.011
  fan.connect(bp).connect(fanG).connect(master); fan.start()

  // ronflement de l'ampoule : 100 Hz et harmoniques
  hum = ctx.createGain(); hum.gain.value = 0.003
  ;[[100, 1], [200, 0.5], [300, 0.25]].forEach(([f, a]) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f
    const g = ctx.createGain(); g.gain.value = a * 0.5
    o.connect(g).connect(hum); o.start()
  })
  hum.connect(master)

  scheduleTicks()
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend(); else ctx.resume()
  })
}

export function setMuted(m) {
  try { localStorage.setItem(KEY, m ? '1' : '0') } catch { /* stockage indisponible */ }
  if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05)
}

// la nuit, l'ampoule est la seule lumière : son ronflement se remarque davantage
export function setNightAudio(night) {
  if (hum) hum.gain.setTargetAtTime(night ? 0.012 : 0.003, ctx.currentTime, 0.3)
}

// clic de l'interrupteur
export function clickSound() {
  if (!ctx) return
  burst(2400, 0.05, 0.12, 2)
  const o = ctx.createOscillator(); o.type = 'square'
  const g = ctx.createGain()
  const t = ctx.currentTime
  o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.06)
  g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.08)
}
