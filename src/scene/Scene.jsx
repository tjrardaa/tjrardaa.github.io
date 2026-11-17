import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import * as THREE from 'three'
import Room, { useScreenInfo } from './Room'
import Museum from './Museum'

const FOV = 38
// Vue d'ensemble (repère three.js) et vue d'intro, plus éloignée, avant le clic sur START
const ROOM_VIEW = { pos: [3.5, 2.3, 5.2], target: [0.1, 0.8, 0.1] }
// l'intro démarre à gauche : après START la caméra glisse de gauche à droite jusqu'au bureau
const INTRO_VIEW = { pos: [-8.5, 4.6, 8.2], target: [0.1, 1.1, 0.1] }

function Rig({ view, started, focus }) {
  const ref = useRef()
  const intro = useRef(true)
  const { size, clock } = useThree()
  const screen = useScreenInfo()
  const focusKey = focus ? focus.pos.join() + '|' + focus.target.join() : ''
  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (!started) {
      c.setLookAt(...INTRO_VIEW.pos, ...INTRO_VIEW.target, false)
      return
    }
    // le premier trajet (après START) est plus lent : la caméra descend vers le bureau
    c.smoothTime = intro.current ? 1.6 : 0.55
    intro.current = false
    if (focus && view === 'room') {
      // une pièce du musée est visée (clic ou visite guidée) : la caméra s'approche en douceur
      c.smoothTime = 0.9
      c.setLookAt(...focus.pos, ...focus.target, true)
    } else if (view === 'screen') {
      // distance pour que l'écran remplisse la vue, quelle que soit la forme de la fenêtre
      const [cx, cy, cz] = screen.center
      const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
      const aspect = size.width / size.height
      const d = Math.max(screen.size[1] / (2 * t), screen.size[0] / (2 * t * aspect)) * 1.16
      c.setLookAt(cx, cy, cz + d, cx, cy, cz, true)
    } else {
      // en portrait (téléphone), on recule pour voir tout le bureau
      const aspect = size.width / size.height
      const k = aspect < 1 ? 1 + (1 - aspect) * 1.5 : 1
      const [x, y, z] = ROOM_VIEW.pos, [tx, ty, tz] = ROOM_VIEW.target
      c.setLookAt(tx + (x - tx) * k, ty + (y - ty) * k, tz + (z - tz) * k, tx, ty, tz, true)
    }
    // eslint-disable-next-line
  }, [view, started, size.width, size.height, screen, focusKey])
  const room = view === 'room' && started && !focus

  // La caméra balaie lentement la pièce de gauche à droite et revient (±6°, un aller-retour toutes les 20 s).
  // Elle s'arrête tant qu'on manipule la vue, et reprend quelques secondes après.
  const touching = useRef(false)
  const lastTouch = useRef(-10)
  const sweep = useRef({ prev: 0, ready: false })
  useFrame(({ clock }) => {
    const c = ref.current
    if (!c) return
    const t = clock.elapsedTime
    if (!room || touching.current || t - lastTouch.current < 3) { sweep.current.ready = false; return }
    const a = 0.105 * Math.sin((2 * Math.PI * t) / 20)
    if (!sweep.current.ready) { sweep.current.prev = a; sweep.current.ready = true; return }
    c.rotate(a - sweep.current.prev, 0, false)
    sweep.current.prev = a
  })
  return (
    <CameraControls ref={ref} makeDefault smoothTime={1.6}
      onStart={() => { touching.current = true }}
      onEnd={() => { touching.current = false; lastTouch.current = clock.elapsedTime }}
      enabled={room}
      minDistance={2.4} maxDistance={14}
      minPolarAngle={0.5} maxPolarAngle={1.45}
      dollySpeed={0.4} truckSpeed={0} />
  )
}

// La caméra suit doucement la souris : on incline très légèrement toute la pièce vers le pointeur
function Parallax({ active, children }) {
  const g = useRef()
  useFrame((s, dt) => {
    if (!g.current) return
    const ty = active ? s.pointer.x * 0.06 : 0
    const tx = active ? -s.pointer.y * 0.03 : 0
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, ty, 1.8, dt)
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, tx, 1.8, dt)
  })
  return <group ref={g}>{children}</group>
}

export default function Scene({ night, setNight, view, setView, started, onHover, focus, stop, onSelect, onMissed, onMuseumReady }) {
  const bg = night ? '#07080c' : '#f4f1ea'
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: FOV, position: INTRO_VIEW.pos, near: 0.2, far: 80 }} gl={{ antialias: true }}
      onPointerMissed={() => { onHover(null); onMissed?.() }}>
      <color attach="background" args={[bg]} />
      <Suspense fallback={null}>
        <Rig view={view} started={started} focus={focus} />
        <Parallax active={view === 'room' && started && !focus}>
          <Room night={night} setNight={setNight} view={view} setView={setView} onHover={onHover} />
          {/* le musée se charge à part, après START : le bureau n'attend pas */}
          {started && (
            <Suspense fallback={null}>
              <Museum night={night} selected={stop} onHover={onHover} onSelect={onSelect} onReady={onMuseumReady} />
            </Suspense>
          )}
        </Parallax>
      </Suspense>
    </Canvas>
  )
}
