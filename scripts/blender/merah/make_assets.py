# Aset buatan sendiri untuk "Nomor Merah": layar LCD monokrom (font piksel 5x7 sendiri) + tekstur PSX kecil.
# Tidak ada foto, logo, merek, atau gambar orang lain. Deterministik (seed tetap).
#   "<face-tools>/.venv/bin/python" -I scripts/blender/merah/make_assets.py <repo motion-video> <folder kerja>
# Hasil:
#   <kerja>/lcd/{meja,lantai,tutup}/f_####.png  urutan layar 96x64 per frame (tekstur emisi Blender; timing dari cues VO)
#   <repo>/public/3d/merah/lcd/*.png            layar diam untuk sisipan Remotion (inbox, pesan, RED, judul)
#   <repo>/public/3d/merah/tex/*.png            tekstur kayu, ubin, plester, koran, layar forum CRT
import sys, os, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import merah_beats as MB

REPO, WORK = sys.argv[1], sys.argv[2]
LCD_SEQ = os.path.join(WORK, 'lcd')
LCD_PUB = os.path.join(REPO, 'public/3d/merah/lcd')
TEX = os.path.join(REPO, 'public/3d/merah/tex')
for d in (LCD_SEQ, LCD_PUB, TEX): os.makedirs(d, exist_ok=True)
B = MB.beats(REPO)

# ---------------------------------------------------------------- font 5x7
G = {
    'A': '.###./#...#/#...#/#####/#...#/#...#/#...#', 'B': '####./#...#/#...#/####./#...#/#...#/####.',
    'C': '.###./#...#/#..../#..../#..../#...#/.###.', 'D': '####./#...#/#...#/#...#/#...#/#...#/####.',
    'E': '#####/#..../#..../####./#..../#..../#####', 'F': '#####/#..../#..../####./#..../#..../#....',
    'G': '.###./#...#/#..../#.###/#...#/#...#/.####', 'H': '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    'I': '.###./..#../..#../..#../..#../..#../.###.', 'J': '..###/...#./...#./...#./...#./#..#./.##..',
    'K': '#...#/#..#./#.#../##.../#.#../#..#./#...#', 'L': '#..../#..../#..../#..../#..../#..../#####',
    'M': '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', 'N': '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
    'O': '.###./#...#/#...#/#...#/#...#/#...#/.###.', 'P': '####./#...#/#...#/####./#..../#..../#....',
    'Q': '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', 'R': '####./#...#/#...#/####./#.#../#..#./#...#',
    'S': '.####/#..../#..../.###./....#/....#/####.', 'T': '#####/..#../..#../..#../..#../..#../..#..',
    'U': '#...#/#...#/#...#/#...#/#...#/#...#/.###.', 'V': '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
    'W': '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', 'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    'Y': '#...#/#...#/.#.#./..#../..#../..#../..#..', 'Z': '#####/....#/...#./..#../.#.../#..../#####',
    '0': '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', '1': '..#../.##../..#../..#../..#../..#../.###.',
    '2': '.###./#...#/....#/...#./..#../.#.../#####', '3': '####./....#/....#/.###./....#/....#/####.',
    '4': '...#./..##./.#.#./#..#./#####/...#./...#.', '5': '#####/#..../####./....#/....#/#...#/.###.',
    '6': '..##./.#.../#..../####./#...#/#...#/.###.', '7': '#####/....#/...#./..#../.#.../.#.../.#...',
    '8': '.###./#...#/#...#/.###./#...#/#...#/.###.', '9': '.###./#...#/#...#/.####/....#/...#./.##..',
    ' ': '...../...../...../...../...../...../.....', '.': '...../...../...../...../...../.##../.##..',
    ',': '...../...../...../...../.##../..#../.#...', ':': '...../.##../.##../...../.##../.##../.....',
    '?': '.###./#...#/....#/...#./..#../...../..#..', '!': '..#../..#../..#../..#../..#../...../..#..',
    '-': '...../...../...../#####/...../...../.....', '/': '....#/....#/...#./..#../.#.../#..../#....',
    '[': '.###./.#.../.#.../.#.../.#.../.#.../.###.', ']': '.###./...#./...#./...#./...#./...#./.###.',
    '(': '...#./..#../.#.../.#.../.#.../..#../...#.', ')': '.#.../..#../...#./...#./...#./..#../.#...',
    '>': '.#.../..#../...#./....#/...#./..#../.#...', '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#',
    '+': '...../..#../..#../#####/..#../..#../.....', '*': '...../..#../#.#.#/.###./#.#.#/..#../.....',
    'w': '...../...../#...#/#...#/#.#.#/#.#.#/.#.#.', 'd': '....#/....#/.##.#/#..##/#...#/#...#/.####',
}
GA = {k: np.array([[c == '#' for c in row] for row in v.split('/')], bool) for k, v in G.items()}

W, H = 96, 64
BG = np.array((150, 168, 138), float)      # backlight menyala (hijau-abu)
BG_OFF = np.array((92, 104, 88), float)    # backlight mati (LCD reflektif)
PIX = np.array((24, 32, 24), float)
RED = np.array((226, 28, 14), float)

def blank(bg): return np.tile(bg, (H, W, 1)).astype(float)

def put(a, x, y, s, col, sx=1, sy=1, pitch=6, cols=None):
    """tulis teks; cols = warna per karakter (opsional). Mengembalikan x akhir."""
    for i, ch in enumerate(s):
        g = GA.get(ch, GA['?'])
        g2 = np.kron(g, np.ones((sy, sx), bool))
        hh, ww = g2.shape; x0 = x + i * pitch * sx
        c = cols[i] if cols is not None else col
        ys, xs = np.nonzero(g2)
        for yy, xx in zip(ys, xs):
            if 0 <= y + yy < a.shape[0] and 0 <= x0 + xx < a.shape[1]: a[y + yy, x0 + xx] = c
    return x + len(s) * pitch * sx

def rect(a, x, y, w, h, col): a[max(0, y):y + h, max(0, x):x + w] = col
def hline(a, y, col, x0=0, x1=W): a[y, x0:x1] = col

def invert(a, x, y, w, h, bg, pix):
    """kursor: tukar warna latar/piksel di dalam kotak."""
    r = a[y:y + h, x:x + w]; isbg = np.abs(r - bg).sum(axis=2) < 30
    r[isbg] = pix; r[~isbg] = bg

def statusbar(a, pix, ring=False):
    for i, hgt in enumerate((2, 3, 5, 6)): rect(a, 2 + i * 3, 7 - hgt, 2, hgt, pix)       # sinyal
    rect(a, 82, 1, 11, 6, pix); rect(a, 83, 2, 9, 4, a[0, 0].copy()); rect(a, 93, 3, 1, 2, pix)   # baterai
    rect(a, 84, 3, 5, 2, pix)
    if ring:                                                                                # ikon dering berkedip
        for dx in (0, 3, 6): rect(a, 44 + dx, 2, 2, 4, pix)
    hline(a, 9, pix)

NUMBER = '0866-XXX-XXXX'      # awalan 0866 bagian dari rumor; sisa digit disamarkan (lihat brief)

def call_screen(bg, n_red=0, red=RED, header='PANGGILAN MASUK', ring=False, keys=True):
    a = blank(bg); statusbar(a, PIX, ring)
    put(a, (W - len(header) * 6) // 2 + 1, 13, header, PIX)
    cols = [red if i < n_red else PIX for i in range(len(NUMBER))]
    put(a, 3, 27, NUMBER, PIX, sx=1, sy=2, pitch=7, cols=cols)
    if keys:
        hline(a, 53, PIX); put(a, 2, 56, 'ANGKAT', PIX); put(a, W - 2 - 5 * 6 + 1, 56, 'TOLAK', PIX)
    return a

def answer_screen(bg, cursor, red=RED):
    a = blank(bg); statusbar(a, PIX, True)
    put(a, 7, 13, 'ANGKAT?', PIX, sx=2, sy=2, pitch=6)
    put(a, 12, 34, '[YA]', PIX, sy=2); put(a, 46, 34, '[TIDAK]', PIX, sy=2)
    if cursor: invert(a, 10, 32, 28, 18, bg, PIX)
    put(a, 9, 55, NUMBER, red)
    return a

def flood_screen(k, pulse):
    """layar 'memerah': k 0..1 = seberapa jauh merah menjalar (ambang noise tetap), lalu merah penuh berdenyut pelan."""
    a = call_screen(BG_OFF, 0, keys=True)
    rng = np.random.default_rng(8); thr = rng.random((H, W)) * 0.6 + np.abs(np.linspace(-1, 1, H))[:, None] * 0.4
    m = thr < k * 1.05
    isbg = np.abs(a - BG_OFF).sum(axis=2) < 30
    redbg = np.array((205, 24, 12), float) * pulse
    a[m & isbg] = redbg; a[m & ~isbg] = (30, 6, 4)
    return a

def save(a, path, scale=1, rgba=False):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA' if rgba else 'RGB')
    if scale > 1: im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    im.save(path)

def seq(shot):
    d = os.path.join(LCD_SEQ, shot); os.makedirs(d, exist_ok=True)
    t0, t1 = MB.shot_span(B, shot); _, total = MB.span(t0, t1)
    return d, t0, total

def red_count(t):
    """jumlah karakter nomor yang sudah merah di adegan 1 (rumus sama di NomorMerah.tsx untuk bunyi tik)."""
    return int(max(0, min(len(NUMBER), math.floor((t - B['nomor']) / (B['merah1'] - B['nomor']) * len(NUMBER)) + 1))) if t >= B['nomor'] else 0

# ---------------------------------------------------------------- urutan LCD per shot
d, t0, total = seq('meja')
for f in range(1, total + 1):
    t = t0 + (f - 1) / 30
    save(call_screen(BG, red_count(t), ring=(f // 10) % 2 == 0), os.path.join(d, 'f_%04d.png' % f))
print('lcd meja', total)

d, t0, total = seq('lantai')
for f in range(1, total + 1):
    t = t0 + (f - 1) / 30; k = (t - B['memerah']) / 0.5
    if k <= 0: a = call_screen(BG_OFF, 0)
    else: a = flood_screen(min(1, k), 0.86 + 0.14 * math.sin(2 * math.pi * 0.45 * (t - B['memerah'])))
    save(a, os.path.join(d, 'f_%04d.png' % f))
print('lcd lantai', total)

d, t0, total = seq('tutup')
for f in range(1, total + 1):
    t = t0 + (f - 1) / 30
    if t < B['ring']:
        pulse = 0.88 + 0.12 * math.sin(2 * math.pi * 0.4 * (t - t0))
        a = call_screen(np.array((70, 80, 68), float), len(NUMBER), red=np.array((250, 44, 26), float) * pulse, header='1 TAK TERJAWAB', keys=False)
    else:
        k = int((t - B['ring']) * 30)
        a = answer_screen(BG, cursor=(k // 8) % 2 == 0)
    save(a, os.path.join(d, 'f_%04d.png' % f))
print('lcd tutup', total)

# ---------------------------------------------------------------- layar diam untuk Remotion
def envelope(a, x, y, col):
    rect(a, x, y, 7, 5, col); rect(a, x + 1, y + 1, 5, 3, a[0, 0].copy())
    a[y + 1, x + 1] = col; a[y + 1, x + 5] = col; a[y + 2, x + 2] = col; a[y + 2, x + 4] = col; a[y + 3, x + 3] = col

def inbox(n):                  # kotak masuk berisi n pesan berantai; yang terbaru disorot
    a = blank(BG); statusbar(a, PIX)
    put(a, 2, 11, 'KOTAK MASUK  %d' % n, PIX)
    for i in range(n):
        y = 20 + i * 9; envelope(a, 2, y + 1, PIX); put(a, 11, y, 'Fwd: Fwd: Fwd:', PIX)
    invert(a, 0, 19 + (n - 1) * 9, W, 9, BG, PIX)
    return a

PESAN = ('Fwd: Fwd: Fwd:', 'SUDAH 7 ORANG', 'TEWAS DI JAKARTA', 'NOMOR 0866 WARNA', 'MERAH JANGAN', 'DIANGKAT! KIRIM', 'KE SEMUA TEMAN')
def pesan(n):                  # isi pesan (ringkasan isi rumor dengan kata sendiri; bukan kutipan utuh, tanpa nama operator)
    a = blank(BG)
    for i, line in enumerate(PESAN[:n]): put(a, 0 if len(line) == 16 else 1, 1 + i * 9, line, PIX)
    return a

for n in range(1, 6): save(inbox(n), os.path.join(LCD_PUB, 'inbox_%d.png' % n))
# adegan 3b: pesan masuk beruntun (tiap 0,2 dtk), lalu pesan terbuka dan barisnya muncul satu per satu
d, t0, total = seq('inbox')
for f in range(1, total + 1):
    rel = (f - 1) / 30
    a = inbox(min(5, int(rel / 0.2) + 1)) if rel < 1.1 else pesan(min(7, 3 + int((rel - 1.1) / 0.3)))
    save(a, os.path.join(d, 'f_%04d.png' % f))
print('lcd inbox', total)
save(pesan(7), os.path.join(LCD_PUB, 'pesan.png'))
# sisipan adegan 7: layar monokrom dengan kata RED di samping nomor (detail gelombang 2007, Bonhomme 2011)
a = blank(BG); statusbar(a, PIX, True)
put(a, 9, 13, 'INCOMING CALL', PIX)
put(a, 3, 27, 'XXXX-XXX', PIX, sy=2, pitch=7)
rect(a, 62, 25, 32, 18, PIX); put(a, 65, 27, 'RED', BG, sx=1, sy=2, pitch=10)
hline(a, 53, PIX); put(a, 2, 56, 'ANSWER', PIX); put(a, W - 2 - 6 * 6 + 1, 56, 'REJECT', PIX)
save(a, os.path.join(LCD_PUB, 'red.png'))
save(call_screen(BG, len(NUMBER)), os.path.join(LCD_PUB, 'call_red.png'))
save(answer_screen(BG, True), os.path.join(LCD_PUB, 'angkat.png'))
# judul: piksel merah di atas transparan
t = 'NOMOR MERAH'; a = np.zeros((9, len(t) * 6 + 1, 4), float); tmp = np.zeros((9, len(t) * 6 + 1, 3), float)
put(tmp, 1, 1, t, (1, 1, 1)); m = tmp[..., 0] > 0
a[m] = (232, 30, 16, 255); save(a, os.path.join(LCD_PUB, 'title.png'), rgba=True)
print('lcd statis ok')

# ---------------------------------------------------------------- tekstur
def vnoise(n, cx, cy, seed):
    r = np.random.default_rng(seed).random((cy, cx))
    def ax(cells):
        x = np.arange(n) * cells / n; i0 = np.floor(x).astype(int); f = x - i0; f = f * f * (3 - 2 * f); return i0, (i0 + 1) % cells, f
    x0, x1, fx = ax(cx); y0, y1, fy = ax(cy)
    a = r[y0][:, x0]; b = r[y0][:, x1]; c = r[y1][:, x0]; d = r[y1][:, x1]
    fx = fx[None, :]; fy = fy[:, None]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
def ramp(t, a, b): return hexrgb(a)[None, None, :] * (1 - t[..., None]) + hexrgb(b)[None, None, :] * t[..., None]
def q(rgb, name, colors=24):
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    im.save(os.path.join(TEX, name)); print(name, im.size)

N = 128
grain = 0.55 * vnoise(N, 3, 40, 1) + 0.3 * vnoise(N, 6, 64, 2) + 0.15 * vnoise(N, 32, 32, 3)        # serat memanjang sumbu X
plank = (np.arange(N) // 32 % 2)[:, None] * 0.06
wood = ramp(np.clip(grain + plank, 0, 1), '#241710', '#6b4a2e'); wood[np.arange(N) % 32 == 0] *= 0.55
q(wood, 'wood.png')
N = 64
t = 0.6 * vnoise(N, 5, 5, 4) + 0.4 * vnoise(N, 20, 20, 5)
tile = ramp(t, '#8a8f88', '#b9bdb2'); tile[:2, :] = hexrgb('#3d403c'); tile[:, :2] = hexrgb('#3d403c')
q(tile, 'tile.png')
t = 0.5 * vnoise(N, 6, 6, 6) + 0.5 * vnoise(N, 24, 24, 7)
q(ramp(t, '#6f7468', '#a3a694'), 'plaster.png')
t = 0.5 * vnoise(N, 8, 8, 8) + 0.5 * vnoise(N, 30, 30, 9)
q(ramp(t, '#5a4a3a', '#8a7558'), 'triplek.png')
# koran: kolom garis teks (tidak terbaca), judul blok
rng = np.random.default_rng(10); paper = ramp(0.5 * vnoise(N, 8, 8, 11) + 0.5 * vnoise(N, 30, 30, 12), '#b9ad8e', '#d8cdb0')
for col in range(3):
    x0 = 3 + col * 21
    for y in range(14, 62, 3):
        w = int(rng.integers(10, 18)); paper[y, x0:x0 + w] = hexrgb('#3a342a')
paper[4:9, 3:50] = hexrgb('#2a2620'); paper[4:9, 20:22] = hexrgb('#c9bea0'); paper[4:9, 36:38] = hexrgb('#c9bea0')
q(paper, 'koran.png', 16)
# layar forum CRT (teks karangan sendiri, tidak terbaca di 64x48): latar biru tua / putih kebiruan, baris, sorotan merah
def forum(name, bgc, linec, seed, redrow):
    rng = np.random.default_rng(seed); a = np.tile(hexrgb(bgc), (48, 64, 1))
    a[0:5, :] = hexrgb('#27407a'); a[1:4, 2:26] = hexrgb('#d9e2f5')
    for i, y in enumerate(range(8, 46, 4)):
        w = int(rng.integers(18, 52)); a[y:y + 2, 4:4 + w] = hexrgb('#c8281e' if i == redrow else linec)
        a[y:y + 2, 1:3] = hexrgb('#7d8fb5')
    Image.fromarray(a.astype(np.uint8), 'RGB').save(os.path.join(TEX, name)); print(name)
forum('forum_a.png', '#e6ebf5', '#3a4254', 21, 2)
forum('forum_b.png', '#111a33', '#9fb3e0', 22, 4)
forum('forum_c.png', '#e9eee4', '#44503c', 23, 1)
forum('forum_d.png', '#0c1410', '#6fd08a', 24, 3)
