# Pasangan di galeri (WajahDiLukisan, adegan 1): dua tokoh PSX dari belakang, latar transparan,
# disusun sebagai billboard di lorong CSS 3D Remotion. Perempuan menoleh ke pasangannya pada kata "menoleh".
#   blender -b --factory-startup -P couple_scene.py -- <outdir> <base_mesh.glb> <repo motion-video> [lebar tinggi]
import bpy, sys, os, json, math
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import psx_lib as P

args = sys.argv[sys.argv.index('--') + 1:]
D, GLB, REPO = args[0], args[1], args[2]
RES = (int(args[3]), int(args[4])) if len(args) >= 5 else (320, 320)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
P.GLB = GLB

# ---------- timing dari VO ----------
words = json.load(open(os.path.join(REPO, 'src/Videos/wajah-words.json')))
caps = json.load(open(os.path.join(REPO, 'src/Videos/wajah-captions.json')))
def word(clip, text): return [w for w in words if w['clip'] == clip and w['text'] == text][0]['t'] - 0.2
def cap(prefix):
    n = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum())
    return next(c for c in caps if n(c['text']).startswith(n(prefix)))
T0 = 0.4                                                           # = B.leader di Remotion
S1_END = (cap('"Itu kamu')['end'] + cap('Tahun')['start']) / 2
fr = lambda t: int(round((t - T0) * 30)) + 1
TOTAL = fr(S1_END) + 1
F_TURN, F_ITU = fr(word('01-hook', 'menoleh')), fr(cap('"Itu kamu')['start'])
print('timing', dict(total=TOTAL, turn=F_TURN, itu=F_ITU))

# atlas wajah polos (dari belakang wajah tidak terlihat; profil perempuan hanya siluet bertepi cahaya)
import numpy as np
plain = os.path.join(D, 'plain_atlas.png')
img = bpy.data.images.new('plain', 64, 64); img.pixels = [0.55, 0.36, 0.25, 1.0] * (64 * 64); img.filepath_raw = plain; img.file_format = 'PNG'; img.save()
P.ATLAS = plain

man = P.make_char('man', coat='#1b1d23', pants='#202228', hair='#1a1310')
man['rig'].location = (0.36, 0, 0); man['rig'].rotation_euler = (0, 0, math.pi); man['rig'].scale = (1.1, 1.1, 1.0)
woman = P.make_char('woman', coat='#2a1418', pants='#2a1418', hair='#2b1a12')
woman['rig'].location = (-0.4, 0.05, 0); woman['rig'].rotation_euler = (0, 0, math.pi); woman['rig'].scale = (0.86, 0.9, 0.93)
bpy.context.view_layer.update()

def attach(obj, ch, bone, world_loc):
    obj.parent = ch['rig']; obj.parent_type = 'BONE'; obj.parent_bone = bone
    bpy.context.view_layer.update(); obj.matrix_world = Matrix.Translation(world_loc) @ Matrix.Diagonal((*obj.scale, 1.0))
hairm = P.mat('hairlong', '#2b1a12'); skirtm = P.mat('skirt', '#2a1418')
# rambut panjang: bola low-poly memanjang di belakang kepala sampai tulang belikat
hb = woman['rig'].matrix_world @ woman['pb']['spine.003'].head
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=1.0); hair = bpy.context.active_object; hair.scale = (0.15, 0.1, 0.27)
hair.data.materials.append(hairm); attach(hair, woman, 'spine.003', hb + Vector((0, 0.03, 0.02)))
# rok mantel: kerucut 8 sisi dari pinggang ke bawah lutut
pv = woman['rig'].matrix_world @ woman['pb']['spine'].head
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.34, radius2=0.19, depth=0.62); skirt = bpy.context.active_object
skirt.data.materials.append(skirtm); attach(skirt, woman, 'spine', Vector((pv.x, pv.y, 0.66)))
for o in (hair, skirt): o.select_set(False); [p.__setattr__('use_smooth', True) for p in o.data.polygons]

# ---------- animasi ----------
for ch in (man, woman): P.breathe(ch, TOTAL, amp=0.018)
P.head_turn(woman, 1, 0, 4); P.head_turn(woman, F_TURN - 2, 0, 4); P.head_turn(woman, F_TURN + 7, -72, 0); P.head_turn(woman, TOTAL, -74, 0)
P.head_turn(man, 1, 0, 3); P.head_turn(man, F_ITU, 0, 3); P.head_turn(man, F_ITU + 9, 30, -2); P.head_turn(man, TOTAL, 32, -2)
P.key_expr(man, [(1, 0)]); P.key_expr(woman, [(1, 0)])

# ---------- cahaya: sorot lukisan di depan (tepi hangat), isi dingin redup dari arah kamera ----------
for name, e, col, loc in (('spot', 260, (1.0, 0.86, 0.66), (0, 3.2, 2.4)), ('rimL', 55, (1.0, 0.82, 0.6), (-1.3, -0.15, 1.95)), ('rimR', 55, (1.0, 0.82, 0.6), (1.3, -0.15, 1.95)),
                          ('fill', 40, (0.55, 0.64, 0.8), (0.3, -3.2, 2.2))):
    L = bpy.data.objects.new(name, bpy.data.lights.new(name, 'POINT')); L.data.energy = e; L.data.color = col; L.data.use_shadow = False; L.location = loc; sc.collection.objects.link(L)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 68; sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, -4.6, 1.62); cam.rotation_euler = (Vector((0, 0, 0.98)) - cam.location).to_track_quat('-Z', 'Y').to_euler()

from bpy_extras import anim_utils
for ch in (man, woman):
    ad = ch['rig'].animation_data
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    for fc in (cb.fcurves if cb else []):
        for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'; kp.easing = 'EASE_IN_OUT'

sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0; sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.render.fps = 30; sc.frame_start = 1; sc.frame_end = int(os.environ.get('FRAMES', TOTAL))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'couple.blend'))
ONLY = os.environ.get('ONLY')
if ONLY:
    for f in [int(x) for x in ONLY.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(D, 'stills_couple', 'f_%04d' % f); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(D, 'frames_couple', 'f_'); bpy.ops.render.render(animation=True); print('rendered', sc.frame_end)
