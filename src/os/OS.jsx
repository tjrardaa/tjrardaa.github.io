import { useEffect, useRef, useState } from 'react'
import { PROFILE, PROJECTS, SKILLS, TROPHIES } from '../data'
import Terminal from './Terminal'

// Écran virtuel de 1024 x 768 affiché sur le moniteur 3D.
export const SCREEN_W = 1024
export const SCREEN_H = 768

const BOOT_LINES = [
  'ArdaOS 1.0 · démarrage',
  '[ OK ] Montage de /home/arda',
  '[ OK ] Chargement du module curiosite.ko',
  '[ OK ] Démarrage du service reseau (DHCP, DNS)',
  '[ OK ] Connexion SSH à bandit.labs.overthewire.org',
  '[WARN] cafe.service introuvable, remplacé par chocolat-chaud.service',
  '[ OK ] Ouverture de la session invité',
]

function Logo({ size = 40, light = true }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden>
      <path d="M48 214 L128 72 L208 214" fill="none" stroke={light ? '#f1eee5' : '#12141f'} strokeWidth="28" strokeLinejoin="round" />
      <rect x="104" y="166" width="48" height="24" rx="4" fill="#ff5a36" className="cursor-blink" />
    </svg>
  )
}

function Boot({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= BOOT_LINES.length) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setN(n + 1), n === 0 ? 500 : 260)
    return () => clearTimeout(t)
  }, [n, onDone])
  return (
    <div className="absolute inset-0 bg-[#07080c] text-[#d6d3c9] p-10 text-[20px] leading-8" onClick={onDone}>
      <div className="flex items-center gap-4 mb-8">
        <Logo size={64} />
        <span className="text-[34px] text-white font-sans font-extrabold tracking-tight">ArdaOS</span>
      </div>
      {BOOT_LINES.slice(0, n).map((l) => (
        <div key={l} className={l.includes('WARN') ? 'text-[#ffd23f]' : ''}>{l}</div>
      ))}
      <span className="cursor-blink">_</span>
      <div className="absolute bottom-8 right-10 text-[16px] text-[#67655e]">clic pour passer</div>
    </div>
  )
}

const APPS = {
  about: { title: 'a_propos.txt', icon: '📄', w: 600, h: 470 },
  projects: { title: 'Projets', icon: '📁', w: 700, h: 540 },
  cv: { title: 'CV_Arda_Nigiz.pdf', icon: '📑', w: 520, h: 400 },
  trophies: { title: 'Trophées', icon: '🏆', w: 640, h: 470 },
  contact: { title: 'Contact', icon: '✉️', w: 520, h: 380 },
  terminal: { title: 'terminal', icon: '⌨️', w: 700, h: 470 },
}
const ICON_ORDER = ['about', 'projects', 'cv', 'trophies', 'contact', 'terminal']

function AboutApp() {
  return (
    <div className="p-6 text-[17px] leading-7 font-sans text-[#e8e5dc]">
      <h2 className="text-[30px] font-extrabold text-white mb-1">{PROFILE.name}</h2>
      <div className="text-[#ff7a5c] font-mono text-[15px] mb-4">{PROFILE.title}</div>
      {PROFILE.about.map((p) => <p key={p} className="mb-3">{p}</p>)}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {PROFILE.facts.map(([k, v]) => (
          <div key={k} className="bg-white/5 rounded-lg p-3">
            <div className="text-[13px] font-mono text-[#9b9a93]">{k}</div>
            <div className="text-[16px]">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsApp() {
  const [open, setOpen] = useState(PROJECTS[0].id)
  const p = PROJECTS.find((x) => x.id === open)
  return (
    <div className="flex h-full font-sans">
      <div className="w-[230px] border-r border-white/10 p-2 os-scroll overflow-auto">
        {PROJECTS.map((x) => (
          <button key={x.id} onClick={() => setOpen(x.id)}
            className={`btn w-full text-left px-3 py-2 rounded-md text-[15px] mb-1 ${open === x.id ? 'bg-[#ff5a36] text-white' : 'text-[#d6d3c9] hover:bg-white/10'}`}>
            📁 {x.title}
          </button>
        ))}
      </div>
      <div className="flex-1 p-5 os-scroll overflow-auto text-[#e8e5dc]">
        <h3 className="text-[24px] font-extrabold text-white">{p.title}</h3>
        <div className="font-mono text-[13px] text-[#ffd23f] mb-3">{p.meta}</div>
        <p className="text-[16px] mb-3">{p.summary}</p>
        <ul className="list-disc pl-5 text-[15px] leading-7">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
        {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="inline-block mt-4 font-mono text-[14px] text-[#35d6a3] underline">Voir le code sur GitHub ↗</a>}
      </div>
    </div>
  )
}

function CvApp() {
  return (
    <div className="p-6 font-sans text-[#e8e5dc] flex flex-col gap-4 h-full">
      <div className="flex gap-4 items-start">
        <div className="w-[110px] h-[150px] bg-white rounded shadow-lg flex flex-col p-2 gap-1 shrink-0">
          <div className="h-3 w-16 bg-[#12141f] rounded" />
          <div className="h-2 w-12 bg-[#3b7dd8] rounded" />
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-1.5 bg-[#d6d3c9] rounded" style={{ width: `${60 + ((i * 37) % 40)}%` }} />)}
        </div>
        <div>
          <div className="text-[22px] font-extrabold text-white">CV_Arda_Nigiz.pdf</div>
          <div className="text-[15px] text-[#9b9a93] mb-3">1 page · Support IT, réseaux et cybersécurité</div>
          <div className="text-[15px]">{SKILLS.slice(0, 3).map(([k, v]) => <div key={k}><b className="text-white">{k} :</b> {v}</div>)}</div>
        </div>
      </div>
      <div className="flex gap-3 mt-auto">
        <a href={PROFILE.cv} target="_blank" rel="noreferrer" className="btn bg-[#ff5a36] text-white px-4 py-2 rounded-lg text-[16px] font-semibold">Ouvrir le CV</a>
        <a href={PROFILE.cv} download className="btn bg-white/10 text-white px-4 py-2 rounded-lg text-[16px]">Télécharger</a>
      </div>
    </div>
  )
}

function TrophiesApp() {
  const got = TROPHIES.filter((t) => t.got).length
  return (
    <div className="p-5 font-sans text-[#e8e5dc]">
      <div className="font-mono text-[14px] text-[#9b9a93] mb-3">/home/arda/trophees · {got} / {TROPHIES.length} débloqués</div>
      <div className="grid grid-cols-4 gap-3">
        {TROPHIES.map((t) => (
          <div key={t.name} title={t.desc} className={`rounded-xl p-3 text-center ${t.got ? 'bg-[#ffd23f]/15 ring-1 ring-[#ffd23f]/60' : 'bg-white/5 opacity-55'}`}>
            <div className="text-[34px]">{t.got ? '🏅' : '🔒'}</div>
            <div className="text-[14px] font-semibold leading-tight mt-1">{t.name}</div>
            <div className="text-[12px] font-mono text-[#9b9a93] mt-1">{t.got ? t.date : 'verrouillé'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactApp() {
  const rows = [
    ['E-mail', PROFILE.email, `mailto:${PROFILE.email}`],
    ['LinkedIn', 'arda-nigiz', PROFILE.linkedin],
    ['GitHub', 'tjrardaa', PROFILE.github],
    ['CV', 'CV_Arda_Nigiz.pdf', PROFILE.cv],
  ]
  return (
    <div className="p-6 font-sans text-[#e8e5dc]">
      <p className="text-[17px] mb-4">Une alternance à proposer en support IT, systèmes ou réseaux, en Île-de-France ? Écris-moi.</p>
      {rows.map(([k, v, href]) => (
        <a key={k} href={href} target="_blank" rel="noreferrer" className="btn flex justify-between items-center bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 mb-2">
          <span className="font-mono text-[14px] text-[#9b9a93]">{k}</span>
          <span className="text-[16px] text-white">{v} ↗</span>
        </a>
      ))}
    </div>
  )
}

function Window({ id, win, focus, close, move, children, active }) {
  const drag = useRef(null)
  const onDown = (e) => {
    focus(id)
    drag.current = { x: e.clientX, y: e.clientY, ox: win.x, oy: win.y, scale: e.currentTarget.getBoundingClientRect().width / win.w }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const s = d.scale || 1
    move(id, d.ox + (e.clientX - d.x) / s, d.oy + (e.clientY - d.y) / s)
  }
  const onUp = () => { drag.current = null }
  return (
    <div className="os-window absolute rounded-xl overflow-hidden bg-[#161924] flex flex-col"
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }} onPointerDown={() => focus(id)}>
      <div className={`h-10 flex items-center px-3 gap-2 select-none cursor-grab shrink-0 ${active ? 'bg-[#232737]' : 'bg-[#1c1f2c]'}`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => close(id)} aria-label="Fermer"
          className="btn w-4 h-4 rounded-full bg-[#ff5a36] hover:brightness-110" />
        <span className="w-4 h-4 rounded-full bg-[#ffd23f]" />
        <span className="w-4 h-4 rounded-full bg-[#35d6a3]" />
        <span className="ml-2 text-[15px] text-[#d6d3c9]">{APPS[id].title}</span>
      </div>
      <div className="flex-1 min-h-0 os-scroll overflow-auto">{children}</div>
    </div>
  )
}

export default function OS({ active, onExit, night, setNight, booted, setBooted }) {
  const [wins, setWins] = useState({})
  const [top, setTop] = useState(10)
  const [focused, setFocused] = useState(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 15000)
    return () => clearInterval(t)
  }, [])

  const openApp = (id) => {
    setTop((z) => z + 1)
    setFocused(id)
    setWins((w) => {
      if (w[id]) return { ...w, [id]: { ...w[id], z: top + 1 } }
      const n = Object.keys(w).length
      const a = APPS[id]
      return { ...w, [id]: { x: Math.min(150 + n * 34, SCREEN_W - a.w - 20), y: Math.min(40 + n * 28, SCREEN_H - a.h - 70), w: a.w, h: a.h, z: top + 1 } }
    })
  }
  const close = (id) => setWins((w) => { const c = { ...w }; delete c[id]; return c })
  const focus = (id) => { if (focused === id) return; setTop((z) => z + 1); setFocused(id); setWins((w) => (w[id] ? { ...w, [id]: { ...w[id], z: top + 1 } } : w)) }
  const move = (id, x, y) => setWins((w) => ({ ...w, [id]: { ...w[id], x: Math.max(-w[id].w + 120, Math.min(x, SCREEN_W - 120)), y: Math.max(0, Math.min(y, SCREEN_H - 90)) } }))

  // Au premier démarrage : ouvrir le terminal et la présentation
  const bootDone = () => {
    setBooted(true)
    setTimeout(() => { openApp('about') }, 50)
  }

  return (
    <div className="os-root relative overflow-hidden select-none" style={{ width: SCREEN_W, height: SCREEN_H, background: 'radial-gradient(120% 90% at 30% 20%, #26304f 0%, #12141f 55%, #07080c 100%)' }}>
      {!booted && active && <Boot onDone={bootDone} />}
      {!active && !booted && (
        <div className="absolute inset-0 bg-[#07080c] flex flex-col items-center justify-center gap-4">
          <Logo size={140} />
          <div className="text-[#9b9a93] text-[22px]">Clique pour démarrer<span className="cursor-blink">_</span></div>
        </div>
      )}
      {booted && (
        <>
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none"><Logo size={460} /></div>
          <div className="absolute left-5 top-5 flex flex-col gap-3">
            {ICON_ORDER.map((id) => (
              <button key={id} onDoubleClick={() => openApp(id)} onClick={() => openApp(id)}
                className="btn w-[96px] flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10 text-[#f1eee5]">
                <span className="text-[38px] leading-none">{APPS[id].icon}</span>
                <span className="text-[13px] text-center leading-tight">{APPS[id].title}</span>
              </button>
            ))}
          </div>
          {Object.entries(wins).map(([id, win]) => (
            <Window key={id} id={id} win={win} focus={focus} close={close} move={move} active={focused === id}>
              {id === 'about' && <AboutApp />}
              {id === 'projects' && <ProjectsApp />}
              {id === 'cv' && <CvApp />}
              {id === 'trophies' && <TrophiesApp />}
              {id === 'contact' && <ContactApp />}
              {id === 'terminal' && <Terminal openApp={openApp} onExit={onExit} night={night} setNight={setNight} />}
            </Window>
          ))}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-[#0b0d14]/90 border-t border-white/10 flex items-center px-3 gap-3 text-[#d6d3c9] text-[15px]" style={{ zIndex: 9999 }}>
            <button className="btn flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-md px-3 py-1" onClick={() => openApp('terminal')}>
              <Logo size={22} /> <span>Terminal</span>
            </button>
            {Object.keys(wins).map((id) => (
              <button key={id} onClick={() => focus(id)} className={`btn rounded-md px-3 py-1 ${focused === id ? 'bg-white/15' : 'hover:bg-white/10'}`}>{APPS[id].title}</button>
            ))}
            <span className="ml-auto">{night ? '🌙' : '☀️'} {clock}</span>
            <button className="btn bg-[#ff5a36] text-white rounded-md px-3 py-1" onClick={onExit}>Quitter l’écran</button>
          </div>
        </>
      )}
    </div>
  )
}
