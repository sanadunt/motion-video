# Rip ekspresi wajah dari video -> atlas 8 sel + urutan wajah (tekstur video), sudah dipixelize gaya PS1.
#   <face-tools venv>/bin/python -I rip_face.py <video> <outdir> [--cell 64] [--colors 32] [--fps 30]
#                                               [--model face_landmarker.task] [--start 0] [--end 0]
# Butuh: mediapipe + opencv + numpy (venv motion-starters/referensi/face-tools/.venv) dan model face_landmarker.task.
# Hasil di <outdir>:
#   atlas_8.png  8 sel berjajar (layout psx-character: diam, kedip, A, O, E, senyum, takut, seram)
#   seq/f_0001.png ...  wajah per frame (30 fps), untuk FACE_SEQ di psx_char.py
#   meta.json    warna kulit sisi kepala (SKIN_HEX), sumber tiap sel (frame asli / sintetis) + skor
#   preview.png  atlas diperbesar + contoh urutan
# Wajah diluruskan supaya mata di (31%, 35%) & (69%, 35%) dan tengah mulut di (50%, 72%) sel, sama dengan atlas kartun.
import sys, os, json, math
import numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

a = sys.argv[1:]
VIDEO, OUT = a[0], a[1]
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
S, K, FPS = opt('--cell', 64), opt('--colors', 32), opt('--fps', 30)
MODEL = opt('--model', '/Users/mac/Magz Motion/motion-starters/referensi/face-tools/models/face_landmarker.task')
T0, T1 = opt('--start', 0.0), opt('--end', 0.0)
FIT = opt('--fit', '')   # head_layout.json dari psx_char.py (LAYOUT_OUT): crop dicocokkan ke bentuk kepala 3D
os.makedirs(os.path.join(OUT, 'seq'), exist_ok=True)

# ---------- 1. landmark + skor ekspresi tiap frame ----------
cap = cv2.VideoCapture(VIDEO); vfps = cap.get(cv2.CAP_PROP_FPS) or 25
lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.VIDEO,
    num_faces=1, output_face_blendshapes=True))
frames, pts, bs = [], [], []
i = 0
while True:
    ok, img = cap.read()
    if not ok: break
    t = i / vfps; i += 1
    if t < T0 or (T1 and t > T1): continue
    res = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)), int(t * 1000))
    if not res.face_landmarks: continue
    h, w = img.shape[:2]
    p = np.array([[q.x * w, q.y * h] for q in res.face_landmarks[0]], np.float32)
    frames.append((t, img)); pts.append(p); bs.append({c.category_name: c.score for c in res.face_blendshapes[0]})
print(f'{len(frames)} frame berwajah dari {i} frame ({vfps:.0f} fps)')
if not frames: sys.exit('tidak ada wajah terdeteksi')

# ---------- 2. meluruskan wajah: 3 titik (mata kiri, mata kanan, tengah mulut), dihaluskan antarframe ----------
EYE_R, EYE_L, MOUTH = (33, 133), (362, 263), (61, 291, 13, 14)
def key3(p): return np.array([p[list(EYE_R)].mean(0), p[list(EYE_L)].mean(0), p[list(MOUTH)].mean(0)], np.float32)
K3 = np.array([key3(p) for p in pts]); KS = K3.copy()
for j in range(len(K3)):                                     # rata-rata bergerak +-2 frame (kurangi getar landmark)
    KS[j] = K3[max(0, j - 2):j + 3].mean(0)
DST = np.array([[0.31, 0.35], [0.69, 0.35], [0.50, 0.72]], np.float32)
SUP = 4                                                      # supersample lalu perkecil (area) = pixelize bersih
def aligned(img, k3, size):
    # urutan mata di gambar: mata kanan subjek tampak di kiri penonton
    src = k3 if k3[0][0] < k3[1][0] else k3[[1, 0, 2]]
    M, _ = cv2.estimateAffinePartial2D(src, DST * size)
    return cv2.warpAffine(img, M, (size, size), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE), M

big = [aligned(img, KS[j], S * SUP) for j, (_, img) in enumerate(frames)]
small = [cv2.resize(b, (S, S), interpolation=cv2.INTER_AREA) for b, _ in big]

# ---------- 3. palet bersama (k-means) + topeng oval wajah ----------
yy, xx = np.mgrid[0:S, 0:S]
cx, cy = (xx - (S - 1) / 2) / (S / 2), (yy - (S - 1) / 2) / (S / 2)
R = cx * cx * 1.1 + cy * cy * 0.7
oval = R <= 0.7
# warna kulit sisi kepala = median cincin tepi wajah (pipi luar, rahang), bagian bawah-samping saja (dahi bisa kena rambut)
rim = (R > 0.5) & (R <= 0.68) & (yy > S * 0.45)
skin = np.median(np.concatenate([s[rim].reshape(-1, 3) for s in small[::3]]), 0)
# tepi oval dilembutkan ke warna kulit: R 0.45 -> 0.7 (supaya batas tekstur dan kepala tidak terlihat)
# dagu bawah ikut dipudarkan (bayangan leher di video jadi bintik gelap di batas dagu-leher)
FADE = np.maximum(np.clip((R - 0.45) / 0.25, 0, 1), np.clip((yy / S - 0.84) / 0.07, 0, 1))[..., None].astype(np.float32)
# ubin kulit dari kulit wajah video itu sendiri (pipi + dahi), dipakai juga untuk kepala/leher/tangan di Blender
rng = np.random.default_rng(7); B = max(4, S // 16)
boxes = [(.5, .66, .14, .3), (.5, .66, .7, .86), (.12, .22, .35, .65)]   # (y0, y1, x0, x1) dalam pecahan sel
patches = []
for s_ in small[::max(1, len(small) // 12)]:
    for y0, y1, x0, x1 in boxes:
        for y in range(int(S * y0), int(S * y1) - B + 1, B):
            for x in range(int(S * x0), int(S * x1) - B + 1, B):
                patches.append(s_[y:y + B, x:x + B].astype(np.float32))
# buang potongan yang kena rambut/bayangan/latar: dibanding median semua potongan (kulit dominan)
mc = np.median([p.mean((0, 1)) for p in patches], 0)
n_all = len(patches); patches = [p for p in patches if np.abs(p.mean((0, 1)) - mc).mean() < 0.12 * mc.mean() and p.min() > 0.5 * mc.min() and p.std() < 24]
if not patches: patches = [np.ones((B, B, 3), np.float32) * skin]
print("ubin kulit dari", len(patches), "dari", n_all, "potongan")
tile = np.zeros((S, S, 3), np.float32)
for y in range(0, S, B):
    for x in range(0, S, B):
        p = patches[rng.integers(len(patches))]
        tile[y:y + B, x:x + B] = p[:, ::-1] if rng.random() < 0.5 else p
tile = cv2.GaussianBlur(tile, (0, 0), 1.2)
tile += skin - tile.reshape(-1, 3).mean(0)                    # rata-rata ubin = warna kulit tepi wajah
TILE = np.clip(tile, 0, 255)
EDGE = (R > 0.36)[..., None]
def fade(im):
    im = im.astype(np.float32)
    # helai rambut/bayangan yang masuk ke pinggir oval (jauh lebih gelap dari kulit) -> ganti ubin kulit
    dark = (im.mean(-1, keepdims=True) < 0.62 * skin.mean()) & EDGE
    im = np.where(dark, TILE, im)
    return im * (1 - FADE) + TILE * FADE
sample = np.concatenate([fade(s)[oval].reshape(-1, 3) for s in small[::3]]).astype(np.float32)
_, _, pal = cv2.kmeans(sample, K - 1, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3, cv2.KMEANS_PP_CENTERS)
pal = np.vstack([pal, skin[None]]).astype(np.float32)
def quant(im):
    im = fade(im)
    d = ((im.reshape(-1, 1, 3).astype(np.float32) - pal[None]) ** 2).sum(-1)
    q = pal[d.argmin(1)].reshape(im.shape).astype(np.uint8)
    q[~oval] = pal[((TILE[~oval].reshape(-1, 1, 3) - pal[None]) ** 2).sum(-1).argmin(1)].astype(np.uint8)   # luar oval = ubin kulit
    return q

# ---------- 4. urutan wajah 30 fps (untuk FACE_SEQ) ----------
seq_q = []
times = np.array([t for t, _ in frames]); n_out = int((times[-1] - times[0]) * FPS) + 1
for f in range(n_out):
    j = int(np.abs(times - (times[0] + f / FPS)).argmin())
    q_ = quant(small[j]); cv2.imwrite(os.path.join(OUT, 'seq', f'f_{f + 1:04d}.png'), q_); seq_q.append(q_)

# ---------- 5. pilih frame terbaik untuk tiap ekspresi ----------
g = lambda b, *n: sum(b.get(x, 0) for x in n)
def yaw(p):                                                  # hidung (1) relatif ke tengah kedua mata, dinormalkan jarak mata
    e1, e2 = p[list(EYE_R)].mean(0), p[list(EYE_L)].mean(0)
    return abs((p[1][0] - (e1[0] + e2[0]) / 2) / (abs(e2[0] - e1[0]) + 1e-6))
SCORE = {
    'rest':   lambda b: -g(b, 'jawOpen', 'eyeBlinkLeft', 'eyeBlinkRight', 'mouthSmileLeft', 'mouthSmileRight', 'mouthFunnel', 'browInnerUp'),
    'blink':  lambda b: g(b, 'eyeBlinkLeft', 'eyeBlinkRight') / 2 - g(b, 'jawOpen'),
    'A':      lambda b: g(b, 'jawOpen') - g(b, 'mouthFunnel', 'mouthPucker'),
    'O':      lambda b: g(b, 'mouthFunnel', 'mouthPucker') + 0.5 * g(b, 'jawOpen') - g(b, 'mouthStretchLeft', 'mouthStretchRight'),
    'E':      lambda b: g(b, 'mouthStretchLeft', 'mouthStretchRight') + 0.3 * g(b, 'jawOpen') - g(b, 'mouthFunnel'),
    'smile':  lambda b: g(b, 'mouthSmileLeft', 'mouthSmileRight') / 2 - g(b, 'jawOpen'),
    'scared': lambda b: g(b, 'browInnerUp') + g(b, 'eyeWideLeft', 'eyeWideRight') / 2 + 0.5 * g(b, 'jawOpen'),
}
# frame dianggap asli kalau salah satu skor relevan melewati ambang; kalau tidak, bentuknya digambar (sintetis)
# E tidak pernah disintesis (meremas mulut A memunculkan garis bibir ganda): pakai frame E terbaik walau lemah,
# atau mulut A kalau frame itu mulutnya tertutup.
NEED = {'A': (('jawOpen',), 0.25), 'O': (('mouthFunnel', 'mouthPucker'), 0.3),
        'smile': (('mouthSmileLeft', 'mouthSmileRight'), 0.3), 'blink': (('eyeBlinkLeft', 'eyeBlinkRight'), 0.4)}
ORDER = ['rest', 'blink', 'A', 'O', 'E', 'smile', 'scared', 'creepy']
pick, meta_cells = {}, {}
for name, fn in SCORE.items():
    sc = [fn(b) - 0.6 * yaw(p) for b, p in zip(bs, pts)]
    j = int(np.argmax(sc)); pick[name] = j
    real = name not in NEED or max(bs[j].get(k, 0) for k in NEED[name][0]) >= NEED[name][1]
    if name == 'E' and bs[j].get('jawOpen', 0) < 0.08 and 'A' in pick:
        j = pick['A']; pick['E'] = j
    if name == 'E' and max(bs[j].get(k, 0) for k in ('mouthStretchLeft', 'mouthStretchRight')) < 0.15:
        real = 'video (lemah)'
    meta_cells[name] = dict(frame=j, time=round(frames[j][0], 2), source=(real if isinstance(real, str) else ('video' if real else 'sintetis')),
                            scores={k: round(v, 2) for k, v in sorted(bs[j].items(), key=lambda kv: -kv[1])[:4]})

# titik penting di koordinat sel (untuk mulut/mata sintetis)
def to_cell(j, idx):
    _, M = big[j]; p = pts[j][list(idx)]
    return (np.hstack([p, np.ones((len(p), 1))]) @ M.T) / SUP

def synth(name, base):
    """Bentuk mulut/mata yang tidak ada di video, digambar di atas frame 'diam' (ditandai 'sintetis' di meta)."""
    im = base.copy(); j = pick['rest']
    mc = to_cell(j, MOUTH); cxm, cym = mc[:, 0].mean(), mc[:, 1].mean(); mw = abs(mc[1, 0] - mc[0, 0])
    dark, lip, teeth = (20, 12, 14), tuple(int(v) for v in skin * 0.75), (215, 220, 225)
    if name == 'A':
        cv2.ellipse(im, (int(cxm), int(cym + mw * 0.12)), (int(mw * 0.42), int(mw * 0.3)), 0, 0, 360, dark, -1)
        cv2.line(im, (int(cxm - mw * 0.3), int(cym - mw * 0.1)), (int(cxm + mw * 0.3), int(cym - mw * 0.1)), teeth, max(1, S // 32))
    elif name == 'O':
        cv2.ellipse(im, (int(cxm), int(cym + mw * 0.08)), (int(mw * 0.22), int(mw * 0.28)), 0, 0, 360, dark, -1)
    elif name == 'E' and meta_cells['A']['source'] == 'video':
        # E dari mulut "A" asli: diselaraskan ke mulut frame diam, lalu diremas (lebih lebar, lebih pipih)
        src = shift_to_rest(pick['A'], MOUTH)
        sx, sy = 1.12, 0.6
        Mw = np.float32([[sx, 0, cxm * (1 - sx)], [0, sy, cym * (1 - sy)]])
        warped = cv2.warpAffine(src, Mw, (S, S), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE)
        im = mouth_patch(pick['A'], warped, Mw)
    elif name == 'E':
        cv2.ellipse(im, (int(cxm), int(cym)), (int(mw * 0.5), int(mw * 0.13)), 0, 0, 360, dark, -1)
        cv2.line(im, (int(cxm - mw * 0.4), int(cym - mw * 0.03)), (int(cxm + mw * 0.4), int(cym - mw * 0.03)), teeth, max(1, S // 32))
    elif name == 'smile':
        # senyum: sudut bibir frame diam ditarik ke atas (geser piksel asli, tidak menggambar)
        yy_, xx_ = np.mgrid[0:S, 0:S].astype(np.float32)
        u = (xx_ - cxm) / (mw * 0.6)
        lift = mw * 0.14 * np.clip(u * u, 0, 1.6) * np.exp(-((yy_ - cym) / (mw * 0.35)) ** 2)
        im = cv2.remap(im, xx_, (yy_ + lift).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    elif name == 'blink':
        for idx in (EYE_R, EYE_L):
            e = to_cell(j, idx); c = e.mean(0); ew = abs(e[1, 0] - e[0, 0])
            cv2.ellipse(im, (int(c[0]), int(c[1])), (int(ew * 0.7), int(ew * 0.35)), 0, 0, 360, tuple(int(v) for v in skin * 1.05), -1)
            cv2.line(im, (int(c[0] - ew * 0.6), int(c[1])), (int(c[0] + ew * 0.6), int(c[1])), dark, max(1, S // 32))
    elif name == 'creepy':
        for idx in (EYE_R, EYE_L):                           # mata jadi lubang hitam dengan titik merah
            e = to_cell(j, idx); c = e.mean(0); ew = abs(e[1, 0] - e[0, 0])
            cv2.ellipse(im, (int(c[0]), int(c[1])), (int(ew * 0.75), int(ew * 0.55)), 0, 0, 360, (8, 6, 8), -1)
            cv2.circle(im, (int(c[0]), int(c[1])), max(1, S // 40), (20, 20, 130), -1)
        cv2.ellipse(im, (int(cxm), int(cym)), (int(mw * 1.0), int(mw * 0.28)), 0, 0, 360, (12, 8, 10), -1)   # seringai lebar
        for k in range(-4, 5):
            x = int(cxm + k * mw * 0.2)
            cv2.rectangle(im, (x - max(1, S // 64), int(cym - mw * 0.16)), (x + max(1, S // 64), int(cym - mw * 0.02)), teeth, -1)
    return im

# ---------- tempel sebagian wajah tanpa "hidung dobel" ----------
# Bug lama: pita horizontal mulai 58% tinggi sel ikut membawa ujung hidung dari frame lain yang posisinya sedikit
# bergeser -> hidung dobel. Sekarang: (1) sumber digeser dulu supaya pusat mulut/mata-nya tepat di posisi frame diam,
# (2) yang ditempel hanya elips kecil di sekitar mulut/mata, tidak menyentuh hidung.
YY, XX = np.mgrid[0:S, 0:S].astype(np.float32)
def ellipse_mask(cxe, cye, rx, ry):
    r2 = ((XX - cxe) / rx) ** 2 + ((YY - cye) / ry) ** 2
    return np.clip((1 - r2) * 3, 0, 1)[..., None]           # penuh di tengah, tepi lembut, 0 di luar elips
def blend(base, src, m):
    return (base.astype(np.float32) * (1 - m) + src.astype(np.float32) * m).astype(np.uint8)
def shift_to_rest(j, idx):
    d = to_cell(pick['rest'], idx).mean(0) - to_cell(j, idx).mean(0)
    return cv2.warpAffine(small[j], np.float32([[1, 0, d[0]], [0, 1, d[1]]]), (S, S), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
# Bug kedua ("mulut dobel"): elips tetap tidak menutup seluruh bibir frame diam kalau bentuk mulutnya beda,
# jadi bibir lama mengintip di samping bibir baru. Sekarang topeng = GABUNGAN poligon bibir frame diam dan frame
# sumber (landmark kontur luar bibir), dilebarkan beberapa piksel, tepi lembut, dan dipotong di bawah hidung.
LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
EYE_RING = {EYE_R: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            EYE_L: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]}
def poly_mask(polys, grow, top=None):
    m = np.zeros((S, S), np.uint8)
    for p in polys: cv2.fillPoly(m, [np.round(p).astype(np.int32)], 255)
    k = max(1, int(grow)); m = cv2.dilate(m, np.ones((2 * k + 1, 2 * k + 1), np.uint8))
    m = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), max(0.6, k / 2))
    if top is not None: m *= np.clip((YY - top) / 1.5, 0, 1)   # jangan sentuh hidung
    return np.clip(m * 1.4, 0, 1)[..., None]
def shift_vec(j, idx): return to_cell(pick['rest'], idx).mean(0) - to_cell(j, idx).mean(0)
def mouth_patch(j, src_img=None, M2=None):
    """Tempel mulut frame j (sudah digeser ke posisi diam; opsional diwarp M2) ke frame diam."""
    d = shift_vec(j, MOUTH)
    src = shift_to_rest(j, MOUTH) if src_img is None else src_img
    lips_src = to_cell(j, LIPS) + d
    if M2 is not None: lips_src = np.hstack([lips_src, np.ones((len(lips_src), 1))]) @ M2.T
    nose_y = to_cell(pick['rest'], [2])[0, 1] + S * 0.02
    m = poly_mask([to_cell(pick['rest'], LIPS), lips_src], S / 22, top=nose_y)
    return blend(small[pick['rest']], src, m)
def mouth_cell(j): return mouth_patch(j)
def eye_cell(j):
    im = small[pick['rest']].copy()
    for idx, ring in EYE_RING.items():
        d = shift_vec(j, idx)
        m = poly_mask([to_cell(pick['rest'], ring), to_cell(j, ring) + d], S / 28)
        im = blend(im, shift_to_rest(j, idx), m)
    return im

cells = []
for name in ORDER:
    if name == 'creepy':
        im = synth('creepy', small[pick['rest']]); meta_cells['creepy'] = dict(frame=pick['rest'], source='sintetis (dari diam)')
    elif meta_cells[name]['source'] == 'sintetis' and name != 'E':
        im = synth(name, small[pick['rest']])
    elif name in ('A', 'O', 'E', 'smile'):   # hanya mulut dari frame terpilih; mata & hidung tetap dari frame diam
        im = mouth_cell(pick[name])
    elif name == 'blink':                    # hanya mata dari frame terpilih
        im = eye_cell(pick[name])
    else:
        im = small[pick[name]]
    cells.append(quant(im))
# cek otomatis "hidung dobel": di sel yang hanya menempel mulut/mata, kotak hidung harus sama persis dengan sel diam
NOSE = (slice(int(S * 0.42), int(S * 0.6)), slice(int(S * 0.38), int(S * 0.62)))
nose_check = {}
for k, name in enumerate(ORDER):
    if name in ('blink', 'A', 'O', 'E', 'smile'):
        diff = float(np.abs(cells[k][NOSE].astype(int) - cells[0][NOSE].astype(int)).mean())
        nose_check[name] = round(diff, 2)
        if diff > 2.0: print(f'PERINGATAN: area hidung sel {name} berubah (selisih {diff:.1f}); cek hidung dobel')
atlas = np.hstack(cells)
cv2.imwrite(os.path.join(OUT, 'atlas_8.png'), atlas)
# potongan lebar (wajah + rambut asli, tanpa oval) untuk HEAD_MAP=wide: bidang pandang 2x, wajah 50% di tengah
DSTW = np.float32([[0.5 + (x - 0.5) * 0.5, 0.55 + (y - 0.55) * 0.5] for x, y in DST])
jr = pick['rest']; srcw = KS[jr] if KS[jr][0][0] < KS[jr][1][0] else KS[jr][[1, 0, 2]]
SW = S * 2; Mw_, _ = cv2.estimateAffinePartial2D(srcw, DSTW * SW * SUP)
wide = cv2.resize(cv2.warpAffine(frames[jr][1], Mw_, (SW * SUP, SW * SUP), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE), (SW, SW), interpolation=cv2.INTER_AREA)
# segmentasi per piksel (MediaPipe selfie_multiclass: 0 latar, 1 rambut, 2 kulit badan, 3 kulit wajah, 4 baju, 5 lain)
# -> latar diganti warna rambut, baju diganti kulit. Kulit wajah & rambut TIDAK disentuh (dulu: saring warna = wajah bolong).
SEG = opt('--seg', '/Users/mac/Magz Motion/motion-starters/referensi/face-tools/models/selfie_multiclass_256x256.tflite')
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=SEG), output_category_mask=True))
cat = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frames[jr][1], cv2.COLOR_BGR2RGB))).category_mask.numpy_view()
catw = cv2.resize(cv2.warpAffine(cat.astype(np.uint8), Mw_, (SW * SUP, SW * SUP), flags=cv2.INTER_NEAREST, borderValue=0), (SW, SW), interpolation=cv2.INTER_NEAREST)
hairc = np.median(wide[catw == 1], 0) if (catw == 1).any() else np.array([30, 25, 25])
skinc = np.median(wide[catw == 3], 0) if (catw == 3).any() else skin
wide[catw == 0] = hairc.astype(np.uint8)      # latar -> rambut (siluet kepala)
wide[catw == 4] = skinc.astype(np.uint8)      # baju -> kulit (leher)
wide[(catw == 2) & (np.arange(SW)[:, None] < SW * 0.72)] = hairc.astype(np.uint8)   # tangan di atas dagu -> rambut
hairhex = '#%02x%02x%02x' % tuple(int(v) for v in hairc[::-1])
cv2.imwrite(os.path.join(OUT, 'wide_seg.png'), cv2.applyColorMap((catw * 40).astype(np.uint8), cv2.COLORMAP_JET))
_, lab, palw = cv2.kmeans(wide.reshape(-1, 3).astype(np.float32), K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3, cv2.KMEANS_PP_CENTERS)
cv2.imwrite(os.path.join(OUT, 'wide.png'), palw[lab.flatten()].reshape(wide.shape).astype(np.uint8))
# urutan potongan lebar per frame (wajah + rambut bergerak) untuk HEAD_MAP=front + FACE_SEQ: palet & warna rambut/kulit
# tetap dari frame diam supaya tidak berkedip warna antarframe
os.makedirs(os.path.join(OUT, 'seq_wide'), exist_ok=True)
def wide_of(j):
    sw_ = KS[j] if KS[j][0][0] < KS[j][1][0] else KS[j][[1, 0, 2]]
    Mj, _ = cv2.estimateAffinePartial2D(sw_, DSTW * SW * SUP)
    w_ = cv2.resize(cv2.warpAffine(frames[j][1], Mj, (SW * SUP, SW * SUP), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE), (SW, SW), interpolation=cv2.INTER_AREA)
    c_ = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frames[j][1], cv2.COLOR_BGR2RGB))).category_mask.numpy_view()
    c_ = cv2.resize(cv2.warpAffine(c_.astype(np.uint8), Mj, (SW * SUP, SW * SUP), flags=cv2.INTER_NEAREST, borderValue=0), (SW, SW), interpolation=cv2.INTER_NEAREST)
    w_[c_ == 0] = hairc.astype(np.uint8); w_[c_ == 4] = skinc.astype(np.uint8)
    w_[(c_ == 2) & (np.arange(SW)[:, None] < SW * 0.72)] = hairc.astype(np.uint8)   # tangan/lengan di atas dagu -> rambut
    d_ = ((w_.reshape(-1, 1, 3).astype(np.float32) - palw[None]) ** 2).sum(-1)
    return palw[d_.argmin(1)].reshape(w_.shape).astype(np.uint8)
_cache = {}
for f_ in range(n_out):
    j_ = int(np.abs(times - (times[0] + f_ / FPS)).argmin())
    if j_ not in _cache: _cache = {j_: wide_of(j_)}
    cv2.imwrite(os.path.join(OUT, 'seq_wide', f'f_{f_ + 1:04d}.png'), _cache[j_])
print('seq_wide', n_out, 'frame')
tq = pal[((TILE.reshape(-1, 1, 3) - pal[None]) ** 2).sum(-1).argmin(1)].reshape(TILE.shape).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, 'skin_tile.png'), tq)
cv2.imwrite(os.path.join(OUT, 'rest.png'), cells[0])        # 1 sel (diam) untuk HEAD_MAP planar/cyl/cyl360        # SKIN_TILE untuk psx_char.py (kepala, leher, tangan)
prev = cv2.resize(atlas, (atlas.shape[1] * 4, atlas.shape[0] * 4), interpolation=cv2.INTER_NEAREST)
seqprev = np.hstack([cv2.resize(quant(small[j]), (S * 4, S * 4), interpolation=cv2.INTER_NEAREST)
                     for j in np.linspace(0, len(small) - 1, 8).astype(int)])
cv2.imwrite(os.path.join(OUT, 'preview.png'), np.vstack([prev, seqprev]))
hexskin = '#%02x%02x%02x' % tuple(int(v) for v in skin[::-1])   # BGR -> RGB
json.dump(dict(video=os.path.basename(VIDEO), cell=S, colors=K, fps=FPS, seq_frames=n_out, skin_hex=hexskin, hair_hex=hairhex, nose_check=nose_check,
               cells={n: meta_cells[n] for n in ORDER}), open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
print('kulit', hexskin, '| sel:', {n: meta_cells[n]['source'] for n in ORDER}, '| urutan', n_out, 'frame')

# ---------- 6. crop cerdas: wajah dibengkokkan (thin-plate spline) ke titik wajah kepala 3D ----------
if FIT:
    L = json.load(open(FIT)); TW = S * 2; TH = int(round(TW / L['aspect']))
    jr = pick['rest']; c = lambda idx: to_cell(jr, idx).mean(0)
    # landmark video (koordinat sel) -> target (piksel tekstur kepala: u ke kanan, v dagu=0 ke atas)
    pairs = [(c([152]), L['chin']), (c(MOUTH), L['mouth']), (c([1]), L['nose']), (c(EYE_R), L['eyeL']), (c(EYE_L), L['eyeR']),
             (c([10]), L['hairline']), (c([234]), L['cheekL']), (c([454]), L['cheekR'])]
    if c(EYE_R)[0] > c(EYE_L)[0]:   # urutan mata kiri/kanan penonton
        pairs[3], pairs[4] = (c(EYE_L), L['eyeL']), (c(EYE_R), L['eyeR'])
    src = np.array([p for p, _ in pairs], np.float64)
    dst = np.array([[u * TW, (1 - v) * TH] for _, (u, v) in pairs], np.float64)
    def tps(dp, sp):                       # peta tujuan -> sumber (warp terbalik)
        n = len(dp); Uf = lambda r: np.where(r > 0, r * r * np.log(r + 1e-12), 0)
        K = Uf(np.linalg.norm(dp[:, None] - dp[None], axis=-1)); Pm = np.hstack([np.ones((n, 1)), dp])
        A = np.zeros((n + 3, n + 3)); A[:n, :n] = K + np.eye(n) * 1e-3; A[:n, n:] = Pm; A[n:, :n] = Pm.T
        Wt = np.linalg.solve(A, np.vstack([sp, np.zeros((3, 2))]))
        gy, gx = np.mgrid[0:TH, 0:TW]; g = np.stack([gx.ravel(), gy.ravel()], 1).astype(np.float64)
        out = Uf(np.linalg.norm(g[:, None] - dp[None], axis=-1)) @ Wt[:n] + np.hstack([np.ones((len(g), 1)), g]) @ Wt[n:]
        return out[:, 0].reshape(TH, TW).astype(np.float32), out[:, 1].reshape(TH, TW).astype(np.float32)
    mx, my = tps(dst, src)
    warp = lambda im: cv2.remap(im, mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(os.path.join(OUT, 'atlas_8_fit.png'), np.hstack([warp(cc) for cc in cells]))
    cv2.imwrite(os.path.join(OUT, 'rest_fit.png'), warp(cells[0]))
    os.makedirs(os.path.join(OUT, 'seq_fit'), exist_ok=True)
    for k, q_ in enumerate(seq_q): cv2.imwrite(os.path.join(OUT, 'seq_fit', f'f_{k + 1:04d}.png'), warp(q_))
    dbg = cv2.resize(warp(cells[0]), (TW * 4, TH * 4), interpolation=cv2.INTER_NEAREST)
    for (u, v) in [t for _, t in pairs]:
        cv2.circle(dbg, (int(u * TW * 4), int((1 - v) * TH * 4)), 5, (60, 220, 60), -1)   # hijau = titik target kepala 3D
    cv2.imwrite(os.path.join(OUT, 'fit_debug.png'), dbg)
    print(f'fit: tekstur kepala {TW}x{TH} (atlas_8_fit.png, rest_fit.png, seq_fit/); CELLS=8 untuk atlas')
