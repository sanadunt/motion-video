# Adegan 4 SiaranAngka: padang salju malam di Rusia, tiang antena kisi dengan lampu merah yang berkedip seirama
# "dengungan" (nyala 1,2 dtk, jeda 1,2 dtk ≈ 25/menit). PSX 3D penuh, tanpa tokoh.
# ATURAN: tiang antena adalah benda mati. Tidak bergerak, tidak punya "kepala", tidak ada corong/megafon.
#   [ONLY=1,40] blender -b --factory-startup -P salju_scene.py -- <outdir> <repo motion-video> [lebar tinggi]
import bpy, sys, os, math, json, random
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'wajah'))
from psx_lib import lin, mat

args = sys.argv[sys.argv.index('--') + 1:]
D, REPO = args[0], args[1]
RES = (int(args[2]), int(args[3])) if len(args) >= 4 else (270, 480)
os.makedirs(D, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
FOG = '#0b1218'

# ---------- timing dari VO (satu sumber: src/Videos/angka-*.json) ----------
caps = json.load(open(os.path.join(REPO, 'src/Videos/angka-captions.json')))
def cap(prefix):
    n = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum())
    return next(c for c in caps if n(c['text']).startswith(n(prefix)))
T0 = (cap('ia mencatat')['end'] + cap('Ia tertangkap')['start']) / 2      # batas adegan 3 -> 4
T_STOP = cap('Tak ada yang')['end']                                         # dengung berhenti tepat setelah "untuk apa"
FPS = 30
fr = lambda t: int(round((t - T0) * FPS)) + 1
TOTAL = fr(T_STOP) + 8                                                       # + 8 frame dip-to-black di Remotion
F_STOP = fr(T_STOP)
print('timing', dict(T0=round(T0, 2), total=TOTAL, stop=F_STOP))

def box(name, m, loc, dims, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.active_object; o.name = name
    o.scale = dims; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(m); o.select_set(False); return o
def beam(name, m, a, b, r):
    a, b = Vector(a), Vector(b); d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=4, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object; o.name = name; o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); o.data.materials.append(m); o.select_set(False); return o
def emis(name, hexc, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree; e = t.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = lin(hexc); e.inputs['Strength'].default_value = strength
    t.links.new(e.outputs['Emission'], t.nodes['Material Output'].inputs['Surface']); return m, e

# ---------- salju ----------
snow = mat('snow', '#c9d6e2', rough=0.9)
sn = snow.node_tree; nz = sn.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.35
bmp = sn.nodes.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = 0.5
sn.links.new(nz.outputs['Fac'], bmp.inputs['Height']); sn.links.new(bmp.outputs['Normal'], sn.nodes['Principled BSDF'].inputs['Normal'])
bpy.ops.mesh.primitive_grid_add(x_subdivisions=60, y_subdivisions=60, size=400, location=(0, 150, 0)); ground = bpy.context.active_object
random.seed(3)
for v in ground.data.vertices: v.co.z += (random.random() - 0.5) * 0.5 + math.sin(v.co.x * 0.05) * 0.6
ground.data.materials.append(snow)

# ---------- tiang antena kisi (segitiga, ±60 m) ----------
steel = mat('steel', '#5c6268', rough=0.6); dark = mat('dark', '#0a0c0e')
MX, MY, MH, R = 5.0, 46.0, 58.0, 1.6
corners = [Vector((MX + R * math.cos(a), MY + R * math.sin(a), 0)) for a in (math.radians(90), math.radians(210), math.radians(330))]
for c in corners: beam('leg', steel, c, c + Vector((0, 0, MH)), 0.16)
z = 0.0; k = 0
while z < MH - 1:
    z2 = z + 2.4
    for i in range(3):
        a = corners[i] + Vector((0, 0, z)); b = corners[(i + 1) % 3] + Vector((0, 0, z2 if k % 2 else z))
        beam('brace', steel, a, b, 0.07)
        if k % 2: beam('ring', steel, corners[i] + Vector((0, 0, z2)), corners[(i + 1) % 3] + Vector((0, 0, z2)), 0.06)
    z = z2; k += 1
# kawat penahan (guy wire) ke tiga jangkar
wire = mat('wire', '#3b4248')
for i, a in enumerate((math.radians(100), math.radians(220), math.radians(340))):
    anchor = Vector((MX + 38 * math.cos(a), MY + 38 * math.sin(a), 0.2))
    for h in (MH * 0.45, MH * 0.85): beam('guy', wire, Vector((MX, MY, h)), anchor, 0.02)
# lampu penanda merah di puncak + tengah
redm, rede = emis('red', '#ff1206', 0.0)
for h in (MH + 0.4, MH * 0.5):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=6, ring_count=4, radius=0.9, location=(MX, MY, h)); o = bpy.context.active_object; o.data.materials.append(redm); o.select_set(False)
redl = bpy.data.objects.new('redl', bpy.data.lights.new('redl', 'POINT')); redl.data.color = (1.0, 0.15, 0.08); redl.data.use_shadow = False
redl.location = (MX, MY, MH + 1.2); sc.collection.objects.link(redl)
# gubuk pemancar di kaki tiang, satu jendela redup
hut = mat('hut', '#3a3f44'); box('hut', hut, (MX - 7, MY - 6, 1.6), (6, 4, 3.2)); box('roofh', dark, (MX - 7, MY - 6, 3.35), (6.4, 4.4, 0.3))
winm, _ = emis('hutwin', '#c99a52', 1.6); box('hutwin', winm, (MX - 7, MY - 8.02, 1.8), (1.2, 0.05, 0.7))
# pagar kawat di latar dekat (tiang kayu + 3 kawat)
post = mat('post', '#2a221b')
for i in range(-6, 7):
    x = i * 3.2; y = 9 + i * 0.4
    box('post', post, (x, y, 0.9), (0.14, 0.14, 1.9), rot=(0, (random.random() - 0.5) * 0.12, 0))
    if i < 6:
        for hz in (0.6, 1.1, 1.6): beam('fwire', wire, (x, y, hz), (x + 3.2, y + 0.4, hz - 0.05), 0.012)
# tanda peringatan generik di pagar (tanpa teks/lambang negara)
sign = mat('sign', '#4a4636'); box('sign', sign, (-4.6, 7.8, 1.25), (0.7, 0.04, 0.45))
# garis pohon gelap di cakrawala
tree = mat('tree', '#060a0c')
for i in range(70):
    x = -160 + i * 4.8 + random.uniform(-1.5, 1.5); y = 210 + random.uniform(-10, 10); h = random.uniform(8, 16)
    bpy.ops.mesh.primitive_cone_add(vertices=5, radius1=h * 0.22, depth=h, location=(x, y, h / 2)); o = bpy.context.active_object; o.data.materials.append(tree); o.select_set(False)
# serpih salju melayang (diam per frame; gerak turun dikeyframe kasar)
flake, _ = emis('flake', '#dfe8f0', 1.2)
flakes = []
for i in range(180):
    loc = (random.uniform(-6, 6), random.uniform(2, 22), random.uniform(0.2, 9))
    bpy.ops.mesh.primitive_plane_add(size=0.05, location=loc); o = bpy.context.active_object; o.data.materials.append(flake); o.select_set(False); flakes.append(o)

# ---------- kabut per jarak ----------
def fog(m, near, far, col=FOG):
    t = m.node_tree; out = t.nodes['Material Output']; src = out.inputs['Surface'].links[0].from_socket
    cd = t.nodes.new('ShaderNodeCameraData'); mr = t.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = near; mr.inputs['From Max'].default_value = far
    ef = t.nodes.new('ShaderNodeEmission'); ef.inputs['Color'].default_value = lin(col); mx = t.nodes.new('ShaderNodeMixShader')
    t.links.new(cd.outputs['View Distance'], mr.inputs['Value']); t.links.new(mr.outputs['Result'], mx.inputs['Fac'])
    t.links.new(src, mx.inputs[1]); t.links.new(ef.outputs['Emission'], mx.inputs[2]); t.links.new(mx.outputs['Shader'], out.inputs['Surface'])
for m in (snow, steel, dark, wire, hut, post, sign, winm): fog(m, 8, 150)
fog(tree, 60, 260)

# ---------- cahaya + langit ----------
moon = bpy.data.objects.new('moon', bpy.data.lights.new('moon', 'SUN')); moon.data.energy = 0.9; moon.data.color = (0.62, 0.72, 0.9)
moon.data.use_shadow = False; moon.rotation_euler = (math.radians(58), 0, math.radians(-30)); sc.collection.objects.link(moon)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
wt = sc.world.node_tree; bg = wt.nodes['Background']; tc = wt.nodes.new('ShaderNodeTexCoord'); sx = wt.nodes.new('ShaderNodeSeparateXYZ')
mr = wt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -0.02; mr.inputs['From Max'].default_value = 0.5
ramp = wt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = lin('#1c2a35'); ramp.color_ramp.elements[1].color = lin('#03060a')
wt.links.new(tc.outputs['Generated'], sx.inputs['Vector']); wt.links.new(sx.outputs['Z'], mr.inputs['Value'])
wt.links.new(mr.outputs['Result'], ramp.inputs['Fac']); wt.links.new(ramp.outputs['Color'], bg.inputs['Color'])

moonm, _ = emis('moondisc', '#dfe7ec', 4.0)
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=6.0, location=(-45, 230, 175)); o = bpy.context.active_object; o.data.materials.append(moonm); o.select_set(False)
# lampu merah: nyala 36 frame, mati 36 frame; mati total setelah F_STOP
for f in range(1, TOTAL + 1, 36):
    on = ((f - 1) // 36) % 2 == 0 and f < F_STOP
    rede.inputs['Strength'].default_value = 4.5 if on else 0.35; rede.inputs['Strength'].keyframe_insert('default_value', frame=f)
    redl.data.energy = 9000 if on else 0; redl.data.keyframe_insert('energy', frame=f)
rede.inputs['Strength'].default_value = 0.4; rede.inputs['Strength'].keyframe_insert('default_value', frame=F_STOP)
redl.data.energy = 0; redl.data.keyframe_insert('energy', frame=F_STOP)

# salju turun pelan
for o in flakes:
    z0 = o.location.z
    o.keyframe_insert('location', frame=1); o.location.z = z0 - 0.9 * TOTAL / 30; o.keyframe_insert('location', frame=TOTAL)

# ---------- kamera: rendah, dolly sangat pelan ke antena, menengadah ----------
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 22; sc.collection.objects.link(cam); sc.camera = cam
for f, y in ((1, -2.0), (TOTAL, 4.0)):
    cam.location = (0.6, y, 1.5); look = Vector((MX - 1.5, MY, MH * 0.5))
    cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)

from bpy_extras import anim_utils
def fcurves(idb):
    ad = idb.animation_data
    if not ad or not ad.action: return []
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot); return cb.fcurves if cb else []
for idb in (redl.data, redm.node_tree):
    for fc in fcurves(idb):
        for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'
for o in [cam] + flakes:
    for fc in fcurves(o):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'

# ---------- render ----------
sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = int(os.environ.get('FRAMES', TOTAL))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'salju.blend'))
if os.environ.get('ONLY'):
    for f in [int(x) for x in os.environ['ONLY'].split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(D, 'stills', 'salju_%04d' % f); bpy.ops.render.render(write_still=True)
    print('stills', os.environ['ONLY'])
else:
    sc.render.filepath = os.path.join(D, 'frames_salju', 'f_'); bpy.ops.render.render(animation=True); print('rendered', sc.frame_end)
