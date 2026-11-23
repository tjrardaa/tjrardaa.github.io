import { useEffect, useState } from 'react'
import { MUSEUM, PROJECTS } from './data'

// Image d'une carte : disparaît simplement si le fichier n'a pas encore été déposé
function CardImage({ src, alt, className }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return <img src={`${import.meta.env.BASE_URL}${src}`} alt={alt} loading="lazy" onError={() => setOk(false)} className={className} />
}

// Carte d'une pièce du musée (à droite sur ordinateur, en bas sur téléphone) et barre de la visite guidée.
export function MuseumCard({ stop, mobile, night, tour, onClose, onProject }) {
  if (stop === null) return null
  const e = MUSEUM[stop]
  const project = e.project ? PROJECTS.find((p) => p.id === e.project) : null
  const panel = night ? 'bg-[#12141f]/92 text-[#f1eee5] border-white/10' : 'bg-white/92 text-ink border-black/5'
  const pos = mobile
    ? `fixed inset-x-3 z-30 ${tour ? 'bottom-[84px]' : 'bottom-3'} max-h-[42vh]`
    : 'fixed z-30 right-6 top-[16vh] w-[340px] max-h-[68vh]'
  return (
    <aside className={`${pos} ${panel} overflow-auto rounded-2xl border px-5 py-4 shadow-xl backdrop-blur card-in`} aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest opacity-60">{e.group}</div>
          <h2 className="text-xl font-extrabold leading-tight mt-0.5">{e.title}</h2>
        </div>
        <button onClick={onClose} aria-label="Fermer la carte" className="btn -mr-2 -mt-1 w-8 h-8 shrink-0 rounded-full grid place-items-center hover:bg-black/10">✕</button>
      </div>
      {e.photo && <CardImage src={e.photo} alt={e.title} className="mt-3 w-full rounded-xl" />}
      {e.stat && <div className="mt-3 rounded-xl bg-coral/15 text-coral px-3 py-2 font-bold text-[15px]">{e.stat}</div>}
      {e.text.map((t, i) => <p key={i} className="mt-3 text-[14px] leading-6 opacity-90">{t}</p>)}
      {e.album?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {e.album.map((a) => (
            <figure key={a.src} className="m-0">
              <CardImage src={a.src} alt={a.place} className="aspect-[4/3] w-full rounded-lg object-cover" />
              <figcaption className="mt-1 text-[12px] opacity-70">{a.place}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {(e.links.length > 0 || project) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {e.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">{l.label} ↗</a>
          ))}
          {project && (
            <button onClick={() => onProject(project.id)} className="btn rounded-full bg-ink text-white px-4 py-2 text-sm font-semibold">
              Voir « {project.title} » dans l’ordinateur
            </button>
          )}
          {project?.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="btn rounded-full border border-current/30 px-4 py-2 text-sm font-semibold">Code sur GitHub ↗</a>
          )}
        </div>
      )}
    </aside>
  )
}

export function TourBar({ stop, mobile, night, onPrev, onNext, onDesk, onQuit }) {
  const total = MUSEUM.length
  const bar = night ? 'bg-[#12141f]/90 text-[#f1eee5]' : 'bg-white/90 text-ink'
  const btn = 'btn rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-35 ' + (night ? 'bg-white/10 hover:bg-white/15' : 'bg-black/5 hover:bg-black/10')
  // balayage gauche / droite sur téléphone
  useEffect(() => {
    if (!mobile) return
    let start = null
    const down = (e) => {
      if (e.touches.length !== 1) { start = null; return }
      const touch = e.touches[0]
      start = { id: touch.identifier, x: touch.clientX, y: touch.clientY }
    }
    const cancel = () => { start = null }
    const up = (e) => {
      if (!start) return
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === start.id)
      if (!touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      start = null
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onNext : onPrev)()
    }
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up, { passive: true })
    window.addEventListener('touchcancel', cancel, { passive: true })
    return () => { window.removeEventListener('touchstart', down); window.removeEventListener('touchend', up); window.removeEventListener('touchcancel', cancel) }
  }, [mobile, onNext, onPrev])
  return (
    <nav aria-label="Visite guidée" className={`fixed z-40 bottom-4 inset-x-3 mx-auto w-fit max-w-full flex items-center gap-2 rounded-full px-2 py-2 shadow-xl backdrop-blur ${bar}`}>
      <button onClick={onPrev} disabled={stop === 0} className={btn} aria-label="Pièce précédente">← <span className="hidden sm:inline">Précédent</span></button>
      <span className="font-mono text-sm px-2 min-w-[3.5rem] text-center" aria-live="polite">{stop + 1} / {total}</span>
      <button onClick={onNext} disabled={stop === total - 1} className={btn} aria-label="Pièce suivante"><span className="hidden sm:inline">Suivant</span> →</button>
      <button onClick={onDesk} className={btn + ' hidden sm:inline-block'}>Bureau</button>
      <button onClick={onQuit} className={btn} aria-label="Quitter la visite">✕<span className="hidden sm:inline"> Quitter</span></button>
    </nav>
  )
}
