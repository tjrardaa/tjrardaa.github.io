"""Bake jour / nuit du musée. À lancer après museum_lib.py et bake_lib.py (même session Blender).

Quatre atlas : M1 (passions), M2 (parcours), M3 (porte), M4 (sol avec bord qui s'efface).
"""
import math
import bmesh
import bpy
import numpy as np

# ---- configuration (remplace celle du bureau dans bake_lib) ----
ATLAS = {
    "M1": ["St_projecteur", "St_musique", "St_jeux", "St_voyages"],
    "M2": ["St_weplay", "St_reseau", "St_linux", "St_trophees"],
    "M3": ["Door"],
    "M4": ["MFloor"],
}
RES = {"M1": 2048, "M2": 2048, "M3": 1024, "M4": 2048}
FLOOR_R = 9.2          # rayon du sol (m)
FADE0, FADE1 = 7.6, 9.0  # le sol reste opaque jusqu'à 7,6 m puis s'efface


def make_floor():
    if "MFloor" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["MFloor"], do_unlink=True)
    bm = bmesh.new()
    N = 128
    c = bm.verts.new((0, 0, 0))
    ring = [bm.verts.new((FLOOR_R * math.cos(2 * math.pi * i / N), FLOOR_R * math.sin(2 * math.pi * i / N), 0)) for i in range(N)]
    for i in range(N):
        bm.faces.new((c, ring[i], ring[(i + 1) % N]))
    me = bpy.data.meshes.new("MFloor_mesh")
    bm.to_mesh(me); bm.free()
    lm = me.uv_layers.new(name="LM")
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            lm.data[li].uv = ((v.x / FLOOR_R + 1) / 2, (v.y / FLOOR_R + 1) / 2)
    m = bpy.data.materials.get("MFloor_mat") or bpy.data.materials.new("MFloor_mat")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    pr = nt.nodes.new("ShaderNodeBsdfPrincipled")
    pr.inputs["Base Color"].default_value = (*srgb_to_lin(PAGE_DAY), 1)
    pr.inputs["Roughness"].default_value = 1.0
    nt.links.new(pr.outputs[0], out.inputs[0])
    me.materials.append(m)
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new("MFloor", me)
    bpy.context.scene.collection.objects.link(o)
    return o


def prep_museum_materials():
    mats = set()
    for names in ATLAS.values():
        for n in names:
            for s in bpy.data.objects[n].material_slots:
                if s.material:
                    mats.add(s.material)
    for m in mats:
        if not m.use_nodes:
            m.use_nodes = True
        b = principled(m)
        if b is None:
            continue
        for key in ("Metallic", "Transmission Weight"):
            inp = b.inputs.get(key)
            if inp is None:
                continue
            for l in list(m.node_tree.links):
                if l.to_socket == inp:
                    m.node_tree.links.remove(l)
            inp.default_value = 0.0
    for names in ATLAS.values():
        for n in names:
            me = bpy.data.objects[n].data
            if "UVMap" in me.uv_layers:
                me.uv_layers["UVMap"].active_render = True
            if "LM" in me.uv_layers:
                me.uv_layers.active = me.uv_layers["LM"]
    return len(mats)


def floor_image(rgb_lin, tag, night_bg=None, soft=None):
    """Sol : couleur cuite + alpha radial (opaque jusqu'à FADE0, transparent à FADE1)."""
    res = rgb_lin.shape[0]
    ys, xs = np.mgrid[0:res, 0:res]
    x = ((xs + 0.5) / res * 2 - 1) * FLOOR_R
    y = ((ys + 0.5) / res * 2 - 1) * FLOOR_R
    r = np.sqrt(x * x + y * y)
    s = np.clip((r - FADE0) / (FADE1 - FADE0), 0, 1)
    alpha = 1 - (s * s * s * (s * (s * 6 - 15) + 10))
    if night_bg is not None:
        rgb_lin = rgb_lin + np.array(night_bg, dtype=np.float32)
    if soft is not None:
        rgb_lin = soft(rgb_lin)
    old = bpy.data.images.get(f"M4_{tag}")
    if old:
        bpy.data.images.remove(old)
    out = bpy.data.images.new(f"M4_{tag}", res, res, alpha=True)
    arr = np.ones((res, res, 4), dtype=np.float32)
    arr[..., :3] = lin_to_srgb(rgb_lin)
    arr[..., 3] = alpha
    out.pixels.foreach_set(arr.ravel())
    out.alpha_mode = "STRAIGHT"
    out.pack()
    return out
