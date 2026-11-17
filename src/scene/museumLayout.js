// Disposition du musée (identique à Blender) : calcul des vues de caméra pour chaque pièce.
// Repère Blender (x, y, z haut) -> three.js (x, z, -y).
const R = 5.0
const LOOK = { x: 0, y: -3.4 } // les pièces sont tournées vers ce point, devant le bureau

// angle (degrés, repère Blender), hauteur visée, distance de la caméra, décalage latéral du point visé
const SPOTS = {
  St_projecteur: { deg: 190, ty: 1.0, dist: 2.9 },
  St_musique: { deg: 170, ty: 1.0, dist: 2.9 },
  St_jeux: { deg: 150, ty: 1.0, dist: 2.9 },
  St_voyages: { deg: 130, ty: 1.3, dist: 3.0 },
  St_weplay: { deg: 50, ty: 1.05, dist: 3.1 },
  St_reseau: { deg: 30, ty: 1.15, dist: 3.0 },
  St_linux: { deg: 10, ty: 1.2, dist: 3.4 },
  St_trophees: { deg: -10, ty: 0.9, dist: 3.7 },
}

export function stopCamera(node, mobile) {
  if (node === 'Door') {
    // la porte est au fond, de face
    return { pos: [0, 1.9, -0.2], target: [0, mobile ? 0.8 : 1.3, -7.0] }
  }
  const s = SPOTS[node]
  if (!s) return null
  const t = (s.deg * Math.PI) / 180
  const px = R * Math.cos(t), py = R * Math.sin(t)
  const dx = LOOK.x - px, dy = LOOK.y - py
  const yaw = Math.atan2(dx, -dy)
  const fx = Math.sin(yaw), fz = Math.cos(yaw) // direction « devant » en three.js
  const cx = px, cz = -py
  const rx = fz, rz = -fx // droite de la caméra
  const d = s.dist * (mobile ? 1.6 : 1) // en portrait, on recule pour garder la pièce entière
  const off = mobile ? 0 : 0.55 // sur ordinateur la carte est à droite : l'objet est décalé à gauche
  const ty = mobile ? s.ty - 0.55 : s.ty // sur téléphone la carte est en bas : l'objet monte
  return {
    pos: [cx + fx * d, s.ty + 0.55, cz + fz * d],
    target: [cx + rx * off, ty, cz + rz * off],
  }
}

