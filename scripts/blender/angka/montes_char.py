# Tokoh kamar 2001 (SiaranAngka, adegan 3): perempuan PSX dilihat dari BELAKANG, duduk menulis di meja.
# Orang nyata yang masih hidup -> wajah tidak pernah terlihat, tidak ada kemiripan wajah. Latar transparan,
# dipasang sebagai billboard di set 2.5D Remotion (kursi dan meja menutupi badan bawah).
#   [ONLY=1] blender -b --factory-startup -P montes_char.py -- <outdir> <base_mesh.glb> <repo motion-video> [lebar tinggi]
import bpy, sys, os, math
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '..', 'wajah'))
import psx_lib as P

args = sys.argv[sys.argv.index('--') + 1:]
D, GLB, REPO = args[0], args[1], args[2]
RES = (int(args[3]), int(args[4])) if len(args) >= 5 else (320, 320)
os.makedirs(D, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
P.GLB = GLB
TOTAL = int(os.environ.get('TOTAL', '48'))

# atlas polos: wajah tidak pernah menghadap kamera
plain = os.path.join(D, 'plain_atlas.png')
img = bpy.data.images.new('plain', 64, 64); img.pixels = [0.55, 0.38, 0.27, 1.0] * (64 * 64); img.filepath_raw = plain; img.file_format = 'PNG'; img.save()
P.ATLAS = plain

HAIR = '#1c130e'
w = P.make_char('w', coat='#3d4150', pants='#23252c', hair=HAIR, skin='#b98463')
w['rig'].rotation_euler = (0, 0, math.pi)                # punggung ke kamera (kamera di -Y)
w['rig'].scale = (0.86, 0.9, 0.93)
bpy.context.view_layer.update()
pb = w['pb']

# pose menulis: lengan atas maju, siku menekuk, kepala sedikit menunduk
def arm_forward(s, up_deg, fore_deg):
    ua = pb['upper_arm.' + s]; fa = pb['forearm.' + s]
    ax = int(os.environ.get('AX', '0'))
    r = list(ua.rotation_euler); r[ax] += math.radians(up_deg); ua.rotation_euler = r
    fr_ = [0, 0, 0]; fr_[int(os.environ.get('FAX', '0'))] = math.radians(fore_deg); fa.rotation_euler = fr_
UP = float(os.environ.get('UP', '45')); FORE = float(os.environ.get('FORE', '70'))
arm_forward('L', UP, FORE); arm_forward('R', UP, FORE)
P.head_turn(w, 1, 0, 14)

def attach(obj, bone, world_loc):
    obj.parent = w['rig']; obj.parent_type = 'BONE'; obj.parent_bone = bone
    bpy.context.view_layer.update(); obj.matrix_world = Matrix.Translation(world_loc) @ Matrix.Diagonal((*obj.scale, 1.0))
hairm = P.mat('hairlong', HAIR)
hb = w['rig'].matrix_world @ pb['spine.003'].head
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=1.0); hair = bpy.context.active_object; hair.scale = (0.16, 0.11, 0.25)
hair.data.materials.append(hairm); attach(hair, 'spine.003', hb + Vector((0, 0.035, 0.0)))
hair.select_set(False)
for p in hair.data.polygons: p.use_smooth = True

# napas pelan + kepala mengangguk kecil (menulis)
P.breathe(w, TOTAL, amp=0.015)
for f, nod in ((1, 14), (TOTAL // 2, 18), (TOTAL, 14)): P.head_turn(w, f, 0, nod)

# ---------- cahaya: lampu meja hangat dari depan-kanan (rim di tepi bahu), isi dingin dari jendela ----------
key = bpy.data.objects.new('desk', bpy.data.lights.new('desk', 'POINT')); key.data.energy = 120; key.data.color = (1.0, 0.72, 0.45)
key.data.use_shadow = False; key.location = (0.6, 0.9, 1.5); sc.collection.objects.link(key)
fill = bpy.data.objects.new('win', bpy.data.lights.new('win', 'SUN')); fill.data.energy = 0.6; fill.data.color = (0.6, 0.72, 0.9)
fill.data.use_shadow = False; fill.rotation_euler = (math.radians(55), 0, math.radians(200)); sc.collection.objects.link(fill)
back = bpy.data.objects.new('back', bpy.data.lights.new('back', 'POINT')); back.data.energy = 60; back.data.color = (0.75, 0.82, 1.0)
back.data.use_shadow = False; back.location = (-0.9, -2.2, 2.2); sc.collection.objects.link(back)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.01, 0.01, 0.012, 1)

# ---------- kamera: di belakang, sedikit di atas, framing pinggang ke atas ----------
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = float(os.environ.get('LENS', '75')); sc.collection.objects.link(cam); sc.camera = cam
look = Vector((0, 0, 1.45)); loc = Vector((0.22, -2.3, 1.72))
cam.location = loc; cam.rotation_euler = (look - loc).to_track_quat('-Z', 'Y').to_euler()

# ---------- render ----------
sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
sc.render.film_transparent = True; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'
sc.render.fps = 30; sc.frame_start = 1; sc.frame_end = TOTAL
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'montes.blend'))
if os.environ.get('ONLY'):
    for f in [int(x) for x in os.environ['ONLY'].split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(D, 'stills', os.environ.get('TAG', 'montes') + '_%04d' % f); bpy.ops.render.render(write_still=True)
else:
    sc.frame_step = 2                                  # on twos: hanya frame ganjil (1, 3, 5, ...)
    sc.render.filepath = os.path.join(D, 'frames_montes', 'f_'); bpy.ops.render.render(animation=True)
