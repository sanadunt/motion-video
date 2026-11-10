# Tekstur PSX buatan sendiri untuk ArsipTiang (ARSIP 06), 64–128 px, deterministik (seed tetap).
# Tidak ada foto atau gambar orang lain: semuanya noise + bentuk prosedural.
#   "<face-tools>/.venv/bin/python" -I make_tex.py <repo motion-video>
import sys, os
import numpy as np
from PIL import Image

REPO = sys.argv[1]
OUT = os.path.join(REPO, 'public/3d/tiang/tex'); os.makedirs(OUT, exist_ok=True)

def hexrgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)

def vnoise(n, cells, seed):
    """value noise yang bisa di-tile, ukuran n×n, `cells` sel per sisi."""
    r = np.random.default_rng(seed).random((cells, cells))
    x = np.arange(n) * cells / n; i0 = np.floor(x).astype(int); f = x - i0; f = f * f * (3 - 2 * f); i1 = (i0 + 1) % cells
    a = r[i0][:, i0]; b = r[i0][:, i1]; c = r[i1][:, i0]; d = r[i1][:, i1]
    fx = f[None, :]; fy = f[:, None]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

def fbm(n, seed, octaves=(4, 8, 16, 32), gains=(0.5, 0.25, 0.15, 0.1)):
    v = sum(g * vnoise(n, o, seed + k) for k, (o, g) in enumerate(zip(octaves, gains)))
    return (v - v.min()) / (v.max() - v.min() + 1e-9)

def ramp(t, stops):
    """t 0..1 → warna dari daftar (posisi, hex)."""
    pos = np.array([p for p, _ in stops]); cols = np.array([hexrgb(c) for _, c in stops])
    out = np.zeros(t.shape + (3,))
    for ch in range(3): out[..., ch] = np.interp(t, pos, cols[:, ch])
    return out

def save(name, rgb, colors=None):
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
    if colors: im = im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    im.save(os.path.join(OUT, name)); print(name, im.size)

N = 128
rng = np.random.default_rng(6)

# --- karat: oranye-coklat dengan lubang korosi gelap dan noda aliran vertikal ---
t = fbm(N, 10)
pit = (fbm(N, 20, (16, 32), (0.6, 0.4)) > 0.72).astype(float)
streak = np.tile(vnoise(N, 24, 30)[0:1, :], (N, 1)) * np.linspace(0.3, 1, N)[:, None]
rust = ramp(np.clip(t * 0.85 + streak * 0.25, 0, 1), [(0, '#2a140b'), (0.35, '#5e2f17'), (0.6, '#8a4a22'), (0.8, '#a8622c'), (1, '#c4854a')])
rust *= (1 - 0.55 * pit)[..., None]
save('rust.png', rust, 24)

# --- daging busuk: merah-abu kusam, urat gelap, bercak kehijauan ---
t = fbm(N, 40)
vein = np.abs(fbm(N, 50, (3, 6, 12), (0.6, 0.3, 0.1)) - 0.5) + np.abs(fbm(N, 51, (4, 8), (0.7, 0.3)) - 0.5) * 0.6
vein = np.clip(1 - vein / 0.06, 0, 1)  # urat tebal berkelok, bukan garis kontur
lump = fbm(N, 52, (8, 16), (0.6, 0.4))
rot = (fbm(N, 60, (6, 12), (0.6, 0.4)) > 0.66).astype(float)
flesh = ramp(np.clip(t * 0.7 + lump * 0.3, 0, 1), [(0, '#2b1717'), (0.3, '#563334'), (0.55, '#7d5a52'), (0.8, '#94706a'), (1, '#a88b80')])
flesh = flesh * (1 - 0.55 * vein[..., None]) + rot[..., None] * (hexrgb('#4a4a2e') - flesh) * 0.55
save('flesh.png', flesh, 24)

# --- daging-karat menyatu: batas bergerigi, daging merambat di atas logam ---
m = fbm(N, 70, (3, 6, 12), (0.6, 0.3, 0.1)) + np.linspace(-0.25, 0.25, N)[:, None]
edge = (np.abs(m - 0.5) < 0.035).astype(float)
mix = np.where((m > 0.5)[..., None], flesh, rust) * (1 - 0.6 * edge[..., None])
save('fleshrust.png', mix, 32)

# --- bagian dalam corong: gelap, cincin konsentris, jelaga ---
n = 64; yy, xx = np.mgrid[0:n, 0:n] / (n - 1) - 0.5; r = np.sqrt(xx ** 2 + yy ** 2) * 2
rings = 0.5 + 0.5 * np.sin(r * 22)
inner = ramp(np.clip(r * 0.8 + rings * 0.12 + fbm(n, 80) * 0.15, 0, 1), [(0, '#030303'), (0.4, '#0d0908'), (0.75, '#24150f'), (1, '#3b2216')])
save('horn_inner.png', inner, 12)

# --- kayu tiang listrik: serat vertikal, retak, abu-coklat lapuk ---
n = 64; g = vnoise(n, 16, 90)
grain = np.tile(np.sin(np.linspace(0, 30, n) + g[0] * 6)[None, :], (n, 1)) * 0.5 + 0.5
crack = (np.tile(vnoise(n, 32, 91)[0:1, :], (n, 1)) > 0.86).astype(float)
wood = ramp(np.clip(grain * 0.4 + fbm(n, 92) * 0.6, 0, 1), [(0, '#1e1a16'), (0.5, '#3d3630'), (1, '#5f564c')]) * (1 - 0.6 * crack[..., None])
save('pole_wood.png', wood, 16)

# --- kulit pinus: lempeng kasar coklat gelap ---
n = 64; plates = vnoise(n, 8, 100); plates = np.floor(plates * 5) / 5
bark = ramp(np.clip(plates * 0.6 + fbm(n, 101) * 0.4, 0, 1), [(0, '#120d0a'), (0.5, '#2c211a'), (1, '#4a3a2c')])
save('pine_bark.png', bark, 12)

# --- jarum pinus (daun): hijau tua dengan titik gelap ---
n = 64; nd = ramp(fbm(n, 110, (8, 16, 32), (0.4, 0.35, 0.25)), [(0, '#060a08'), (0.5, '#13211a'), (1, '#24382b')])
save('pine_needles.png', nd, 12)

# --- tanah jalan setapak: tanah + jarum gugur ---
n = 128; soil = ramp(fbm(n, 120), [(0, '#141009'), (0.5, '#2a2015'), (1, '#43352a')])
needle = (vnoise(n, 64, 121) > 0.8).astype(float)
soil = soil * (1 - 0.3 * needle[..., None]) + needle[..., None] * hexrgb('#4a3a22') * 0.3
save('soil.png', soil, 16)

# --- aspal jalan desa: abu gelap + tambalan ---
n = 128; asp = ramp(fbm(n, 130, (8, 16, 32, 64), (0.3, 0.3, 0.2, 0.2)), [(0, '#141516'), (0.5, '#232527'), (1, '#36383a')])
patch = (fbm(n, 131, (3, 6), (0.7, 0.3)) > 0.7).astype(float)
asp = asp * (1 - 0.25 * patch[..., None])
save('asphalt.png', asp, 16)

# --- papan pos jaga (kayu horizontal) ---
n = 64; pl = np.tile(np.sin(np.linspace(0, 40, n) + vnoise(n, 8, 140)[:, 0:1].T * 4)[:, None] if False else np.sin(np.linspace(0, 40, n))[None, :], (n, 1))
planks = ramp(np.clip(fbm(n, 141) * 0.7 + (pl * 0.5 + 0.5) * 0.3, 0, 1), [(0, '#1b130d'), (0.5, '#3a2a1c'), (1, '#57412c')]).transpose(1, 0, 2)
gap = np.zeros((n, n)); gap[::16, :] = 1
planks *= (1 - 0.7 * gap[..., None])
save('planks.png', planks, 16)

# --- batu/kayu nisan lapuk ---
n = 64; grave = ramp(fbm(n, 150), [(0, '#1a1a17'), (0.5, '#34332c'), (1, '#4e4b40')])
save('grave.png', grave, 12)
