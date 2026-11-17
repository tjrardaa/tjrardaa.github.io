import { useEffect, useRef, useState } from 'react'
import { PROFILE, PROJECTS, SKILLS, TROPHIES } from '../data'
import Terminal from './Terminal'
import './xp.css'

// Écran virtuel de 1024 x 768 affiché sur le moniteur 3D. Habillage inspiré de Windows XP (dessiné en CSS).
export const SCREEN_W = 1024
export const SCREEN_H = 768
const TASKBAR = 40

const BOOT_LINES = [
  'ArdaOS XP · démarrage',
  'Vérification de la mémoire : 640 Ko ... OK (largement suffisant)',
  'Chargement du module curiosite.sys',
  'Démarrage du service reseau (DHCP, DNS)',
  'Connexion SSH à bandit.labs.overthewire.org',
  '[WARN] cafe.service introuvable, remplacé par chocolat-chaud.service',
  'Ouverture de la session invité',
]

// Logo maison : un « A » dans une pastille quadricolore
function Logo({ size = 24 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <rect x="4" y="4" width="26" height="26" rx="5" fill="#f25022" />
      <rect x="34" y="4" width="26" height="26" rx="5" fill="#7fba00" />
      <rect x="4" y="34" width="26" height="26" rx="5" fill="#00a4ef" />
      <rect x="34" y="34" width="26" height="26" rx="5" fill="#ffb900" />
      <path d="M18 50 L32 16 L46 50" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Boot({ onDone }) {
  const [n, setN] = useState(0)
  const [splash, setSplash] = useState(false)
  useEffect(() => {
    if (splash) {
      const t = setTimeout(onDone, 2600)
      return () => clearTimeout(t)
    }
    if (n >= BOOT_LINES.length) {
      const t = setTimeout(() => setSplash(true), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setN(n + 1), n === 0 ? 400 : 220)
    return () => clearTimeout(t)
  }, [n, splash, onDone])
  if (splash) {
    return (
      <div className="xp absolute inset-0 bg-black text-white flex flex-col items-center justify-center gap-8" onClick={onDone}>
        <div className="flex items-center gap-5">
          <Logo size={86} />
          <div>
            <div className="text-[18px] text-[#d6d6d6] tracking-wide">Arda<sup className="text-[11px]">®</sup> Nigiz</div>
            <div className="flex items-end gap-2">
              <span className="text-[56px] leading-none font-extrabold tracking-tight" style={{ fontFamily: "'Trebuchet MS', Tahoma, sans-serif" }}>ArdaOS</span>
              <span className="text-[26px] font-extrabold text-[#ff8a1f] italic mb-1">xp</span>
            </div>
          </div>
        </div>
        <div className="xp-loadbar" aria-hidden><i /></div>
        <div className="absolute bottom-6 left-8 text-[13px] text-[#c8c8c8]">Copyright © 2026 Arda Nigiz</div>
        <div className="absolute bottom-6 right-8 text-[13px] text-[#c8c8c8]">clic pour passer</div>
      </div>
    )
  }
  return (
    <div className="absolute inset-0 bg-black text-[#c0c0c0] p-8 text-[17px] leading-7 xp-cmd" onClick={onDone}>
      {BOOT_LINES.slice(0, n).map((l) => (
        <div key={l} className={l.includes('WARN') ? 'text-[#ffd23f]' : ''}>{l}</div>
      ))}
      <span className="cursor-blink">_</span>
      <div className="absolute bottom-6 right-8 text-[14px] text-[#67655e]">clic pour passer</div>
    </div>
  )
}

const APPS = {
  about: { title: 'a_propos.txt - Bloc-notes', short: 'a_propos.txt', icon: '📄', w: 600, h: 470 },
  projects: { title: 'Projets', short: 'Projets', icon: '📁', w: 720, h: 520 },
  cv: { title: 'CV_Arda_Nigiz.pdf', short: 'CV_Arda_Nigiz.pdf', icon: '📑', w: 540, h: 400 },
  trophies: { title: 'Trophées', short: 'Trophées', icon: '🏆', w: 650, h: 470 },
  contact: { title: 'Contact', short: 'Contact', icon: '✉️', w: 520, h: 380 },
  terminal: { title: 'Invite de commandes', short: 'Invite de commandes', icon: '⌨️', w: 700, h: 470 },
}
const ICON_ORDER = ['about', 'projects', 'cv', 'trophies', 'contact', 'terminal']

function AboutApp() {
  return (
    <>
      <div className="xp-menubar"><span>Fichier</span><span>Edition</span><span>Format</span><span>Affichage</span><span>?</span></div>
      <div className="flex-1 min-h-0 bg-white os-scroll overflow-auto p-3 xp-cmd text-[14px] leading-6">
        <div className="text-[18px] font-bold">{PROFILE.name}</div>
        <div className="text-[#b03a1a] mb-3">{PROFILE.title}</div>
        {PROFILE.about.map((p) => <p key={p} className="mb-3">{p}</p>)}
        <div className="mt-4 border-t border-dashed border-[#999] pt-2">
          {PROFILE.facts.map(([k, v]) => <div key={k}><span className="text-[#555]">{k} :</span> {v}</div>)}
        </div>
      </div>
    </>
  )
}

function ProjectsApp() {
  const [open, setOpen] = useState(PROJECTS[0].id)
  const p = PROJECTS.find((x) => x.id === open)
  return (
    <>
      <div className="xp-menubar"><span>Fichier</span><span>Edition</span><span>Affichage</span><span>Favoris</span><span>?</span></div>
      <div className="xp-address"><span>Adresse</span><div>C:\Projets\{p.title}</div></div>
      <div className="flex flex-1 min-h-0">
        <div className="w-[210px] shrink-0 xp-task-pane os-scroll overflow-auto">
          <div className="xp-task-box">
            <div className="xp-pane-head" style={{ borderRadius: 0 }}>Dossiers</div>
            {PROJECTS.map((x) => (
              <button key={x.id} onClick={() => setOpen(x.id)} className={`xp-task-item ${open === x.id ? 'on' : ''}`}>
                <span>📁</span><span className="leading-tight">{x.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white os-scroll overflow-auto p-5">
          <h3 className="text-[22px] font-bold text-[#1a3a8f]">{p.title}</h3>
          <div className="text-[12px] text-[#777] mb-3">{p.meta}</div>
          <p className="mb-3 text-[14px]">{p.summary}</p>
          <ul className="list-disc pl-5 text-[14px] leading-6">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
          {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[#0033cc] underline">Voir le code sur GitHub ↗</a>}
        </div>
      </div>
    </>
  )
}

function CvApp() {
  return (
    <div className="flex flex-col h-full">
      <div className="xp-menubar"><span>Fichier</span><span>Affichage</span><span>Outils</span><span>?</span></div>
      <div className="flex-1 min-h-0 p-5 flex gap-5 items-start">
        <div className="w-[120px] h-[160px] bg-white border border-[#7f9db9] shadow-md flex flex-col p-2 gap-1 shrink-0">
          <div className="h-3 w-16 bg-[#222] rounded-sm" />
          <div className="h-2 w-12 bg-[#3b7dd8] rounded-sm" />
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-1.5 bg-[#d6d3c9]" style={{ width: `${60 + ((i * 37) % 40)}%` }} />)}
        </div>
        <div>
          <div className="text-[19px] font-bold text-[#1a3a8f]">CV_Arda_Nigiz.pdf</div>
          <div className="text-[13px] text-[#555] mb-3">1 page · Support IT, réseaux et cybersécurité</div>
          <div className="text-[13px] leading-6">{SKILLS.slice(0, 3).map(([k, v]) => <div key={k}><b>{k} :</b> {v}</div>)}</div>
        </div>
      </div>
      <div className="flex gap-3 justify-end p-3 border-t border-[#aca899]">
        <a href={PROFILE.cv} target="_blank" rel="noreferrer" className="xp-btn primary">Ouvrir le CV</a>
        <a href={PROFILE.cv} download className="xp-btn">Télécharger</a>
      </div>
    </div>
  )
}

function TrophiesApp() {
  const got = TROPHIES.filter((t) => t.got).length
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="xp-menubar"><span>Fichier</span><span>Affichage</span><span>?</span></div>
      <div className="flex-1 min-h-0 bg-white os-scroll overflow-auto p-4">
        <div className="text-[13px] text-[#555] mb-3">C:\Trophées · {got} / {TROPHIES.length} débloqués</div>
        <div className="grid grid-cols-4 gap-3">
          {TROPHIES.map((t) => (
            <div key={t.name} title={t.desc} className={`xp-group p-3 text-center ${t.got ? '' : 'opacity-55'}`}>
              <div className="text-[32px]">{t.got ? '🏅' : '🔒'}</div>
              <div className="text-[13px] font-bold leading-tight mt-1">{t.name}</div>
              <div className="text-[11px] text-[#777] mt-1">{t.got ? t.date : 'verrouillé'}</div>
            </div>
          ))}
        </div>
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
    <div className="flex-1 min-h-0 p-5 bg-[#ece9d8]">
      <p className="text-[14px] mb-4">Une alternance à proposer en support IT, systèmes ou réseaux, en Île-de-France ? Écris-moi.</p>
      <div className="xp-group p-2">
        {rows.map(([k, v, href]) => (
          <a key={k} href={href} target="_blank" rel="noreferrer" className="flex justify-between items-center px-3 py-2 hover:bg-[#316ac5] hover:text-white rounded-sm text-[14px]">
            <span className="font-bold">{k}</span>
            <span>{v} ↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function Window({ id, win, focus, close, minimize, toggleMax, move, children, active }) {
  const drag = useRef(null)
  const onDown = (e) => {
    focus(id)
    if (win.max) return
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
  const box = win.max ? { left: 0, top: 0, width: SCREEN_W, height: SCREEN_H - TASKBAR } : { left: win.x, top: win.y, width: win.w, height: win.h }
  return (
    <div className={`xp-window absolute ${active ? '' : 'inactive'}`}
      style={{ ...box, zIndex: win.z, display: win.min ? 'none' : 'flex', borderRadius: win.max ? 0 : undefined }} onPointerDown={() => focus(id)}>
      <div className="xp-title" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onDoubleClick={() => toggleMax(id)}>
        <span className="text-[16px]">{APPS[id].icon}</span>
        <span className="flex-1 truncate">{APPS[id].title}</span>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => minimize(id)} aria-label="Réduire" className="xp-tbtn">_</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleMax(id)} aria-label="Agrandir" className="xp-tbtn">□</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => close(id)} aria-label="Fermer" className="xp-tbtn close">✕</button>
      </div>
      <div className="xp-body">{children}</div>
    </div>
  )
}

function StartMenu({ openApp, onExit, onClose }) {
  const go = (id) => { openApp(id); onClose() }
  const Item = ({ id }) => (
    <button className="xp-menu-item" onClick={() => go(id)}>
      <span className="text-[24px] leading-none">{APPS[id].icon}</span>
      <span className="leading-tight">{APPS[id].short}</span>
    </button>
  )
  return (
    <div className="xp-menu" onPointerDown={(e) => e.stopPropagation()}>
      <div className="xp-menu-head"><div className="xp-avatar">🙂</div>Arda</div>
      <div className="xp-menu-cols">
        <div className="xp-menu-left">
          <Item id="about" /><Item id="projects" /><Item id="cv" />
          <div className="my-1 border-t border-[#d6d3c9]" />
          <Item id="terminal" />
        </div>
        <div className="xp-menu-right">
          <Item id="trophies" /><Item id="contact" />
        </div>
      </div>
      <div className="xp-menu-foot">
        <button onClick={() => { onClose(); onExit() }}>⏻ Quitter l’écran</button>
      </div>
    </div>
  )
}

export default function OS({ active, onExit, night, setNight, booted, setBooted }) {
  const [wins, setWins] = useState({})
  const [top, setTop] = useState(10)
  const [focused, setFocused] = useState(null)
  const [clock, setClock] = useState('')
  const [menu, setMenu] = useState(false)

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
      if (w[id]) return { ...w, [id]: { ...w[id], z: top + 1, min: false } }
      const n = Object.keys(w).length
      const a = APPS[id]
      return { ...w, [id]: { x: Math.min(150 + n * 34, SCREEN_W - a.w - 20), y: Math.min(30 + n * 28, SCREEN_H - TASKBAR - a.h - 10), w: a.w, h: a.h, z: top + 1, min: false, max: false } }
    })
  }
  const close = (id) => { setWins((w) => { const c = { ...w }; delete c[id]; return c }); setFocused((f) => (f === id ? null : f)) }
  const focus = (id) => { setMenu(false); if (focused === id) return; setTop((z) => z + 1); setFocused(id); setWins((w) => (w[id] ? { ...w, [id]: { ...w[id], z: top + 1 } } : w)) }
  const minimize = (id) => { setWins((w) => ({ ...w, [id]: { ...w[id], min: true } })); setFocused((f) => (f === id ? null : f)) }
  const toggleMax = (id) => setWins((w) => ({ ...w, [id]: { ...w[id], max: !w[id].max } }))
  const move = (id, x, y) => setWins((w) => ({ ...w, [id]: { ...w[id], x: Math.max(-w[id].w + 120, Math.min(x, SCREEN_W - 120)), y: Math.max(0, Math.min(y, SCREEN_H - TASKBAR - 30)) } }))
  const taskClick = (id) => {
    const w = wins[id]
    if (w.min) openApp(id)
    else if (focused === id) minimize(id)
    else focus(id)
  }

  // Au premier démarrage : ouvrir la présentation
  const bootDone = () => {
    setBooted(true)
    setTimeout(() => { openApp('about') }, 50)
  }

  return (
    <div className="os-root xp relative overflow-hidden select-none xp-desktop" style={{ width: SCREEN_W, height: SCREEN_H }}
      onPointerDown={() => setMenu(false)}>
      {!booted && active && <Boot onDone={bootDone} />}
      {!active && !booted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-white"
          style={{ background: 'linear-gradient(to bottom, #00309c 0, #00309c 9%, #5a7edc 9%, #5a7edc 12%, #5a7edc 100%)' }}>
          <Logo size={120} />
          <div className="text-[34px] font-bold italic" style={{ fontFamily: "'Trebuchet MS', Tahoma, sans-serif", textShadow: '2px 2px 4px #0a1d5c' }}>Bienvenue</div>
          <div className="text-[18px]">Clique pour démarrer<span className="cursor-blink">_</span></div>
        </div>
      )}
      {booted && (
        <>
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {ICON_ORDER.map((id) => (
              <button key={id} onClick={() => openApp(id)} className="xp-icon flex flex-col items-center gap-1">
                <span className="text-[38px] leading-none drop-shadow">{APPS[id].icon}</span>
                <span>{APPS[id].short}</span>
              </button>
            ))}
          </div>
          {Object.entries(wins).map(([id, win]) => (
            <Window key={id} id={id} win={win} focus={focus} close={close} minimize={minimize} toggleMax={toggleMax} move={move} active={focused === id}>
              {id === 'about' && <AboutApp />}
              {id === 'projects' && <ProjectsApp />}
              {id === 'cv' && <CvApp />}
              {id === 'trophies' && <TrophiesApp />}
              {id === 'contact' && <ContactApp />}
              {id === 'terminal' && <Terminal openApp={openApp} onExit={onExit} night={night} setNight={setNight} />}
            </Window>
          ))}
          {menu && <StartMenu openApp={openApp} onExit={onExit} onClose={() => setMenu(false)} />}
          <div className="xp-taskbar absolute bottom-0 inset-x-0" style={{ zIndex: 9999 }} onPointerDown={(e) => e.stopPropagation()}>
            <button className={`xp-start ${menu ? 'open' : ''}`} onClick={() => setMenu((m) => !m)}>
              <Logo size={26} /> démarrer
            </button>
            <div className="flex items-center ml-2 min-w-0">
              {Object.keys(wins).map((id) => (
                <button key={id} onClick={() => taskClick(id)} className={`xp-task-btn ${focused === id && !wins[id].min ? 'on' : ''}`}>
                  <span>{APPS[id].icon}</span><span className="truncate">{APPS[id].short}</span>
                </button>
              ))}
            </div>
            <div className="xp-tray">
              <button onClick={() => setNight(!night)} aria-label="Lumière" title="Allumer ou éteindre l’ampoule">{night ? '🌙' : '☀️'}</button>
              <span>{clock}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
