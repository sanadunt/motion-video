# Fungsi bersama adegan PSX ArsipTiang (ARSIP 06). Pola sama dengan angka/salju_scene.py.
# Makhluk = tafsiran sendiri dari deskripsi kanon tertulis (tiang tinggi, daging busuk menyatu besi berkarat,
# tanpa mata, dua pengeras suara di tempat kepala). Tidak men-trace gambar siapa pun.
import bpy, os, math, json, random
from mathutils import Vector, Matrix
import bmesh

REPO = None
TEX = None          # folder public/3d/tiang/tex
FPS = 30

def setup(repo):
    global REPO, TEX
    REPO = repo; TEX = os.path.join(repo, 'public/3d/tiang/tex')
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene

# ---------- timing dari VO (satu sumber: src/Videos/tiang-*.json + briefs/ArsipTiang.vo.json) ----------
WORD_LEAD = 0.2
def _norm(s): return ''.join(ch for ch in s.lower() if ch.isalnum())
def caps():
    return json.load(open(os.path.join(REPO, 'src/Videos/tiang-captions.json')))
def cap(prefix):
    return next(c for c in caps() if _norm(c['text']).startswith(_norm(prefix)))
def word(clip, text, nth=0):
    ws = [w for w in json.load(open(os.path.join(REPO, 'src/Videos/tiang-words.json'))) if w['clip'] == clip and w['text'] == text]
    return ws[nth]['t'] - WORD_LEAD
def vo():
    return json.load(open(os.path.join(REPO, 'briefs/ArsipTiang.vo.json')))

# ---------- material ----------
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c], 1)

def mat(name, hexc, rough=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = lin(hexc); b.inputs['Roughness'].default_value = rough
    return m

def texmat(name, png, scale=1.0, rough=0.95, tint=None, metal=0.0, spec=0.25):
    """Tekstur PNG kecil, filter Closest (PSX), proyeksi kotak dari koordinat objek."""
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree; b = t.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; b.inputs['Specular IOR Level'].default_value = spec
    tc = t.nodes.new('ShaderNodeTexCoord'); mp = t.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    tx = t.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(TEX, png), check_existing=True)
    tx.interpolation = 'Closest'; tx.projection = 'BOX'; tx.projection_blend = 0.0
    t.links.new(tc.outputs['Object'], mp.inputs['Vector']); t.links.new(mp.outputs['Vector'], tx.inputs['Vector'])
    if tint:
        mx = t.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        t.links.new(tx.outputs['Color'], mx.inputs['A']); mx.inputs['B'].default_value = lin(tint)
        t.links.new(mx.outputs['Result'], b.inputs['Base Color'])
    else:
        t.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    return m

def emis(name, hexc, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree; e = t.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = lin(hexc); e.inputs['Strength'].default_value = strength
    t.links.new(e.outputs['Emission'], t.nodes['Material Output'].inputs['Surface']); return m, e

def fog(m, near, far, col):
    """Kabut per jarak kamera (dicampur ke emisi warna kabut). Dipasang setelah material selesai."""
    t = m.node_tree; out = t.nodes['Material Output']; src = out.inputs['Surface'].links[0].from_socket
    cd = t.nodes.new('ShaderNodeCameraData'); mr = t.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = near; mr.inputs['From Max'].default_value = far
    ef = t.nodes.new('ShaderNodeEmission'); ef.inputs['Color'].default_value = lin(col); mx = t.nodes.new('ShaderNodeMixShader')
    t.links.new(cd.outputs['View Distance'], mr.inputs['Value']); t.links.new(mr.outputs['Result'], mx.inputs['Fac'])
    t.links.new(src, mx.inputs[1]); t.links.new(ef.outputs['Emission'], mx.inputs[2]); t.links.new(mx.outputs['Shader'], out.inputs['Surface'])

def fog_all(near, far, col, skip=()):
    for m in bpy.data.materials:
        if m.name in skip or not m.use_nodes: continue
        if any(n.type == 'CAMERA' for n in m.node_tree.nodes): continue
        if any(n.type == 'EMISSION' for n in m.node_tree.nodes) and m.name.startswith('E_'): continue
        fog(m, near, far, col)

def sky(top, horizon, lo=-0.02, hi=0.5):
    sc = bpy.context.scene; sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
    wt = sc.world.node_tree; bg = wt.nodes['Background']; tc = wt.nodes.new('ShaderNodeTexCoord'); sx = wt.nodes.new('ShaderNodeSeparateXYZ')
    mr = wt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = lo; mr.inputs['From Max'].default_value = hi
    ramp = wt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = lin(horizon); ramp.color_ramp.elements[1].color = lin(top)
    wt.links.new(tc.outputs['Generated'], sx.inputs['Vector']); wt.links.new(sx.outputs['Z'], mr.inputs['Value'])
    wt.links.new(mr.outputs['Result'], ramp.inputs['Fac']); wt.links.new(ramp.outputs['Color'], bg.inputs['Color'])

# ---------- geometri ----------
def _fin(o, m, name):
    o.name = name
    if m: o.data.materials.append(m)
    o.select_set(False); return o

def _obj(name, bm, m, loc=(0, 0, 0), rot=(0, 0, 0), mw=None):
    """mesh dari bmesh langsung (tanpa bpy.ops: ratusan pinus tetap cepat)."""
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    if mw is not None: o.matrix_world = mw
    else: o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    return o

def box(name, m, loc, dims, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * dims[0], v.co.y * dims[1], v.co.z * dims[2]))
    return _obj(name, bm, m, loc, rot)

def _cyl(r1, r2, depth, verts):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r1, radius2=r2, depth=depth); return bm

def beam(name, m, a, b, r, verts=4):
    a, b = Vector(a), Vector(b); d = b - a
    mw = Matrix.Translation((a + b) / 2) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    return _obj(name, _cyl(r, r, d.length, verts), m, mw=mw)

def cone(name, m, loc, r1, r2, h, verts=6, rot=(0, 0, 0)):
    return _obj(name, _cyl(r1, r2, h, verts), m, loc, rot)

def blob(name, m, loc, scale, seed, amp=0.18, subdiv=1):
    """gumpalan daging: icosphere low-poly dengan verteks digeser acak (seed tetap)."""
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    rnd = random.Random(seed)
    for v in bm.verts: k = 1 + rnd.uniform(-amp, amp); v.co = Vector((v.co.x * k * scale[0], v.co.y * k * scale[1], v.co.z * k * scale[2]))
    return _obj(name, bm, m, loc)

def wire(name, m, a, b, sag, r=0.012, segs=6):
    """kabel menggantung (catenary kasar)."""
    a, b = Vector(a), Vector(b); pts = []
    for i in range(segs + 1):
        t = i / segs; p = a.lerp(b, t); p.z -= sag * 4 * t * (1 - t); pts.append(p)
    return [beam(name, m, pts[i], pts[i + 1], r, 3) for i in range(segs)]

def pine(name, mbark, mneedle, loc, h, seed):
    """pinus PSX: batang 5 sisi + 4–5 kerucut 6 sisi bertumpuk."""
    rnd = random.Random(seed); x, y, z0 = loc; parts = []
    parts.append(cone(name + '_t', mbark, (x, y, z0 + h * 0.5), h * 0.025, h * 0.012, h, 5))
    n = rnd.choice((4, 5))
    for k in range(n):
        f = k / n; zc = z0 + h * (0.32 + 0.6 * f); rr = h * (0.2 - 0.13 * f) * rnd.uniform(0.85, 1.1)
        parts.append(cone(name + '_c', mneedle, (x + rnd.uniform(-0.1, 0.1), y, zc), rr, rr * 0.15, h * 0.26, 6, rot=(0, 0, rnd.uniform(0, 1))))
    return parts

def utility_pole(name, mwood, mmetal, minsul, loc, h=9.0, lean=0.0, crossarm=True):
    """tiang listrik kayu: batang 6 sisi, palang, 3 isolator. Mengembalikan titik kabel (kiri, tengah, kanan)."""
    x, y, z0 = loc
    o = cone(name, mwood, (x, y, z0 + h / 2), 0.16, 0.12, h, 6, rot=(lean, 0, 0))
    tops = []
    if crossarm:
        box(name + '_arm', mwood, (x, y, z0 + h - 0.45), (1.9, 0.12, 0.12))
        beam(name + '_brace', mmetal, (x - 0.5, y, z0 + h - 0.47), (x, y, z0 + h - 1.0), 0.02)
        beam(name + '_brace', mmetal, (x + 0.5, y, z0 + h - 0.47), (x, y, z0 + h - 1.0), 0.02)
        for dx in (-0.85, 0.0, 0.85):
            zz = z0 + h - 0.32 + (0.12 if dx == 0 else 0)
            cone(name + '_ins', minsul, (x + dx, y, zz), 0.06, 0.04, 0.16, 5); tops.append((x + dx, y, zz + 0.06))
    return tops

# ---------- makhluk ----------
def creature_mats():
    return dict(
        flesh=texmat('flesh', 'flesh.png', 1.4, 0.5, tint='#c08078', spec=0.5),
        fr=texmat('fleshrust', 'fleshrust.png', 1.2, 0.7, tint='#b08a7a'),
        rust=texmat('rust', 'rust.png', 1.6, 0.9, tint='#e0b090'),
        inner=texmat('horn_inner', 'horn_inner.png', 0.9, 1.0, tint='#6a5a55', spec=0.0),
        cable=mat('cable', '#0b0a0a', 1.0),
    )

def horn(name, M, base, direction, length=1.25, mouth=0.55, seg=8):
    """corong pengeras suara: profil diputar 8 sisi, luar = karat, dalam = gelap. ±150 tris."""
    prof = [  # (r, z, sisi) z dari pangkal ke mulut
        (0.17, 0.00, 'o'), (0.19, 0.35, 'o'), (0.30, 0.72, 'o'), (0.50, 1.00, 'o'), (0.58, 1.06, 'o'),
        (0.52, 1.04, 'i'), (0.27, 0.74, 'i'), (0.14, 0.38, 'i'), (0.09, 0.08, 'i'),
    ]
    k = length / 1.06; kr = mouth / 0.58
    bm = bmesh.new(); rings = []
    for r, z, _ in prof:
        rings.append([bm.verts.new((r * kr * math.cos(2 * math.pi * i / seg), r * kr * math.sin(2 * math.pi * i / seg), z * k)) for i in range(seg)])
    me = bpy.data.meshes.new(name); o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    me.materials.append(M['rust']); me.materials.append(M['inner'])
    for j in range(len(prof) - 1):
        for i in range(seg):
            f = bm.faces.new((rings[j][i], rings[j][(i + 1) % seg], rings[j + 1][(i + 1) % seg], rings[j + 1][i]))
            f.material_index = 1 if prof[j][2] == 'i' else 0      # bibir corong (o→i) tetap karat
    c = bm.verts.new((0, 0, 0.08 * k));
    for i in range(seg):
        f = bm.faces.new((rings[-1][(i + 1) % seg], rings[-1][i], c)); f.material_index = 1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    d = Vector(direction).normalized()
    o.matrix_world = Matrix.Translation(Vector(base)) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    # driver di belakang corong
    back = Vector(base) - d * 0.22 * k
    beam(name + '_drv', M['rust'], back, Vector(base) + d * 0.04, 0.2 * kr, 8)
    return o

def creature_head(M, top=(0, 0, 0), seed=7, horns=True, spread=11, pitch=-15, length=1.15, mouth=0.48):
    """kepala makhluk di atas leher: gumpalan daging, palang besi, dua corong, kabel. Pusat = top."""
    tx, ty, tz = top; T = Vector(top); rnd = random.Random(seed); objs = []
    objs.append(blob('collar', M['flesh'], (tx, ty + 0.05, tz + 0.15), (0.55, 0.45, 0.5), seed, 0.22))
    objs.append(box('arm', M['rust'], (tx, ty + 0.1, tz + 0.42), (1.7, 0.16, 0.16), rot=(0, math.radians(4), 0)))
    for i, s in enumerate((-1, 1)):
        base = T + Vector((s * 0.42, -0.05, 0.62))
        d = Vector((s * math.sin(math.radians(spread)), -1, math.sin(math.radians(pitch + 3 * i))))   # sedikit asimetris
        if horns:
            h = horn('horn%d' % i, M, base, d, length, mouth); objs.append(h)
            mw = h.matrix_world; rr = mouth * 0.92; zz = length * 0.97
            for a0, a1, sag in ((155, 35, 0.3), (195, 345, 0.12)):     # serat daging melintang di mulut corong
                pa = mw @ Vector((rr * math.cos(math.radians(a0 + 12 * i)), rr * math.sin(math.radians(a0 + 12 * i)), zz))
                pb = mw @ Vector((rr * math.cos(math.radians(a1 + 12 * i)), rr * math.sin(math.radians(a1 + 12 * i)), zz))
                objs += wire('strand', M['fr'], pa, pb, sag, 0.024, 4)
        objs.append(blob('wrap%d' % i, M['flesh'], base + Vector((s * 0.02, 0.28, -0.02)), (0.36, 0.42, 0.34), seed + 11 * (i + 1), 0.25))
        objs.append(blob('tendril%d' % i, M['fr'], base + Vector((s * 0.05, 0.05, -0.28)), (0.12, 0.12, 0.38), seed + 23 * (i + 1), 0.3))
        dn = d.normalized()   # selongsong daging yang merambat ke leher corong
        objs.append(blob('sleeve%d' % i, M['flesh'], base + dn * 0.3 * length + Vector((0, 0, -0.04)), (0.26, 0.24, 0.24), seed + 31 * (i + 1), 0.3))
    objs.append(blob('core', M['flesh'], (tx, ty - 0.22, tz + 0.5), (0.36, 0.3, 0.42), seed + 3, 0.28))   # gumpalan di antara corong
    for k in range(4):     # serpih pelat karat yang tertanam di daging
        a = rnd.uniform(0, 2 * math.pi)
        objs.append(box('shard', M['rust'], (tx + 0.4 * math.cos(a), ty + 0.3 * math.sin(a) + 0.05, tz + rnd.uniform(-0.1, 0.35)), (0.22, 0.03, 0.16), rot=(rnd.uniform(-0.6, 0.6), rnd.uniform(-0.6, 0.6), a)))
    for s in (-1, 1):      # kabel terjuntai dari palang
        objs += wire('cable', M['cable'], (tx + s * 0.8, ty + 0.1, tz + 0.38), (tx + s * 0.45, ty - 0.12, tz - 0.6), 0.25, 0.018)
    objs += wire('cable', M['cable'], (tx - 0.75, ty + 0.12, tz + 0.36), (tx + 0.2, ty - 0.15, tz - 0.9), 0.4, 0.015)
    return objs

def creature_neck(M, base=(0, 0, 0), h=6.0, r0=0.36, r1=0.27, seed=5, rings=7):
    """leher/badan seperti tiang: 8 sisi, cincin bergelombang (daging), pita besi berkarat di beberapa ketinggian."""
    rnd = random.Random(seed); bx, by, bz = base; seg = 8
    bm = bmesh.new(); prev = None; ringsv = []
    for j in range(rings + 1):
        t = j / rings; z = bz + h * t; r = r0 + (r1 - r0) * t
        ring = [bm.verts.new((bx + (r * rnd.uniform(0.85, 1.15)) * math.cos(2 * math.pi * i / seg), by + (r * rnd.uniform(0.85, 1.15)) * math.sin(2 * math.pi * i / seg), z + rnd.uniform(-0.05, 0.05))) for i in range(seg)]
        if prev:
            for i in range(seg): bm.faces.new((prev[i], prev[(i + 1) % seg], ring[(i + 1) % seg], ring[i]))
        prev = ring; ringsv.append(ring)
    me = bpy.data.meshes.new('neck'); o = bpy.data.objects.new('neck', me); bpy.context.scene.collection.objects.link(o)
    me.materials.append(M['fr']); bm.to_mesh(me); bm.free()
    objs = [o]
    for k in range(3):
        z = bz + h * (0.35 + 0.22 * k)
        rr = (r0 + (r1 - r0) * (z - bz) / h) * 1.12
        objs.append(cone('band', M['rust'], (bx, by, z), rr, rr, 0.14, 8, rot=(rnd.uniform(-0.15, 0.15), rnd.uniform(-0.15, 0.15), 0)))
    return objs

def tris(objs=None):
    n = 0
    for o in (objs or [o for o in bpy.data.objects if o.type == 'MESH']):
        if o.type != 'MESH': continue
        for p in o.data.polygons: n += len(p.vertices) - 2
    return n

# ---------- kamera + render ----------
def camera(lens=24):
    sc = bpy.context.scene
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = lens; cam.data.clip_end = 600
    sc.collection.objects.link(cam); sc.camera = cam; return cam

def aim(cam, loc, look, f=None, roll=0.0):
    cam.location = Vector(loc); q = (Vector(look) - Vector(loc)).to_track_quat('-Z', 'Y')
    e = q.to_euler(); e.rotate_axis('Z', roll) if roll else None; cam.rotation_euler = e
    if f is not None: cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)

def light(name, kind, color, energy, loc=None, rot=None, shadow=False, size=None):
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, kind)); l.data.color = lin(color)[:3]; l.data.energy = energy
    l.data.use_shadow = shadow
    if loc: l.location = loc
    if rot: l.rotation_euler = rot
    if size is not None and kind == 'SPOT': l.data.spot_size = size; l.data.spot_blend = 0.35
    bpy.context.scene.collection.objects.link(l); return l

def interp(idbs, mode):
    from bpy_extras import anim_utils
    for idb in idbs:
        ad = getattr(idb, 'animation_data', None)
        if not ad or not ad.action: continue
        cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
        for fc in (cb.fcurves if cb else []):
            for kp in fc.keyframe_points: kp.interpolation = mode

def render(D, tag, total, res=(270, 480), transparent=False):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'
    if transparent: sc.render.film_transparent = True; sc.render.image_settings.color_mode = 'RGBA'
    sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = int(os.environ.get('FRAMES', total))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, tag + '.blend'))
    if os.environ.get('ONLY'):
        for f in [int(x) for x in os.environ['ONLY'].split(',')]:
            sc.frame_set(f); sc.render.filepath = os.path.join(D, 'stills', '%s_%04d' % (tag, f)); bpy.ops.render.render(write_still=True)
        print('stills', tag, os.environ['ONLY'])
    else:
        sc.render.filepath = os.path.join(D, 'frames_' + tag, 'f_'); bpy.ops.render.render(animation=True); print('rendered', tag, sc.frame_end)
