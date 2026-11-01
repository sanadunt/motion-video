"""
Siapkan lapisan komposisi CrewReveal dari cutout manual per karakter.

Masukan: 7 PNG transparan dengan ukuran & posisi sama dengan ilustrasi asli (boleh resolusi lebih besar,
misalnya 2604x3683; akan diperkecil ke 1414x2000). Urutan = urutan muncul = urutan kedalaman:
nomor 1 paling depan (gadis jaket biru), 7 paling belakang. Gabungan ketujuhnya = gambar asli.

Keluaran di public/crew/ (semua koordinat dalam ruang gambar 1414x2000):
  front.png             karakter 1 tanpa dua helai rambut bawah (crop, posisi di layers.json)
  hair-left/right.png   helai rambut bawah karakter 1 yang bergoyang
  char-2.png..char-7.png karakter lain; bagian yang tertutup karakter di depannya ditambal selebar
                        BAND px supaya saat lapisan bergerak yang tersingkap adalah tambalan, bukan lubang
  eyes-mask.png         area mata karakter 1 (tanpa rambut di depannya): kelopak kedip hanya digambar di sini
  layers.json           ukuran, kotak tiap lapisan, titik jangkar "muncul", kelopak, warna kulit

File cutout tidak pernah ditimpa; skrip hanya membaca.

Pakai:  python3 scripts/layers/crew_layers.py scripts/layers/crew-source/magz-{1,2,3,4,5,6,7}.png
Butuh:  pip install opencv-python-headless pillow numpy
Koordinat helai rambut & sampel kulit di bawah khusus untuk ilustrasi ini; sesuaikan kalau gambarnya lain.
"""
import json, os, sys
import cv2, numpy as np
from PIL import Image

W, H = 1414, 2000
BAND = 40  # lebar tambalan di balik karakter depan (px, ruang 1414x2000)

srcs = sys.argv[1:]
if len(srcs) != 7:
    sys.exit("butuh 7 file cutout, urut dari depan (1) ke belakang (7)")
out_dir = os.path.join(os.path.dirname(__file__), "..", "..", "public", "crew")
os.makedirs(out_dir, exist_ok=True)


def load(path):
    im = Image.open(path).convert("RGBA")
    if im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    a = np.asarray(im).copy()
    # buang sisa hapusan: komponen terpisah yang hampir transparan (membesarkan kotak lapisan)
    n, lab, _, _ = cv2.connectedComponentsWithStats((a[..., 3] > 0).astype(np.uint8))
    peak = np.zeros(n, np.uint8)
    np.maximum.at(peak, lab.ravel(), a[..., 3].ravel())
    a[..., 3][peak[lab] < 64] = 0
    return a


chars = [load(p) for p in srcs]
masks = [(c[..., 3] > 128).astype(np.uint8) for c in chars]


def bbox(alpha):
    ys, xs = np.where(alpha > 0)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def save_crop(name, rgba):
    x0, y0, x1, y1 = bbox(rgba[..., 3])
    Image.fromarray(rgba[y0:y1, x0:x1]).save(os.path.join(out_dir, f"{name}.png"))
    return {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}


def largest(fg):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
    if n > 1:
        big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        return (lab == big).astype(np.uint8)
    return fg


layers = {"width": W, "height": H, "chars": {}, "strands": {}}

# ---------- 1. karakter depan + dua helai rambut bawah (di atas jaket biru) ----------
a = chars[0]
rgb = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2BGR)
alpha = a[..., 3]
front_fg = masks[0]

STRANDS = {
    "hair-left": (520, 1060, 650, 1235),
    "hair-right": (840, 990, 1060, 1255),
}
strand_masks = {}
for name, (x0, y0, x1, y1) in STRANDS.items():
    region = (slice(y0, y1), slice(x0, x1))
    dark = (rgb[region].max(axis=2) < 95) & (front_fg[region] > 0)
    sm = np.zeros((H, W), np.uint8)
    sm[region] = dark.astype(np.uint8)
    sm = cv2.morphologyEx(sm, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    sm = cv2.morphologyEx(sm, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    sm = largest(sm)
    sm = cv2.morphologyEx(sm, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    soft = (cv2.GaussianBlur(sm.astype(np.float32), (5, 5), 0) * 255).astype(np.uint8)
    strand_masks[name] = np.maximum(soft, sm * 255)
    print(name, "px:", int((sm > 0).sum()))

# karakter depan tanpa helai: isi area helai dengan apa yang ada di sampingnya (secara horizontal),
# utamakan jaket biru kalau ada dekat; alpha ikut piksel sumber. Area dibatasi ke kotak helai supaya
# rambut di luar kotak tidak tersentuh. Dengan begitu helai yang bergoyang tidak meninggalkan lubang.
hole = np.zeros((H, W), np.uint8)
for name, sm in strand_masks.items():
    x0, y0, x1, y1 = STRANDS[name]
    box = np.zeros((H, W), np.uint8)
    box[y0 + 3:y1, x0:x1] = 1  # 3 baris teratas dibiarkan asli: tepi atas helai menempel tanpa garis
    hole |= cv2.dilate((sm > 100).astype(np.uint8), np.ones((7, 7), np.uint8)) & box
blueish = (rgb[..., 0] > 140) & (rgb[..., 2] < 110) & (rgb[..., 1] < 140)  # biru jaket (BGR)
front_rgb = rgb.copy()
front_alpha = alpha.astype(np.float32).copy()
for y, x in zip(*np.where(hole > 0)):
    near = blue = None
    for d in range(1, 160):
        for xx in (x - d, x + d):
            if 0 <= xx < W and hole[y, xx] == 0:
                if near is None:
                    near = (xx, d)
                if blue is None and blueish[y, xx] and alpha[y, xx] > 200:
                    blue = xx
        if blue is not None or (near is not None and d > near[1] + 40):
            break
    src = blue if blue is not None else (near[0] if near is not None else x)
    front_rgb[y, x] = rgb[y, src]
    front_alpha[y, x] = alpha[y, src]
soft = cv2.GaussianBlur(front_rgb, (0, 0), 3)
front_rgb[hole > 0] = soft[hole > 0]
front_png = np.dstack([cv2.cvtColor(front_rgb, cv2.COLOR_BGR2RGB), front_alpha.astype(np.uint8)])
layers["front"] = save_crop("front", front_png)

for name, sm in strand_masks.items():
    ys, xs = np.where(sm > 0)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    crop = np.dstack([a[y0:y1, x0:x1, :3], np.minimum(alpha[y0:y1, x0:x1], sm[y0:y1, x0:x1])])
    Image.fromarray(crop).save(os.path.join(out_dir, f"{name}.png"))
    layers["strands"][name] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}

# ---------- 2. karakter 2..7: tambal bagian yang tertutup karakter di depannya ----------
band_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * BAND + 1, 2 * BAND + 1))
for i in range(1, 7):
    c = chars[i]
    own = masks[i]
    covered = np.zeros((H, W), np.uint8)  # area karakter yang lebih depan (digambar di atasnya)
    for j in range(i):
        covered |= (chars[j][..., 3] > 8).astype(np.uint8)
    near = cv2.dilate(own, band_kernel)
    ext = (near > 0) & (covered > 0) & (c[..., 3] < 250)
    c_rgb = cv2.cvtColor(c[..., :3], cv2.COLOR_RGB2BGR)
    fill = cv2.inpaint(c_rgb, (ext & (c[..., 3] < 128)).astype(np.uint8), 7, cv2.INPAINT_TELEA)
    out_rgb = c_rgb.copy()
    weak = ext & (c[..., 3] < 128)
    out_rgb[weak] = fill[weak]
    out_alpha = c[..., 3].copy()
    out_alpha[ext] = 255  # ext selalu di dalam karakter depan, jadi di posisi diam tidak terlihat
    rgba = np.dstack([cv2.cvtColor(out_rgb, cv2.COLOR_BGR2RGB), out_alpha])

    # titik jangkar: pusat kontak dengan karakter di depannya -> karakter "keluar dari belakang" sini
    contact = (own > 0) & (cv2.dilate(covered, np.ones((9, 9), np.uint8)) > 0)
    if contact.sum() < 50:
        contact = own > 0
    ys, xs = np.where(contact)
    info = save_crop(f"char-{i + 1}", rgba)
    info["anchor"] = {"x": int(np.median(xs)), "y": int(np.median(ys))}
    info["patched"] = int(ext.sum())
    layers["chars"][f"char-{i + 1}"] = info
    print(f"char-{i + 1}", info)

# ---------- 3. kelopak mata karakter 1 ----------
# Poligon = area yang ditutup kelopak (pivot di sisi atas); lash = garis bulu mata saat terpejam.
# Mask = poligon dikurangi piksel rambut (abu-biru gelap, saturasi rendah) supaya kelopak tak menutupi poni.
# coverLash: bulu mata atas (hampir hitam) ikut tertutup, jadi saat terpejam hanya ada satu garis bulu mata.
EYES = {
    "left": {
        "points": "610,958 618,935 635,918 655,910 664,915 664,962 652,969 632,972 616,966",
        "pivotY": 910,
        "coverLash": False,  # bulu mata atas tersembunyi poni; garis hitam di sini milik rambut
        "lash": "M612,960 C625,974 648,974 662,964",
        "skin": (972, 982, 625, 655),  # kotak sampel kulit tepat di bawah mata (y0, y1, x0, x1)
    },
    "right": {
        "points": "743,908 752,898 770,893 790,893 806,899 818,908 828,918 826,925 814,940 796,948 774,951 754,948 744,940",
        "pivotY": 893,
        "coverLash": True,
        "lash": "M744,938 C768,953 802,950 824,927",
        "skin": (956, 966, 760, 800),
    },
}
argb = a[..., :3].astype(int)
slate = (argb.max(2) < 140) & ((argb.max(2) - argb.min(2)) < 50)
black = argb.max(2) < 60
eye_mask = np.zeros((H, W), np.uint8)
layers["eyes"] = {}
for side, e in EYES.items():
    pts = np.array([[int(v) for v in q.split(",")] for q in e["points"].split()], np.int32)
    poly = np.zeros((H, W), np.uint8)
    cv2.fillPoly(poly, [pts], 1)
    hair_px = slate & ~black if e["coverLash"] else slate
    m = ((poly > 0) & ~hair_px).astype(np.uint8)
    ff = m.copy()
    cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    m |= ((ff == 0) & (poly > 0)).astype(np.uint8)  # isi bagian gelap iris yang tertutup
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))) & poly
    eye_mask |= m
    y0, y1, x0, x1 = e["skin"]
    px = a[y0:y1, x0:x1, :3].reshape(-1, 3)
    layers["eyes"][side] = {
        "points": e["points"],
        "pivotY": e["pivotY"],
        "lash": e["lash"],
        "skin": "#%02X%02X%02X" % tuple(np.median(px, axis=0).astype(int)),
    }
eye_mask = cv2.dilate(eye_mask, np.ones((5, 5), np.uint8))  # sedikit lebih lebar agar garis bulu mata utuh
eye_alpha = (cv2.GaussianBlur(eye_mask.astype(np.float32), (3, 3), 0) * 255).astype(np.uint8)
eye_rgba = np.dstack([np.full((H, W, 3), 255, np.uint8), eye_alpha])
layers["eyeMask"] = save_crop("eyes-mask", eye_rgba)

with open(os.path.join(out_dir, "layers.json"), "w") as f:
    json.dump(layers, f, indent=2)
print(json.dumps(layers))
