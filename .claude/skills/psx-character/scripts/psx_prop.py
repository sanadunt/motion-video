# Model 3D hasil unduhan -> gaya PSX + still 4 sudut.
#   blender -b --factory-startup -P psx_prop.py -- <model.glb|.gltf|.fbx|.obj> <outdir> [--tris 800] [--tex 64] [--size 2.0]
# Langkah: impor -> gabung verteks dobel -> turunkan segitiga (Decimate) -> skala ke --size -> semua tekstur diperkecil
# ke --tex px dengan interpolasi Closest -> material tanpa kilap -> render 4 sudut 240x320 tanpa antialias -> .blend.
import bpy, bmesh, sys, os, math
from mathutils import Vector

a = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = a[0], a[1]
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
TRIS, TEX, SIZE = opt('--tris', 800), opt('--tex', 64), opt('--size', 2.0)
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
ext = os.path.splitext(SRC)[1].lower()
{'.glb': lambda: bpy.ops.import_scene.gltf(filepath=SRC), '.gltf': lambda: bpy.ops.import_scene.gltf(filepath=SRC),
 '.fbx': lambda: bpy.ops.import_scene.fbx(filepath=SRC), '.obj': lambda: bpy.ops.wm.obj_import(filepath=SRC)}[ext]()
meshes = [o for o in sc.objects if o.type == 'MESH']
before = after = 0
for o in meshes:
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.triangulate(bm, faces=bm.faces); before += len(bm.faces); bm.to_mesh(o.data); bm.free()
ratio = min(1.0, TRIS / max(1, before))
for o in meshes:
    if ratio < 1.0:
        m = o.modifiers.new('psx_decimate', 'DECIMATE'); m.ratio = ratio
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for mod in list(o.modifiers):
        if mod.type == 'DECIMATE': bpy.ops.object.modifier_apply(modifier=mod.name)
    after += len(o.data.polygons)
# skala: sisi terpanjang = SIZE, alas di z=0, tengah di x=y=0
bpy.context.view_layer.update()
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
k = SIZE / max(hi - lo)
root = bpy.data.objects.new('prop_root', None); sc.collection.objects.link(root)
for o in sc.objects:
    if o.parent is None and o is not root: o.parent = root
root.scale = (k, k, k); root.location = (-(lo.x + hi.x) / 2 * k, -(lo.y + hi.y) / 2 * k, -lo.z * k)
# tekstur kecil + Closest, material matte
for img in bpy.data.images:
    if img.size[0] > TEX:
        img.scale(TEX, max(1, int(TEX * img.size[1] / img.size[0])))
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    for n in mat.node_tree.nodes:
        if n.type == 'TEX_IMAGE': n.interpolation = 'Closest'
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Roughness'].default_value = 1.0
            if 'Specular IOR Level' in n.inputs: n.inputs['Specular IOR Level'].default_value = 0.0
# render 4 sudut
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 2.5; sun.data.use_shadow = False
sun.rotation_euler = (math.radians(50), 0, math.radians(-30)); sc.collection.objects.link(sun)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.012, 0.016, 0.012, 1)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 35; sc.collection.objects.link(cam); sc.camera = cam
sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 1; sc.render.filter_size = 0.0
sc.render.resolution_x, sc.render.resolution_y = 240, 320; sc.view_settings.view_transform = 'Standard'
center = Vector((0, 0, (hi.z - lo.z) * k / 2)); dist = SIZE * 1.25
for i, deg in enumerate((0, 40, 80, 150)):
    t = math.radians(deg - 90)
    cam.location = center + Vector((math.cos(t) * dist, math.sin(t) * dist, SIZE * 0.35))
    cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(OUT, f'turn_{i}.png'); bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'prop_psx.blend'))
print(f'segitiga {before} -> {after}, skala {k:.3f}, tekstur <= {TEX}px; still: {OUT}/turn_0..3.png')
