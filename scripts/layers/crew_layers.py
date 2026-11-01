"""
Pisahkan ilustrasi grup (PNG transparan) menjadi lapisan untuk komposisi CrewReveal:

  public/crew/back.png        gambar utuh, area gadis depan ditambal (lapisan belakang)
  public/crew/front.png       gadis depan tanpa dua helai rambut bawah
  public/crew/hair-left.png   helai rambut kiri (crop, posisi di layers.json)
  public/crew/hair-right.png  helai rambut kanan
  public/crew/layers.json     ukuran gambar, kotak helai rambut, warna kulit

Mask manual: kalau ada public/crew/front-mask.png (putih = gadis depan, hitam = lainnya,
ukuran sama dengan gambar sumber), file itu dipakai sebagai pengganti GrabCut.

Pakai:  python3 scripts/layers/crew_layers.py <gambar-sumber.png|webp>
Butuh:  pip install opencv-python-headless pillow numpy
Koordinat di bawah khusus untuk ilustrasi 1414x2000 ini; sesuaikan kalau gambarnya lain.
"""
import json, os, sys
import cv2, numpy as np
from PIL import Image

src = sys.argv[1]
out_dir = os.path.join(os.path.dirname(__file__), "..", "..", "public", "crew")
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src).convert("RGBA")
a = np.asarray(im).copy()
rgb = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2BGR)
alpha = a[..., 3]
H, W = alpha.shape


def grabcut(mask_init, iters=6):
    bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
    m = mask_init.copy()
    cv2.grabCut(rgb, m, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return np.isin(m, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8)


def largest(fg):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
    if n > 1:
        big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        return (lab == big).astype(np.uint8)
    return fg


def keep_touching(fg, seeds):
    """Pertahankan semua komponen yang menyentuh salah satu kotak seed (y0,y1,x0,x1)."""
    n, lab, _, _ = cv2.connectedComponentsWithStats(fg)
    keep = set()
    for (y0, y1, x0, x1) in seeds:
        keep |= set(np.unique(lab[y0:y1, x0:x1])) - {0}
    return np.isin(lab, list(keep)).astype(np.uint8)


def feather(fg, close=9, blur=5):
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((close, close), np.uint8))
    return (cv2.GaussianBlur(fg.astype(np.float32), (blur, blur), 0) * 255).astype(np.uint8)


# ---------- 1. gadis depan ----------
m = np.full((H, W), cv2.GC_PR_BGD, np.uint8)
m[alpha < 10] = cv2.GC_BGD
box = (slice(730, H), slice(190, 1060))
m[box][alpha[box] >= 10] = cv2.GC_PR_FGD
m[:, 0:200] = cv2.GC_BGD
m[0:730, :] = cv2.GC_BGD
m[600:1000, 330:560] = cv2.GC_BGD      # wajah pria topi
m[760:1200, 1080:W] = cv2.GC_BGD       # kepala pria zirah
m[1200:H, 1150:W] = cv2.GC_BGD         # badan pria zirah
red = (rgb[..., 2] > 140) & (rgb[..., 1] < 90) & (rgb[..., 0] < 90)
m[(red) & (np.arange(W)[None, :] < 420)] = cv2.GC_BGD   # gaun merah (kiri)
m[900:1050, 620:820] = cv2.GC_FGD      # wajah
m[1250:1900, 450:950] = cv2.GC_FGD     # jaket
m[760:880, 620:900] = cv2.GC_FGD       # puncak rambut
light = rgb.min(axis=2) > 200
fur = np.zeros((H, W), bool); fur[950:1200, 930:W] = True
m[light & fur] = cv2.GC_BGD            # bulu kerah pria zirah (putih) di dekat rambut kanan
m[1700:H, 0:320] = cv2.GC_BGD          # rok gadis merah (kiri bawah)
# rompi biru pria bertopi: warnanya sama dengan jaket, jadi dikeluarkan dengan poligon tegas
VEST = np.array([[150, 960], [600, 960], [600, 1105], [545, 1225], [350, 1300], [230, 1390], [150, 1450]], np.int32)
vest_mask = np.zeros((H, W), np.uint8)
cv2.fillPoly(vest_mask, [VEST], 1)
m[vest_mask > 0] = cv2.GC_BGD
m[1250:1480, 900:985] = cv2.GC_FGD     # lengan kanan dekat bulu kerah
m[1400:1500, 280:430] = cv2.GC_FGD     # lengan kiri
m[1060:1130, 660:770] = cv2.GC_FGD     # leher
m[1120:1200, 560:860] = cv2.GC_FGD     # kerah jaket
manual_mask = os.path.join(out_dir, "front-mask.png")
if os.path.exists(manual_mask):
    # Mask manual (putih = gadis depan) menggantikan GrabCut; ukuran harus sama dengan gambar sumber.
    print("memakai mask manual:", manual_mask)
    mm = np.asarray(Image.open(manual_mask).convert("L"))
    front_fg = (mm > 128).astype(np.uint8)
else:
    front_fg = keep_touching(grabcut(m), [(900, 1050, 620, 820), (1250, 1900, 450, 950), (760, 880, 620, 900)])
front_fg = cv2.morphologyEx(front_fg, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
if not os.path.exists(manual_mask):
    front_fg[vest_mask > 0] = 0
front_fg = cv2.erode(front_fg, np.ones((3, 3), np.uint8))
cv2.imwrite(os.path.join(out_dir, "..", "..", "tmp_front_mask.png"), front_fg * 255)
front_mask = feather(front_fg)

# ---------- 2. helai rambut bawah (di atas jaket biru) ----------
STRANDS = {
    "hair-left": (520, 1060, 650, 1235),
    "hair-right": (840, 990, 1060, 1255),
}
strand_masks = {}
for name, (x0, y0, x1, y1) in STRANDS.items():
    region = (slice(y0, y1), slice(x0, x1))
    crop = rgb[region].astype(int)
    mx = crop.max(axis=2)
    dark = (mx < 95) & (front_fg[region] > 0)
    sm = np.zeros((H, W), np.uint8)
    sm[region] = dark.astype(np.uint8)
    sm = cv2.morphologyEx(sm, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    sm = cv2.morphologyEx(sm, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    sm = largest(sm)
    sm = cv2.morphologyEx(sm, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    soft = (cv2.GaussianBlur(sm.astype(np.float32), (5, 5), 0) * 255).astype(np.uint8)
    strand_masks[name] = np.maximum(soft, sm * 255)
    print(name, "px:", int((sm > 0).sum()))

# ---------- 3. tulis lapisan ----------
layers = {"width": W, "height": H, "strands": {}}

# front tanpa helai: tambal area helai dengan warna jaket sekitar
front_rgb = rgb.copy()
hole = np.zeros((H, W), np.uint8)
for name, sm in strand_masks.items():
    hole |= cv2.dilate((sm > 100).astype(np.uint8), np.ones((7, 7), np.uint8))
# isi lubang helai dengan warna jaket terdekat secara horizontal (hindari warna rambut)
blueish = (rgb[..., 0] > 140) & (rgb[..., 2] < 110) & (rgb[..., 1] < 140)  # biru jaket (BGR)
ys_h, xs_h = np.where(hole > 0)
for y, x in zip(ys_h, xs_h):
    picked = None
    for d in range(1, 160):
        for xx in (x + d, x - d):
            if 0 <= xx < W and hole[y, xx] == 0 and blueish[y, xx] and alpha[y, xx] > 200:
                picked = rgb[y, xx]; break
        if picked is not None: break
    if picked is None:
        picked = np.array([200, 60, 20])  # biru jaket (BGR) sebagai cadangan
    front_rgb[y, x] = picked
soft = cv2.GaussianBlur(front_rgb, (0, 0), 3)
front_rgb[hole > 0] = soft[hole > 0]
front_alpha = np.minimum(alpha, front_mask).astype(np.float32)
for sm in strand_masks.values():
    front_alpha[sm >= 255] = 0   # buang hanya bagian inti helai; tepi lembut helai menimpa front
front_png = np.dstack([cv2.cvtColor(front_rgb, cv2.COLOR_BGR2RGB), front_alpha.astype(np.uint8)])
# helai rambut tetap tampak di front di area yang BUKAN jaket (mis. di atas y0) -> sudah dibatasi kotak
Image.fromarray(front_png).save(os.path.join(out_dir, "front.png"))

for name, sm in strand_masks.items():
    ys, xs = np.where(sm > 0)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = np.dstack([a[y0:y1, x0:x1, :3], np.minimum(alpha[y0:y1, x0:x1], sm[y0:y1, x0:x1])])
    Image.fromarray(crop).save(os.path.join(out_dir, f"{name}.png"))
    layers["strands"][name] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}

# back plate: tambal cincin di sekitar tepi gadis + buramkan bagian dalamnya
fgbin = (front_mask > 128).astype(np.uint8)
# tambal pita DI DALAM tepi gadis (2..30 px ke dalam): di posisi diam tertutup penuh,
# saat lapisan belakang bergeser beberapa px yang tersingkap adalah tambalan, bukan piksel gadis
ring = cv2.erode(fgbin, np.ones((5, 5), np.uint8)) & (1 - cv2.erode(fgbin, np.ones((61, 61), np.uint8)))
back_rgb = cv2.inpaint(rgb, ring, 9, cv2.INPAINT_TELEA)
inner = cv2.erode(fgbin, np.ones((61, 61), np.uint8)).astype(bool)
blurred = cv2.GaussianBlur(back_rgb, (0, 0), 25)
back_rgb[inner] = blurred[inner]
Image.fromarray(np.dstack([cv2.cvtColor(back_rgb, cv2.COLOR_BGR2RGB), alpha])).save(os.path.join(out_dir, "back.png"))

# warna kulit untuk kelopak mata: median pipi
def sample(y0, y1, x0, x1):
    px = a[y0:y1, x0:x1, :3].reshape(-1, 3)
    return "#%02X%02X%02X" % tuple(np.median(px, axis=0).astype(int))
layers["skin"] = sample(985, 1005, 680, 700)
layers["skinLeftEye"] = sample(982, 996, 640, 664)
layers["skinRightEye"] = sample(966, 980, 764, 790)
with open(os.path.join(out_dir, "layers.json"), "w") as f:
    json.dump(layers, f, indent=2)
print(json.dumps(layers))
