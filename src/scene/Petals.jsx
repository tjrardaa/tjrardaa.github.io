import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Pétales de cerisier qui tombent par à-coups : l'animation « bogue » volontairement,
// comme une vieille carte graphique (pas de temps irréguliers, pétales qui se figent ou sautent).
const COUNT = 42
// zone sous la canopée (repère three.js, autour du cerisier)
const AREA = { x: [-2.45, -1.25], y: [1.05, 1.95], z: [-1.0, 0.3] }
const FLOOR = 0.012

const rand = (a, b) => a + Math.random() * (b - a)

function spawn(p, fromTop = true) {
  p.x = rand(...AREA.x)
  p.z = rand(...AREA.z)
  p.y = fromTop ? rand(AREA.y[0], AREA.y[1]) : AREA.y[1]
  p.vy = rand(0.12, 0.26)
  p.phase = rand(0, 6.28)
  p.freq = rand(0.8, 1.8)
  p.rx = rand(0, 6.28); p.ry = rand(0, 6.28); p.rz = rand(0, 6.28)
  p.sx = rand(-1.5, 1.5); p.sy = rand(-1.5, 1.5)
  p.s = rand(0.7, 1.25)
  p.freeze = 0
  p.landed = 0
  p.flick = 0
}

export default function Petals({ night }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const state = useMemo(() => {
    const list = Array.from({ length: COUNT }, () => { const p = {}; spawn(p); return p })
    return { list, acc: 0, step: 0.1, t: 0 }
  }, [])
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.022, 10)
    g.scale(1, 0.62, 1)
    return g
  }, [])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    state.acc += Math.min(dt, 0.2)
    if (state.acc < state.step) return
    // mise à jour par à-coups : le pas change à chaque fois (de 6 à 15 images par seconde)
    const d = state.acc
    state.acc = 0
    state.step = rand(0.065, 0.16)
    state.t += d
    state.list.forEach((p, i) => {
      if (p.freeze > 0) p.freeze--
      else if (p.landed > 0) {
        p.landed -= d
        if (p.landed <= 0) spawn(p, false)
      } else {
        p.y -= p.vy * d
        p.x += Math.sin(state.t * p.freq + p.phase) * 0.035 * d * 6 + p.sx * 0.01 * d
        p.z += Math.cos(state.t * p.freq * 0.8 + p.phase) * 0.02 * d * 6 + p.sy * 0.01 * d
        p.rx += 2.2 * d; p.ry += 1.4 * d; p.rz += 1.8 * d
        const r = Math.random()
        if (r < 0.012) p.freeze = 2 + Math.floor(Math.random() * 3)          // se fige quelques images
        else if (r < 0.03) p.x += rand(-0.05, 0.05)                          // saute sur le côté
        else if (r < 0.04) p.flick = 1                                       // clignote une image
        if (p.y <= FLOOR) { p.y = FLOOR; p.landed = rand(2, 5); p.rx = -Math.PI / 2; p.ry = 0 }
      }
      const vis = p.flick > 0 ? 0 : 1
      p.flick = 0
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rx, p.ry, p.rz)
      dummy.scale.setScalar(p.s * vis)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, COUNT]} frustumCulled={false} renderOrder={1}>
      <meshBasicMaterial color={night ? '#4a3a48' : '#ffc3d3'} side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  )
}
