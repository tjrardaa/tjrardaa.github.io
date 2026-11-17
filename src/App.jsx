import { useCallback, useEffect, useMemo, useState } from 'react'
import Scene from './scene/Scene'
import Recruiter from './Recruiter'
import ScreenLayer from './ScreenLayer'
import Start from './Start'
import OS, { SCREEN_W, SCREEN_H } from './os/OS'
import { MuseumCard, TourBar } from './MuseumUI'
import { stopCamera } from './scene/museumLayout'
import { MUSEUM, PROFILE } from './data'
import { startAudio, setMuted, isMuted, setNightAudio, clickSound } from './audio'

function readNight() {
  try {
    const v = localStorage.getItem('night')
    if (v !== null) return v === '1'
  } catch { /* stockage indisponible */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function useMobile() {
  const [m, setM] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const on = () => setM(window.innerWidth < 768)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

export default function App() {
  const [night, setNightState] = useState(readNight)
  const [view, setView] = useState('room')
  const [booted, setBooted] = useState(false)
  const [recruiter, setRecruiter] = useState(() => location.hash === '#recruteur')
  const [started, setStarted] = useState(false)
  const [muted, setMutedState] = useState(isMuted)
  const [tip, setTip] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [stop, setStop] = useState(null) // pièce du musée ouverte (index dans MUSEUM)
  const [tour, setTour] = useState(false)
  const [museumReady, setMuseumReady] = useState(false)
  const [osRequest, setOsRequest] = useState(null)
  const mobile = useMobile()
  const total = MUSEUM.length

  const setNight = (v) => {
    setNightState(v)
    clickSound()
    try { localStorage.setItem('night', v ? '1' : '0') } catch { /* rien */ }
  }
  const toggleMute = () => { const m = !muted; setMutedState(m); setMuted(m) }
  const start = () => { startAudio(); setNightAudio(night); setStarted(true) }
  const onMuseumReady = useCallback(() => setMuseumReady(true), [])

  const closeStop = useCallback(() => { setStop(null); setTour(false); setTip(null) }, [])
  const selectStop = useCallback((i) => { setView('room'); setStop(i); setTip(null) }, [])
  const startTour = () => { setView('room'); setTour(true); setStop(0); setTip(null) }
  const next = useCallback(() => setStop((s) => (s === null ? 0 : Math.min(s + 1, total - 1))), [total])
  const prev = useCallback(() => setStop((s) => (s === null ? 0 : Math.max(s - 1, 0))), [])
  const openProject = (id) => { closeStop(); setOsRequest({ app: 'projects', id, n: Date.now() }); setView('screen') }

  useEffect(() => { document.body.classList.toggle('night', night); setNightAudio(night) }, [night])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setView('room'); setTip(null); closeStop() }
      else if (e.key === 'ArrowRight' && stop !== null && view === 'room') next()
      else if (e.key === 'ArrowLeft' && stop !== null && view === 'room') prev()
    }
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY })
    const onHash = () => setRecruiter(location.hash === '#recruteur')
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointermove', onMove); window.removeEventListener('hashchange', onHash) }
  }, [stop, view, next, prev, closeStop])
  useEffect(() => { if (view === 'screen') { setTip(null); setStop(null); setTour(false) } }, [view])

  // vue de caméra de la pièce ouverte
  const focus = useMemo(() => (stop === null ? null : stopCamera(MUSEUM[stop].node, mobile)), [stop, mobile])

  const openRecruiter = () => { location.hash = 'recruteur'; setRecruiter(true) }
  const closeRecruiter = () => { history.replaceState(null, '', location.pathname); setRecruiter(false) }

  const fg = night ? 'text-[#f1eee5]' : 'text-ink'
  const pill = night ? 'bg-white/10 hover:bg-white/15 text-[#f1eee5]' : 'bg-white/80 hover:bg-white text-ink shadow-sm'
  const tourBtn = museumReady && view === 'room' && stop === null

  return (
    <div className="fixed inset-0">
      <ScreenLayer active={view === 'screen'}>
        <div onClick={() => view === 'room' && setView('screen')} className="crt-wrap" style={{ width: SCREEN_W, height: SCREEN_H }}>
          <OS active={view === 'screen'} booted={booted} setBooted={setBooted} night={night} setNight={setNight} onExit={() => setView('room')} request={osRequest} />
          <div className="crt-overlay" aria-hidden="true" />
        </div>
      </ScreenLayer>
      <div className="fixed inset-0" style={{ zIndex: 2 }}>
        <Scene night={night} setNight={setNight} view={view} setView={setView} started={started || recruiter} onHover={setTip}
          focus={focus} stop={stop} onSelect={selectStop} onMissed={() => { if (stop !== null && !tour) closeStop() }} onMuseumReady={onMuseumReady} />
      </div>

      {/* barre du haut */}
      <header className={`pointer-events-none fixed z-20 top-0 inset-x-0 flex items-start justify-between p-4 sm:p-6 ${fg}`}>
        <div className="pointer-events-auto">
          {view === 'screen' ? (
            <button onClick={() => setView('room')} className={`btn rounded-full px-4 py-2 text-sm font-semibold backdrop-blur ${pill}`}>← Retour <span className="hidden sm:inline">au musée </span><span className="hidden sm:inline opacity-60 font-mono text-xs">échap</span></button>
          ) : (
            <div className="flex items-center gap-3">
              <img src={night ? './favicon.svg' : './logo.svg'} alt="" className="w-9 h-9" />
              <div>
                <div className="font-extrabold text-lg leading-none">{PROFILE.name}</div>
                <div className="hidden sm:block font-mono text-xs opacity-70 mt-1">{PROFILE.title}</div>
              </div>
            </div>
          )}
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={toggleMute} aria-label={muted ? 'Activer le son' : 'Couper le son'} aria-pressed={muted}
            className={`btn rounded-full w-10 h-10 grid place-items-center backdrop-blur ${pill}`}>{muted ? '🔇' : '🔊'}</button>
          <button onClick={() => setNight(!night)} aria-label={night ? 'Passer en mode jour' : 'Passer en mode nuit'}
            className={`btn rounded-full w-10 h-10 grid place-items-center backdrop-blur ${pill}`}>{night ? '☀' : '☾'}</button>
          {started && view === 'room' && !mobile && stop === null && (
            <button onClick={startTour} disabled={!museumReady} className={`btn rounded-full px-4 py-2 text-sm font-semibold backdrop-blur disabled:opacity-50 ${pill}`}>
              {museumReady ? 'Visite guidée' : 'Le musée arrive…'}
            </button>
          )}
          <button onClick={openRecruiter} className="btn rounded-full px-4 py-2 text-sm font-semibold bg-coral text-white shadow-sm whitespace-nowrap">Mode recruteur</button>
        </div>
      </header>

      {/* téléphone : la visite guidée est le mode principal */}
      {mobile && started && view === 'room' && stop === null && (
        <div className="fixed z-30 bottom-5 inset-x-4 flex justify-center">
          <button onClick={startTour} disabled={!museumReady}
            className="btn rounded-full bg-coral text-white px-7 py-3 text-base font-bold shadow-xl disabled:opacity-60">
            {museumReady ? 'Visite guidée' : 'Le musée arrive…'}
          </button>
        </div>
      )}

      {/* indication en bas (ordinateur) */}
      {view === 'room' && started && stop === null && !mobile && (
        <div className={`pointer-events-none fixed z-20 bottom-5 inset-x-0 text-center font-mono text-xs sm:text-sm px-4 ${fg} opacity-70`}>
          Clique sur l’écran pour entrer · bouge la souris, la caméra suit · glisse pour tourner · clique sur l’ampoule{tourBtn ? ' · ou lance la visite guidée' : ''}
        </div>
      )}

      {/* message au survol */}
      {tip && view === 'room' && (
        <div className="pointer-events-none fixed z-40 max-w-[260px] rounded-xl bg-ink text-white text-sm px-3 py-2 shadow-lg"
          style={{ left: Math.min(mouse.x + 16, window.innerWidth - 280), top: mouse.y + 18 }}>{tip}</div>
      )}

      {view === 'room' && <MuseumCard stop={stop} mobile={mobile} night={night} tour={tour} onClose={closeStop} onProject={openProject} />}
      {tour && stop !== null && view === 'room' && (
        <TourBar stop={stop} mobile={mobile} night={night} onPrev={prev} onNext={next} onDesk={closeStop} onQuit={closeStop} />
      )}

      {recruiter && <Recruiter onClose={closeRecruiter} night={night} />}
      {!recruiter && <Start onStart={start} onRecruiter={openRecruiter} />}
    </div>
  )
}
