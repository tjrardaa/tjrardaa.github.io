"""Outils de bake pour la scène du bureau (Blender 5.x, Cycles).

Utilisé depuis le MCP Blender :  exec(open('.../bake_lib.py', encoding='utf-8').read())
Chaque atlas regroupe des objets qui partagent une texture de lumière (UV 'LM').
"""
import bpy
import numpy as np
from mathutils import Vector

ATLAS = {
    "A1_desk": ["Desk", "Chair"],
    "A2_computer": ["Monitor", "Computer", "Keyboard", "Mouse", "Speakers"],
    "A3_items": ["Mug", "DeskStuff", "Cables"],
    "A4_props": ["Vinyls", "PaperPiles", "Pot", "Leaves"],
    "A5_floor": ["Floor"],
}
RES = {"A1_desk": 2048, "A2_computer": 2048, "A3_items": 1024, "A4_props": 2048, "A5_floor": 2048}

PAGE_DAY = (0.957, 0.945, 0.918)     # #f4f1ea
PAGE_NIGHT = (0.0275, 0.0314, 0.0471)  # #07080c
BULB = Vector((0.0, 0.02, 1.78))


def srgb_to_lin(c):
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def lin_to_srgb(a):
    a = np.clip(a, 0.0, 1.0)
    return np.where(a <= 0.0031308, 12.92 * a, 1.055 * np.power(a, 1 / 2.4) - 0.055)


def principled(m):
    return next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)


def prep_materials():
    """Rend les matériaux 'diffus' pour le bake : pas de métal, pas de transmission."""
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
    # uv de rendu = UV d'origine (les textures la lisent), uv active = LM (cible du bake)
    for names in ATLAS.values():
        for n in names:
            me = bpy.data.objects[n].data
            if "UVMap" in me.uv_layers:
                me.uv_layers["UVMap"].active_render = True
            if "LM" in me.uv_layers:
                me.uv_layers.active = me.uv_layers["LM"]
    # sol : matériau diffus simple (la transparence radiale est ajoutée après le bake)
    fl = bpy.data.materials["Floor_mat"]
    nt = fl.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    pr = nt.nodes.new("ShaderNodeBsdfPrincipled")
    pr.inputs["Base Color"].default_value = (*srgb_to_lin(PAGE_DAY), 1)
    pr.inputs["Roughness"].default_value = 1.0
    nt.links.new(pr.outputs[0], out.inputs[0])
    return len(mats)


def _world(strength, color):
    w = bpy.context.scene.world
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength
    nt.links.new(bg.outputs[0], out.inputs[0])


def ensure_lights():
    sc = bpy.context.scene
    L = {}
    if "Day_Softbox" in bpy.data.objects:
        L["soft"] = bpy.data.objects["Day_Softbox"]
    def mk(name, kind):
        if name in bpy.data.objects:
            return bpy.data.objects[name]
        d = bpy.data.lights.new(name, kind)
        o = bpy.data.objects.new(name, d)
        sc.collection.objects.link(o)
        return o
    spot = mk("Night_Spot", "SPOT")
    spot.location = BULB
    spot.rotation_euler = (0, 0, 0)  # regarde vers -Z
    spot.data.spot_size = 2.0
    spot.data.spot_blend = 0.9
    spot.data.shadow_soft_size = 0.03
    spot.data.color = (1.0, 0.66, 0.30)
    fill = mk("Night_Fill", "POINT")
    fill.location = BULB
    fill.data.shadow_soft_size = 0.03
    fill.data.color = (1.0, 0.66, 0.30)
    glow = mk("Screen_Glow", "AREA")
    glow.data.shape = "RECTANGLE"
    glow.data.size = 0.346
    glow.data.size_y = 0.26
    glow.data.color = (0.55, 0.75, 1.0)
    glow.location = (0.0, -0.20, 1.22)
    glow.rotation_euler = (-1.5708, 0, 0)  # émet vers -Y
    L.update(spot=spot, fill=fill, glow=glow)
    return L


def set_mode(mode, spot_w=700.0, fill_w=80.0, glow_w=6.0):
    L = ensure_lights()
    day = mode == "day"
    if day:
        _world(0.8, (1, 1, 1))
    else:
        _world(1.0, (0.004, 0.005, 0.009))
    L["soft"].hide_render = not day
    L["spot"].hide_render = day
    L["fill"].hide_render = day
    L["glow"].hide_render = day
    L["spot"].data.energy = spot_w
    L["fill"].data.energy = fill_w
    L["glow"].data.energy = glow_w
    # l'ampoule (verre, douille) ne doit pas faire d'ombre ; l'écran plat n'est pas cuit
    for n in ("Bulb",):
        bpy.data.objects[n].visible_shadow = False
    bpy.data.objects["Screen"].hide_render = True
    return mode


def bake_atlas(atlas, tag, samples=256):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = False
    sc.cycles.transparent_max_bounces = 64
    objs = [bpy.data.objects[n] for n in ATLAS[atlas]]
    res = RES[atlas]
    name = f"{atlas}_{tag}_lin"
    old = bpy.data.images.get(name)
    if old:
        bpy.data.images.remove(old)
    img = bpy.data.images.new(name, res, res, alpha=False, float_buffer=True)
    img.colorspace_settings.name = "Non-Color"
    added = []
    for o in objs:
        for s in o.material_slots:
            nt = s.material.node_tree
            n = nt.nodes.new("ShaderNodeTexImage")
            n.image = img
            n.name = "BAKE_TARGET"
            nt.nodes.active = n
            added.append((nt, n))
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
        if "LM" in o.data.uv_layers:
            o.data.uv_layers.active = o.data.uv_layers["LM"]
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.bake(
        type="COMBINED",
        pass_filter={"DIFFUSE", "DIRECT", "INDIRECT", "EMIT"},
        margin=8,
        margin_type="EXTEND",
        use_clear=True,
        uv_layer="LM",
    )
    for nt, n in added:
        nt.nodes.remove(n)
    return img


def pixels(img):
    res = img.size[0]
    return np.array(img.pixels[:], dtype=np.float32).reshape(res, res, 4)


def baked_material(atlas, tag):
    """Matériau 'sans lumière' : la texture cuite est émise telle quelle."""
    name = f"{atlas}_baked"
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    pr = nt.nodes.new("ShaderNodeBsdfPrincipled")
    pr.inputs["Roughness"].default_value = 1.0
    pr.inputs["Metallic"].default_value = 0.0
    tx = nt.nodes.new("ShaderNodeTexImage")
    tx.name = "BakedTex"
    tx.image = bpy.data.images[f"{atlas}_{tag}"]
    uv = nt.nodes.new("ShaderNodeUVMap")
    uv.uv_map = "LM"
    nt.links.new(uv.outputs[0], tx.inputs[0])
    nt.links.new(tx.outputs["Color"], pr.inputs["Base Color"])
    if atlas == "A5_floor":
        nt.links.new(tx.outputs["Alpha"], pr.inputs["Alpha"])
        m.blend_method = "BLEND"
    nt.links.new(pr.outputs[0], out.inputs[0])
    return m


def apply_baked(tag):
    for atlas, names in ATLAS.items():
        m = baked_material(atlas, tag)
        for n in names:
            o = bpy.data.objects[n]
            if "orig_mats" not in o:
                o["orig_mats"] = [s.material.name if s.material else "" for s in o.material_slots]
                o["orig_idx"] = [p.material_index for p in o.data.polygons]
            o.data.materials.clear()
            o.data.materials.append(m)
            for p in o.data.polygons:
                p.material_index = 0
                p.use_smooth = p.use_smooth


def set_baked_tag(tag):
    for atlas in ATLAS:
        m = bpy.data.materials[f"{atlas}_baked"]
        m.node_tree.nodes["BakedTex"].image = bpy.data.images[f"{atlas}_{tag}"]


def restore_orig():
    for names in ATLAS.values():
        for n in names:
            o = bpy.data.objects[n]
            if "orig_mats" in o:
                o.data.materials.clear()
                for mn in o["orig_mats"]:
                    o.data.materials.append(bpy.data.materials.get(mn))
                for p, i in zip(o.data.polygons, o["orig_idx"]):
                    p.material_index = i
                del o["orig_mats"]
                del o["orig_idx"]


def make_srgb(name, rgb):
    """Crée une image 8 bits sRGB depuis un tableau linéaire (res, res, 3)."""
    res = rgb.shape[0]
    old = bpy.data.images.get(name)
    if old:
        bpy.data.images.remove(old)
    out = bpy.data.images.new(name, res, res, alpha=False)
    srgb = lin_to_srgb(rgb)
    a = np.ones((res, res, 4), dtype=np.float32)
    a[..., :3] = srgb
    out.pixels.foreach_set(a.ravel())
    out.pack()
    return out
