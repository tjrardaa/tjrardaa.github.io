import { useEffect, useRef, useState } from 'react'
import { PROFILE, PROJECTS, SKILLS, TROPHIES } from '../data'

// Terminal du bureau virtuel. Il ouvre les fenêtres et pilote aussi la scène 3D (lumière, sortie).
const FILES = {
  'a_propos.txt': PROFILE.about.join('\n'),
  'competences.txt': SKILLS.map(([k, v]) => `${k} : ${v}`).join('\n'),
  'contact.txt': `E-mail : ${PROFILE.email}\nLinkedIn : ${PROFILE.linkedin}\nGitHub : ${PROFILE.github}`,
  'pourquoi_le_pentest.txt': "Comprendre comment un système peut être cassé, pour mieux le protéger.\nMais d'abord : apprendre comment il fonctionne. D'où l'alternance en support, systèmes et réseaux.",
}
const APP_ALIASES = { cv: 'cv', projets: 'projects', projects: 'projects', trophees: 'trophies', trophies: 'trophies', contact: 'contact', apropos: 'about', about: 'about', terminal: 'terminal' }

const PROMPT = 'C:\\ARDA>'

const HELP = [
  ['help', 'cette aide'],
  ['whoami', 'qui je suis'],
  ['ls', 'les fichiers'],
  ['cat <fichier>', 'lire un fichier'],
  ['open <app>', 'cv, projets, trophees, contact, apropos'],
  ['projets', 'la liste des projets'],
  ['lumiere', 'allumer ou éteindre l’ampoule (mode nuit)'],
  ['exit', 'quitter l’écran et revenir au musée'],
  ['clear', 'effacer'],
]

export default function Terminal({ openApp, onExit, night, setNight }) {
  const [lines, setLines] = useState([
    { t: 'ArdaOS XP [version 5.1.2600]', c: 'text-[#c0c0c0]' },
    { t: '(C) Copyright 2026 Arda Nigiz.', c: 'text-[#c0c0c0]' },
    { t: '', c: '' },
    { t: 'Tape help pour la liste des commandes.', c: 'text-[#9b9a93]' },
    { t: '', c: '' },
  ])
  const [val, setVal] = useState('')
  const [hist, setHist] = useState([])
  const [hi, setHi] = useState(-1)
  const inputRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [lines])

  const print = (t, c = '') => setLines((l) => [...l, ...String(t).split('\n').map((x) => ({ t: x, c }))])

  const run = (raw) => {
    const cmd = raw.trim()
    setLines((l) => [...l, { t: `${PROMPT}${cmd}`, c: 'text-white' }])
    if (!cmd) return
    setHist((h) => [cmd, ...h].slice(0, 50))
    const [name, ...args] = cmd.split(/\s+/)
    const arg = args.join(' ')
    const low = name.toLowerCase()

    if (cmd === 'sudo make me hired') return print('[sudo] Mot de passe pour arda : ********\nAccès accordé. Alternance 2027 ? Écris-moi : ' + PROFILE.email, 'text-[#35d6a3]')
    if (/^rm\s+-rf/.test(cmd)) return print('Bien essayé.', 'text-[#ff7a5c]')

    switch (low) {
      case 'help':
        return print(HELP.map(([k, v]) => `${k.padEnd(16)} ${v}`).join('\n') + '\nEt quelques surprises cachées…')
      case 'whoami':
        return print(`${PROFILE.name}. ${PROFILE.title}. ${PROFILE.tagline}.`)
      case 'ls':
        return print(Object.keys(FILES).join('   ') + '   projets/   trophees/   CV_Arda_Nigiz.pdf')
      case 'cat':
        if (!arg) return print('cat : quel fichier ? (ls pour la liste)', 'text-[#ff7a5c]')
        if (FILES[arg]) return print(FILES[arg])
        if (arg.endsWith('.pdf')) { openApp('cv'); return print('Ouverture du CV…') }
        return print(`cat : ${arg} : fichier introuvable`, 'text-[#ff7a5c]')
      case 'open': {
        const a = APP_ALIASES[arg.toLowerCase().replace(/[^a-z]/g, '')]
        if (!a) return print('open : cv, projets, trophees, contact, apropos', 'text-[#ff7a5c]')
        openApp(a)
        return print(`Ouverture de ${arg}…`)
      }
      case 'cv':
        openApp('cv'); return print('Ouverture du CV…')
      case 'projets':
        return print(PROJECTS.map((p, i) => `${String(i + 1).padStart(2, '0')}  ${p.title}  (${p.meta})`).join('\n') + '\nopen projets pour les détails')
      case 'trophees':
        return print(TROPHIES.map((t) => `${t.got ? '[x]' : '[ ]'} ${t.name}`).join('\n'))
      case 'contact':
        return print(FILES['contact.txt'])
      case 'lumiere': case 'light': case 'theme':
        setNight(!night)
        return print(night ? 'Ampoule éteinte. Bonjour la galerie.' : 'Ampoule allumée. Bienvenue dans le noir.', 'text-[#ffd23f]')
      case 'exit': case 'quit':
        print('À bientôt.'); setTimeout(onExit, 300); return
      case 'clear':
        return setLines([])
      case 'date':
        return print(new Date().toLocaleString('fr-FR'))
      case 'echo':
        return print(arg)
      case 'cafe': case 'café': case 'coffee':
        return print('Erreur 418 : je suis une théière. Et Arda ne boit pas de café, seulement du chocolat chaud.', 'text-[#ffd23f]')
      case 'sudo':
        return print("arda n'est pas dans le fichier sudoers. Cet incident sera signalé.", 'text-[#ff7a5c]')
      case 'ping':
        return print(`PING ${arg || 'arda'} : 64 octets, temps=1 ms\nToujours joignable : ${PROFILE.email}`)
      case 'nmap':
        return print("Un scan sans autorisation écrite, c'est non. Règle numéro 1 du pentest.", 'text-[#ff7a5c]')
      case 'hack':
        return print('[█████████░] 92 %… Accès refusé. On apprend d’abord, on casse ensuite (et toujours avec permission).', 'text-[#35d6a3]')
      default:
        return print(`${name} : commande introuvable. Tape help.`, 'text-[#ff7a5c]')
    }
  }

  const onKey = (e) => {
    e.stopPropagation()
    if (e.key === 'Enter') { run(val); setVal(''); setHi(-1) }
    else if (e.key === 'ArrowUp') { const i = Math.min(hi + 1, hist.length - 1); if (hist[i]) { setHi(i); setVal(hist[i]) } e.preventDefault() }
    else if (e.key === 'ArrowDown') { const i = hi - 1; setHi(i); setVal(i >= 0 ? hist[i] : ''); e.preventDefault() }
    else if (e.key === 'Tab') {
      e.preventDefault()
      const all = ['help', 'whoami', 'ls', 'cat', 'open', 'projets', 'trophees', 'contact', 'lumiere', 'exit', 'clear', ...Object.keys(FILES)]
      const parts = val.split(' ')
      const last = parts.pop()
      const m = all.filter((x) => x.startsWith(last))
      if (m.length === 1) setVal([...parts, m[0]].join(' ') + ' ')
    }
  }

  return (
    <div className="xp-cmd flex-1 min-h-0 bg-black text-[#c0c0c0] text-[14px] leading-5 p-2 os-scroll overflow-auto" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => <div key={i} className={`whitespace-pre-wrap ${l.c}`}>{l.t || ' '}</div>)}
      <div className="flex">
        <span className="text-[#c0c0c0] shrink-0 whitespace-pre">{PROMPT}</span>
        <input ref={inputRef} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none text-white caret-white xp-cmd" spellCheck={false} autoComplete="off" aria-label="Commande" />
      </div>
      <div ref={endRef} />
    </div>
  )
}
