import { useEffect, useRef } from 'react'
import { screenLayer } from './scene/screenBridge'

// Couche HTML de l'écran : placée derrière le canvas en vue musée (le canvas y découpe un trou),
// et devant le canvas quand on est entré dans l'ordinateur, pour pouvoir cliquer et taper.
export default function ScreenLayer({ active, children }) {
  const root = useRef(), cam = useRef(), obj = useRef()
  useEffect(() => {
    screenLayer.root = root.current; screenLayer.camera = cam.current; screenLayer.object = obj.current
    return () => { screenLayer.root = screenLayer.camera = screenLayer.object = null }
  }, [])
  return (
    <div ref={root} className="fixed top-0 left-0 overflow-hidden" style={{ zIndex: active ? 15 : 1, pointerEvents: 'none' }}>
      <div ref={cam} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transformStyle: 'preserve-3d', pointerEvents: 'none' }}>
        <div ref={obj} style={{ position: 'absolute', pointerEvents: active ? 'auto' : 'none' }}>{children}</div>
      </div>
    </div>
  )
}
