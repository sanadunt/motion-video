# Karakter PSX: base mesh rig gaya Rigify + atlas ekspresi + efek PSX (+ jalan IK).
#   [ANIM=walk] [IK=1] [FACE_ATLAS=atlas.png] [CELLS=4] [FRAMES=n] \
#   blender -b --factory-startup -P psx_char.py -- <outdir> <file .glb> [lebar tinggi]
# Material dibagi menurut tulang dominan tiap sisi (vertex group): kepala -> wajah/rambut/kulit,
# badan + lengan atas -> baju, lengan bawah + tangan -> kulit, kaki -> celana, telapak -> sepatu.
# Wajah = atlas face_atlas.png (CELLS sel berjajar), ekspresi diganti per frame via node Mapping.
import bpy, sys, os, math, bmesh
from mathutils import Vector, Euler

args = sys.argv[sys.argv.index('--') + 1:]
D, GLB = args[0], args[1]
RES = (int(args[2]), int(args[3])) if len(args) >= 4 else (240, 320)
CELLS = int(os.environ.get('CELLS', 4))   # jumlah ekspresi di atlas (sel berjajar ke kanan)
FOG = '#1c201c'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
for o in list(bpy.data.objects):
    if o.type == 'MESH' and not o.vertex_groups:  # Icosphere nyasar dari file asal
        bpy.data.objects.remove(o, do_unlink=True)
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
body = next(o for o in bpy.data.objects if o.type == 'MESH')

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1)

def mat(name, hexc):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = lin(hexc); b.inputs['Roughness'].default_value = 1.0
    return m

# ---------- material ----------
face = bpy.data.materials.new('face'); face.use_nodes = True
nt = face.node_tree; bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 1.0
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(os.environ.get('FACE_ATLAS', os.path.join(D, 'face_atlas.png')))
tex.interpolation = 'Closest'; tex.extension = 'CLIP'
uvn = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
nt.links.new(uvn.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
M = dict(skin=mat('skin', '#b07a5a'), hair=mat('hair', '#2a1c18'), shirt=mat('shirt', '#4a5248'),
         pants=mat('pants', '#2e3038'), shoes=mat('shoes', '#1a1614'))
ORDER = ['skin', 'face', 'hair', 'shirt', 'pants', 'shoes']
body.data.materials.clear()
for k in ORDER:
    body.data.materials.append(face if k == 'face' else M[k])
MI = {k: i for i, k in enumerate(ORDER)}
GROUP = {'spine': 'shirt', 'spine.001': 'shirt', 'shoulder': 'shirt', 'upper_arm': 'shirt', 'forearm': 'skin', 'hand': 'skin',
         'spine.002': 'skin', 'spine.003': 'head', 'pelvis': 'pants', 'thigh': 'pants', 'shin': 'pants',
         'foot': 'shoes', 'toe': 'shoes', 'heel.02': 'shoes'}

# ---------- bagi material + UV wajah (koordinat lokal: depan = +X, atas = +Z) ----------
me = body.data
gname = {g.index: g.name.rsplit('.L', 1)[0].rsplit('.R', 1)[0] for g in body.vertex_groups}
def dominant(poly):
    acc = {}
    for vi in poly.vertices:
        for g in me.vertices[vi].groups:
            n = gname[g.group]; acc[n] = acc.get(n, 0) + g.weight
    return max(acc, key=acc.get) if acc else 'spine'
head_polys = [p for p in me.polygons if GROUP.get(dominant(p)) == 'head']
hz = [me.vertices[v].co.z for p in head_polys for v in p.vertices]
hx = [me.vertices[v].co.x for p in head_polys for v in p.vertices]
zmin, zmax = min(hz), max(hz); xmin, xmax = min(hx), max(hx)
print('head faces', len(head_polys), 'z', round(zmin, 3), round(zmax, 3), 'x', round(xmin, 3), round(xmax, 3))
bm = bmesh.new(); bm.from_mesh(me); bm.normal_update(); uvl = bm.loops.layers.uv.verify()
dom = {p.index: dominant(p) for p in me.polygons}
fz0, fz1 = zmin + (zmax - zmin) * 0.02, zmin + (zmax - zmin) * 0.80   # wajah: dagu sampai alis
xc, xw = (xmin + xmax) / 2, (xmax - xmin) / 2 * 0.86
fx0, fx1 = xc - xw, xc + xw
for f in bm.faces:
    kind = GROUP.get(dom[f.index], 'shirt')
    if kind == 'head':
        c = f.calc_center_median()
        if f.normal.y < -0.35 and c.z < fz1:   # lokal model: depan = -Y, kanan penonton = +X
            kind = 'face'
            for lp in f.loops:
                u = (lp.vert.co.x - fx0) / (fx1 - fx0); v = (lp.vert.co.z - fz0) / (fz1 - fz0)
                lp[uvl].uv = (max(0, min(1, u)) / CELLS, max(0, min(1, v)))
        elif c.z > zmin + (zmax - zmin) * 0.62 or f.normal.y > -0.25:
            kind = 'hair'   # rambut pendek dicat di kepala (atas + belakang), gaya PS1
        else:
            kind = 'skin'
    if kind == 'shirt' and f.calc_center_median().z < 0.98:
        kind = 'pants'   # pinggul (bobot 'spine') di bawah pinggang = celana, bukan baju
    f.material_index = MI[kind]
bm.to_mesh(me); bm.free()
print('faces per material', {k: sum(1 for p in me.polygons if p.material_index == i) for k, i in MI.items()})

# ---------- posisi: kaki di z=0, menghadap kamera (-Y) ----------
# Importer glTF memberi armature rotasi quaternion 90 derajat. Dengan rotasi nol, model (depan = -Y lokal) menghadap kamera.
rig.rotation_mode = 'XYZ'
rig.location = (0, 0, 0); rig.rotation_euler = (0, 0, 0)
bpy.context.view_layer.update()

# ---------- pose & animasi lewat tulang ----------
pb = rig.pose.bones
for b in pb: b.rotation_mode = 'XYZ'
def hand_y(side):
    # ruang armature: samping = X, depan = -Y; tangan didekatkan ke badan tanpa maju/mundur
    bpy.context.view_layer.update(); t = pb['hand.' + side].tail
    return abs(t.x) + 2 * abs(t.y - REST_Y[side])
REST_Y = {}; LOW = {}
bpy.context.view_layer.update()
for sd in ('L', 'R'): REST_Y[sd] = pb['hand.' + sd].tail.y
# turunkan lengan dari A-pose: cari sumbu lokal yang mendekatkan tangan ke badan
for side in ('L', 'R'):
    base = hand_y(side); best = None
    for ax in (0, 2):
        for sgn in (1, -1):
            r = [0, 0, 0]; r[ax] = sgn * math.radians(22); pb['upper_arm.' + side].rotation_euler = r
            d = hand_y(side)
            if best is None or d < best[0]: best = (d, ax, sgn)
    r = [0, 0, 0]; r[best[1]] = best[2] * math.radians(22); pb['upper_arm.' + side].rotation_euler = r
    pb['forearm.' + side].rotation_euler = (0, 0, 0)
    print('arm', side, 'axis', best[1], 'sign', best[2], 'hand x', round(base, 3), '->', round(best[0], 3))
    LOW[side] = (best[1], best[2] * math.radians(22))

ANIM = os.environ.get('ANIM', 'idle')
def head_turn(f, deg, nod=0.0):
    for n, share in (('spine.002', 0.4), ('spine.003', 0.6)):
        pb[n].rotation_euler = (math.radians(nod * share), math.radians(deg * share), 0)
        pb[n].keyframe_insert('rotation_euler', frame=f)
def axis_for(bone, tip, want):
    """Cari sumbu+tanda rotasi lokal 'bone' yang menggeser ujung 'tip' ke arah 'want' (vektor armature)."""
    keep = tuple(pb[bone].rotation_euler); bpy.context.view_layer.update(); base = pb[tip].tail.copy(); best = None
    for ax in (0, 1, 2):
        for sgn in (1, -1):
            r = list(keep); r[ax] += sgn * math.radians(15); pb[bone].rotation_euler = r
            bpy.context.view_layer.update(); d = pb[tip].tail - base
            score = d.dot(want) - 0.5 * d.cross(want).length
            if best is None or score > best[0]: best = (score, ax, sgn)
    pb[bone].rotation_euler = keep
    return best[1], best[2]

SNAP = 66 if ANIM != 'walk' else 118          # frame kepala patah ke kamera + wajah seram
if ANIM == 'walk':
    # ---- jalan mendekati kamera, berhenti, lalu kepala patah ke kamera ----
    FWD = Vector((0, -1, 0)); CYC = 30; WALK_END = 108
    USE_IK = os.environ.get('IK', '1') == '1'   # IK=0: kaki FK lama (telapak meluncur)
    AX = {}
    for s in ('L', 'R'):
        AX['thigh' + s] = axis_for('thigh.' + s, 'foot.' + s, FWD)       # paha: kaki ke depan
        AX['shin' + s] = axis_for('shin.' + s, 'foot.' + s, -FWD)        # lutut: telapak ke belakang
        r = [0, 0, 0]; r[LOW[s][0]] = LOW[s][1]; pb['upper_arm.' + s].rotation_euler = r
        AX['arm' + s] = axis_for('upper_arm.' + s, 'hand.' + s, FWD)     # lengan: tangan ke depan
    print('axes', AX)
    def rot(bone, axsgn, deg, base=None, f=None):
        r = list(base) if base else [0, 0, 0]; r[axsgn[0]] += axsgn[1] * math.radians(deg)
        pb[bone].rotation_euler = r; pb[bone].keyframe_insert('rotation_euler', frame=f)
    LEG = [(0, 24, 4), (7, 4, 8), (15, -20, 12), (22, 8, 45)]   # (fase, paha + = depan, lutut)
    for s, off in (('L', 0), ('R', CYC // 2)):
        armb = [0, 0, 0]; armb[LOW[s][0]] = LOW[s][1]
        for c in range(0, WALK_END, CYC):
            for ph, th, kn in LEG:
                f = 1 + c + (ph + off) % CYC
                if f > WALK_END: continue
                if not USE_IK:
                    rot('thigh.' + s, AX['thigh' + s], th, f=f); rot('shin.' + s, AX['shin' + s], kn, f=f)
                rot('upper_arm.' + s, AX['arm' + s], -th * 0.5, base=armb, f=f)  # lengan berlawanan kaki
        for f in (WALK_END + 6, 150):  # berdiri diam
            if not USE_IK:
                rot('thigh.' + s, AX['thigh' + s], 0, f=f); rot('shin.' + s, AX['shin' + s], 2, f=f)
            rot('upper_arm.' + s, AX['arm' + s], 0, base=armb, f=f)
    # gerak maju (linear) + naik-turun panggul
    Y0, SPEED = 4.1, 0.85
    for f in range(1, WALK_END + 1):
        ph = (f - 1) % (CYC // 2)
        if f == 1 or f == WALK_END or ph in (0, 4, 7, 11):
            rig.location = (0, Y0 - SPEED * (f - 1) / 30, -0.02 if ph == 0 else (0.012 if ph == 7 else -0.004))
            rig.keyframe_insert('location', frame=f)
    rig.location.z = 0; rig.keyframe_insert('location', index=2, frame=WALK_END + 6)
    YEND = rig.location.y
    if USE_IK:
        # ---- IK kaki: target telapak menempel di lantai saat tumpu, melengkung saat ayun ----
        bpy.context.view_layer.update()
        hip_y = lambda f: Y0 - SPEED * (min(f, WALK_END) - 1) / 30
        STRIDE_FWD, STANCE, LIFT = 0.21, 16, 0.08     # telapak mendarat 0,21 di depan pinggul; tumpu 16/30 frame
        tg, pole = {}, {}
        for s, off in (('L', 0), ('R', CYC // 2)):
            ank = pb['foot.' + s].head.copy()          # pergelangan, ruang armature (= dunia saat rig di 0)
            t = bpy.data.objects.new('foot_target.' + s, None); t.empty_display_size = 0.05; sc.collection.objects.link(t)
            p = bpy.data.objects.new('knee_pole.' + s, None); sc.collection.objects.link(p)
            p.parent = rig; p.location = (ank.x, -0.6, 0.55)                       # di depan lutut, ikut badan
            tg[s], pole[s] = t, p
            land = lambda c: hip_y(c) - STRIDE_FWD
            for f in range(1, 151):
                k = (f - 1 - off) // CYC; c = 1 + off + CYC * k; ph = f - c
                if f > WALK_END:                        # berhenti: kedua telapak ke posisi berdiri
                    last_c = 1 + off + CYC * ((WALK_END - 1 - off) // CYC)
                    y_from = land(last_c) if (WALK_END - last_c) < STANCE else land(last_c + CYC)
                    s_ = min(1.0, (f - WALK_END) / 6); s_ = s_ * s_ * (3 - 2 * s_)
                    y, z = y_from + (YEND - y_from) * s_, ank.z + LIFT * 0.5 * math.sin(math.pi * s_)
                elif ph < STANCE:
                    y, z = land(c), ank.z
                else:
                    s_ = (ph - STANCE) / (CYC - STANCE); s_ = s_ * s_ * (3 - 2 * s_)
                    y, z = land(c) + (land(c + CYC) - land(c)) * s_, ank.z + LIFT * math.sin(math.pi * s_)
                t.location = (ank.x, y, z); t.keyframe_insert('location', frame=f)
            ik = pb['shin.' + s].constraints.new('IK'); ik.target = t; ik.chain_count = 2
            ik.pole_target = p
        # sudut pole: pilih yang membuat lutut menekuk ke depan, bukan ke samping
        for s, sw in (('L', 24), ('R', 9)):   # nilai di frame saat kaki itu sedang mengayun (lutut menekuk)
            sc.frame_set(sw)
            ik = pb['shin.' + s].constraints['IK']; best = None
            for a in range(-180, 180, 15):
                ik.pole_angle = math.radians(a); bpy.context.view_layer.update()
                knee = pb['shin.' + s].head; hip = pb['thigh.' + s].head
                ft = pb['foot.' + s].head; mid = (hip + ft) / 2
                score = (mid.y - knee.y) - 4 * abs(knee.x - hip.x)
                if best is None or score > best[0]: best = (score, a)
            ik.pole_angle = math.radians(best[1]); print('pole', s, best[1])
        sc.frame_set(1)
    # kepala menunduk saat jalan, lalu patah ke kamera
    for f, deg, nod in ((1, 0, 10), (WALK_END, 4, 12), (SNAP - 2, 4, 12), (SNAP, 0, -6), (150, 0, -8)):
        head_turn(f, deg, nod)
    for f, s in ((1, 1.0), (60, 1.02), (WALK_END, 1.0), (SNAP, 1.035), (150, 1.02)):
        pb['spine.001'].scale = (s, 1, s); pb['spine.001'].keyframe_insert('scale', frame=f)
    for side, sgn in (('L', 1), ('R', -1)):
        for f, a in ((1, 0), (SNAP - 2, 0), (SNAP, 6), (150, 5)):
            pb['shoulder.' + side].rotation_euler = (math.radians(sgn * a), 0, 0); pb['shoulder.' + side].keyframe_insert('rotation_euler', frame=f)
    EXPR = [(1, 0), (40, 1), (44, 0), (85, 1), (89, 0), (110, 2), (113, 0), (115, 2), (SNAP, 3)]
else:
    for s in ('L', 'R'):
        for f in (1, 90): pb['upper_arm.' + s].keyframe_insert('rotation_euler', frame=f)
    head_turn(1, -32, 4); head_turn(60, 16, 0); head_turn(64, 16, 0); head_turn(66, 0, -8); head_turn(90, 0, -10)
    for f, s in ((1, 1.0), (23, 1.025), (45, 1.0), (67, 1.03), (90, 1.0)):   # napas
        pb['spine.001'].scale = (s, 1, s); pb['spine.001'].keyframe_insert('scale', frame=f)
    for side, sgn in (('L', 1), ('R', -1)):  # bahu terangkat saat menoleh patah
        for f, a in ((1, 0), (64, 0), (66, 6), (90, 5)):
            pb['shoulder.' + side].rotation_euler = (math.radians(sgn * a), 0, 0); pb['shoulder.' + side].keyframe_insert('rotation_euler', frame=f)
    EXPR = [(1, 0), (25, 1), (29, 0), (37, 2), (41, 0), (45, 2), (49, 0), (53, 2), (57, 0), (66, 3)]
for f, e in EXPR:
    mp.inputs['Location'].default_value[0] = e / CELLS
    mp.inputs['Location'].keyframe_insert('default_value', index=0, frame=f)

from bpy_extras import anim_utils
def fcurves(idb):
    ad = idb.animation_data; cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    return cb.fcurves if cb else []
for fc in fcurves(face.node_tree):
    for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
for fc in fcurves(rig):
    for kp in fc.keyframe_points:
        if fc.data_path == 'location' and fc.array_index == 1:
            kp.interpolation = 'LINEAR'   # maju dengan kecepatan tetap
            continue
        kp.interpolation = 'CONSTANT' if (kp.co.x >= SNAP - 2 and 'spine.00' in fc.data_path and 'spine.001' not in fc.data_path) else 'BEZIER'
        kp.easing = 'EASE_IN_OUT'

# ---------- lorong, cahaya, kamera ----------
def flat(name, hexc): return mat(name, hexc)
env = dict(floor=flat('floor', '#3d3a30'), wall=flat('wall', '#8a8a72'), door=flat('door', '#0c0c0a'))
def plane(m, loc, scale, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=2, location=loc); o = bpy.context.active_object
    o.scale = scale; o.rotation_euler = rot; o.data.materials.append(m)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=6); bpy.ops.object.mode_set(mode='OBJECT')
    o.select_set(False)
    return o
plane(env['floor'], (0, 3, 0), (1.3, 4, 1))
for s in (-1, 1): plane(env['wall'], (s * 1.3, 3, 1.3), (1, 4, 1.3), (0, math.pi / 2, 0))
plane(env['wall'], (0, 7, 1.3), (1.3, 1, 1.3), (math.pi / 2, 0, 0))
plane(env['door'], (0.4, 6.98, 1.0), (0.4, 1, 1.0), (math.pi / 2, 0, 0))

def fog(m, near=1.6, far=11.0):
    t = m.node_tree; out = t.nodes['Material Output']; src = out.inputs['Surface'].links[0].from_node
    cd = t.nodes.new('ShaderNodeCameraData'); mr = t.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = near; mr.inputs['From Max'].default_value = far
    em = t.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = lin(FOG); mx = t.nodes.new('ShaderNodeMixShader')
    t.links.new(cd.outputs['View Distance'], mr.inputs['Value']); t.links.new(mr.outputs['Result'], mx.inputs['Fac'])
    t.links.new(src.outputs['BSDF'], mx.inputs[1]); t.links.new(em.outputs['Emission'], mx.inputs[2]); t.links.new(mx.outputs['Shader'], out.inputs['Surface'])
for m in list(M.values()) + [face] + list(env.values()): fog(m)

sun = bpy.data.objects.new('key', bpy.data.lights.new('key', 'SUN')); sun.data.energy = 2.4
sun.rotation_euler = (math.radians(55), 0, math.radians(-35)); sc.collection.objects.link(sun)
for name, e, col, loc in (('lamp', 16, (1.0, 0.85, 0.6), (-0.45, -0.8, 1.9)), ('end', 70, (0.8, 0.9, 0.75), (-0.6, 6.0, 2.2))):
    L = bpy.data.objects.new(name, bpy.data.lights.new(name, 'POINT')); L.data.energy = e; L.data.color = col; L.location = loc; sc.collection.objects.link(L)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = lin(FOG)

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 50; sc.collection.objects.link(cam); sc.camera = cam
if ANIM == 'walk':
    # lensa lebar melihat lorong; saat kepala patah: zoom mendadak ke wajah
    look = Vector((0, 2.2, 1.2))
    for f, dx, dz in ((1, 0.0, 0.0), (40, -0.03, 0.01), (80, -0.05, -0.005), (SNAP - 1, -0.04, 0.008)):
        cam.location = (0.12 + dx, -1.1, 1.5 + dz)
        cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
        cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
    cam.data.lens = 30; cam.data.keyframe_insert('lens', frame=SNAP - 1)
    face_pt = Vector((0, YEND, 1.8))
    cam.rotation_euler = (face_pt - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.keyframe_insert('rotation_euler', frame=SNAP)
    cam.data.lens = 85; cam.data.keyframe_insert('lens', frame=SNAP)
    cam.data.lens = 92; cam.data.keyframe_insert('lens', frame=150)
    for fc in list(fcurves(cam.data)) + list(fcurves(cam)):
        for kp in fc.keyframe_points:
            if kp.co.x >= SNAP - 1: kp.interpolation = 'CONSTANT' if kp.co.x < 150 else 'LINEAR'
    # lampu lorong yang berkedip (pola tetap, bukan acak)
    fl = bpy.data.objects.new('flicker', bpy.data.lights.new('flicker', 'POINT')); fl.data.color = (0.85, 0.95, 0.8)
    fl.location = (0.5, 2.8, 2.3); sc.collection.objects.link(fl)
    for f, e in ((1, 40), (18, 40), (19, 4), (21, 40), (52, 40), (53, 2), (54, 35), (56, 3), (58, 40), (100, 40), (101, 0), (104, 40)):
        fl.data.energy = e; fl.data.keyframe_insert('energy', frame=f)
    for fc in fcurves(fl.data):
        for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
else:
    look = Vector((0, 0, 1.55))
    for f, dx, dz in ((1, 0.0, 0.0), (30, -0.03, 0.01), (60, -0.05, -0.005), (90, -0.04, 0.008)):
        cam.location = (0.16 + dx, -1.5, 1.66 + dz)
        cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
        cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)

# ---------- vertex jitter (Geometry Nodes, setelah Armature) ----------
STEP = 0.007
ng = bpy.data.node_groups.new('psx_jitter', 'GeometryNodeTree')
ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
N = ng.nodes; Lk = ng.links
gi, go = N.new('NodeGroupInput'), N.new('NodeGroupOutput')
so = N.new('GeometryNodeSelfObject'); oi = N.new('GeometryNodeObjectInfo'); oi.transform_space = 'ORIGINAL'
pos = N.new('GeometryNodeInputPosition'); inv = N.new('FunctionNodeInvertMatrix')
tw, tl = N.new('FunctionNodeTransformPoint'), N.new('FunctionNodeTransformPoint')
sn = N.new('ShaderNodeVectorMath'); sn.operation = 'SNAP'; sn.inputs[1].default_value = (STEP, STEP, STEP)
sp = N.new('GeometryNodeSetPosition')
Lk.new(so.outputs[0], oi.inputs['Object']); Lk.new(pos.outputs['Position'], tw.inputs['Vector']); Lk.new(oi.outputs['Transform'], tw.inputs['Transform'])
Lk.new(tw.outputs['Vector'], sn.inputs[0]); Lk.new(oi.outputs['Transform'], inv.inputs['Matrix'])
Lk.new(sn.outputs['Vector'], tl.inputs['Vector']); Lk.new(inv.outputs['Matrix'], tl.inputs['Transform'])
Lk.new(gi.outputs[0], sp.inputs['Geometry']); Lk.new(tl.outputs['Vector'], sp.inputs['Position']); Lk.new(sp.outputs[0], go.inputs[0])
for o in sc.objects:
    if o.type == 'MESH': o.modifiers.new('psx_jitter', 'NODES').node_group = ng

# ---------- render ----------
sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'
sc.render.fps = 30; sc.frame_start, sc.frame_end = 1, int(os.environ.get('FRAMES', 150 if ANIM == 'walk' else 90))
sc.render.filepath = os.path.join(D, 'frames_walk' if ANIM == 'walk' else 'frames_char', 'f_')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'psx_walk.blend' if ANIM == 'walk' else 'psx_char.blend'))
bpy.ops.render.render(animation=True)
print('rendered', sc.frame_end, 'frames')
