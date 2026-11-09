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
oval = (cx * cx * 1.1 + cy * cy * 0.7) <= 0.7
cheek = np.concatenate([s[int(S * .5):int(S * .62), int(S * .2):int(S * .32)].reshape(-1, 3) for s in small[::5]] +
                       [s[int(S * .5):int(S * .62), int(S * .68):int(S * .8)].reshape(-1, 3) for s in small[::5]])
skin = np.median(cheek, 0) * 0.8                             # sisi kepala sedikit lebih gelap dari pipi
sample = np.concatenate([s[oval].reshape(-1, 3) for s in small[::3]]).astype(np.float32)
_, _, pal = cv2.kmeans(sample, K - 1, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3, cv2.KMEANS_PP_CENTERS)
pal = np.vstack([pal, skin[None]]).astype(np.float32)
def quant(im):
    d = ((im.reshape(-1, 1, 3).astype(np.float32) - pal[None]) ** 2).sum(-1)
    q = pal[d.argmin(1)].reshape(im.shape).astype(np.uint8)
    q[~oval] = skin.astype(np.uint8)                          # di luar oval = warna sisi kepala
    return q

# ---------- 4. urutan wajah 30 fps (untuk FACE_SEQ) ----------
times = np.array([t for t, _ in frames]); n_out = int((times[-1] - times[0]) * FPS) + 1
for f in range(n_out):
    j = int(np.abs(times - (times[0] + f / FPS)).argmin())
    cv2.imwrite(os.path.join(OUT, 'seq', f'f_{f + 1:04d}.png'), quant(small[j]))

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
NEED = {'A': (('jawOpen',), 0.25), 'O': (('mouthFunnel', 'mouthPucker'), 0.3), 'E': (('mouthStretchLeft', 'mouthStretchRight'), 0.15),
        'smile': (('mouthSmileLeft', 'mouthSmileRight'), 0.3), 'blink': (('eyeBlinkLeft', 'eyeBlinkRight'), 0.4)}
ORDER = ['rest', 'blink', 'A', 'O', 'E', 'smile', 'scared', 'creepy']
pick, meta_cells = {}, {}
for name, fn in SCORE.items():
    sc = [fn(b) - 0.6 * yaw(p) for b, p in zip(bs, pts)]
    j = int(np.argmax(sc)); pick[name] = j
    real = name not in NEED or max(bs[j].get(k, 0) for k in NEED[name][0]) >= NEED[name][1]
    meta_cells[name] = dict(frame=j, time=round(frames[j][0], 2), source='video' if real else 'sintetis',
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
        # E dari mulut "A" asli: diremas (lebih lebar, lebih pipih) di sekitar tengah mulut
        sx, sy = 1.12, 0.6
        Mw = np.float32([[sx, 0, cxm * (1 - sx)], [0, sy, cym * (1 - sy)]])
        warped = cv2.warpAffine(small[pick['A']], Mw, (S, S), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE)
        yy_, xx_ = np.mgrid[0:S, 0:S].astype(np.float32)   # topeng elips lembut hanya di mulut (hidung tidak ikut)
        mm = np.clip(1.6 - ((xx_ - cxm) / (mw * 0.75)) ** 2 - ((yy_ - cym) / (mw * 0.42)) ** 2, 0, 1)[..., None]
        im = (im.astype(np.float32) * (1 - mm) + warped.astype(np.float32) * mm).astype(np.uint8)
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

def band(lo, hi, feather=3):
    """Topeng horizontal (baris lo..hi dalam pecahan sel) dengan tepi lembut, untuk menempel sebagian wajah."""
    y = np.arange(S, dtype=np.float32)
    m = np.clip((y - lo * S) / feather + 1, 0, 1) * np.clip((hi * S - y) / feather + 1, 0, 1)
    return m[:, None, None]
MOUTH_BAND, EYE_BAND = band(0.58, 1.0), band(0.22, 0.48)
cells = []
rest_img = small[pick['rest']].astype(np.float32)
for name in ORDER:
    if name == 'creepy':
        im = synth('creepy', small[pick['rest']]); meta_cells['creepy'] = dict(frame=pick['rest'], source='sintetis (dari diam)')
    elif meta_cells[name]['source'] == 'sintetis':
        im = synth(name, small[pick['rest']])
    elif name in ('A', 'O', 'E', 'smile'):   # hanya mulut dari frame terpilih; mata tetap dari frame diam
        im = (rest_img * (1 - MOUTH_BAND) + small[pick[name]].astype(np.float32) * MOUTH_BAND).astype(np.uint8)
    elif name == 'blink':                    # hanya mata dari frame terpilih; mulut tetap diam
        im = (rest_img * (1 - EYE_BAND) + small[pick[name]].astype(np.float32) * EYE_BAND).astype(np.uint8)
    else:
        im = small[pick[name]]
    cells.append(quant(im))
atlas = np.hstack(cells)
cv2.imwrite(os.path.join(OUT, 'atlas_8.png'), atlas)
prev = cv2.resize(atlas, (atlas.shape[1] * 4, atlas.shape[0] * 4), interpolation=cv2.INTER_NEAREST)
seqprev = np.hstack([cv2.resize(quant(small[j]), (S * 4, S * 4), interpolation=cv2.INTER_NEAREST)
                     for j in np.linspace(0, len(small) - 1, 8).astype(int)])
cv2.imwrite(os.path.join(OUT, 'preview.png'), np.vstack([prev, seqprev]))
hexskin = '#%02x%02x%02x' % tuple(int(v) for v in skin[::-1])   # BGR -> RGB
json.dump(dict(video=os.path.basename(VIDEO), cell=S, colors=K, fps=FPS, seq_frames=n_out, skin_hex=hexskin,
               cells={n: meta_cells[n] for n in ORDER}), open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
print('kulit', hexskin, '| sel:', {n: meta_cells[n]['source'] for n in ORDER}, '| urutan', n_out, 'frame')
