import { useEffect, useMemo, useState } from 'react'
import { useCursor, useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { MUSEUM, TROPHIES } from '../data'

// Le musée est un second .glb (musee.glb), chargé en arrière-plan après le clic sur START :
// l'écran START n'attend que le bureau. Même méthode que le bureau : lumière cuite, jour dans le .glb, nuit à part.
const BASE = import.meta.env.BASE_URL
export const MUSEUM_URL = `${BASE}models/musee.glb`
const ATLAS = ['M1', 'M2', 'M3', 'M4']
const NIGHT_URLS = ATLAS.map((a) => `${BASE}models/museum-night/${a}.webp`)
const PHOTO_URL = `${BASE}images/weplayforcharity.jpg`

function Piece({ entry, index, node, mat, night, selected, onHover, onSelect }) {
  const [over, setOver] = useState(false)
  useCursor(over)
  // survol : l'objet s'éclaire légèrement ; sélection : un peu aussi
  useEffect(() => {
    const k = over ? (night ? 1.55 : 1.22) : selected ? 1.12 : 1
    mat.color.setRGB(k, k * 0.99, k * 0.96)
  }, [over, selected, night, mat])
  return (
    <primitive object={node}
      onPointerOver={(e) => { e.stopPropagation(); setOver(true); onHover?.(entry.hover) }}
      onPointerOut={() => { setOver(false); onHover?.(null) }}
      onClick={(e) => { e.stopPropagation(); onSelect(index) }} />
  )
}

export default function Museum({ night, selected, onHover, onSelect, onReady }) {
  const { nodes, materials } = useGLTF(MUSEUM_URL)
  const nightTex = useLoader(THREE.TextureLoader, NIGHT_URLS)

  // matériaux sans lumière : un par pièce (pour pouvoir l'éclairer au survol), tous avec la même texture cuite
  const mats = useMemo(() => {
    const bases = {}
    ATLAS.forEach((a, i) => {
      const day = materials[`${a}_baked`].map
      const nt = nightTex[i]
      nt.flipY = false
      nt.colorSpace = THREE.SRGBColorSpace
      day.anisotropy = nt.anisotropy = 8
      bases[a] = { day, night: nt }
    })
    const list = []
    const make = (atlas, transparent) => {
      const m = new THREE.MeshBasicMaterial({ map: bases[atlas].day, toneMapped: false })
      if (transparent) { m.transparent = true; m.depthWrite = false }
      list.push({ m, atlas })
      return m
    }
    const pieceMat = {}
    MUSEUM.forEach((e) => {
      const node = nodes[e.node]
      const atlas = node.userData.atlas ??= node.material.name.slice(0, 2)
      node.userData.src ??= node.material
      pieceMat[e.node] = make(atlas, false)
      node.material = pieceMat[e.node]
    })
    const floor = nodes.MFloor
    floor.material = make('M4', true)
    floor.renderOrder = -1
    floor.raycast = () => {}
    nodes.Vitrine_glass.material = new THREE.MeshBasicMaterial({ color: '#dff1ff', transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false })
    nodes.Vitrine_glass.raycast = () => {}
    return { list, bases, pieceMat }
  }, [nodes, materials, nightTex])

  // trophées : doré si obtenu (TROPHIES), sombre avec un cadenas sinon
  const trophies = useMemo(() => {
    const out = []
    for (let i = 0; i < 8; i++) {
      const t = nodes[`Trophy_${i}`]
      if (!t) continue
      t.raycast = () => {}
      const m = new THREE.MeshBasicMaterial({ toneMapped: false })
      t.material = m
      const p = nodes[`Padlock_${i}`]
      if (p) { p.raycast = () => {}; p.material = new THREE.MeshBasicMaterial({ color: '#8d8d94', toneMapped: false }) }
      out.push({ i, m, p })
    }
    return out
  }, [nodes])

  // photo du cadre : public/images/weplayforcharity.jpg, gris tant qu'elle n'existe pas
  const photo = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ color: '#8b8d92', toneMapped: false })
    nodes.Photo.material = m
    nodes.Photo.raycast = () => {}
    return m
  }, [nodes])
  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(PHOTO_URL, (tex) => {
      if (!alive) return
      tex.flipY = false
      tex.colorSpace = THREE.SRGBColorSpace
      photo.map = tex
      photo.color.set('#ffffff')
      photo.needsUpdate = true
    }, undefined, () => { /* pas encore déposée : on garde le gris */ })
    return () => { alive = false }
  }, [photo])

  // panneau au-dessus de la porte : « Alternance 2027 », posé devant l'ancien panneau cuit dans le .glb
  const sign = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024; c.height = 256
    const x = c.getContext('2d')
    x.fillStyle = '#14203f'
    x.fillRect(0, 0, 1024, 256)
    x.fillStyle = '#ff5a36'
    x.fillRect(0, 0, 22, 256)
    x.fillStyle = '#ffffff'
    x.font = '700 104px "Bricolage Grotesque", system-ui, sans-serif'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText('Alternance 2027  →', 530, 136)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return new THREE.MeshBasicMaterial({ map: t, toneMapped: false })
  }, [])
  useEffect(() => { sign.color.setScalar(night ? 0.55 : 1) }, [night, sign])

  useEffect(() => { onReady?.() }, [onReady])

  // jour / nuit
  useEffect(() => {
    mats.list.forEach(({ m, atlas }) => { m.map = night ? mats.bases[atlas].night : mats.bases[atlas].day; m.needsUpdate = true })
    trophies.forEach(({ i, m, p }) => {
      const got = !!TROPHIES[i]?.got
      if (got) m.color.setRGB(night ? 2.0 : 1.0, night ? 1.4 : 0.76, night ? 0.45 : 0.2)
      else m.color.set(night ? '#0d0d11' : '#4a4a52')
      if (p) p.visible = !got
    })
    if (!photo.map) photo.color.set(night ? '#3a3b3e' : '#8b8d92')
    else photo.color.setScalar(night ? 0.85 : 1)
  }, [night, mats, trophies, photo])

  return (
    <group>
      <primitive object={nodes.MFloor} />
      {MUSEUM.map((e, i) => (
        <Piece key={e.id} entry={e} index={i} node={nodes[e.node]} mat={mats.pieceMat[e.node]}
          night={night} selected={selected === i} onHover={onHover} onSelect={onSelect} />
      ))}
      {trophies.map(({ i }) => <primitive key={`t${i}`} object={nodes[`Trophy_${i}`]} />)}
      {trophies.filter((t) => t.p).map(({ i }) => <primitive key={`p${i}`} object={nodes[`Padlock_${i}`]} />)}
      <primitive object={nodes.Photo} />
      <primitive object={nodes.Vitrine_glass} />
      <mesh position={[0.04, 2.38, -6.835]} material={sign} raycast={() => null}>
        <planeGeometry args={[1.04, 0.26]} />
      </mesh>
    </group>
  )
}
