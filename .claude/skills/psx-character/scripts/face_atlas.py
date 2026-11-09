# Atlas ekspresi wajah gaya PS1 (tekstur kecil, bayangan "dicat"), tanpa dependensi.
#   python3 face_atlas.py <out.png>
# Layout: 4 sel 32x32 berjajar -> 128x32. Sel 0 normal, 1 kedip, 2 bicara, 3 seram.
# Ganti file ini dengan PNG gambaranmu sendiri: ukuran dan urutan sel sama.
import sys, zlib, struct

W, H, N = 32, 32, 4
P = {  # palet terbatas
    'h': (236, 195, 159), 'S': (216, 164, 127), 's': (176, 122, 90), 'd': (125, 79, 58), 'D': (80, 48, 36),
    'w': (232, 224, 208), 'i': (42, 26, 20), 'b': (58, 38, 32), 'l': (154, 74, 64), 'm': (42, 15, 12),
    't': (232, 224, 208), 'k': (10, 6, 6), 'r': (120, 20, 18),
}

def skin(x, y):
    """Bayangan dicat: tepi pipi, lekuk mata, bawah hidung, dagu."""
    cx, cy = (x - 15.5) / 16, (y - 15.5) / 16
    r = cx * cx * 1.1 + cy * cy * 0.7
    if r > 0.7: return 's'  # pinggir = warna sisi kepala (material 'skin_side' di Blender)
    if y <= 4 and abs(cx) < 0.3: return 'h'                    # dahi kena cahaya
    if 9 <= y <= 11 and (6 <= x <= 12 or 19 <= x <= 25): return 's'  # lekuk mata
    if 12 <= y <= 19 and x in (14, 17): return 's'             # sisi hidung
    if y == 19 and 14 <= x <= 17: return 'd'                    # bawah hidung
    if 26 <= y and abs(cx) < 0.5: return 's'                    # dagu
    if 12 <= y <= 18 and x in (15, 16): return 'h'             # batang hidung
    return 'S'

def face(e):
    g = [[skin(x, y) for x in range(W)] for y in range(H)]
    put = lambda pts, c: [g[y].__setitem__(x, c) for x, y in pts]
    # alis
    brow_y = 7 if e != 3 else 8
    put([(x, brow_y) for x in range(7, 13)] + [(x, brow_y) for x in range(19, 25)], 'b')
    if e == 3:  # alis menurun ke tengah
        put([(12, 9), (19, 9)], 'b')
    # mata
    if e == 1:  # kedip
        put([(x, 11) for x in range(8, 13)] + [(x, 11) for x in range(19, 24)], 'b')
    elif e == 3:  # seram: lubang hitam besar
        for (x0, x1) in ((7, 13), (18, 24)):
            put([(x, y) for x in range(x0, x1 + 1) for y in range(9, 14)], 'k')
        put([(10, 11), (21, 11)], 'r')  # titik merah samar
    else:
        for x0 in (8, 19):
            put([(x0, 10), (x0 + 4, 10), (x0, 11), (x0 + 4, 11)], 'w')
            put([(x0 + 1, 10), (x0 + 2, 10), (x0 + 3, 10), (x0 + 1, 11), (x0 + 2, 11), (x0 + 3, 11)], 'w')
            put([(x0 + 2, 10), (x0 + 2, 11), (x0 + 3, 10) if x0 == 8 else (x0 + 1, 10)], 'i')
    # mulut
    if e == 2:  # bicara: terbuka
        put([(x, y) for x in range(12, 20) for y in (22, 23)], 'm')
        put([(x, 21) for x in range(12, 20)] + [(x, 24) for x in range(13, 19)], 'l')
    elif e == 3:  # seringai lebar sampai pipi
        put([(x, y) for x in range(6, 26) for y in range(21, 26)], 'm')
        put([(x, 22) for x in range(7, 25) if x % 2], 't')
        put([(x, 24) for x in range(8, 24) if not x % 2], 't')
        put([(5, 20), (26, 20), (4, 19), (27, 19)], 'm')
    else:
        put([(x, 22) for x in range(12, 20)], 'l')
        put([(x, 23) for x in range(13, 19)], 's')
    return g

rows = [[None] * (W * N) for _ in range(H)]
for e in range(N):
    f = face(e)
    for y in range(H):
        for x in range(W):
            rows[y][e * W + x] = P[f[y][x]]

def png(path, rows):
    raw = b''.join(b'\x00' + bytes(c for px in r for c in px) for r in rows)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as fh:
        fh.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', len(rows[0]), len(rows), 8, 2, 0, 0, 0))
                 + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

png(sys.argv[1], rows)
print('atlas', W * N, 'x', H)
