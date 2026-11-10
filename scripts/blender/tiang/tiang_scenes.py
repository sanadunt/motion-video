# Adegan 3D PSX ArsipTiang (ARSIP 06). Satu skrip, SHOT memilih adegan:
#   jalan   (bagian 1) jalan desa malam, deretan tiang listrik ke kabut, lampu jalan, tiang ekstra di "bertambah"
#   relay   (bagian 3) puncak bukit: tiang relay + lampu merah, pinus, kabut abu-hijau, embun beku, dua tiang saat kabut terbuka
#   pendaki (bagian 4a) pendaki PSX dari belakang menuruni jalan setapak (wajah tidak pernah terlihat)
#   cam     (bagian 4b) POV camcorder: senter, tiang di sisi jalan, kuburan bukit, berbalik, tiang tanpa puncak, kamera jatuh
# Timing dari src/Videos/tiang-*.json (rumus sama dengan objek B di src/Videos/ArsipTiang.tsx). Frame 1 = awal adegan.
#   SHOT=jalan [ONLY=1,200] blender -b --factory-startup -P tiang_scenes.py -- <outdir> <repo> [lebar tinggi] [glb]
import bpy, sys, os, math, random
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', 'wajah'))
import tiang_lib as T

args = sys.argv[sys.argv.index('--') + 1:]
D, REPO = args[0], args[1]
RES = (int(args[2]), int(args[3])) if len(args) >= 4 else (270, 480)
GLB = args[4] if len(args) >= 5 else os.path.join(REPO, '.claude/skills/psx-character/assets/psx_male_base_mesh.glb')
SHOT = os.environ.get('SHOT', 'jalan')
os.makedirs(D, exist_ok=True)
sc = T.setup(REPO)

# ---------- beat (detik global) ----------
cap, word = T.cap, T.word
B = dict(
    s1End=(cap('dan jumlahnya')['end'] + cap('Dari jauh')['start']) / 2,
    tambah=word('01-hook', 'bertambah'),
    jangan=word('01-hook', 'jangan'),
    s2End=(cap('Dari dekat')['end'] + cap('Pengeras suara itu')['start']) / 2,
    bersiaran=word('03a-siaran', 'bersiaran'),
    sirene=word('03a-siaran', 'sirene'),
    kenal=word('03b-kenal', 'suara'),
    s3End=(cap('suara orang')['end'] + cap('Seorang')['start']) / 2,
    rekam=word('04-pendaki', 'merekam') + 0.45,
    kubur=word('04-pendaki', 'bukit') - 0.6,
    hitung=word('04-pendaki', 'menghitung'),
    c21=word('b1-hitung', 'satu'),
    c22=word('b1-hitung', 'dua', 2),
    c23=word('b2-tambah', 'tiga'),
    s4End=[c for c in T.vo()['clips'] if c['file'] == '05-hilang'][0]['at'] - 0.02,
)
B['turn'] = B['c23'] + 0.1
B['back'] = B['turn'] + 1.45
B['again'] = B['back'] + 0.45
B['fall'] = B['again'] + 0.35
print('B', {k: round(v, 2) for k, v in B.items()})

FPS = 30
def span(t0, t1):
    fr = lambda t: int(round((t - t0) * FPS)) + 1
    return fr, fr(t1)

# ---------- material bersama ----------
wood = T.texmat('pole_wood', 'pole_wood.png', 2.2, 1.0, tint='#b0a89a')
metal = T.mat('metal', '#2b2d2f', 0.7)
insul = T.mat('insul', '#6f7a72', 0.5)
cable = T.mat('cablew', '#070808', 1.0)
bark = T.texmat('bark', 'pine_bark.png', 1.5, 1.0)
needle = T.texmat('needle', 'pine_needles.png', 0.8, 1.0, tint='#b8c8bc')
CM = T.creature_mats()
dark_flesh = T.texmat('flesh_far', 'fleshrust.png', 1.0, 0.9, tint='#5e504a')   # dari jauh terbaca kayu tua

def poles_with_wires(points, h=9.0, lean=0.0, z_of=lambda x, y: 0.0):
    tops = [T.utility_pole('pole%d' % i, wood, metal, insul, (x, y, z_of(x, y)), h, lean) for i, (x, y) in enumerate(points)]
    for a, b in zip(tops, tops[1:]):
        for pa, pb in zip(a, b): T.wire('w', cable, pa, pb, 0.7, 0.012, 6)
    return tops

def creature_pole(loc, h, name='extra'):
    """badan makhluk sebagai 'tiang': tanpa palang, tanpa kabel, puncak di luar frame/kabut. Tanpa kepala."""
    objs = T.creature_neck({'fr': dark_flesh, 'rust': T.texmat('rust_far', 'rust.png', 1.4, 0.9, tint='#6a5a50')}, base=loc, h=h, r0=0.3, r1=0.2, seed=11, rings=9)
    for o in objs: o.name = name
    return objs

def forest(rnd, n, xr, yr, avoid, z_of=lambda x, y: 0.0, hr=(9, 17)):
    for i in range(n):
        x = rnd.uniform(*xr); y = rnd.uniform(*yr)
        if avoid(x, y): continue
        T.pine('pine', bark, needle, (x, y, z_of(x, y) - 0.2), rnd.uniform(*hr), rnd.randint(0, 9999))

def hide_between(objs, f_show, f_hide=None):
    for o in objs:
        for f, v in ((1, True), (f_show, False)) + (((f_hide, True),) if f_hide else ()):
            o.hide_render = v; o.keyframe_insert('hide_render', frame=f); o.hide_viewport = v; o.keyframe_insert('hide_viewport', frame=f)

# =====================================================================================
if SHOT == 'jalan':
    fr, TOTAL = span(0.0, B['s1End'])
    FOGC = '#24302c'
    rnd = random.Random(1)
    grass = T.texmat('grass', 'soil.png', 0.3, 1.0, tint='#5f7a62')
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 100, 0)); g = bpy.context.active_object; g.scale = (300, 300, 1); g.data.materials.append(grass)
    asph = T.texmat('asphalt', 'asphalt.png', 0.22, 0.85)
    T.box('road', asph, (0, 100, 0.01), (6.5, 260, 0.02))
    edge = T.mat('edge', '#6b6a62', 1.0)
    for s in (-1, 1): T.box('edgeline', edge, (s * 3.0, 100, 0.025), (0.1, 260, 0.01))
    # deretan tiang di kanan jalan
    PY = [7 + 17 * k for k in range(10)]
    poles_with_wires([(4.3, y) for y in PY])
    # lampu jalan di tiang pertama: lengan + kepala lampu natrium
    T.beam('lamparm', metal, (4.3, PY[0], 7.0), (2.6, PY[0], 7.4), 0.04)
    lampm, lampe = T.emis('E_lamp', '#ffcf7a', 6.0)
    T.box('lamphead', lampm, (2.5, PY[0], 7.3), (0.5, 0.25, 0.12))
    lamp = T.light('lamp', 'SPOT', '#d9a441', 900, loc=(2.5, PY[0], 7.2), rot=(0, 0, 0), size=math.radians(110))
    lamp.data.use_shadow = False
    # tiang ekstra: di antara tiang ke-3 dan ke-4, sedikit keluar barisan, puncak di luar frame
    extra = creature_pole((5.1, (PY[2] + PY[3]) / 2 + 2, 0), 34)
    hide_between(extra, fr(B['tambah']))
    # rumah desa di kiri, satu jendela hangat
    wall = T.mat('wall', '#3a3833', 1.0); roof = T.mat('roof', '#1d1714', 1.0)
    for (x, y, w, d) in ((-11, 26, 7, 6), (-12.5, 58, 6, 5)):
        T.box('house', wall, (x, y, 1.6), (w, d, 3.2)); T.box('roof', roof, (x, y, 3.6), (w + 0.8, d + 0.8, 0.8), rot=(0, 0, 0))
    winm, _ = T.emis('E_win', '#c98f45', 1.4); T.box('win', winm, (-7.48, 26, 1.7), (0.05, 1.0, 0.8))
    # pinus kiri-kanan, menjauh dari jalan dan rumah
    forest(rnd, 260, (-60, 60), (-5, 220), lambda x, y: abs(x) < 7.5 or (x < -6 and (20 < y < 33 or 53 < y < 63)))
    T.fog_all(4, 70, FOGC, skip=('E_lamp', 'E_win'))
    T.sky('#070b0e', '#2c3835', lo=-0.05, hi=0.45)
    moon = T.light('moon', 'SUN', '#8fa3b5', 0.9, rot=(math.radians(60), 0, math.radians(-25)))
    # lampu jalan padam 4 frame di "jangan", lalu menyala lagi
    fj = fr(B['jangan'])
    for f, on in ((1, 1), (fj, 0), (fj + 4, 1)):
        lamp.data.energy = 900 * on; lamp.data.keyframe_insert('energy', frame=f)
        lampe.inputs['Strength'].default_value = 6.0 * on + 0.2; lampe.inputs['Strength'].keyframe_insert('default_value', frame=f)
    cam = T.camera(24)
    look0, look1 = Vector((6.0, 55, 4.6)), Vector((6.2, 55, 5.0))      # deretan tiang menjauh ke tengah frame
    T.aim(cam, (-1.2, -3.0, 1.55), look0, 1); T.aim(cam, (-1.1, 3.5, 1.6), look1, TOTAL)
    T.interp([lamp.data, lampm.node_tree], 'CONSTANT'); T.interp([cam], 'LINEAR')
    T.render(D, 'jalan', TOTAL, RES)

# =====================================================================================
elif SHOT == 'relay':
    fr, TOTAL = span(B['s2End'], B['s3End'])
    FOGC = '#4a5753'
    rnd = random.Random(2)
    soil = T.texmat('hill', 'soil.png', 0.25, 1.0, tint='#7f8f80')
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=300, location=(0, 120, 0)); g = bpy.context.active_object
    for v in g.data.vertices:
        d = math.hypot(v.co.x, v.co.y - 40); v.co.z = -0.0009 * d * d + rnd.uniform(-0.25, 0.25)   # puncak bukit di sekitar tiang
    g.data.materials.append(soil)
    hz = lambda x, y: -0.0009 * ((x) ** 2 + (y - 40) ** 2)
    steel = T.mat('steel', '#4f5458', 0.6)
    MX, MY, MH, R = 3.0, 40.0, 42.0, 1.4
    corners = [Vector((MX + R * math.cos(a), MY + R * math.sin(a), 0)) for a in (math.radians(90), math.radians(210), math.radians(330))]
    for c in corners: T.beam('leg', steel, c, c + Vector((0, 0, MH)), 0.13)
    z = 0.0; k = 0
    while z < MH - 1:
        z2 = z + 2.2
        for i in range(3):
            a = corners[i] + Vector((0, 0, z)); b = corners[(i + 1) % 3] + Vector((0, 0, z2 if k % 2 else z))
            T.beam('brace', steel, a, b, 0.06)
        z = z2; k += 1
    for h in (MH * 0.6, MH * 0.85):      # antena panel kecil
        for a in (0, 2.1, 4.2): T.box('panel', steel, (MX + 1.7 * math.cos(a), MY + 1.7 * math.sin(a), h), (0.5, 0.15, 1.6), rot=(0, 0, a))
    redm, rede = T.emis('E_red', '#ff1206', 0.0)
    for h in (MH + 0.4, MH * 0.5):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=6, ring_count=4, radius=0.6, location=(MX, MY, h)); o = bpy.context.active_object; o.data.materials.append(redm)
    redl = T.light('redl', 'POINT', '#ff2614', 0, loc=(MX, MY, MH + 1.2))
    # pos jaga kayu di kaki tiang, jendela redup (HT ada di dalamnya)
    planks = T.texmat('planks', 'planks.png', 0.9, 1.0)
    T.box('post', planks, (MX - 8, MY - 9, 1.3 + hz(MX - 8, MY - 9)), (3.4, 2.6, 2.6)); T.box('postroof', metal, (MX - 8, MY - 9, 2.75 + hz(MX - 8, MY - 9)), (4.0, 3.2, 0.2), rot=(0.12, 0, 0))
    pwin, _ = T.emis('E_postwin', '#7bd88f', 0.5); T.box('postwin', pwin, (MX - 8, MY - 10.32, 1.5 + hz(MX - 8, MY - 9)), (0.8, 0.04, 0.5))
    # dua tiang di sebelah antena: satu tiang listrik biasa + satu "tiang" yang seharusnya tidak ada
    T.utility_pole('npole', wood, metal, insul, (MX + 9, MY - 2, hz(MX + 9, MY - 2)), 11)
    extra = creature_pole((MX - 7.5, MY + 3, hz(MX - 7.5, MY + 3)), 40)
    hide_between(extra, fr(B['kenal']))      # baru ada saat kabut terbuka
    forest(rnd, 220, (-90, 90), (-10, 230), lambda x, y: math.hypot(x - MX, y - MY) < 9 or (abs(x) < 4 and y < 30), z_of=hz, hr=(8, 15))
    # embun beku melayang (pipeline serpih salju ARSIP 05, warna abu-hijau, lebih lambat)
    flk, _ = T.emis('E_frost', '#cfd9d2', 0.9); flakes = []
    for i in range(160):
        flakes.append(T.box('frost', flk, (rnd.uniform(-5, 6), rnd.uniform(1, 16), rnd.uniform(-0.5, 6)), (0.04, 0.001, 0.04)))
    T.fog_all(5, 60, FOGC, skip=('E_red', 'E_frost', 'E_postwin'))
    # kabut terbuka sesaat di "suara orang yang kamu kenal": jarak jauh kabut 60 -> 150 -> 60
    mrs = [n for m in bpy.data.materials if m.use_nodes for n in m.node_tree.nodes if n.type == 'MAP_RANGE' and n.inputs['From Max'].default_value == 60]
    fk = fr(B['kenal'])
    for f, far in ((1, 60), (fk, 60), (fk + 25, 150), (TOTAL - 4, 150), (TOTAL + 10, 70)):
        for n in mrs: n.inputs['From Max'].default_value = far; n.inputs['From Max'].keyframe_insert('default_value', frame=f)
    T.sky('#0e1412', '#56635e', lo=-0.05, hi=0.6)
    T.light('moon', 'SUN', '#a9b8b0', 0.5, rot=(math.radians(55), 0, math.radians(-35)))
    # lampu merah: ±0,6 Hz (nyala 25 / mati 25); di "sirene" 1,2 dtk cepat (nyala 6 / mati 6 = 2,5 Hz ≤ 3)
    fs0, fs1 = fr(B['sirene']), fr(B['sirene'] + 1.2)
    f = 1; on = True
    while f <= TOTAL:
        rede.inputs['Strength'].default_value = 5.0 if on else 0.3; rede.inputs['Strength'].keyframe_insert('default_value', frame=f)
        redl.data.energy = 6000 if on else 0; redl.data.keyframe_insert('energy', frame=f)
        f += 6 if fs0 <= f < fs1 else 25; on = not on
    for o in flakes:
        o.keyframe_insert('location', frame=1); o.location.z -= 0.25 * TOTAL / 30; o.location.x += 0.4 * TOTAL / 30; o.keyframe_insert('location', frame=TOTAL)
    cam = T.camera(22)
    T.aim(cam, (0.8, -2.0, 1.4 + hz(0.8, -2)), (MX - 1.0, MY, MH * 0.55), 1)
    T.aim(cam, (0.9, 6.0, 1.4 + hz(0.9, 6)), (MX - 1.2, MY, MH * 0.5), TOTAL)
    T.interp([redl.data, redm.node_tree], 'CONSTANT'); T.interp([cam] + flakes, 'LINEAR')
    T.render(D, 'relay', TOTAL, RES)

# =====================================================================================
elif SHOT in ('pendaki', 'cam'):
    # jalan setapak menurun ke +Y, tiang listrik kecil di kiri, kuburan tua di punggung bukit kanan
    rnd = random.Random(4)
    SL = 0.11
    pz = lambda x, y: -SL * y + 0.004 * x * x + 0.15 * math.sin(y * 0.3)
    soilm = T.texmat('soil', 'soil.png', 0.35, 1.0)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=50, y_subdivisions=80, size=1, location=(0, 0, 0)); g = bpy.context.active_object
    g.scale = (120, 200, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for v in g.data.vertices:
        v.co.y += 60; v.co.z = pz(v.co.x, v.co.y) + (0 if abs(v.co.x) < 1.5 else rnd.uniform(0, 0.35))
    g.data.materials.append(soilm)
    PY = [-12 + 9 * k for k in range(14)]
    poles_with_wires([(-2.6, y) for y in PY], h=8.0, z_of=pz)
    gravem = T.texmat('grave', 'grave.png', 1.5, 1.0)
    for i in range(9):          # nisan kayu miring di punggung bukit kanan
        x = 5.5 + rnd.uniform(0, 4); y = 1 + i * 1.6 + rnd.uniform(-0.4, 0.4); z = pz(x, y)
        T.box('nisan', gravem, (x, y, z + 0.45), (0.28, 0.08, 0.95), rot=(rnd.uniform(-0.2, 0.2), rnd.uniform(-0.25, 0.25), rnd.uniform(-0.4, 0.4)))
        T.box('gundukan', soilm, (x, y + 0.6, z + 0.08), (0.9, 1.6, 0.25), rot=(0, 0, rnd.uniform(-0.3, 0.3)))
    forest(rnd, 420, (-50, 50), (-40, 150), lambda x, y: abs(x) < 3.6 or (4.5 < x < 11 and 0 < y < 16), z_of=pz, hr=(10, 18))
    extra = creature_pole((1.8, -9.0, pz(1.8, -9.0)), 34, 'extra')
    if SHOT == 'pendaki':
        fr, TOTAL = span(B['s3End'], B['rekam'])
        import psx_lib as P
        P.GLB = GLB
        plain = os.path.join(D, 'plain_atlas.png')
        img = bpy.data.images.new('plain', 64, 64); img.pixels = [0.45, 0.32, 0.24, 1.0] * (64 * 64); img.filepath_raw = plain; img.file_format = 'PNG'; img.save()
        P.ATLAS = plain
        h = P.make_char('h', coat='#3c4636', pants='#26272b', hair='#141010', skin='#9c6f52')
        rig = h['rig']; pb = h['pb']
        rig.rotation_euler = (0, 0, math.pi)            # punggung ke kamera (kamera di belakang, tokoh berjalan ke +Y)
        for o in (rig,):
            o.location = (0.1, 2.0, pz(0.1, 2.0))
        bpy.context.view_layer.update()
        def attach(obj, bone, world_loc):
            obj.parent = rig; obj.parent_type = 'BONE'; obj.parent_bone = bone
            bpy.context.view_layer.update(); obj.matrix_world = Matrix.Translation(world_loc) @ Matrix.Diagonal((*obj.scale, 1.0))
        pack = T.mat('pack', '#2a3340', 1.0)
        sp = rig.matrix_world @ pb['spine.002'].head
        bpy.ops.mesh.primitive_cube_add(size=1); bag = bpy.context.active_object; bag.scale = (0.34, 0.2, 0.5); bag.data.materials.append(pack)
        attach(bag, 'spine.002', sp + Vector((0, 0.17, -0.12)))
        htm = T.mat('ht', '#111214', 1.0); ledm, _ = T.emis('E_led', '#7bd88f', 3.0)
        bpy.ops.mesh.primitive_cube_add(size=1); ht = bpy.context.active_object; ht.scale = (0.06, 0.04, 0.16); ht.data.materials.append(htm)
        attach(ht, 'spine.002', sp + Vector((0.16, 0.3, -0.05)))
        # tangan kanan terangkat memegang camcorder (ke depan), lampu REC merah kecil
        P.head_turn(h, 1, 0, 6)
        camb = T.mat('camcorder', '#1a1a1c', 0.8); recm, _ = T.emis('E_rec', '#ff2020', 6.0)
        ua = pb['upper_arm.R']; r = list(ua.rotation_euler); r[0] += math.radians(55); ua.rotation_euler = r
        pb['forearm.R'].rotation_euler = (math.radians(40), 0, 0)
        # jalan: ayun paha/betis berlawanan, badan naik-turun, maju ke +Y
        SPEED = 1.05
        for f in range(1, TOTAL + 1, 4):
            ph = (f - 1) / 30 * 2 * math.pi * 0.95
            for s, sg in (('L', 1), ('R', -1)):
                pb['thigh.' + s].rotation_euler = (math.radians(24 * sg * math.sin(ph)), 0, 0); pb['thigh.' + s].keyframe_insert('rotation_euler', frame=f)
                pb['shin.' + s].rotation_euler = (math.radians(-22 * max(0, sg * math.cos(ph))), 0, 0); pb['shin.' + s].keyframe_insert('rotation_euler', frame=f)
            pb['upper_arm.L'].rotation_euler = (math.radians(-14 * math.sin(ph)), 0, math.radians(0)); pb['upper_arm.L'].keyframe_insert('rotation_euler', frame=f)
            y = 2.0 + SPEED * (f - 1) / 30; rig.location = (0.1, y, pz(0.1, y) + 0.03 * abs(math.sin(ph))); rig.keyframe_insert('location', frame=f)
        # senter di tangan kiri: sorot ke jalan di depan
        sc.frame_set(1); bpy.context.view_layer.update()
        fl = T.light('flash', 'SPOT', '#f2e6c8', 900, size=math.radians(38)); fl.data.use_shadow = True
        fl.matrix_world = Matrix.Translation((-0.3, 2.45, pz(0, 2.45) + 1.05)) @ Matrix.Rotation(math.radians(76), 4, 'X')   # di tangan kiri, sorot ke depan-bawah
        rim = T.light('rimh', 'POINT', '#6f8a9a', 90, loc=(1.6, 3.2, pz(0, 3.2) + 2.3))     # tepi bahu dari depan-samping
        for o in (fl, rim): o.parent = rig; o.matrix_parent_inverse = rig.matrix_world.inverted()
        hide_between(extra, TOTAL + 50)      # tiang ekstra tidak ada di shot ini
        cam = T.camera(30)
        for f in (1, TOTAL):
            y = 2.0 + SPEED * (f - 1) / 30
            T.aim(cam, (0.7, y - 3.2, pz(0.7, y - 3.2) + 1.75), (0.0, y + 4, pz(0, y + 4) + 1.0), f)
        T.fog_all(3, 26, '#090c0b', skip=('E_led', 'E_rec'))
        T.sky('#020304', '#0d1211')
        T.light('moon', 'SUN', '#6d7f8c', 0.4, rot=(math.radians(60), 0, math.radians(150)))
        T.interp([cam], 'LINEAR')
        T.render(D, 'pendaki', TOTAL, RES)
    else:
        fr, TOTAL = span(B['rekam'], B['s4End'])
        F = lambda k: fr(B[k])
        cam = T.camera(20)
        fl = T.light('flash', 'SPOT', '#f2e6c8', 2400, size=math.radians(48)); fl.data.use_shadow = True; fl.data.spot_blend = 0.5
        fl.parent = cam; fl.location = (0.12, -0.15, 0.0); fl.rotation_euler = (math.radians(-3), math.radians(2), 0)
        T.light('moon', 'SUN', '#6d7f8c', 0.3, rot=(math.radians(60), 0, math.radians(30)))
        # lintasan: maju menurun 1,15 m/dtk; yaw (derajat, 0 = ke depan/+Y, + = ke kiri)
        SPEED = 1.15
        def y_at(f): return 0.5 + SPEED * (min(f, F('turn')) - 1) / 30
        keys = [  # (frame, yaw, pitch, roll, tinggi)
            (1, 0, -4, 0, 1.6), (F('kubur') - 6, -2, -4, 0, 1.6), (F('kubur') + 10, -52, -8, 2, 1.6), (F('kubur') + 50, -48, -9, 1, 1.6),
            (F('hitung') - 10, 0, -3, 0, 1.6), (F('c21') - 14, 2, 0, 0, 1.6), (F('c21') + 2, 32, 8, -2, 1.6), (F('c21') + 30, 28, 7, -1, 1.6),
            (F('c22') - 16, 6, 2, 0, 1.6), (F('c22') + 2, 14, 6, 0, 1.6), (F('c23') - 4, 10, 3, 0, 1.6),
            (F('turn'), 10, 2, 0, 1.6), (F('turn') + 9, 120, 0, 6, 1.6), (F('turn') + 19, 178, 9, -2, 1.55),
            (F('back') - 1, 181, 10, -1, 1.55), (F('back') + 5, 70, -2, 9, 1.6), (F('back') + 10, 6, -4, 0, 1.6),
            (F('again'), 4, -3, 0, 1.6), (F('again') + 8, 176, 6, -3, 1.6), (F('fall') + 1, 178, 7, -2, 1.6),
            (F('fall') + 6, 168, -30, 40, 0.8), (F('fall') + 10, 160, -12, 82, 0.12), (TOTAL, 160, -12, 82, 0.12),
        ]
        for f, yaw, pitch, roll, hgt in keys:
            y = y_at(f); x = 0.15 + (0.25 if hgt < 1 else 0)
            cam.location = (x, y, pz(x, y) + hgt)
            cam.rotation_euler = (math.radians(90 + pitch), math.radians(roll), math.radians(yaw))
            cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
        # tiang ekstra: berdiri di belakang (arah naik) hanya saat pertama berbalik; hilang saat ditoleh lagi
        ey = y_at(F('turn')) - 7.0      # berdiri tepat di tengah jalan setapak yang baru dilewati
        for o in extra: o.location.x += 0.15 - 1.8; o.location.y += ey - (-9.0); o.location.z += pz(0.15, ey) - pz(1.8, -9.0)
        hide_between(extra, F('turn') + 6, F('back') + 3)
        T.fog_all(2.5, 26, '#0c110f', skip=())
        T.sky('#020303', '#0e1311')
        T.interp([cam], 'BEZIER'); T.interp([o for o in extra], 'CONSTANT')
        T.render(D, 'cam', TOTAL, RES)
