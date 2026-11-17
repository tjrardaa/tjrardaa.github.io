# Pipeline 3D du bureau

La scène vit dans Blender 5.x (fichier de travail non versionné, 130 Mo avec les textures d'origine).
Ce dossier garde les rendus de contrôle et le script de bake.

1. **Assemblage** : modèles CC0 (Poly Haven) et CC-BY (Sketchfab), crédités dans `CREDITS.md`, plus des objets modélisés pour le projet.
2. **Bake Cycles** (`bake_lib.py`) : l'éclairage est cuit dans des textures, une version jour (galerie blanche, lumière douce)
   et une version nuit (seule l'ampoule éclaire, cercle de lumière sur le bureau, léger halo bleu de l'écran).
   Les objets sont regroupés en 5 atlas (bureau et chaise, ordinateur, objets du bureau, objets au sol, sol).
3. **Export** : un seul `public/models/bureau.glb` (compression meshopt, textures WebP) avec la lumière du jour.
   Les textures de nuit sont dans `public/models/night/` et remplacent celles du jour quand on éteint la galerie.
   L'écran du PC est un plan plat séparé nommé `Screen`, découpé dans le canvas pour laisser voir le HTML (ScreenSync).
4. **Site** : `src/scene/Room.jsx` charge le `.glb`, remplace les matériaux par des matériaux sans lumière et gère jour/nuit.

L'arbre et l'ampoule gardent leurs textures d'origine (feuillage découpé, verre), assombries la nuit.
