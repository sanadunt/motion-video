# JUMPSCARE ArsipTiang (ARSIP 06): close-up wajah makhluk dari bawah, cahaya keras dari satu sisi.
# Tafsiran sendiri dari kanon tertulis: dua corong pengeras suara berkarat di tempat kepala, menyatu dengan leher
# dari daging busuk, tanpa mata. Low poly (target 300–800 tris, dicetak di log). Tekstur PNG buatan sendiri.
# 12 frame: 9 frame jumpscare (frame 1 = cue jumpscare di Remotion) + 3 cadangan untuk frame drop/glitch.
#   [ONLY=5] blender -b --factory-startup -P face_scene.py -- <outdir> <repo motion-video> [lebar tinggi]
import bpy, sys, os, math
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tiang_lib as T

args = sys.argv[sys.argv.index('--') + 1:]
D, REPO = args[0], args[1]
RES = (int(args[2]), int(args[3])) if len(args) >= 4 else (270, 480)
os.makedirs(D, exist_ok=True)
sc = T.setup(REPO)
TOTAL = 12

M = T.creature_mats()
head = T.creature_head(M, top=(0, 0, 6.0), seed=7)
neck = T.creature_neck(M, base=(0, 0.05, -1.0), h=7.1, r0=0.4, r1=0.3, seed=5)
parts = head + neck
print('TRIS makhluk', T.tris(parts))

# seluruh makhluk di-parent ke satu empty supaya bisa menoleh/condong sedikit
C = bpy.data.objects.new('C', None); sc.collection.objects.link(C); C.location = (0, 0, 5.2)
bpy.context.view_layer.update()
for o in parts:
    mw = o.matrix_world.copy(); o.parent = C; o.matrix_parent_inverse = C.matrix_world.inverted(); o.matrix_world = mw

# ---------- cahaya: kunci keras dari kiri kamera, isi teal sangat redup dari bawah kanan, rim merah tipis di belakang ----------
key = T.light('key', 'SPOT', '#dfe6ea', 1700, loc=(-2.4, -3.0, 5.5), shadow=False, size=math.radians(55))
key.rotation_euler = (Vector((0, 0, 6.5)) - key.location).to_track_quat('-Z', 'Y').to_euler()
T.light('fill', 'POINT', '#3f6f6a', 60, loc=(1.8, -2.0, 4.6))
T.light('rim', 'POINT', '#ff2a14', 90, loc=(0.6, 2.2, 7.4))
T.light('rim2', 'POINT', '#9fb4c7', 70, loc=(2.6, -0.6, 7.6))   # tepi dingin tipis di corong kanan
T.sky('#020303', '#0b1211', lo=-0.1, hi=0.4)

# ---------- kamera: rendah, menengadah, mendorong (lunge) dengan frame drop (CONSTANT tiap 2 frame) ----------
cam = T.camera(lens=float(os.environ.get('LENS', '18')))
look = Vector((0.0, -0.8, 6.3))
for f, y, x, z, roll in ((1, -3.9, 0.32, 5.75, 0.0), (3, -3.7, 0.3, 5.8, 0.02), (5, -3.55, 0.28, 5.82, -0.03),
                         (7, -3.47, 0.27, 5.84, 0.03), (9, -3.42, 0.26, 5.85, 0.0), (11, -3.4, 0.25, 5.85, 0.01)):
    T.aim(cam, (x, y, z), look, f, roll)
# makhluk condong sedikit ke kamera dan menoleh patah
for f, rz, rx in ((1, -7, 0), (4, -2, 3), (6, 4, 5), (9, 2, 6), (12, 2, 6)):
    C.rotation_euler = (math.radians(rx), 0, math.radians(rz)); C.keyframe_insert('rotation_euler', frame=f)
T.interp([cam, C], 'CONSTANT')

T.render(D, 'face', TOTAL, RES)
