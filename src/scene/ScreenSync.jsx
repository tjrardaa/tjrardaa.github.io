import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { screenLayer } from './screenBridge'

const eps = (v) => (Math.abs(v) < 1e-10 ? 0 : v)
const css = (m, mul, pre = '') => pre + 'matrix3d(' + m.elements.map((e, i) => eps(mul[i] * e)).join(',') + ')'
const CAM = [1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1]
const objMul = (f) => [1 / f, 1 / f, 1 / f, 1, -1 / f, -1 / f, -1 / f, -1, 1 / f, 1 / f, 1 / f, 1, 1, 1, 1, 1]

// Le mesh « Screen » du .glb sert de trou : il rend la zone de l'écran transparente dans le canvas
// pour laisser voir le HTML placé derrière. Les objets 3D devant l'écran le cachent naturellement.
// position / size : centre et taille du mesh Screen (mesurés dans la scène).
export default function ScreenSync({ mesh, position, size, pxWidth, onClick, hover }) {
  const g = useRef()
  const { camera, size: vp } = useThree()
  const factor = 1 / (10 / 400) // 40 px HTML par unité, comme drei

  useMemo(() => {
    mesh.material = new THREE.MeshBasicMaterial({
      color: '#000000', transparent: true, opacity: 0, blending: THREE.NoBlending, fog: false, toneMapped: false,
    })
  }, [mesh])

  useFrame(() => {
    const { root, camera: camEl, object } = screenLayer
    if (!g.current || !root || !camEl || !object) return
    camera.updateMatrixWorld()
    g.current.updateWorldMatrix(true, false)
    const hw = vp.width / 2, hh = vp.height / 2
    const fov = camera.projectionMatrix.elements[5] * hh
    root.style.width = vp.width + 'px'
    root.style.height = vp.height + 'px'
    root.style.perspective = fov + 'px'
    camEl.style.transform = `translateZ(${fov}px)${css(camera.matrixWorldInverse, CAM)}translate(${hw}px,${hh}px)`
    object.style.transform = css(g.current.matrixWorld, objMul(factor), 'translate(-50%,-50%)')
  })

  const s = (size[0] / pxWidth) * factor
  return (
    <>
      <group position={position}>
        <group ref={g} scale={s} />
      </group>
      <primitive object={mesh} onClick={onClick} {...hover} />
    </>
  )
}
