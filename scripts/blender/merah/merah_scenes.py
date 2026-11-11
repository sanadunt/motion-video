# Adegan 3D PSX "Nomor Merah". Satu skrip, SHOT memilih adegan:
#   meja    (adegan 1)   ponsel candybar generik di meja kayu, bergetar, digit nomor memerah satu per satu
#   warnet  (adegan 3a)  lorong warnet 2008: deretan CRT, bilik triplek, kipas angin, kabut asap tipis
#   inbox   (adegan 3b)  ponsel di meja bilik warnet: kotak masuk penuh "Fwd: Fwd: Fwd:", lalu isi pesan
#   kursi   (adegan 5a)  ruang periksa: kursi kosong dilihat dari belakang, meja, lampu gantung
#   lantai  (adegan 6)   ponsel di lantai ubin, layar memerah, tangan low-poly kaku di tepi frame
#   tutup   (adegan 8-9) meja yang sama, lebih gelap: nomor merah menyala → bergetar → layar ANGKAT?
# Ponsel = desain candybar generik buatan sendiri, tanpa merek dan tanpa logo. Tidak ada wajah di adegan mana pun.
# Timing dari cues VO (merah_beats.py, rumus sama dengan objek B di src/Videos/NomorMerah.tsx). Frame 1 = awal adegan.
# Layar LCD = urutan PNG dari make_assets.py (<kerja>/lcd/<shot>/f_####.png).
#   SHOT=meja [ONLY=1,120] blender -b --factory-startup -P merah_scenes.py -- <folder kerja> <repo> [lebar tinggi]
import bpy, bmesh, sys, os, math, random
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', 'tiang'))
import tiang_lib as T
import merah_beats as MB

args = sys.argv[sys.argv.index('--') + 1:]
D, REPO = args[0], args[1]
RES = (int(args[2]), int(args[3])) if len(args) >= 4 else (360, 640)
SHOT = os.environ.get('SHOT', 'meja')
sc = T.setup(REPO)
T.TEX = os.path.join(REPO, 'public/3d/merah/tex')
B = MB.beats(REPO)
T0, T1 = MB.shot_span(B, SHOT)
fr, TOTAL = MB.span(T0, T1)
R = math.radians
print('SHOT', SHOT, round(T0, 2), round(T1, 2), TOTAL)

def parent(objs, p):
    for o in objs: o.parent = p
    return objs

def empty(name, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); e.location = loc; sc.collection.objects.link(e); return e

def seg(name, m, dims, par=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    """balok dengan pangkal di origin dan memanjang ke +Y (untuk ruas jari/lengan yang diputar di sendi)."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * dims[0], (v.co.y + 0.5) * dims[1], v.co.z * dims[2]))
    o = T._obj(name, bm, m, loc, rot)
    if par: o.parent = par
    return o

def screen_mat(name, first, total=None, strength=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree
    for n in list(t.nodes):
        if n.type == 'BSDF_PRINCIPLED': t.nodes.remove(n)
    tx = t.nodes.new('ShaderNodeTexImage'); img = bpy.data.images.load(first); tx.image = img; tx.interpolation = 'Closest'; tx.extension = 'EXTEND'
    if total:
        img.source = 'SEQUENCE'; iu = tx.image_user; iu.frame_duration = total; iu.frame_start = 1; iu.frame_offset = 0; iu.use_auto_refresh = True; iu.use_cyclic = False
    e = t.nodes.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = strength
    t.links.new(tx.outputs['Color'], e.inputs['Color']); t.links.new(e.outputs['Emission'], t.nodes['Material Output'].inputs['Surface'])
    return m, e

def quad(name, m, w, h, loc=(0, 0, 0), rot=(0, 0, 0)):
    """bidang w×h di XY dengan UV penuh (atas gambar = +Y)."""
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
    f = bm.faces.new(vs); uv = bm.loops.layers.uv.new('uv')
    for l, c in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): l[uv].uv = c
    return T._obj(name, bm, m, loc, rot)

# ---------------------------------------------------------------- ponsel candybar generik (skala 10: 1 unit = 1 cm... ×10)
def phone(lcd_mat):
    """badan 0,46 × 1,12 × 0,18; layar 0,345 × 0,23 (3:2). Mengembalikan (induk, lampu layar)."""
    body = T.mat('ph_body', '#2a303b', 0.55); face = T.mat('ph_face', '#878c93', 0.4); dark = T.mat('ph_dark', '#0c0d0f', 0.3)
    key = T.mat('ph_key', '#c4c7c0', 0.5); keyd = T.mat('ph_keyd', '#9a9d98', 0.5)
    ph = empty('phone'); o = []
    o.append(T.box('pb', body, (0, 0, 0.09), (0.46, 0.66, 0.18)))
    for y in (-0.33, 0.33): o.append(T.cone('pe', body, (0, y, 0.09), 0.23, 0.23, 0.18, 14))
    o.append(T.box('pf', face, (0, 0, 0.184), (0.40, 0.66, 0.012)))
    for y in (-0.33, 0.33): o.append(T.cone('pfe', face, (0, y, 0.184), 0.20, 0.20, 0.012, 14))
    o.append(T.box('bezel', dark, (0, 0.22, 0.192), (0.385, 0.27, 0.008)))
    o.append(quad('lcd', lcd_mat, 0.345, 0.23, (0, 0.22, 0.1975)))
    o.append(T.box('ear', dark, (0, 0.44, 0.191), (0.10, 0.018, 0.006)))
    o.append(T.cone('nav', key, (0, 0.025, 0.194), 0.062, 0.062, 0.012, 8))
    for x in (-0.135, 0.135): o.append(T.box('soft', keyd, (x, 0.04, 0.194), (0.085, 0.045, 0.012)))
    for r_, y in enumerate((-0.11, -0.20, -0.29, -0.38)):
        for x in (-0.12, 0.0, 0.12): o.append(T.box('key', key, (x, y, 0.194), (0.098, 0.06, 0.012)))
    lamp = T.light('lcdglow', 'POINT', '#a8c79a', 0.0, loc=(0, 0.22, 0.42)); lamp.data.shadow_soft_size = 0.2
    o.append(lamp); parent(o, ph)
    return ph, lamp

def vibrate(ph, bursts, seed, base_loc, base_rot, amp=0.007, creep=R(0.9)):
    """getar: goyang acak per frame selama tiap burst (detik global), plus ponsel pelan-pelan berputar/bergeser."""
    rnd = random.Random(seed); loc = Vector(base_loc); rz = base_rot
    def key(f, l, r):
        ph.location = l; ph.rotation_euler = (0, 0, r); ph.keyframe_insert('location', frame=f); ph.keyframe_insert('rotation_euler', frame=f)
    key(1, loc, rz)
    for a, b in bursts:
        fa, fb = max(1, fr(a)), min(TOTAL, fr(b))
        if fb <= 1 or fa >= TOTAL: continue
        key(max(1, fa - 1), loc, rz)
        for f in range(fa, fb):
            k = (f - fa) / max(1, fb - fa); rz2 = rz + creep * k
            key(f, loc + Vector((rnd.uniform(-amp, amp), rnd.uniform(-amp, amp) + 0.012 * k, 0)), rz2 + R(rnd.uniform(-0.7, 0.7)))
        rz += creep; loc = loc + Vector((0, 0.012, 0)); key(fb, loc, rz)
    T.interp([ph], 'LINEAR')

def keyv(idb, path, f, v, index=-1):
    setattr(idb, path, v); idb.keyframe_insert(path, frame=f, index=index)

def desk_set(lamp_energy, moon_energy):
    wood = T.texmat('wood', 'wood.png', 0.34, 0.75, tint='#c9b59c', spec=0.3)
    T.box('desk', wood, (0, 0, -0.05), (14, 14, 0.1))
    koran = T.texmat('koran', 'koran.png', 0.55, 0.95)
    T.box('koran', koran, (1.35, 0.75, 0.012), (1.7, 2.3, 0.024), rot=(0, 0, R(11)))
    T.box('koran2', koran, (1.5, 0.6, 0.03), (1.6, 2.2, 0.012), rot=(0, 0, R(4)))
    glass = T.mat('glass', '#5d6f78', 0.12)
    T.cone('glass', glass, (-1.25, 1.15, 0.42), 0.26, 0.31, 0.84, 9); T.cone('kopi', T.mat('kopi', '#1a0f08', 0.3), (-1.25, 1.15, 0.45), 0.24, 0.27, 0.5, 9)
    metal = T.mat('metal', '#8c8a80', 0.35)
    for i in range(8):     # gelang kunci
        a0, a1 = 2 * math.pi * i / 8, 2 * math.pi * (i + 1) / 8
        T.beam('ring', metal, (-1.15 + 0.16 * math.cos(a0), -0.95 + 0.16 * math.sin(a0), 0.02), (-1.15 + 0.16 * math.cos(a1), -0.95 + 0.16 * math.sin(a1), 0.02), 0.014, 4)
    T.box('kunci', metal, (-0.86, -1.02, 0.015), (0.42, 0.09, 0.02), rot=(0, 0, R(-14))); T.box('kunci2', metal, (-0.93, -0.74, 0.015), (0.36, 0.08, 0.02), rot=(0, 0, R(38)))
    T.beam('pen', T.mat('pen', '#16233f', 0.3), (0.75, -1.25, 0.03), (1.75, -0.95, 0.03), 0.03, 6)
    for o in T.wire('kabel', T.mat('kabel', '#101010', 0.6), (-0.6, 2.9, 0.02), (-2.6, 1.9, 0.02), 0.0, 0.022, 5): pass
    # lampu meja hangat dari kiri-atas (di luar frame) + cahaya bulan lewat kisi jendela
    lamp = T.light('lamp', 'SPOT', '#f0b566', lamp_energy, loc=(-2.6, 1.6, 4.2), shadow=True, size=R(80))
    lamp.rotation_euler = (Vector((0.2, 0.0, 0.0)) - Vector(lamp.location)).to_track_quat('-Z', 'Y').to_euler()
    moon = T.light('moon', 'SUN', '#7f9cc4', moon_energy, rot=(R(38), 0, R(-52)), shadow=True)
    from mathutils import Euler, Matrix
    d = Euler(moon.rotation_euler).to_matrix() @ Vector((0, 0, -1)); u = d.cross(Vector((0, 0, 1))).normalized(); v = d.cross(u).normalized()
    blk = T.mat('kisi', '#000000', 1.0)
    for i in range(-7, 8):                    # kisi jendela: bilah panjang tegak lurus arah cahaya → garis bayangan di meja
        o = T.box('kisi', blk, (0, 0, 0), (9.0, 0.3, 0.03))
        o.matrix_world = Matrix.Translation(-d * 7.0 + v * (i * 0.62 + 0.2)) @ Matrix((u, v, d)).transposed().to_4x4()
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.005, 0.008, 1)
    return lamp, moon

def cam_path(cam, keys):
    """keys: (detik global, jarak, elevasi derajat, titik pandang, azimut derajat)."""
    for t, dist, elev, look, az in keys:
        e, a = R(elev), R(az)
        off = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist
        T.aim(cam, Vector(look) + off, look, max(1, min(TOTAL, fr(t))))

# ================================================================== MEJA (adegan 1)
if SHOT == 'meja':
    lcdm, lcde = screen_mat('lcd', os.path.join(D, 'lcd/meja/f_0001.png'), TOTAL, 1.15)
    ph, glow = phone(lcdm)
    lamp, moon = desk_set(900, 0.6)
    period = 1.12; bursts = [(0.25 + k * period, 0.25 + k * period + 0.8) for k in range(6)]
    vibrate(ph, bursts, 3, (0, 0, 0), R(-6))
    n = 13
    for f in range(1, TOTAL + 1):          # cahaya layar: hijau-abu → merah mengikuti jumlah digit merah
        t = T0 + (f - 1) / 30
        k = 0 if t < B['nomor'] else min(1, (math.floor((t - B['nomor']) / (B['merah1'] - B['nomor']) * n) + 1) / n)
        glow.data.color = (0.66 + 0.34 * k, 0.78 - 0.66 * k, 0.6 - 0.52 * k); glow.data.keyframe_insert('color', frame=f)
        keyv(glow.data, 'energy', f, 0.5 + 1.0 * k)
    cam = T.camera(60)
    cam_path(cam, [(0.0, 4.3, 50, (0.0, 0.42, 0.1), 4), (0.7, 4.2, 50, (0.0, 0.42, 0.1), 4), (4.4, 1.62, 63, (0, 0.17, 0.2), 0), (T1, 1.5, 65, (0, 0.16, 0.2), -1)])
    T.interp([glow.data], 'CONSTANT')
    T.render(D, 'meja', TOTAL, RES)

# ================================================================== TUTUP (adegan 8-9)
elif SHOT == 'tutup':
    lcdm, lcde = screen_mat('lcd', os.path.join(D, 'lcd/tutup/f_0001.png'), TOTAL, 1.2)
    ph, glow = phone(lcdm)
    lamp, moon = desk_set(70, 3.6)
    vibrate(ph, [(B['ring'], B['ring'] + 0.8), (B['ring'] + 1.12, B['ring'] + 1.92), (B['ring'] + 2.24, T1 + 0.2)], 5, (0, 0.06, 0), R(-1.5))
    for f in range(1, TOTAL + 1):
        t = T0 + (f - 1) / 30
        if t < B['ring']:
            pulse = 0.9 + 0.1 * math.sin(2 * math.pi * 0.4 * (t - T0)); col = (1.0, 0.1, 0.06); en = 1.5 * pulse
        else: col = (0.7, 0.8, 0.62); en = 1.5
        glow.data.color = col; glow.data.keyframe_insert('color', frame=f); keyv(glow.data, 'energy', f, en)
    # sorot lampu mobil lewat menyapu kisi jendela di "di benua lain?"
    car = T.light('car', 'SUN', '#f2d9a6', 0.0, rot=(R(52), 0, R(-80)), shadow=True)
    c0 = B['benua'] - 0.3
    for t, en, rz in ((c0 - 0.05, 0.0, -84), (c0 + 0.5, 1.5, -66), (c0 + 1.2, 1.3, -40), (c0 + 1.8, 0.0, -20)):
        f = fr(t); car.rotation_euler = (R(52), 0, R(rz)); car.keyframe_insert('rotation_euler', frame=f); keyv(car.data, 'energy', f, en)
    cam = T.camera(60)
    cam_path(cam, [(T0, 3.9, 36, (0.0, 0.3, 0.12), 9), (B['malam'], 2.1, 55, (0, 0.2, 0.2), 3), (B['ring'], 1.56, 63, (0, 0.2, 0.2), 0), (T1, 1.5, 64, (0, 0.2, 0.2), 0)])
    T.interp([glow.data], 'CONSTANT'); T.interp([car, car.data], 'LINEAR')
    T.render(D, 'tutup', TOTAL, RES)

# ================================================================== LANTAI (adegan 6)
elif SHOT == 'lantai':
    lcdm, lcde = screen_mat('lcd', os.path.join(D, 'lcd/lantai/f_0001.png'), TOTAL, 1.25)
    ph, glow = phone(lcdm); ph.location = (-0.4, 0.45, 0); ph.rotation_euler = (0, 0, R(24))
    tile = T.texmat('tile', 'tile.png', 0.42, 0.45, tint='#b4b8ae', spec=0.5)
    T.box('floor', tile, (0, 0, -0.05), (16, 16, 0.1))
    T.box('wall', T.texmat('plaster', 'plaster.png', 0.3, 1.0, tint='#8d9486'), (0, 7.2, 2), (16, 0.2, 4.2))
    T.box('skirting', T.mat('skirt', '#2c2a26', 0.6), (0, 7.06, 0.22), (16, 0.1, 0.45))
    T.box('kakikursi', T.mat('kayu', '#3b2a1c', 0.6), (-1.55, 2.3, 0.35), (0.2, 0.2, 0.7))
    T.box('sandal', T.mat('sandal', '#31465e', 0.8), (-1.25, -1.5, 0.05), (0.62, 1.4, 0.1), rot=(0, 0, R(-28)))
    # tangan low-poly kaku: lengan masuk dari kanan-bawah, telapak menghadap lantai, jari mencakar ke arah ponsel
    skin = T.mat('skin', '#c29470', 0.7); cuff = T.mat('cuff', '#3f4a4a', 0.9)
    hand = empty('hand', (0.95, -0.55, 0.0)); hand.rotation_euler = (0, 0, R(50))
    arm = seg('arm', skin, (0.62, 2.6, 0.46), hand, (0, -3.35, 0.27)); seg('cuff', cuff, (0.8, 1.9, 0.6), hand, (0, -4.6, 0.3))
    palm = seg('palm', skin, (0.86, 0.9, 0.26), hand, (0, -0.82, 0.2), (R(8), 0, 0))
    fingers = []
    for i, (x, l1, l2, a1, a2) in enumerate(((-0.33, 0.36, 0.3, 30, 62), (-0.11, 0.42, 0.34, 34, 66), (0.11, 0.4, 0.32, 32, 64), (0.33, 0.33, 0.27, 28, 58))):
        s1 = seg('f%da' % i, skin, (0.17, l1, 0.16), palm, (x, 0.9, 0.0), (R(a1), 0, R(-6 + 4 * i)))
        s2 = seg('f%db' % i, skin, (0.16, l2, 0.14), s1, (0, l1, 0.0), (R(-a2), 0, 0))
        fingers.append((s1, s2, a1, a2))
    th1 = seg('t_a', skin, (0.2, 0.36, 0.17), palm, (-0.43, 0.3, 0.0), (R(12), 0, R(48))); th2 = seg('t_b', skin, (0.18, 0.3, 0.15), th1, (0, 0.36, 0), (R(-35), 0, R(-10)))
    rnd = random.Random(9); fk, fe = fr(B['kejang']), fr(B['kejang'] + 1.3)
    for s1, s2, a1, a2 in fingers:          # kejang: jari menegang (gemetar ±, lalu mencakar lebih dalam)
        for f in range(max(1, fk - 1), fe + 1):
            k = 0 if f < fk else min(1, (f - fk) / 8); j = 0 if f < fk or f >= fe else rnd.uniform(-5, 5)
            s1.rotation_euler[0] = R(a1 + 10 * k + j); s1.keyframe_insert('rotation_euler', frame=f)
            s2.rotation_euler[0] = R(-(a2 + 16 * k) + j); s2.keyframe_insert('rotation_euler', frame=f)
    for f in range(max(1, fk - 1), fe + 1):
        k = 0 if f < fk else min(1, (f - fk) / 8); j = 0 if f < fk or f >= fe else rnd.uniform(-0.012, 0.012)
        hand.location = (0.95 + j - 0.05 * k, -0.55 + j, 0.0); hand.keyframe_insert('location', frame=f)
    # cahaya: bulan redup; saat "memerah" cahaya merah naik pelan lalu berdenyut ≤ 0,45 Hz dan bergeser melingkar pelan
    moon = T.light('moon', 'SUN', '#7f9cc4', 1.6, rot=(R(42), 0, R(140)), shadow=True)
    T.light('fill', 'POINT', '#56687a', 60, loc=(-3.0, -2.5, 4.0))
    red = T.light('red', 'POINT', '#ff2010', 0.0, loc=(-0.35, 0.3, 0.6), shadow=True); red.data.shadow_soft_size = 0.15
    for f in range(1, TOTAL + 1):
        t = T0 + (f - 1) / 30; dt = t - B['memerah']
        if dt < 0: glow.data.color = (0.6, 0.7, 0.55); en = 0.5; ren = 0.0
        else:
            k = min(1, dt / 0.5); pulse = 0.86 + 0.14 * math.sin(2 * math.pi * 0.45 * dt)
            glow.data.color = (1.0, 0.1, 0.05); en = 0.4 + 1.6 * k * pulse; ren = 16 * k * pulse
        glow.data.keyframe_insert('color', frame=f); keyv(glow.data, 'energy', f, en); keyv(red.data, 'energy', f, ren)
        a = 2 * math.pi * 0.11 * max(0, dt)
        red.location = (-0.4 + 0.45 * math.cos(a), 0.5 + 0.45 * math.sin(a), 0.9); red.keyframe_insert('location', frame=f)
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.005, 0.008, 1)
    cam = T.camera(42)
    cam_path(cam, [(T0, 6.0, 76, (0.15, 0.55, 0.1), -5), (B['jakarta'], 5.6, 77, (0.12, 0.5, 0.1), -3), (B['memerah'] + 0.6, 4.9, 78, (0.05, 0.45, 0.1), -1), (T1, 4.5, 79, (0.0, 0.42, 0.1), 0)])
    T.interp([glow.data], 'CONSTANT'); T.interp([red, red.data], 'LINEAR')
    T.render(D, 'lantai', TOTAL, RES)

# ================================================================== KURSI (adegan 5a) — satuan meter
elif SHOT == 'kursi':
    plaster = T.texmat('plaster', 'plaster.png', 1.1, 1.0, tint='#8f9688'); tile = T.texmat('tile', 'tile.png', 2.2, 0.6, tint='#8e9388')
    T.box('floor', tile, (0, 2, -0.05), (7, 10, 0.1)); T.box('back', plaster, (0, 5.0, 1.8), (7, 0.2, 3.8))
    T.box('left', plaster, (-2.6, 2, 1.8), (0.2, 10, 3.8)); T.box('right', plaster, (2.6, 2, 1.8), (0.2, 10, 3.8)); T.box('ceil', plaster, (0, 2, 3.5), (7, 10, 0.1))
    steel = T.mat('steel', '#5d625f', 0.45); woodm = T.texmat('wood', 'wood.png', 1.6, 0.7, tint='#b39a7c')
    T.box('top', woodm, (0, 2.6, 0.74), (1.5, 0.8, 0.05))
    for x in (-0.68, 0.68):
        for y in (2.26, 2.94): T.beam('leg', steel, (x, y, 0), (x, y, 0.72), 0.025, 4)
    def chair(cx, cy, facing=1):
        T.box('seat', woodm, (cx, cy, 0.45), (0.44, 0.44, 0.04))
        for x in (-0.2, 0.2):
            for y in (-0.2, 0.2): T.beam('cleg', steel, (cx + x, cy + y, 0), (cx + x, cy + y, 0.44), 0.018, 4)
        yb = cy - 0.2 * facing
        for x in (-0.2, 0.2): T.beam('cup', steel, (cx + x, yb, 0.44), (cx + x, yb - 0.04 * facing, 0.98), 0.018, 4)
        for z in (0.72, 0.9): T.box('slat', woodm, (cx, yb - 0.03 * facing, z), (0.44, 0.03, 0.1))
    chair(0, 1.75, 1)
    T.box('berkas', T.mat('map', '#b79a5e', 0.9), (0.15, 2.55, 0.775), (0.34, 0.46, 0.012), rot=(0, 0, R(-12)))
    # pintu di dinding belakang dengan jendela kecil berpendar
    T.box('pintu', T.mat('pintu', '#3a3f3c', 0.7), (1.3, 4.88, 1.05), (0.95, 0.08, 2.1))
    wm, we = T.emis('E_win', '#9fb4a8', 0.9); T.box('jendela', wm, (1.3, 4.83, 1.6), (0.3, 0.02, 0.36))
    # lampu gantung di atas meja
    T.beam('kabel', T.mat('kabel', '#0a0a0a', 0.6), (0, 2.5, 3.45), (0, 2.5, 2.25), 0.01, 4)
    T.cone('kap', T.mat('kap', '#23302a', 0.5), (0, 2.5, 2.15), 0.3, 0.07, 0.22, 8)
    bm_, be = T.emis('E_bulb', '#ffe2a8', 6.0); T.cone('bulb', bm_, (0, 2.5, 1.99), 0.05, 0.05, 0.08, 6)
    spot = T.light('spot', 'SPOT', '#f3cf8f', 420, loc=(0, 2.5, 1.9), rot=(0, 0, 0), shadow=True, size=R(125)); spot.data.spot_blend = 0.6
    T.light('fill', 'POINT', '#3e5058', 60, loc=(-1.6, -1.0, 2.4))
    rnd = random.Random(4)
    for f in range(1, TOTAL + 1, 2):         # lampu sedikit bergetar terangnya (tanpa strobo)
        k = 1 - 0.14 * rnd.random(); keyv(spot.data, 'energy', f, 420 * k); be.inputs['Strength'].default_value = 6 * k; be.inputs['Strength'].keyframe_insert('default_value', frame=f)
    T.fog_all(2.5, 11, '#0a0d0c', skip=('E_win', 'E_bulb'))
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.003, 0.004, 0.004, 1)
    cam = T.camera(30)
    T.aim(cam, (0.5, -2.3, 1.55), (0.0, 2.3, 0.95), 1); T.aim(cam, (0.3, -1.25, 1.45), (0.0, 2.3, 0.9), TOTAL)
    T.interp([cam], 'LINEAR')
    T.render(D, 'kursi', TOTAL, RES)

# ================================================================== WARNET (adegan 3a) — satuan meter
elif SHOT == 'warnet':
    plaster = T.texmat('plaster', 'plaster.png', 1.0, 1.0, tint='#7f8a7c'); tile = T.texmat('tile', 'tile.png', 2.0, 0.5, tint='#7c8178')
    trip = T.texmat('triplek', 'triplek.png', 1.4, 0.9); crtm = T.mat('crt', '#b9b4a2', 0.6); dark = T.mat('dark', '#151515', 0.6); kb = T.mat('kb', '#a8a595', 0.7)
    Lr = 12.0
    T.box('floor', tile, (0, Lr / 2, -0.05), (5, Lr + 4, 0.1)); T.box('ceil', plaster, (0, Lr / 2, 2.85), (5, Lr + 4, 0.1))
    T.box('wl', plaster, (-2.3, Lr / 2, 1.4), (0.2, Lr + 4, 3)); T.box('wr', plaster, (2.3, Lr / 2, 1.4), (0.2, Lr + 4, 3)); T.box('wb', plaster, (0, Lr + 1, 1.4), (5, 0.2, 3))
    glows = []
    def booth(side, y, tex, i):
        x = side * 1.75                                 # meja menempel dinding, layar menghadap lorong
        T.box('meja', trip, (x, y, 0.7), (0.75, 1.15, 0.05)); T.box('sekat', trip, (side * 1.9, y + 0.62, 0.75), (0.6, 0.04, 1.5))
        T.box('crt', crtm, (side * 1.86, y, 0.94), (0.42, 0.44, 0.4)); T.box('crtb', crtm, (side * 2.05, y, 0.92), (0.25, 0.3, 0.3))
        m, e = screen_mat('scr%d' % i, os.path.join(T.TEX, tex), None, 1.6); m.name = 'E_scr%d' % i
        q = quad('layar', m, 0.34, 0.27, (side * 1.645, y, 0.95), (R(90), 0, R(-90 * side)))
        T.box('kbd', kb, (side * 1.52, y, 0.74), (0.16, 0.42, 0.025)); T.box('cpu', crtm, (side * 1.9, y - 0.42, 0.33), (0.4, 0.18, 0.42))
        T.box('kursi', dark, (side * 1.0, y + 0.05, 0.44), (0.4, 0.4, 0.05)); T.box('sandar', dark, (side * 0.82, y + 0.05, 0.72), (0.04, 0.38, 0.45))
        for dx in (-0.16, 0.16):
            for dy in (-0.16, 0.16): T.beam('kk', dark, (side * 1.0 + dx, y + 0.05 + dy, 0), (side * 1.0 + dx, y + 0.05 + dy, 0.44), 0.015, 4)
        col = {'forum_a.png': '#b9c8ee', 'forum_b.png': '#5a78d0', 'forum_c.png': '#c4d8b8', 'forum_d.png': '#58c880'}[tex]
        glows.append(T.light('g%d' % i, 'POINT', col, 22, loc=(side * 1.3, y, 1.0)))
    texs = ['forum_a.png', 'forum_b.png', 'forum_c.png', 'forum_d.png']
    i = 0
    for k in range(8):
        for side in (-1, 1):
            booth(side, 1.2 + k * 1.3, texs[(k * 2 + (side > 0) + k // 2) % 4], i); i += 1
    # ponsel tergeletak di meja bilik kanan terdekat (properti kecil, layar menyala)
    T.box('hp', dark, (1.5, 2.2, 0.745), (0.05, 0.11, 0.02)); hm, he = T.emis('E_hp', '#a8c79a', 2.2); T.box('hpl', hm, (1.5, 2.215, 0.757), (0.036, 0.03, 0.004))
    # kipas angin langit-langit berputar
    hub = T.cone('hub', dark, (0, 4.2, 2.62), 0.09, 0.09, 0.12, 8); T.beam('tiang', dark, (0, 4.2, 2.68), (0, 4.2, 2.82), 0.02, 4)
    for b in range(3):
        bl = seg('bilah', T.mat('bilah%d' % b, '#6b6658', 0.6), (0.16, 0.72, 0.012), hub, (0, 0, -0.02), (R(7), 0, R(120 * b)))
    hub.rotation_euler = (0, 0, 0); hub.keyframe_insert('rotation_euler', frame=1); hub.rotation_euler = (0, 0, R(-360 * 1.3 * TOTAL / 30)); hub.keyframe_insert('rotation_euler', frame=TOTAL)
    # lampu neon redup + poster kosong (tanpa teks/merek) di dinding belakang
    tm, te = T.emis('E_tube', '#c9d6c2', 1.4); T.box('neon', tm, (0, 7.5, 2.76), (0.08, 1.2, 0.04)); T.light('tube', 'POINT', '#b9c8b4', 55, loc=(0, 7.5, 2.5))
    T.box('poster', T.mat('poster', '#7a2f26', 0.9), (-0.9, Lr + 0.88, 1.7), (0.7, 0.02, 1.0)); T.box('poster2', T.mat('poster2', '#2f4a66', 0.9), (0.6, Lr + 0.88, 1.6), (0.9, 0.02, 0.6))
    rnd = random.Random(2)
    for g in glows:                           # layar berkedip sangat tipis (ganti halaman forum)
        for f in range(1, TOTAL + 1, 6): keyv(g.data, 'energy', f, 22 * (0.85 + 0.3 * rnd.random()))
    T.fog_all(1.5, 13, '#11171a', skip=tuple(m.name for m in bpy.data.materials if m.name.startswith('E_')))
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.006, 0.008, 0.01, 1)
    cam = T.camera(22)
    T.aim(cam, (-0.25, -0.6, 1.32), (0.25, 6.0, 1.0), 1)
    T.aim(cam, (0.0, 1.9, 1.25), (0.9, 6.0, 0.95), fr(B['dukun']))
    T.aim(cam, (0.3, 3.3, 1.2), (1.7, 4.55, 0.93), TOTAL)
    T.interp([hub], 'LINEAR'); T.interp([g.data for g in glows], 'LINEAR')
    T.render(D, 'warnet', TOTAL, RES)

# ================================================================== INBOX (adegan 3b) — skala ponsel
elif SHOT == 'inbox':
    lcdm, lcde = screen_mat('lcd', os.path.join(D, 'lcd/inbox/f_0001.png'), TOTAL, 1.2)
    ph, glow = phone(lcdm); ph.rotation_euler = (0, 0, R(5)); glow.data.energy = 0.7
    trip = T.texmat('triplek', 'triplek.png', 0.5, 0.85, tint='#b9a887')
    T.box('meja', trip, (0, 0, -0.05), (14, 14, 0.1))
    kb = T.mat('kb', '#b3b09f', 0.6); kk = T.mat('kk', '#d2cfc0', 0.5); dark = T.mat('dark', '#1a1a1a', 0.5)
    T.box('kbd', kb, (-0.6, 1.75, 0.07), (4.4, 1.5, 0.14), rot=(0, 0, R(-4)))            # keyboard di atas frame
    for r_ in range(4):
        for c in range(13): T.box('k', kk, (-2.55 + c * 0.325 + r_ * 0.05, 1.28 + r_ * 0.3, 0.16), (0.27, 0.24, 0.05), rot=(0, 0, R(-4)))
    T.box('mouse', kb, (1.55, -0.55, 0.11), (0.6, 1.0, 0.22), rot=(0, 0, R(14))); T.box('mousebtn', dark, (1.48, -0.26, 0.225), (0.5, 0.02, 0.01), rot=(0, 0, R(14)))
    T.box('kartu', T.mat('kartu', '#7a2f26', 0.8), (-1.45, -0.75, 0.01), (0.86, 0.54, 0.02), rot=(0, 0, R(-20)))   # kartu polos tanpa merek
    T.cone('gelas', T.mat('gelas', '#6b4a2a', 0.2), (-1.7, 0.45, 0.4), 0.28, 0.33, 0.8, 9)
    crt = T.light('crt', 'AREA', '#9db4e8', 130, loc=(0.4, 3.4, 2.6)); crt.data.size = 3.0; crt.data.use_shadow = True
    crt.rotation_euler = (Vector((0, 0, 0)) - Vector(crt.location)).to_track_quat('-Z', 'Y').to_euler()
    T.light('neon', 'POINT', '#b9c8b4', 60, loc=(-2.5, -2.0, 4.0))
    rnd = random.Random(7)
    for f in range(1, TOTAL + 1, 5): keyv(crt.data, 'energy', f, 130 * (0.8 + 0.4 * rnd.random()))
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.005, 0.008, 1)
    cam = T.camera(60)
    cam_path(cam, [(T0, 1.9, 62, (0, 0.16, 0.2), 2), (T1, 1.5, 65, (0, 0.17, 0.2), 0)])
    T.interp([crt.data, cam], 'LINEAR')
    T.render(D, 'inbox', TOTAL, RES)
