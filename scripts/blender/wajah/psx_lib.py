# Fungsi bersama adegan PSX WajahDiLukisan (diringkas dari psx-character/psx_char.py, HEAD_MAP=front).
import bpy, math, bmesh, os
from mathutils import Vector
GLB = None; ATLAS = None; SKIN = '#c08952'; HAIR = '#281b0f'
TOTAL = 1
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1)
def mat(name, hexc, rough=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = lin(hexc); b.inputs['Roughness'].default_value = rough
    return m

# ---------- tokoh (diringkas dari psx-character/psx_char.py, HEAD_MAP=front) ----------
GROUP = {'spine': 'shirt', 'spine.001': 'shirt', 'shoulder': 'shirt', 'upper_arm': 'shirt', 'forearm': 'skin', 'hand': 'skin',
         'spine.002': 'skin', 'spine.003': 'head', 'pelvis': 'pants', 'thigh': 'pants', 'shin': 'pants',
         'foot': 'shoes', 'toe': 'shoes', 'heel.02': 'shoes'}
def make_char(tag, coat='#17181d', pants='#1e1f25', atlas=None, skin=None, hair=None):
    atlas = atlas or ATLAS; skin_ = skin or SKIN; hair_ = hair or HAIR
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=GLB)
    new = [o for o in bpy.data.objects if o not in before]
    for o in list(new):
        if o.type == 'MESH' and not o.vertex_groups: bpy.data.objects.remove(o, do_unlink=True); new.remove(o)
    rig = next(o for o in new if o.type == 'ARMATURE'); body = next(o for o in new if o.type == 'MESH')
    rig.name, body.name = 'rig_' + tag, 'body_' + tag
    bm = bmesh.new(); bm.from_mesh(body.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005); bm.to_mesh(body.data); bm.free()
    face = bpy.data.materials.new('face_' + tag); face.use_nodes = True
    nt = face.node_tree; bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 1.0
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(atlas); tex.interpolation = 'Closest'; tex.extension = 'EXTEND'
    uvn = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    nt.links.new(uvn.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector']); nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    cells = max(1, tex.image.size[0] // tex.image.size[1])
    M = dict(skin=mat('skin_' + tag, skin_), hair=mat('hair_' + tag, hair_), shirt=mat('coat_' + tag, coat), pants=mat('pants_' + tag, pants), shoes=mat('shoes_' + tag, '#0c0a09'))
    order = ['skin', 'face', 'hair', 'shirt', 'pants', 'shoes']
    me = body.data; me.materials.clear()
    for k in order: me.materials.append(face if k == 'face' else M[k])
    MI = {k: i for i, k in enumerate(order)}
    gname = {g.index: g.name.rsplit('.L', 1)[0].rsplit('.R', 1)[0] for g in body.vertex_groups}
    def dominant(poly):
        acc = {}
        for vi in poly.vertices:
            for g in me.vertices[vi].groups: n = gname[g.group]; acc[n] = acc.get(n, 0) + g.weight
        return max(acc, key=acc.get) if acc else 'spine'
    dom = {p.index: dominant(p) for p in me.polygons}
    hp = [p for p in me.polygons if GROUP.get(dom[p.index]) == 'head']
    hz = [me.vertices[v].co.z for p in hp for v in p.vertices]; hx = [me.vertices[v].co.x for p in hp for v in p.vertices]
    zmin, zmax, xmin, xmax = min(hz), max(hz), min(hx), max(hx)
    fz0, fz1 = zmin + (zmax - zmin) * 0.10, zmin + (zmax - zmin) * 0.80
    xc, xw = (xmin + xmax) / 2, (xmax - xmin) / 2 * 0.86
    bm = bmesh.new(); bm.from_mesh(me); bm.normal_update(); uvl = bm.loops.layers.uv.verify()
    for f in bm.faces:
        kind = GROUP.get(dom[f.index], 'shirt')
        if kind == 'head' and f.normal.y > -0.3:
            kind = 'skin' if f.calc_center_median().z < zmin + (zmax - zmin) * 0.3 else 'hair'
        elif kind == 'head':
            kind = 'face'
            for lp in f.loops:
                u = (lp.vert.co.x - (xc - xw)) / (2 * xw); v = (lp.vert.co.z - fz0) / (fz1 - fz0)
                u = 0.5 + (u - 0.5) * 0.5; r = 1 - v; r = 0.55 + (r - 0.55) * 0.5; v = 1 - r
                lp[uvl].uv = (min(max(u, 0), 1) / cells, min(max(v, 0), 1))
        if kind == 'shirt' and f.calc_center_median().z < 0.98: kind = 'pants'
        f.material_index = MI[kind]
    bm.to_mesh(me); bm.free()
    if me.has_custom_normals:
        bpy.context.view_layer.objects.active = body; bpy.ops.mesh.customdata_custom_splitnormals_clear()
    for poly in me.polygons: poly.use_smooth = True
    rig.rotation_mode = 'XYZ'; rig.rotation_euler = (0, 0, 0); rig.location = (0, 0, 0)
    pb = rig.pose.bones
    for b in pb: b.rotation_mode = 'XYZ'
    bpy.context.view_layer.update()
    rest = {s: pb['hand.' + s].tail.y for s in ('L', 'R')}
    def hand_d(s):
        bpy.context.view_layer.update(); t = pb['hand.' + s].tail; return abs(t.x) + 2 * abs(t.y - rest[s])
    for s in ('L', 'R'):                                        # lengan turun dari A-pose
        best = None
        for ax in (0, 2):
            for sg in (1, -1):
                r = [0, 0, 0]; r[ax] = sg * math.radians(22); pb['upper_arm.' + s].rotation_euler = r; d = hand_d(s)
                if best is None or d < best[0]: best = (d, ax, sg)
        r = [0, 0, 0]; r[best[1]] = best[2] * math.radians(22); pb['upper_arm.' + s].rotation_euler = r
    return dict(rig=rig, body=body, pb=pb, map=mp, cells=cells, mats=list(M.values()) + [face])

def key_expr(ch, frames_cells):
    m = ch['map']
    for f, c in frames_cells:
        m.inputs['Location'].default_value[0] = min(c, ch['cells'] - 1) / ch['cells']; m.inputs['Location'].keyframe_insert('default_value', index=0, frame=f)
def head_turn(ch, f, deg, nod=0.0):
    for n, share in (('spine.002', 0.4), ('spine.003', 0.6)):
        ch['pb'][n].rotation_euler = (math.radians(nod * share), math.radians(deg * share), 0); ch['pb'][n].keyframe_insert('rotation_euler', frame=f)
def breathe(ch, total, period=48, amp=0.02):
    TOTAL = total
    for k, f in enumerate(range(1, TOTAL + period, period // 2)):
        s = 1.0 + (amp if k % 2 else 0.0); ch['pb']['spine.001'].scale = (s, 1, s); ch['pb']['spine.001'].keyframe_insert('scale', frame=min(f, TOTAL))
    for s in ('L', 'R'):
        for f in (1, TOTAL): ch['pb']['upper_arm.' + s].keyframe_insert('rotation_euler', frame=f)

