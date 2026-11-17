// Pont entre la scène 3D et la couche HTML de l'écran.
// La scène calcule chaque image la position de l'écran et l'applique à ces éléments DOM (même principe que CSS3DRenderer).
export const screenLayer = { root: null, camera: null, object: null }
