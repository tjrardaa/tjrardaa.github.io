"""Outils pour construire le musée autour du bureau (Blender 5.x).

Utilisé depuis le MCP Blender :  exec(open('.../museum_lib.py', encoding='utf-8').read())
Repère Blender : Z vers le haut, le bureau est au centre (0, 0), la caméra regarde depuis -Y.
"""
import math
import bpy
import bmesh
from mathutils import Matrix, Vector

sc = bpy.context.scene


# ---------- matériaux et primitives ----------
def mat(name, col, rough=0.6, metal=0.0, emit=None, es=0.0, alpha=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = es
    if alpha is not None:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def link(o, coll=None):
    (coll or sc.collection).objects.link(o)
    return o


def box(name, size, loc, m, bevel=0.0, seg=2, rot=(0, 0, 0), parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]; v.co.y *= size[1]; v.co.z *= size[2]
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    link(o)
    o.location = loc; o.rotation_euler = rot
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = seg; md.limit_method = "ANGLE"
    o.data.materials.append(m)
    for p in me.polygons:
        p.use_smooth = True
    if parent:
        o.parent = parent
    return o


def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=48, r2=None, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=(r if r2 is None else r2), depth=h)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    link(o)
    o.location = loc; o.rotation_euler = rot
    o.data.materials.append(m)
    for p in me.polygons:
        p.use_smooth = True
    if parent:
        o.parent = parent
    return o


def sphere(name, r, loc, m, seg=32, rings=16, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    link(o)
    o.location = loc; o.scale = scale
    o.data.materials.append(m)
    for p in me.polygons:
        p.use_smooth = True
    return o


def curve_tube(name, pts, r, m, res=12):
    cv = bpy.data.curves.new(name, "CURVE")
    cv.dimensions = "3D"; cv.bevel_depth = r; cv.resolution_u = res
    sp = cv.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
    for p, c in zip(sp.bezier_points, pts):
        p.co = c; p.handle_left_type = p.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cv)
    link(o); cv.materials.append(m)
    return o


def text(name, body, size, loc, rot, m, extrude=0.0006, align="CENTER"):
    cv = bpy.data.curves.new(name, "FONT")
    cv.body = body; cv.size = size; cv.extrude = extrude; cv.align_x = align; cv.align_y = "CENTER"
    cv.materials.append(m)
    o = bpy.data.objects.new(name, cv)
    link(o)
    o.location = loc; o.rotation_euler = rot
    return o


# ---------- import : aplatir les hiérarchies ----------
def tree_objs(root):
    st, out = [root], []
    while st:
        o = st.pop()
        out.append(o)
        st.extend(o.children)
    return out


def flatten(objs, name, skip=()):
    """Fusionne des objets (mesh/courbe) en un seul maillage en coordonnées monde."""
    dg = bpy.context.evaluated_depsgraph_get()
    parts = []
    for o in objs:
        if o.type not in ("MESH", "CURVE", "FONT") or any(s in o.name for s in skip):
            continue
        ev = o.evaluated_get(dg)
        me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)
        if not len(me.polygons):
            bpy.data.meshes.remove(me)
            continue
        me.transform(o.matrix_world)
        if len(me.uv_layers) > 1:
            while len(me.uv_layers) > 1:
                me.uv_layers.remove(me.uv_layers[len(me.uv_layers) - 1])
        if me.uv_layers:
            me.uv_layers[0].name = "UVMap"
        n = bpy.data.objects.new(o.name + "_flat", me)
        link(n)
        parts.append(n)
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    if len(parts) > 1:
        bpy.ops.object.join()
    res = bpy.context.view_layer.objects.active
    res.name = name; res.data.name = name + "_mesh"
    return res


def remove_tree(roots):
    for r in roots:
        for o in tree_objs(r)[::-1]:
            if o.name in bpy.data.objects:
                bpy.data.objects.remove(o, do_unlink=True)


def purge():
    for m in [m for m in bpy.data.meshes if m.users == 0]:
        bpy.data.meshes.remove(m)
    for c in [c for c in bpy.data.curves if c.users == 0]:
        bpy.data.curves.remove(c)


def origin_bottom(o):
    """Origine au centre du dessous de la boîte englobante (tout est déjà en coordonnées monde)."""
    me = o.data
    pts = [v.co for v in me.vertices]
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2
    cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    zm = min(p.z for p in pts)
    me.transform(Matrix.Translation((-cx, -cy, -zm)))
    o.location = (0, 0, 0); o.rotation_euler = (0, 0, 0); o.scale = (1, 1, 1)
    return o


def dims(o):
    pts = [v.co for v in o.data.vertices]
    return tuple(round(max(p[i] for p in pts) - min(p[i] for p in pts), 3) for i in range(3))


def scale_mesh(o, k):
    o.data.transform(Matrix.Diagonal((k, k, k, 1)))


def decimate(o, ratio):
    md = o.modifiers.new("d", "DECIMATE")
    md.ratio = ratio; md.use_collapse_triangulate = True
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier="d")
    for p in o.data.polygons:
        p.use_smooth = True
    return len(o.data.polygons)
