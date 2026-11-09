# Atlas ekspresi wajah gaya PS1 (tekstur kecil, bayangan "dicat") + template kosong untuk digambar. Tanpa dependensi.
#   python3 face_atlas.py <out.png> [--cells 8|4]          atlas contoh (sel 32x32 berjajar ke kanan)
#   python3 face_atlas.py <out.png> --template [--size 64]  template kosong bergaris bantu (8 sel)
#
# Layout 8 sel (dipakai lipsync.py):
#   0 diam (mulut tertutup)  1 kedip  2 mulut A (terbuka lebar)  3 mulut O/U (bulat)
#   4 mulut E/I (lebar, gigi)  5 senyum  6 takut  7 seram
# Layout 4 sel (lama): 0 normal, 1 kedip, 2 bicara, 3 seram.
# Art sendiri: ukuran sel bebas tapi seragam (32 = paling PS1, 64 = lebih detail), urutan sama,
# pinggir sel diwarnai kulit sisi kepala (#b07a5a) supaya sambungan ke kepala tidak terlihat.
import sys, zlib, struct

args = sys.argv[1:]
OUT = args[0]
N = int(args[args.index('--cells') + 1]) if '--cells' in args else 8
TEMPLATE = '--template' in args
SIZE = int(args[args.index('--size') + 1]) if '--size' in args else (64 if TEMPLATE else 32)
W = H = 32
P = {  # palet terbatas
    'h': (236, 195, 159), 'S': (216, 164, 127), 's': (176, 122, 90), 'd': (125, 79, 58),
    'w': (232, 224, 208), 'i': (42, 26, 20), 'b': (58, 38, 32), 'l': (154, 74, 64), 'm': (42, 15, 12),
    't': (232, 224, 208), 'k': (10, 6, 6), 'r': (120, 20, 18),
}

def skin(x, y):
    """Bayangan dicat: tepi pipi, lekuk mata, bawah hidung, dagu."""
    cx, cy = (x - 15.5) / 16, (y - 15.5) / 16
    r = cx * cx * 1.1 + cy * cy * 0.7
    if r > 0.7: return 's'                                     # pinggir = warna sisi kepala
    if y <= 4 and abs(cx) < 0.3: return 'h'                    # dahi kena cahaya
    if 9 <= y <= 11 and (6 <= x <= 12 or 19 <= x <= 25): return 's'  # lekuk mata
    if 12 <= y <= 19 and x in (14, 17): return 's'             # sisi hidung
    if y == 19 and 14 <= x <= 17: return 'd'                    # bawah hidung
    if 26 <= y and abs(cx) < 0.5: return 's'                    # dagu
    if 12 <= y <= 18 and x in (15, 16): return 'h'             # batang hidung
    return 'S'

def face(eyes, brows, mouth):
    g = [[skin(x, y) for x in range(W)] for y in range(H)]
    put = lambda pts, c: [g[y].__setitem__(x, c) for x, y in pts]
    by = {'flat': 7, 'up': 6, 'down': 8}[brows]
    put([(x, by) for x in range(7, 13)] + [(x, by) for x in range(19, 25)], 'b')
    if brows == 'up':   put([(7, 7), (24, 7)], 'b')           # alis naik di ujung luar (takut)
    if brows == 'down': put([(12, 9), (19, 9)], 'b')          # alis turun ke tengah (seram)
    if eyes == 'closed':
        put([(x, 11) for x in range(8, 13)] + [(x, 11) for x in range(19, 24)], 'b')
    elif eyes == 'hollow':
        for x0, x1 in ((7, 13), (18, 24)):
            put([(x, y) for x in range(x0, x1 + 1) for y in range(9, 14)], 'k')
        put([(10, 11), (21, 11)], 'r')
    else:
        rows = (9, 10, 11, 12) if eyes == 'wide' else (10, 11)
        for x0 in (8, 19):
            put([(x, y) for x in range(x0, x0 + 5) for y in rows], 'w')
            pup = (x0 + 2, x0 + 2) if eyes == 'wide' else (x0 + 2, x0 + 3 if x0 == 8 else x0 + 1)
            put([(pup[0], 10), (pup[0], 11), (pup[1], 10)], 'i')
    if mouth == 'rest':
        put([(x, 22) for x in range(12, 20)], 'l'); put([(x, 23) for x in range(13, 19)], 's')
    elif mouth == 'A':
        put([(x, y) for x in range(12, 20) for y in range(22, 26)], 'm')
        put([(x, 21) for x in range(12, 20)] + [(x, 26) for x in range(13, 19)], 'l')
        put([(x, 22) for x in range(13, 19)], 't')
    elif mouth == 'O':
        put([(x, y) for x in range(14, 18) for y in range(21, 26)], 'm')
        put([(13, y) for y in range(22, 25)] + [(18, y) for y in range(22, 25)] + [(x, 20) for x in range(14, 18)] + [(x, 26) for x in range(14, 18)], 'l')
    elif mouth == 'E':
        put([(x, y) for x in range(11, 21) for y in (22, 23)], 'm')
        put([(x, 22) for x in range(12, 20)], 't')
        put([(x, 21) for x in range(11, 21)] + [(x, 24) for x in range(12, 20)], 'l')
    elif mouth == 'smile':
        put([(x, 23) for x in range(13, 19)] + [(12, 22), (19, 22), (11, 21), (20, 21)], 'l')
    elif mouth == 'scared':
        put([(x, y) for x in range(13, 19) for y in range(22, 25)], 'm')
        put([(x, 21) for x in range(13, 19)] + [(x, 25) for x in range(13, 19)], 'l')
    elif mouth == 'grin':
        put([(x, y) for x in range(6, 26) for y in range(21, 26)], 'm')
        put([(x, 22) for x in range(7, 25) if x % 2], 't'); put([(x, 24) for x in range(8, 24) if not x % 2], 't')
        put([(5, 20), (26, 20), (4, 19), (27, 19)], 'm')
    return g

CELLS8 = [('open', 'flat', 'rest'), ('closed', 'flat', 'rest'), ('open', 'flat', 'A'), ('open', 'flat', 'O'),
          ('open', 'flat', 'E'), ('open', 'flat', 'smile'), ('wide', 'up', 'scared'), ('hollow', 'down', 'grin')]
CELLS4 = [CELLS8[0], CELLS8[1], CELLS8[2], CELLS8[7]]

def png(path, rows):
    raw = b''.join(b'\x00' + bytes(c for px in r for c in px) for r in rows)
    ch = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as fh:
        fh.write(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', len(rows[0]), len(rows), 8, 2, 0, 0, 0))
                 + ch(b'IDAT', zlib.compress(raw, 9)) + ch(b'IEND', b''))

if TEMPLATE:
    # 8 sel kosong: dasar warna kulit, oval wajah, garis mata (40%), hidung (60%), mulut (72%), garis tengah
    S = SIZE; rows = []
    for y in range(S):
        row = []
        for e in range(8):
            for x in range(S):
                cx, cy = (x - (S - 1) / 2) / (S / 2), (y - (S - 1) / 2) / (S / 2)
                r = cx * cx * 1.1 + cy * cy * 0.7
                c = P['s'] if r > 0.7 else P['S']
                if abs(r - 0.7) < 0.03: c = P['d']
                if y in (int(S * 0.34), int(S * 0.60), int(S * 0.72)) and r <= 0.7 and x % 2 == 0: c = (150, 150, 150)
                if x == S // 2 and r <= 0.7 and y % 2 == 0: c = (150, 150, 150)
                if x == 0 or y == 0: c = (255, 0, 255)            # batas sel (magenta), timpa saat menggambar
                for k in range(e + 1):                              # penanda nomor sel: titik di pojok kiri bawah
                    if y == S - 3 and x == 3 + k * 3: c = (255, 0, 255)
                row.append(c)
        rows.append(row)
    png(OUT, rows)
    print(f'template 8 sel {S}x{S} -> {8 * S}x{S}')
else:
    layout = CELLS8 if N == 8 else CELLS4
    rows = [[None] * (W * N) for _ in range(H)]
    for e, spec in enumerate(layout):
        f = face(*spec)
        for y in range(H):
            for x in range(W):
                rows[y][e * W + x] = P[f[y][x]]
    png(OUT, rows)
    print('atlas', W * N, 'x', H, f'({N} sel)')
