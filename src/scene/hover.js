import { useState } from 'react'
import { useCursor } from '@react-three/drei'

// Survol = curseur main + message affiché par l'interface.
// text = null : pas de message (par exemple quand on est déjà dans l'écran).
export function useHover(onHover, text) {
  const [hovered, set] = useState(false)
  useCursor(hovered)
  return {
    onPointerOver: (e) => { e.stopPropagation(); set(true); onHover?.(text) },
    onPointerOut: () => { set(false); onHover?.(null) },
  }
}
