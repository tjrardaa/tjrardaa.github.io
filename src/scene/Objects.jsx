import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'

// Petit utilitaire : survol = curseur main + message
export function useHover(onHover, text) {
  const [hovered, set] = useState(false)
  useCursor(hovered)
  return {
    onPointerOver: (e) => { e.stopPropagation(); set(true); onHover?.(text) },
    onPointerOut: () => { set(false); onHover?.(null) },
  }
}

export const DESK_TOP = 0.76

export function Desk({ night }) {
  const wood = night ? '#3a2a20' : '#c99a6b'
  const leg = night ? '#1b1d24' : '#2a2c33'
  return (
    <group>
      <RoundedBox args={[1.7, 0.05, 0.8]} radius={0.012} position={[0, DESK_TOP - 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={wood} roughness={0.7} />
      </RoundedBox>
      {[[-0.78, -0.34], [0.78, -0.34], [-0.78, 0.34], [0.78, 0.34]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (DESK_TOP - 0.05) / 2, z]} castShadow>
          <boxGeometry args={[0.045, DESK_TOP - 0.05, 0.045]} />
          <meshStandardMaterial color={leg} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function Keyboard({ onHover }) {
  const h = useHover(onHover, 'Un clavier. Le meilleur outil d’un pentester, avec la curiosité.')
  const keys = useMemo(() => {
    const k = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) k.push([-0.198 + c * 0.033, 0.019, -0.045 + r * 0.03])
    return k
  }, [])
  return (
    <group position={[0, DESK_TOP, 0.22]} {...h}>
      <RoundedBox args={[0.46, 0.025, 0.15]} radius={0.008} position={[0, 0.0125, 0]} castShadow>
        <meshStandardMaterial color="#e8e2d4" roughness={0.6} />
      </RoundedBox>
      {keys.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.026, 0.012, 0.024]} />
          <meshStandardMaterial color={i === 47 ? '#ff5a36' : '#f6f2e9'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Mouse({ onHover }) {
  const h = useHover(onHover, 'Une souris. Pas celle qui fait peur.')
  return (
    <mesh position={[0.36, DESK_TOP + 0.015, 0.22]} scale={[0.032, 0.018, 0.05]} castShadow {...h}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#e8e2d4" roughness={0.5} />
    </mesh>
  )
}

export function Mug({ onHover }) {
  const h = useHover(onHover, 'Un chocolat chaud. Arda n’aime pas le café.')
  const steam = useRef([])
  useFrame(({ clock }) => {
    steam.current.forEach((m, i) => {
      if (!m) return
      const t = (clock.elapsedTime * 0.35 + i / 3) % 1
      m.position.y = 0.11 + t * 0.16
      m.position.x = Math.sin((t + i) * 6) * 0.012
      m.material.opacity = Math.sin(t * Math.PI) * 0.35
      m.scale.setScalar(0.6 + t * 0.8)
    })
  })
  return (
    <group position={[-0.52, DESK_TOP, 0.14]} {...h}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.1, 32, 1, true]} />
        <meshStandardMaterial color="#ff5a36" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.004, 32]} />
        <meshStandardMaterial color="#e04a28" />
      </mesh>
      <mesh position={[0, 0.088, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#5a3420" roughness={0.3} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.024, 0.007, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#ff5a36" roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => (steam.current[i] = m)} position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.012, 12, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// Un lys en pot : tiges, feuilles longues et fleurs blanches en trompette
function LilyFlower({ position, rotation }) {
  const petals = useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), [])
  return (
    <group position={position} rotation={rotation}>
      {petals.map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh position={[0.045, 0.05, 0]} rotation={[0, 0, -0.75]} scale={[0.022, 0.075, 0.012]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={i % 2 ? '#fffaf2' : '#fff4f4'} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`s${i}`} position={[Math.cos(i * 1.6) * 0.012, 0.075, Math.sin(i * 1.6) * 0.012]}>
          <sphereGeometry args={[0.006, 8, 6]} />
          <meshStandardMaterial color="#e08a2a" />
        </mesh>
      ))}
    </group>
  )
}

export function Lily({ onHover }) {
  const h = useHover(onHover, 'Un lys. La fleur préférée d’Arda.')
  const g = useRef()
  useFrame(({ clock }) => { if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.012 })
  const stems = [
    { tilt: [0.08, 0, 0.1], h: 0.95 },
    { tilt: [-0.1, 0, -0.06], h: 0.82 },
    { tilt: [0.02, 0, -0.16], h: 1.02 },
  ]
  const leaves = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ y: 0.32 + (i % 3) * 0.15, a: i * 1.7, s: 0.8 + (i % 3) * 0.15 })), [])
  return (
    <group position={[-1.12, 0, -0.18]} {...h}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.11, 0.32, 32]} />
        <meshStandardMaterial color="#c8643c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.315, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 32]} />
        <meshStandardMaterial color="#3b2a1e" roughness={1} />
      </mesh>
      <group ref={g} position={[0, 0.31, 0]}>
        {stems.map((s, i) => (
          <group key={i} rotation={s.tilt}>
            <mesh position={[0, s.h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.006, 0.008, s.h, 8]} />
              <meshStandardMaterial color="#4f7a3a" />
            </mesh>
            <LilyFlower position={[0, s.h, 0]} rotation={[0.35 * (i - 1), i * 1.2, 0.3]} />
          </group>
        ))}
        {leaves.map((l, i) => (
          <group key={`l${i}`} rotation={[0, l.a, 0]}>
            <mesh position={[0.07, l.y - 0.31 + 0.12, 0]} rotation={[0, 0, -0.55]} scale={[0.02 * l.s, 0.17 * l.s, 0.006]} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={i % 2 ? '#5b8c3e' : '#4a7a33'} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// Quelques feuilles tombées au sol et une sur le bureau
export function FallenLeaves({ onHover }) {
  const h = useHover(onHover, 'Des feuilles tombées du lys. Personne ne passe le balai ici.')
  const leaves = [
    [-0.82, 0.002, 0.25, 0.4], [-0.95, 0.002, 0.42, 2.1], [-0.6, 0.002, 0.55, 1.2], [-1.35, 0.002, 0.2, 2.8],
    [0.62, DESK_TOP + 0.002, -0.25, 0.9],
  ]
  return (
    <group {...h}>
      {leaves.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, r]} scale={[0.028, 0.07, 1]} receiveShadow>
          <circleGeometry args={[1, 16]} />
          <meshStandardMaterial color={i % 2 ? '#7a9a42' : '#a3a84a'} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// L'ampoule suspendue au-dessus du bureau : clic = mode nuit
export const BULB_POS = [0, 2.25, 0.08]
export function Bulb({ night, toggle, onHover }) {
  const h = useHover(onHover, night ? 'Clique pour rallumer la galerie.' : 'Clique sur l’ampoule pour passer en mode nuit.')
  const g = useRef()
  useFrame(({ clock }) => { if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.02 })
  return (
    <group ref={g} position={[BULB_POS[0], 6, BULB_POS[2]]}>
      <mesh position={[0, -(6 - BULB_POS[1]) / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 6 - BULB_POS[1], 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <group position={[0, -(6 - BULB_POS[1]), 0]} onClick={(e) => { e.stopPropagation(); toggle() }} {...h}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.055, 32, 24]} />
          <meshStandardMaterial color={night ? '#ffe7a3' : '#f4f1ea'} emissive={night ? '#ffc94a' : '#000'} emissiveIntensity={night ? 3 : 0}
            transparent opacity={night ? 1 : 0.55} roughness={0.1} />
        </mesh>
        {/* zone de clic plus large que l'ampoule */}
        <mesh position={[0, -0.04, 0]} visible={false}>
          <sphereGeometry args={[0.16, 8, 8]} />
        </mesh>
      </group>
    </group>
  )
}
