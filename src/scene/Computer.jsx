import { RoundedBox } from '@react-three/drei'
import { DESK_TOP, useHover } from './Objects'
import { SCREEN_W } from '../os/OS'
import ScreenSync from './ScreenSync'

// Moniteur cathodique rétro posé sur le bureau. L'écran affiche le bureau virtuel (composant OS).
export const MONITOR_POS = [0, DESK_TOP, -0.12]
export const SCREEN_LOCAL = [0, 0.33, 0.262]
export const SCREEN_SIZE = [0.47, 0.3525]
export const SCREEN_WORLD = [MONITOR_POS[0] + SCREEN_LOCAL[0], MONITOR_POS[1] + SCREEN_LOCAL[1], MONITOR_POS[2] + SCREEN_LOCAL[2]]

export default function Computer({ view, setView, onHover }) {
  const active = view === 'screen'
  const h = useHover(onHover, active ? null : 'Clique sur l’écran pour entrer dans l’ordinateur.')
  const beige = '#e9e1cf'
  return (
    <group position={MONITOR_POS}>
      {/* pied */}
      <RoundedBox args={[0.3, 0.03, 0.26]} radius={0.01} position={[0, 0.015, 0]} castShadow>
        <meshStandardMaterial color={beige} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 24]} />
        <meshStandardMaterial color={beige} roughness={0.6} />
      </mesh>
      {/* caisson arrière du tube */}
      <RoundedBox args={[0.5, 0.42, 0.34]} radius={0.05} position={[0, 0.32, -0.12]} castShadow>
        <meshStandardMaterial color="#ddd4c0" roughness={0.65} />
      </RoundedBox>
      {/* façade */}
      <RoundedBox args={[0.62, 0.5, 0.2]} radius={0.03} position={[0, 0.32, 0.16]} castShadow
        onClick={(e) => { e.stopPropagation(); if (!active) setView('screen') }} {...h}>
        <meshStandardMaterial color={beige} roughness={0.55} />
      </RoundedBox>
      {/* bouton et voyant */}
      <mesh position={[0.25, 0.1, 0.262]}>
        <circleGeometry args={[0.009, 16]} />
        <meshBasicMaterial color={active ? '#35d6a3' : '#ff5a36'} />
      </mesh>
      {/* écran : le HTML du bureau virtuel est projeté ici */}
      <ScreenSync position={[SCREEN_LOCAL[0], SCREEN_LOCAL[1], SCREEN_LOCAL[2] + 0.001]} size={SCREEN_SIZE} pxWidth={SCREEN_W}
        onClick={(e) => { e.stopPropagation(); if (!active) setView('screen') }} hover={h} />
    </group>
  )
}
