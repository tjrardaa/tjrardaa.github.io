import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useHover } from './hover'
import ScreenSync from './ScreenSync'
import { SCREEN_W } from '../os/OS'

// La pièce est un seul .glb compressé (meshopt, textures WebP) fabriqué dans Blender.
// L'éclairage est cuit dans les textures : une version jour (dans le .glb) et une version nuit (public/models/night).
const BASE = import.meta.env.BASE_URL
export const MODEL_URL = `${BASE}models/bureau.glb`
const ATLAS = ['A1_desk', 'A2_computer', 'A3_items', 'A4_props', 'A5_floor']
const NIGHT_URLS = ATLAS.map((a) => `${BASE}models/night/${a}.webp`)
const BULB = [0, 1.78, -0.02] // centre de l'ampoule (repère three.js)

useGLTF.preload(MODEL_URL)

const TIPS = {
  Desk: 'Un bureau d’office. Les tiroirs sont mieux rangés que le reste.',
  Chair: 'Une chaise de bureau. Elle tourne, les idées aussi.',
  Keyboard: 'Un clavier. Le meilleur outil d’un pentester, avec la curiosité.',
  Mouse: 'Une souris. Pas celle qui fait peur.',
  Speakers: 'Des enceintes. Le son se coupe avec le bouton en haut de la page.',
  Mug: 'Un chocolat chaud. Arda n’aime pas le café.',
  Vinyls: 'Des vinyles. La bande-son des nuits de CTF.',
  PaperPiles: 'Des piles de feuilles. Les rapports ne s’écrivent pas tout seuls.',
  DeskStuff: 'Classeurs, notes et disquettes. Un désordre très organisé.',
  Tree: 'Un cerisier en pot. Il fleurit toute l’année ici.',
  Leaves: 'Des pétales tombés. Personne ne passe le balai ici.',
  Screen: 'Clique sur l’écran pour entrer dans l’ordinateur.',
}

// Un nœud du .glb avec message au survol (et clic optionnel)
function Hot({ object, text, onHover, onClick }) {
  const h = useHover(onHover, text)
  return <primitive object={object} onClick={onClick} {...h} />
}

function useGlow() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,235,170,1)')
    g.addColorStop(0.25, 'rgba(255,190,90,0.55)')
    g.addColorStop(1, 'rgba(255,160,60,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

// Position et taille du mesh « Screen » (utile pour la caméra et pour le HTML projeté dessus)
export function useScreenInfo() {
  const { nodes } = useGLTF(MODEL_URL)
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(nodes.Screen)
    const c = box.getCenter(new THREE.Vector3())
    const s = box.getSize(new THREE.Vector3())
    return { center: [c.x, c.y, c.z], size: [s.x, s.y] }
  }, [nodes])
}

export default function Room({ night, view, setView, setNight, onHover }) {
  const { nodes, materials } = useGLTF(MODEL_URL)
  const nightTex = useLoader(THREE.TextureLoader, NIGHT_URLS)
  const screen = useScreenInfo()
  const glow = useGlow()
  const active = view === 'screen'

  // Matériaux « sans lumière » : la texture cuite est affichée telle quelle
  const baked = useMemo(() => {
    const out = {}
    ATLAS.forEach((a, i) => {
      const day = materials[`${a}_baked`].map
      const nt = nightTex[i]
      nt.flipY = false
      nt.colorSpace = THREE.SRGBColorSpace
      day.anisotropy = nt.anisotropy = 8
      const mat = new THREE.MeshBasicMaterial({ map: day, toneMapped: false })
      if (a === 'A5_floor') { mat.transparent = true; mat.depthWrite = false }
      out[a] = { mat, day, night: nt, name: `${a}_baked` }
    })
    return out
  }, [materials, nightTex])

  // Arbre (cartes de feuillage découpées) et ampoule : textures d'origine, assombries la nuit
  const props = useMemo(() => {
    const tree = []
    const bulb = {}
    nodes.Tree.traverse((o) => {
      if (!o.isMesh) return
      const src = o.material
      const m = new THREE.MeshBasicMaterial({ map: src.map, toneMapped: false, side: THREE.DoubleSide })
      if (src.name.startsWith('Sakura')) { m.alphaTest = 0.5 }
      o.material = m
      tree.push(m)
    })
    nodes.Bulb.traverse((o) => {
      if (!o.isMesh) return
      const src = o.material
      if (src.name === 'lightbulb_01_glass') {
        o.material = bulb.glass = new THREE.MeshBasicMaterial({ map: src.map, transparent: true, depthWrite: false, toneMapped: false })
      } else {
        o.material = new THREE.MeshBasicMaterial({ color: src.name.includes('Socket') ? '#2b2b30' : '#101012', toneMapped: false })
      }
    })
    return { tree, bulb }
  }, [nodes])

  useEffect(() => {
    nodes.Floor.renderOrder = -1
    nodes.Bulb.renderOrder = 2
    // le sol de la scène n'est jamais un objet à survoler
    nodes.Floor.traverse((o) => { o.raycast = () => {} })
    nodes.Cables.traverse((o) => { o.raycast = () => {} })
    // matériaux cuits sur tous les maillages concernés
    Object.values(nodes).forEach((n) => n.traverse?.((o) => {
      if (!o.isMesh) return
      const b = Object.values(baked).find((x) => x.name === o.material.name)
      if (b) o.material = b.mat
    }))
  }, [nodes, baked])

  // jour / nuit
  useEffect(() => {
    Object.values(baked).forEach((b) => { b.mat.map = night ? b.night : b.day; b.mat.needsUpdate = true })
    props.tree.forEach((m) => m.color.set(night ? '#2a2630' : '#ffffff'))
    if (props.bulb.glass) props.bulb.glass.color.setRGB(night ? 2.4 : 1, night ? 1.8 : 1, night ? 0.9 : 1)
  }, [night, baked, props])

  const enter = (e) => { e.stopPropagation(); if (!active) setView('screen') }
  const tip = (k) => (active ? null : TIPS[k])
  const bulbTip = night ? 'Clique pour rallumer la galerie.' : 'Clique sur l’ampoule pour passer en mode nuit.'
  const hBulb = useHover(onHover, bulbTip)

  return (
    <group>
      <primitive object={nodes.Floor} />
      <Hot object={nodes.Desk} text={tip('Desk')} onHover={onHover} />
      <Hot object={nodes.Chair} text={tip('Chair')} onHover={onHover} />
      <Hot object={nodes.Monitor} text={tip('Screen')} onHover={onHover} onClick={enter} />
      <Hot object={nodes.Computer} text={tip('Screen')} onHover={onHover} onClick={enter} />
      <Hot object={nodes.Keyboard} text={tip('Keyboard')} onHover={onHover} />
      <Hot object={nodes.Mouse} text={tip('Mouse')} onHover={onHover} />
      <Hot object={nodes.Speakers} text={tip('Speakers')} onHover={onHover} />
      <Hot object={nodes.Mug} text={tip('Mug')} onHover={onHover} />
      <Hot object={nodes.DeskStuff} text={tip('DeskStuff')} onHover={onHover} />
      <primitive object={nodes.Cables} />
      <Hot object={nodes.Vinyls} text={tip('Vinyls')} onHover={onHover} />
      <Hot object={nodes.PaperPiles} text={tip('PaperPiles')} onHover={onHover} />
      <Hot object={nodes.Pot} text={tip('Tree')} onHover={onHover} />
      <Hot object={nodes.Tree} text={tip('Tree')} onHover={onHover} />
      <Hot object={nodes.Leaves} text={tip('Leaves')} onHover={onHover} />

      <ScreenSync mesh={nodes.Screen} position={screen.center} size={screen.size} pxWidth={SCREEN_W}
        onClick={enter} hover={{ onPointerOver: (e) => { e.stopPropagation(); onHover?.(tip('Screen')) }, onPointerOut: () => onHover?.(null) }} />

      {/* ampoule : clic = jour / nuit */}
      <primitive object={nodes.Bulb} />
      <group position={BULB} onClick={(e) => { e.stopPropagation(); setNight(!night) }} {...hBulb}>
        <mesh visible={false}>
          <sphereGeometry args={[0.16, 8, 8]} />
        </mesh>
      </group>
      <sprite position={BULB} scale={[0.95, 0.95, 0.95]} renderOrder={3}>
        <spriteMaterial map={glow} color="#ffc060" blending={THREE.AdditiveBlending} depthWrite={false} transparent
          opacity={night ? 0.9 : 0} toneMapped={false} />
      </sprite>
    </group>
  )
}
