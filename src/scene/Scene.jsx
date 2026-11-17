import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CameraControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { Desk, Keyboard, Mouse, Mug, Lily, FallenLeaves, Bulb, BULB_POS } from './Objects'
import Computer, { SCREEN_WORLD, SCREEN_SIZE } from './Computer'

const ROOM_VIEW = { pos: [2.1, 1.75, 3.3], target: [0, 0.95, 0] }
const FOV = 38

function Rig({ view }) {
  const ref = useRef()
  const { size } = useThree()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (view === 'screen') {
      // distance pour que l'écran remplisse la vue, quelle que soit la forme de la fenêtre
      const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
      const aspect = size.width / size.height
      const d = Math.max(SCREEN_SIZE[1] / (2 * t), SCREEN_SIZE[0] / (2 * t * aspect)) * 1.16
      c.setLookAt(SCREEN_WORLD[0], SCREEN_WORLD[1], SCREEN_WORLD[2] + d, ...SCREEN_WORLD, true)
    } else {
      // en portrait (téléphone), on recule pour voir tout le bureau
      const aspect = size.width / size.height
      const k = aspect < 1 ? 1 + (1 - aspect) * 1.5 : 1
      const [x, y, z] = ROOM_VIEW.pos, [tx, ty, tz] = ROOM_VIEW.target
      c.setLookAt(tx + (x - tx) * k, ty + (y - ty) * k, tz + (z - tz) * k, tx, ty, tz, true)
    }
  }, [view, size.width, size.height])
  const room = view === 'room'
  return (
    <CameraControls ref={ref} makeDefault smoothTime={0.55}
      enabled={room}
      minDistance={2.2} maxDistance={9}
      minPolarAngle={0.55} maxPolarAngle={1.42}
      dollySpeed={0.4} truckSpeed={0} />
  )
}

function Lights({ night }) {
  return night ? (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[BULB_POS[0], BULB_POS[1] - 0.08, BULB_POS[2]]} intensity={2.4} distance={4.5} decay={1.5} color="#ffcf73" />
      <spotLight position={[BULB_POS[0], BULB_POS[1] - 0.1, BULB_POS[2]]} target-position={[0, 0, 0]} angle={0.78} penumbra={0.55}
        intensity={14} distance={6} decay={1.4} color="#ffd27a" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
    </>
  ) : (
    <>
      <hemisphereLight args={['#ffffff', '#d9d2c3', 1.1]} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-bias={-0.0004} />
    </>
  )
}

export default function Scene({ night, setNight, view, setView, onHover }) {
  const bg = night ? '#07080c' : '#f4f1ea'
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: FOV, position: [5, 3.2, 6.5], near: 0.05, far: 60 }} gl={{ antialias: true }}
      onPointerMissed={() => onHover(null)}>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, night ? 4 : 7, night ? 11 : 18]} />
      <Lights night={night} />
      <Rig view={view} />
      <Suspense fallback={null}>
        <group>
          <Desk night={night} />
          <Computer view={view} setView={setView} onHover={onHover} />
          <Keyboard onHover={onHover} />
          <Mouse onHover={onHover} />
          <Mug onHover={onHover} />
          <Lily onHover={onHover} />
          <FallenLeaves onHover={onHover} />
          <Bulb night={night} toggle={() => setNight(!night)} onHover={onHover} />
        </group>
        {/* sol : un grand disque qui se fond dans le vide */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[30, 64]} />
          <meshStandardMaterial color={night ? '#0c0d12' : '#efebe2'} roughness={1} />
        </mesh>
        <ContactShadows position={[0, 0.001, 0]} opacity={night ? 0.6 : 0.35} scale={6} blur={2.4} far={2} />
      </Suspense>
    </Canvas>
  )
}
