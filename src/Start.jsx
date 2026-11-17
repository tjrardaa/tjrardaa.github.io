import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

// Écran START : visible pendant le chargement du .glb, puis un clic lance la visite
// (le clic sert aussi à autoriser le son dans le navigateur).
export default function Start({ onStart, onRecruiter }) {
  const { progress, active } = useProgress()
  const [timeout, setTimeoutDone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setTimeoutDone(true), 20000) // filet de sécurité si le chargement échoue
    return () => clearTimeout(t)
  }, [])
  const ready = (progress >= 100 && !active) || timeout
  const blocks = 24
  const filled = Math.round((Math.min(progress, 100) / 100) * blocks)

  const [gone, setGone] = useState(false)
  const go = () => {
    if (!ready || leaving) return
    setLeaving(true)
    onStart()
    setTimeout(() => setGone(true), 800)
  }
  if (gone) return null

  return (
    <div className={`start-screen fixed inset-0 z-50 grid place-items-center bg-[#07080c] px-4 ${leaving ? 'start-leave' : ''}`}>
      <div className="start-box font-mono text-[#f1eee5] w-full max-w-[460px]">
        <div className="text-[#ffd23f]">ARDA-OS · galerie 3D</div>
        <div className="mt-3 text-sm text-[#9b9a93]">
          {ready ? 'Tout est prêt.' : 'Chargement du bureau'}
          {!ready && <span className="cursor-blink">_</span>}
        </div>
        <div className="mt-2 text-sm tracking-widest text-[#35d6a3]" aria-hidden="true">
          [{'█'.repeat(filled)}{'░'.repeat(blocks - filled)}] {Math.round(Math.min(progress, 100))} %
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button onClick={go} disabled={!ready}
            className="btn border-2 border-[#f1eee5] px-7 py-2 text-lg font-semibold tracking-wider enabled:hover:bg-[#f1eee5] enabled:hover:text-[#07080c] disabled:opacity-30">
            START
          </button>
          <button onClick={onRecruiter} className="btn text-sm text-[#9b9a93] underline underline-offset-4 hover:text-[#f1eee5]">
            Mode recruteur (sans 3D)
          </button>
        </div>
        <div className="mt-6 text-xs text-[#6d6c66]">Le son d’ambiance démarre au clic. Il se coupe avec le bouton en haut à droite.</div>
      </div>
    </div>
  )
}
