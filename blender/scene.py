"""Scène du bureau d'Arda, construite dans Blender par script.

Lancer :  python3 blender/scene.py  (avec le module bpy)
Produit :  blender/bureau.blend  et un rendu d'aperçu.
Unités : mètres. Le sol est à z = 0 (Blender a l'axe Z vers le haut).
"""
import math
import bpy
import bmesh
from mathutils import Vector

OUT = '/home/claude/tjrardaa.github.io/blender'

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection


# ---------- outils ----------
def mat(name, color, rough=0.5, metal=0.0, emit=None, emit_strength=0.0, transm=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if transm:
        b.inputs['Transmission Weight'].default_value = transm
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_strength
    return m


def hexc(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    # sRGB -> linéaire
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def box(name, size, loc, material, bevel=0.004, segs=3, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = segs
        mod.limit_method = 'ANGLE'
    o.data.materials.append(material)
    smooth(o)
    return o


def cyl(name, r, h, loc, material, verts=32, rot=(0, 0, 0), r2=None, bevel=0.0):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, vertices=verts, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
    smooth(o)
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True
    if hasattr(o.data, 'set_sharp_from_angle'):
        o.data.set_sharp_from_angle(angle=math.radians(35))


def sphere(name, r, loc, material, scale=(1, 1, 1), rot=(0, 0, 0), seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(material)
    smooth(o)
    return o


def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        for m in o.modifiers:
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    return o


# ---------- matériaux ----------
M = {
    'desk_top': mat('bois_bureau', hexc('#2e2a27'), 0.55),
    'desk_metal': mat('metal_gris', hexc('#b9b8b4'), 0.45, 0.6),
    'desk_panel': mat('panneau_gris', hexc('#c9c7c1'), 0.6),
    'beige': mat('plastique_beige', hexc('#e6e0d2'), 0.55),
    'beige_dark': mat('plastique_beige_fonce', hexc('#cfc7b5'), 0.6),
    'screen': mat('ecran', hexc('#0c1020'), 0.15, emit=hexc('#1a2440'), emit_strength=0.6),
    'key': mat('touches', hexc('#f2eee5'), 0.5),
    'key_accent': mat('touche_corail', hexc('#ff5a36'), 0.45),
    'mug': mat('tasse_corail', hexc('#ff5a36'), 0.35),
    'choco': mat('chocolat', hexc('#4a2a18'), 0.25),
    'pot': mat('terre_cuite', hexc('#b8613c'), 0.85),
    'soil': mat('terre', hexc('#2e2219'), 1.0),
    'stem': mat('tige', hexc('#4f7a3a'), 0.6),
    'leaf': mat('feuille', hexc('#4a7d32'), 0.55),
    'leaf_dry': mat('feuille_seche', hexc('#a6a24c'), 0.7),
    'petal': mat('petale_lys', hexc('#fbf7f0'), 0.5),
    'stamen': mat('etamine', hexc('#d9822b'), 0.6),
    'chair_seat': mat('assise_cuir', hexc('#a8582c'), 0.55),
    'chair_metal': mat('chaise_metal', hexc('#2a2b2e'), 0.4, 0.7),
    'paper': mat('papier', hexc('#f7f5ef'), 0.8),
    'binder': mat('classeur', hexc('#5b3a2a'), 0.6),
    'binder2': mat('classeur2', hexc('#2f4bff'), 0.6),
    'cable': mat('cable', hexc('#1a1a1a'), 0.5),
    'floor': mat('sol', hexc('#e9e6e0'), 0.9),
    'bulb_glass': mat('ampoule', hexc('#fff3d0'), 0.1, emit=hexc('#ffcf73'), emit_strength=0.0),
    'bulb_metal': mat('douille', hexc('#2a2a2a'), 0.3, 0.8),
}

H = 0.75  # hauteur du plateau

# ---------- bureau (plateau + caisson à tiroirs + pieds) ----------
parts = []
parts.append(box('plateau', (1.6, 0.78, 0.035), (0, 0, H - 0.0175), M['desk_top'], bevel=0.006))
# caisson à tiroirs à gauche
parts.append(box('caisson', (0.42, 0.7, 0.36), (-0.55, 0, H - 0.035 - 0.18), M['desk_panel'], bevel=0.004))
for i, z in enumerate((H - 0.035 - 0.09, H - 0.035 - 0.27)):
    parts.append(box(f'tiroir{i}', (0.39, 0.012, 0.16), (-0.55, -0.356, z), M['desk_panel'], bevel=0.003))
    parts.append(box(f'poignee{i}', (0.1, 0.012, 0.014), (-0.55, -0.366, z + 0.04), M['desk_metal'], bevel=0.003))
# pieds
for x in (-0.76, 0.76):
    for y in (-0.34, 0.34):
        if x < 0:
            # sous le caisson : pied court
            parts.append(box('pied', (0.04, 0.04, H - 0.035 - 0.36), (x, y, (H - 0.035 - 0.36) / 2), M['desk_metal'], bevel=0.004))
        else:
            parts.append(box('pied', (0.04, 0.04, H - 0.035), (x, y, (H - 0.035) / 2), M['desk_metal'], bevel=0.004))
parts.append(box('traverse', (0.04, 0.68, 0.04), (0.76, 0, 0.12), M['desk_metal'], bevel=0.004))
parts.append(box('voile', (1.1, 0.012, 0.22), (0.2, 0.33, H - 0.035 - 0.11), M['desk_panel'], bevel=0.003))
desk = join(parts, 'Bureau')

# ---------- ordinateur : unité centrale + écran cathodique ----------
pc = []
# unité centrale à plat (format « desktop » des années 90)
pc.append(box('unite', (0.46, 0.4, 0.13), (0.0, 0.06, H + 0.065), M['beige'], bevel=0.008))
pc.append(box('lecteur', (0.14, 0.01, 0.018), (0.12, -0.142, H + 0.07), M['beige_dark'], bevel=0.002))
pc.append(box('bouton', (0.02, 0.01, 0.02), (-0.17, -0.142, H + 0.07), M['beige_dark'], bevel=0.003))
# moniteur
mz = H + 0.13
pc.append(box('pied_ecran', (0.2, 0.18, 0.02), (0, 0.06, mz + 0.01), M['beige'], bevel=0.006))
pc.append(box('facade', (0.42, 0.06, 0.36), (0, -0.03, mz + 0.2), M['beige'], bevel=0.012))
# tube arrière : tronc de pyramide
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.25, radius2=0.13, depth=0.3, location=(0, 0.14, mz + 0.2))
tube = bpy.context.object
tube.rotation_mode = 'ZXY'
tube.rotation_euler = (math.radians(-90), 0, math.radians(45))
tube.scale = (1.0, 1.0, 1.0)
tube.data.materials.append(M['beige_dark'])
bev = tube.modifiers.new('bevel', 'BEVEL'); bev.width = 0.02; bev.segments = 3
pc.append(tube)
pc.append(box('cadre', (0.36, 0.01, 0.28), (0, -0.061, mz + 0.21), M['beige_dark'], bevel=0.01))
pc.append(box('voyant', (0.012, 0.006, 0.006), (0.16, -0.062, mz + 0.045), M['key_accent'], bevel=0.002))
computer = join(pc, 'Ordinateur')

# écran (objet séparé : c'est là que le site affichera le bureau virtuel)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.0675, mz + 0.21), rotation=(math.radians(90), 0, 0))
screen = bpy.context.object
screen.name = 'Ecran'
screen.scale = (0.32, 0.24, 1)
bpy.ops.object.transform_apply(scale=True)
screen.data.materials.append(M['screen'])

# ---------- clavier et souris ----------
kb = [box('clavier', (0.44, 0.15, 0.025), (0, -0.24, H + 0.0125), M['beige'], bevel=0.006)]
for r in range(5):
    for c in range(14):
        accent = (r == 3 and c == 7)
        kb.append(box('touche', (0.024, 0.022, 0.01), (-0.195 + c * 0.03, -0.295 + r * 0.026, H + 0.029), M['key_accent'] if accent else M['key'], bevel=0.003, segs=2))
keyboard = join(kb, 'Clavier')
mouse = sphere('Souris', 1, (0.33, -0.24, H + 0.012), M['beige'], scale=(0.03, 0.05, 0.018))

# câble clavier
curve = bpy.data.curves.new('cable_clavier', 'CURVE'); curve.dimensions = '3D'
sp = curve.splines.new('BEZIER'); sp.bezier_points.add(2)
for p, co in zip(sp.bezier_points, [(0, -0.165, H + 0.01), (0.05, -0.08, H + 0.004), (0.1, 0.1, H + 0.02)]):
    p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
curve.bevel_depth = 0.003
cable = bpy.data.objects.new('Cables', curve); col.objects.link(cable); cable.data.materials.append(M['cable'])

# ---------- chocolat chaud ----------
mug_parts = [cyl('tasse', 0.04, 0.095, (-0.42, -0.2, H + 0.0475), M['mug'], bevel=0.002),
             cyl('chocolat', 0.035, 0.002, (-0.42, -0.2, H + 0.088), M['choco'])]
bpy.ops.mesh.primitive_torus_add(major_radius=0.025, minor_radius=0.007, location=(-0.38, -0.2, H + 0.05), rotation=(math.radians(90), 0, 0))
handle = bpy.context.object; handle.data.materials.append(M['mug']); mug_parts.append(handle)
mug = join(mug_parts, 'Chocolat')

# ---------- papiers et classeurs ----------
paper = []
for i in range(3):
    paper.append(box('feuille', (0.21, 0.297, 0.0015), (0.48, -0.08 + i * 0.004, H + 0.001 + i * 0.0016), M['paper'], bevel=0.0, rot=(0, 0, math.radians(8 - i * 5))))
papers = join(paper, 'Papiers')
binders = join([
    box('classeur1', (0.06, 0.26, 0.31), (0.68, 0.2, H + 0.155), M['binder'], bevel=0.004),
    box('classeur2', (0.06, 0.26, 0.31), (0.615, 0.2, H + 0.155), M['binder2'], bevel=0.004, rot=(0, math.radians(-6), 0)),
], 'Classeurs')

# ---------- chaise ----------
ch = []
ch.append(box('assise', (0.46, 0.44, 0.07), (0.35, -0.75, 0.47), M['chair_seat'], bevel=0.03, segs=4))
ch.append(box('dossier', (0.42, 0.06, 0.38), (0.35, -0.97, 0.78), M['chair_seat'], bevel=0.03, segs=4, rot=(math.radians(-8), 0, 0)))
ch.append(box('tige_dossier', (0.04, 0.03, 0.3), (0.35, -0.98, 0.55), M['chair_metal'], bevel=0.005, rot=(math.radians(-8), 0, 0)))
ch.append(cyl('verin', 0.025, 0.35, (0.35, -0.75, 0.25), M['chair_metal']))
for k in range(5):
    a = k * 2 * math.pi / 5
    ch.append(box('branche', (0.3, 0.035, 0.03), (0.35 + math.cos(a) * 0.15, -0.75 + math.sin(a) * 0.15, 0.07), M['chair_metal'], bevel=0.008, rot=(0, 0, a)))
    ch.append(sphere('roulette', 0.025, (0.35 + math.cos(a) * 0.29, -0.75 + math.sin(a) * 0.29, 0.025), M['chair_metal']))
chair = join(ch, 'Chaise')
chair.location = (0.35, 0.05, 0)
chair.rotation_euler = (0, 0, math.radians(-28))

# ---------- le lys en pot ----------
lily = [cyl('pot', 0.15, 0.32, (-1.05, -0.12, 0.16), M['pot'], r2=0.11, bevel=0.006),
        cyl('terre', 0.135, 0.01, (-1.05, -0.12, 0.31), M['soil'])]
lily[0].rotation_euler = (math.pi, 0, 0)
stems = [((-1.05, -0.12, 0.31), (-0.98, -0.16, 1.22)), ((-1.05, -0.12, 0.31), (-1.14, -0.06, 1.08)), ((-1.05, -0.12, 0.31), (-1.04, -0.02, 1.3))]
for a, b in stems:
    va, vb = Vector(a), Vector(b)
    mid = (va + vb) / 2
    d = vb - va
    bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=d.length, vertices=8, location=mid)
    s = bpy.context.object
    s.rotation_mode = 'QUATERNION'; s.rotation_quaternion = d.to_track_quat('Z', 'Y')
    s.data.materials.append(M['stem']); lily.append(s)
    # fleur en trompette : 6 pétales
    for k in range(6):
        ang = k * math.pi / 3
        pet = sphere('petale', 1, vb + Vector((math.cos(ang) * 0.055, math.sin(ang) * 0.055, 0.04)), M['petal'],
                     scale=(0.026, 0.01, 0.08), rot=(math.sin(ang) * 1.05, -math.cos(ang) * 1.05, 0), seg=16)
        lily.append(pet)
    for k in range(4):
        lily.append(sphere('etamine', 0.007, vb + Vector((math.cos(k * 1.6) * 0.014, math.sin(k * 1.6) * 0.014, 0.075)), M['stamen'], seg=8))
for k in range(10):
    ang = k * 2.4
    z = 0.42 + (k % 4) * 0.12
    lf = sphere('feuille', 1, (-1.05 + math.cos(ang) * 0.09, -0.12 + math.sin(ang) * 0.09, z), M['leaf'],
                scale=(0.024, 0.006, 0.14), rot=(math.sin(ang) * 0.95, -math.cos(ang) * 0.95, 0), seg=12)
    lily.append(lf)
lily_obj = join(lily, 'Lys')

# feuilles tombées
fallen = []
for i, (x, y, r) in enumerate([(-0.8, -0.2, 0.4), (-0.92, -0.38, 2.1), (-0.62, -0.52, 1.2), (-1.3, -0.1, 2.8), (0.55, 0.25, 0.9)]):
    z = H + 0.001 if x > 0 else 0.002
    fallen.append(sphere('feuille_tombee', 1, (x, y, z), M['leaf_dry'] if i % 2 else M['leaf'], scale=(0.028, 0.07, 0.002), rot=(0, 0, r), seg=12))
leaves = join(fallen, 'Feuilles')

# ---------- ampoule suspendue ----------
bulb_parts = [cyl('fil', 0.002, 3.0, (0, -0.05, 2.25 + 1.5), M['cable'], verts=6),
              cyl('douille', 0.02, 0.05, (0, -0.05, 2.27), M['bulb_metal'])]
bulb = sphere('Ampoule', 0.05, (0, -0.05, 2.2), M['bulb_glass'])
bulb_wire = join(bulb_parts, 'Suspension')

# ---------- sol ----------
bpy.ops.mesh.primitive_circle_add(vertices=96, radius=12, fill_type='NGON', location=(0, 0, 0))
floor = bpy.context.object; floor.name = 'Sol'; floor.data.materials.append(M['floor'])

# ---------- lumière et caméra pour l'aperçu ----------
world = bpy.data.worlds.new('monde'); scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (*hexc('#e9e6e0'), 1); bg.inputs['Strength'].default_value = 0.9

sun = bpy.data.objects.new('Soleil', bpy.data.lights.new('soleil', 'SUN'))
sun.data.energy = 2.2; sun.data.angle = math.radians(12)
sun.rotation_euler = (math.radians(40), math.radians(18), math.radians(30))
col.objects.link(sun)
area = bpy.data.objects.new('Douce', bpy.data.lights.new('douce', 'AREA'))
area.data.energy = 250; area.data.size = 3
area.location = (-2, -2.5, 3); area.rotation_euler = (math.radians(50), 0, math.radians(-40))
col.objects.link(area)

cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('cam'))
cam.data.lens = 50
col.objects.link(cam)
cam.location = (2.6, -3.6, 2.05)
direction = Vector((0, 0, 0.75)) - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

if __name__ == '__main__':
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 640
    scene.view_settings.view_transform = 'AgX'
    scene.render.filepath = f'{OUT}/apercu.png'
    bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/bureau.blend')
    bpy.ops.render.render(write_still=True)
    print('RENDU OK')
