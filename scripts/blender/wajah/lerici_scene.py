# Adegan "Lerici · Juni 1822" (WajahDiLukisan) — PSX 3D penuh di Blender.
#   [FRAMES=n] blender -b --factory-startup -P lerici_scene.py -- <outdir> <base_mesh.glb> <repo motion-video> [lebar tinggi]
# Tokoh = base mesh CC0 (psx-character) dengan wajah Shelley dari potret Curran 1819 (PD), atlas 2 sel: diam, seram.
# Set (teras vila, lengkung, langkan, laut, bulan, lentera) dimodelkan di sini. Timing dari cues VO repo.
import bpy, sys, os, math, bmesh, json
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
D, GLB, REPO = args[0], args[1], args[2]
RES = (int(args[3]), int(args[4])) if len(args) >= 6 else (270, 480)
ATLAS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'face', 'shelley_atlas.png')
SKIN, HAIR = '#c08952', '#281b0f'
FOG = '#0d1317'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- timing dari VO (satu sumber: src/Videos/wajah-*.json + briefs/WajahDiLukisan.vo.json) ----------
words = json.load(open(os.path.join(REPO, 'src/Videos/wajah-words.json')))
caps = json.load(open(os.path.join(REPO, 'src/Videos/wajah-captions.json')))
LEAD = 0.2
def word(clip, text, nth=0): return [w for w in words if w['clip'] == clip and w['text'] == text][nth]['t'] - LEAD
def cap(prefix):
    n = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum())
    return next(c for c in caps if n(c['text']).startswith(n(prefix)))
T0 = word('03-legenda', 'mengaku')                              # awal adegan (= B.s3End di Remotion)
T_END = (cap('Beberapa minggu')['end'] + cap('Kata sains')['start']) / 2
FPS = 30
fr = lambda t: int(round((t - T0) * FPS)) + 1                   # detik global -> frame lokal (mulai 1)
TOTAL = fr(T_END) + 1
F_DOUBLE = fr(word('03-legenda', 'dirinya'))
F_HUSH = fr(word('03-legenda', 'ia') - 1.0)
F_DROWN = fr(word('03-legenda', 'ia'))
print('timing', dict(T0=round(T0, 2), total=TOTAL, double=F_DOUBLE, hush=F_HUSH, drown=F_DROWN))

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
def make_char(tag, coat='#17181d', pants='#1e1f25'):
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
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(ATLAS); tex.interpolation = 'Closest'; tex.extension = 'EXTEND'
    uvn = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    nt.links.new(uvn.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector']); nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    cells = max(1, tex.image.size[0] // tex.image.size[1])
    M = dict(skin=mat('skin_' + tag, SKIN), hair=mat('hair_' + tag, HAIR), shirt=mat('coat_' + tag, coat), pants=mat('pants_' + tag, pants), shoes=mat('shoes_' + tag, '#0c0a09'))
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
def breathe(ch, period=48, amp=0.02):
    for k, f in enumerate(range(1, TOTAL + period, period // 2)):
        s = 1.0 + (amp if k % 2 else 0.0); ch['pb']['spine.001'].scale = (s, 1, s); ch['pb']['spine.001'].keyframe_insert('scale', frame=min(f, TOTAL))
    for s in ('L', 'R'):
        for f in (1, TOTAL): ch['pb']['upper_arm.' + s].keyframe_insert('rotation_euler', frame=f)

# A = Shelley, di langkan menghadap laut (+X), membelakangi kamera serong.
A = make_char('A')
A['rig'].location = (1.08, 3.5, 0); A['rig'].rotation_euler = (0, 0, math.radians(80))
breathe(A)
# kepala: diam menatap laut, lalu menoleh pelan ke kamera saat hening, dan wajah seram tepat di tengah hening
TURN_DEG = -118        # tanda dicek dengan still (kepala ke arah kamera)
head_turn(A, 1, 0, 6); head_turn(A, F_HUSH - 36, 0, 6); head_turn(A, F_HUSH + 4, TURN_DEG * 0.55, 2)
head_turn(A, F_HUSH + 14, TURN_DEG * 0.62, 0); head_turn(A, F_HUSH + 16, TURN_DEG, -6); head_turn(A, TOTAL, TURN_DEG, -8)
key_expr(A, [(1, 0), (F_HUSH + 16, 1)])

# B = kembaran: menghadap kamera, dekat, hanya terlihat 4 frame saat lentera menyala putih.
B = make_char('B', coat='#141519')
B['rig'].location = (0.05, 1.7, 0); B['rig'].rotation_euler = (0, 0, math.radians(-6))
breathe(B, amp=0.0); head_turn(B, 1, 0, -4)
key_expr(B, [(1, 1)])
for o in (B['rig'], B['body']):
    for f, hide in ((1, True), (F_DOUBLE, False), (F_DOUBLE + 4, True)):
        o.hide_render = hide; o.keyframe_insert('hide_render', frame=f)
        o.hide_viewport = hide; o.keyframe_insert('hide_viewport', frame=f)

# ---------- set: teras, lengkung, langkan, laut, bulan ----------
def box(name, m, loc, dims):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.active_object; o.name = name
    o.scale = dims; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(m); o.select_set(False); return o
def cyl(name, m, loc, r, h, n=6):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=loc); o = bpy.context.active_object; o.name = name
    o.data.materials.append(m); o.select_set(False); return o

stone = mat('stone', '#5d6266')
nt = stone.node_tree; br = nt.nodes.new('ShaderNodeTexBrick'); tc = nt.nodes.new('ShaderNodeTexCoord')
br.inputs['Color1'].default_value = lin('#4e5357'); br.inputs['Color2'].default_value = lin('#3c4044'); br.inputs['Mortar'].default_value = lin('#1d2023')
br.inputs['Scale'].default_value = 1.6; br.inputs['Mortar Size'].default_value = 0.012
nt.links.new(tc.outputs['Object'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
wallm = mat('wall', '#6f6a5e'); dark = mat('dark', '#060707'); railm = mat('rail', '#7b7d7a')
seam = mat('sea', '#16303d', rough=0.12)
LEN = 26.0
floor = box('floor', stone, (-0.3, LEN / 2 - 2, -0.05), (4.4, LEN, 0.1))
# langkan kanan
box('rail', railm, (1.75, LEN / 2 - 2, 0.98), (0.16, LEN, 0.08)); box('plinth', railm, (1.75, LEN / 2 - 2, 0.06), (0.22, LEN, 0.12))
y = -1.8
while y < LEN - 2.2:
    cyl('baluster', railm, (1.75, y, 0.53), 0.055, 0.82); y += 0.32
for k in range(9): box('pier', railm, (1.75, -1.6 + k * 3.0, 0.55), (0.26, 0.26, 1.1))
# lorong lengkung kiri: tiang, lengkung, dinding belakang dengan pintu gelap dan satu jendela redup
for k in range(10):
    yy = -1.0 + k * 2.6
    box('col', wallm, (-2.0, yy, 1.6), (0.34, 0.34, 3.2))
    for s in range(7):                                      # lengkung setengah lingkaran dari balok-balok kecil
        a0 = math.pi * s / 7; a1 = math.pi * (s + 1) / 7; am = (a0 + a1) / 2
        cy = yy + 1.3 - math.cos(am) * 1.13; cz = 3.2 + math.sin(am) * 0.55
        o = box('arch', wallm, (-2.0, cy, cz), (0.34, 0.36, 0.18)); o.rotation_euler = (-(am - math.pi / 2) * 0.9, 0, 0)
box('roof', wallm, (-2.6, LEN / 2 - 2, 3.95), (1.6, LEN, 0.3))
box('backwall', wallm, (-3.3, LEN / 2 - 2, 2.0), (0.2, LEN, 4.0))
for k in range(9): box('door', dark, (-3.18, 0.3 + k * 2.6, 1.15), (0.04, 1.0, 2.2))
win = mat('win', '#000000'); wn = win.node_tree; em = wn.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = lin('#c98a3c'); em.inputs['Strength'].default_value = 1.4
wn.links.new(em.outputs['Emission'], wn.nodes['Material Output'].inputs['Surface'])
box('window', win, (-3.17, 13.3, 1.6), (0.04, 0.7, 1.0))
# laut + bulan + kilau bulan
sea = box('sea', seam, (60, 60, -5.0), (120, 160, 0.1))
sn = seam.node_tree; nz = sn.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.0; bmp = sn.nodes.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = 0.35
sn.links.new(nz.outputs['Fac'], bmp.inputs['Height']); sn.links.new(bmp.outputs['Normal'], sn.nodes['Principled BSDF'].inputs['Normal'])
moonm = bpy.data.materials.new('moon'); moonm.use_nodes = True; mn = moonm.node_tree; me_ = mn.nodes.new('ShaderNodeEmission')
me_.inputs['Color'].default_value = lin('#e6ecef'); me_.inputs['Strength'].default_value = 6.0; mn.links.new(me_.outputs['Emission'], mn.nodes['Material Output'].inputs['Surface'])
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=4.5, location=(30, 130, 34)); moon = bpy.context.active_object; moon.data.materials.append(moonm); moon.select_set(False)
glintm = bpy.data.materials.new('glint'); glintm.use_nodes = True; gn_ = glintm.node_tree; ge = gn_.nodes.new('ShaderNodeEmission')
ge.inputs['Color'].default_value = lin('#cfdde3'); ge.inputs['Strength'].default_value = 2.4; gn_.links.new(ge.outputs['Emission'], gn_.nodes['Material Output'].inputs['Surface'])
import random as _r; _r.seed(7)
for k in range(140):
    t_ = (k / 140) ** 1.4; gy = 5 + t_ * 125; gx = 2.5 + t_ * 27 + (_r.random() - 0.5) * (2.5 + t_ * 14)
    o = box('glint', glintm, (gx, gy, -4.93), (0.9 + t_ * 7, 0.16 + t_ * 1.2, 0.02))
# lentera dinding di tiang ke-2
lantm = bpy.data.materials.new('lantern'); lantm.use_nodes = True; ln = lantm.node_tree; le = ln.nodes.new('ShaderNodeEmission')
le.inputs['Color'].default_value = lin('#ffb862'); le.inputs['Strength'].default_value = 5.0; ln.links.new(le.outputs['Emission'], ln.nodes['Material Output'].inputs['Surface'])
box('lantern', lantm, (-1.78, 4.2, 2.25), (0.14, 0.14, 0.22))

# ---------- kabut per material (jarak kamera), seperti psx_char.fog ----------
def fog(m, near, far, col=FOG):
    t = m.node_tree; out = t.nodes['Material Output']; link = out.inputs['Surface'].links[0]; src = link.from_socket
    cd = t.nodes.new('ShaderNodeCameraData'); mr = t.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = near; mr.inputs['From Max'].default_value = far
    emf = t.nodes.new('ShaderNodeEmission'); emf.inputs['Color'].default_value = lin(col); mx = t.nodes.new('ShaderNodeMixShader')
    t.links.new(cd.outputs['View Distance'], mr.inputs['Value']); t.links.new(mr.outputs['Result'], mx.inputs['Fac'])
    t.links.new(src, mx.inputs[1]); t.links.new(emf.outputs['Emission'], mx.inputs[2]); t.links.new(mx.outputs['Shader'], out.inputs['Surface'])
for m in [stone, wallm, dark, railm, win, lantm] + A['mats'] + B['mats']: fog(m, 2.5, 22.0)
fog(seam, 25, 320); fog(moonm, 140, 900, '#9fb0b8')
fog(glintm, 40, 420)

# ---------- cahaya ----------
moonl = bpy.data.objects.new('moonlight', bpy.data.lights.new('moonlight', 'SUN')); moonl.data.energy = 1.0; moonl.data.color = (0.62, 0.74, 0.92)
moonl.data.use_shadow = False; moonl.rotation_euler = (math.radians(62), 0, math.radians(-150)); sc.collection.objects.link(moonl)
lamp = bpy.data.objects.new('lamp', bpy.data.lights.new('lamp', 'POINT')); lamp.data.color = (1.0, 0.72, 0.42); lamp.data.use_shadow = False
lamp.location = (-1.5, 4.2, 2.1); sc.collection.objects.link(lamp)
flash = bpy.data.objects.new('flash', bpy.data.lights.new('flash', 'POINT')); flash.data.color = (0.85, 0.92, 1.0); flash.data.use_shadow = False
flash.location = (-0.9, 1.4, 2.3); sc.collection.objects.link(flash)
# lentera: berkedip halus (pola tetap), padam -> kilat putih 4 frame (kembaran terlihat) -> padam -> normal, lalu meredup
LAMP = [(1, 85), (24, 85), (25, 40), (27, 85), (F_DOUBLE - 3, 85), (F_DOUBLE - 2, 0), (F_DOUBLE, 0), (F_DOUBLE + 4, 0), (F_DOUBLE + 7, 0), (F_DOUBLE + 8, 85),
        (F_DOUBLE + 40, 80), (F_DOUBLE + 41, 25), (F_DOUBLE + 43, 80), (F_HUSH - 10, 70), (F_HUSH, 45), (TOTAL, 40)]
for f, e in LAMP:
    lamp.data.energy = e; lamp.data.keyframe_insert('energy', frame=f); le.inputs['Strength'].default_value = e / 11; le.inputs['Strength'].keyframe_insert('default_value', frame=f)
for f, e in ((1, 0), (F_DOUBLE - 1, 0), (F_DOUBLE, 260), (F_DOUBLE + 4, 0)):
    flash.data.energy = e; flash.data.keyframe_insert('energy', frame=f)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
wt = sc.world.node_tree; bg = wt.nodes['Background']
wtc = wt.nodes.new('ShaderNodeTexCoord'); sxyz = wt.nodes.new('ShaderNodeSeparateXYZ'); wmr = wt.nodes.new('ShaderNodeMapRange')
wmr.inputs['From Min'].default_value = -0.05; wmr.inputs['From Max'].default_value = 0.45
ramp = wt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = lin('#22343d'); ramp.color_ramp.elements[1].color = lin('#04070a')
wt.links.new(wtc.outputs['Generated'], sxyz.inputs['Vector']); wt.links.new(sxyz.outputs['Z'], wmr.inputs['Value'])
wt.links.new(wmr.outputs['Result'], ramp.inputs['Fac']); wt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
# halo bulan: piringan menghadap kamera, emisi memudar dari tengah (transparan di tepi)
halom = bpy.data.materials.new('halo'); halom.use_nodes = True; halom.surface_render_method = 'BLENDED'
hn = halom.node_tree; hn.nodes.remove(hn.nodes['Principled BSDF'])
hg = hn.nodes.new('ShaderNodeTexGradient'); hg.gradient_type = 'SPHERICAL'; htc = hn.nodes.new('ShaderNodeTexCoord'); hmp = hn.nodes.new('ShaderNodeMapping')
hmp.inputs['Location'].default_value = (0, 0, 0); hmp.inputs['Scale'].default_value = (2.4, 2.4, 2.4)
hn.links.new(htc.outputs['Object'], hmp.inputs['Vector']); hn.links.new(hmp.outputs['Vector'], hg.inputs['Vector'])
hpow = hn.nodes.new('ShaderNodeMath'); hpow.operation = 'POWER'; hpow.inputs[1].default_value = 2.2
hn.links.new(hg.outputs['Fac'], hpow.inputs[0])
hem = hn.nodes.new('ShaderNodeEmission'); hem.inputs['Color'].default_value = lin('#9fb4bf'); htr = hn.nodes.new('ShaderNodeBsdfTransparent'); hmx = hn.nodes.new('ShaderNodeMixShader')
hmul = hn.nodes.new('ShaderNodeMath'); hmul.operation = 'MULTIPLY'; hmul.inputs[1].default_value = 0.8
hn.links.new(hpow.outputs[0], hmul.inputs[0]); hn.links.new(hmul.outputs[0], hmx.inputs['Fac'])
hn.links.new(htr.outputs[0], hmx.inputs[1]); hn.links.new(hem.outputs[0], hmx.inputs[2]); hn.links.new(hmx.outputs[0], hn.nodes['Material Output'].inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=1, location=(30, 132, 34)); halo = bpy.context.active_object; halo.scale = (34, 34, 1)
halo.rotation_euler = (math.pi / 2, 0, math.atan2(30, 132)); halo.data.materials.append(halom); halo.select_set(False)

# ---------- kamera: maju pelan, lalu saat hening mendorong ke kepala Shelley ----------
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 24; sc.collection.objects.link(cam); sc.camera = cam
HEAD = Vector((1.08, 3.5, 1.78))
KEYS = list(range(1, F_HUSH, 20)) + [F_HUSH, F_HUSH + 10, F_HUSH + 20, F_DROWN, TOTAL]
for k, f in enumerate(KEYS):
    f = min(f, TOTAL); jx, jz = (0.015, -0.01, 0.02, -0.015, 0.005)[k % 5], (0.01, -0.006, 0.004, -0.01, 0.008)[k % 5]
    if f <= F_HUSH:
        p = (f - 1) / max(1, F_HUSH - 1); loc = Vector((0.35 + jx, -1.4 + 1.2 * p, 1.55 + jz)); look = Vector((0.75, 6.0, 1.35)).lerp(HEAD, 0.35 * p)
    else:
        p = min(1.0, (f - F_HUSH) / max(1, F_DROWN - F_HUSH)); p = p * p * (3 - 2 * p)
        loc = Vector((0.35 + jx * 0.4, -0.2, 1.55)).lerp(Vector((0.62, 1.9, 1.72)), p); look = HEAD
    cam.location = loc; cam.rotation_euler = (look - loc).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
for f, lens in ((1, 24), (F_HUSH, 26), (F_DROWN, 34), (TOTAL, 36)):
    cam.data.lens = lens; cam.data.keyframe_insert('lens', frame=f)

# ---------- interpolasi: ekspresi/lampu patah, kepala patah di akhir ----------
from bpy_extras import anim_utils
def fcurves(idb):
    ad = idb.animation_data
    if not ad or not ad.action: return []
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot); return cb.fcurves if cb else []
for ch in (A, B):
    for fc in fcurves(ch['map'].id_data):
        for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
for idb in (lamp.data, flash.data, lantm.node_tree):
    for fc in fcurves(idb):
        for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
for fc in fcurves(A['rig']):
    for kp in fc.keyframe_points:
        kp.interpolation = 'CONSTANT' if (kp.co.x >= F_HUSH + 14 and 'spine.00' in fc.data_path and 'spine.001' not in fc.data_path) else 'BEZIER'

# ---------- vertex jitter PSX (Geometry Nodes) ----------
STEP = 0.008
ng = bpy.data.node_groups.new('psx_jitter', 'GeometryNodeTree')
ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry'); ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
N = ng.nodes; Lk = ng.links
gi, go = N.new('NodeGroupInput'), N.new('NodeGroupOutput'); so = N.new('GeometryNodeSelfObject'); oi = N.new('GeometryNodeObjectInfo'); oi.transform_space = 'ORIGINAL'
pos = N.new('GeometryNodeInputPosition'); inv = N.new('FunctionNodeInvertMatrix'); tw, tl = N.new('FunctionNodeTransformPoint'), N.new('FunctionNodeTransformPoint')
snp = N.new('ShaderNodeVectorMath'); snp.operation = 'SNAP'; snp.inputs[1].default_value = (STEP, STEP, STEP); sp = N.new('GeometryNodeSetPosition')
Lk.new(so.outputs[0], oi.inputs['Object']); Lk.new(pos.outputs['Position'], tw.inputs['Vector']); Lk.new(oi.outputs['Transform'], tw.inputs['Transform'])
Lk.new(tw.outputs['Vector'], snp.inputs[0]); Lk.new(oi.outputs['Transform'], inv.inputs['Matrix'])
Lk.new(snp.outputs['Vector'], tl.inputs['Vector']); Lk.new(inv.outputs['Matrix'], tl.inputs['Transform'])
Lk.new(gi.outputs[0], sp.inputs['Geometry']); Lk.new(tl.outputs['Vector'], sp.inputs['Position']); Lk.new(sp.outputs[0], go.inputs[0])
for o in (A['body'], B['body']): o.modifiers.new('psx_jitter', 'NODES').node_group = ng

# ---------- render ----------
sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = int(os.environ.get('FRAMES', TOTAL))
ONLY = os.environ.get('ONLY')                      # "a,b,c" = render frame tertentu saja (cek still)
sc.render.filepath = os.path.join(D, 'frames_lerici', 'f_')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'lerici.blend'))
if ONLY:
    for f in [int(x) for x in ONLY.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(D, 'stills', 'f_%04d' % f); bpy.ops.render.render(write_still=True)
    print('stills', ONLY)
else:
    bpy.ops.render.render(animation=True); print('rendered', sc.frame_end, 'frames')
