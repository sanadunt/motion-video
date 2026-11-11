# Beat "Nomor Merah" (detik global), satu sumber untuk make_assets.py (PIL) dan merah_scenes.py (Blender).
# Rumusnya SAMA dengan objek B di src/Videos/NomorMerah.tsx. Sumber: src/Videos/merah-*.json + briefs/NomorMerah.vo.json.
import json, os

WORD_LEAD = 0.2
FPS = 30

def _norm(s): return ''.join(ch for ch in s.lower() if ch.isalnum())

def beats(repo):
    caps = json.load(open(os.path.join(repo, 'src/Videos/merah-captions.json')))
    words = json.load(open(os.path.join(repo, 'src/Videos/merah-words.json')))
    vo = json.load(open(os.path.join(repo, 'briefs/NomorMerah.vo.json')))
    def cap(prefix): return next(c for c in caps if _norm(c['text']).startswith(_norm(prefix)))
    def word(clip, text, nth=0): return [w for w in words if w['clip'] == clip and w['text'] == text][nth]['t'] - WORD_LEAD
    def between(a, b): return (cap(a)['end'] + cap(b)['start']) / 2
    B = dict(
        nomor=word('01-hook', 'nomor'),
        merah1=word('01-hook', 'merah'),
        jangan=cap('jangan diangkat')['start'],
        s1End=between('jangan diangkat', 'Mei dua ribu'),
        sms=cap('SMS berantai')['start'],
        riau=word('02-sebar', 'riau'),
        jawa=word('02-sebar', 'jawa'),
        s2End=between('SMS berantai', 'Konon'),
        dukun=word('03-konon', 'dukun'),
        katanya=cap('Katanya')['start'],
        tewas=word('03-konon', 'tewas'),
        s3End=between('Katanya', 'Polisi'),
        bohong=word('04-resmi', 'kabar'),
        tak=cap('Tak satu pun')['start'],
        terbukti=word('04-resmi', 'terbukti'),
        s4End=between('Tak satu pun', 'Sepekan'),
        diamankan=word('05-iseng', 'diamankan'),
        iseng=word('05-iseng', 'iseng'),
        namanya=cap('Namanya')['start'],
        s5End=between('Namanya', 'Tapi beberapa'),
        mengaku=word('06-sakit', 'mengaku'),
        jakarta=cap('Di Jakarta')['start'],
        memerah=word('06-sakit', 'memerah'),
        kejang=word('06-sakit', 'kejang'),
        sugesti=word('06-sakit', 'sugesti'),
        s6End=between('Pejabat', 'Dan pesan'),
        nigeria=cap('Dua ribu empat')['start'],
        pakistan=cap('Dua ribu tujuh')['start'],
        merah7=cap('nomornya sudah')['start'],
        s7End=between('nomornya sudah', 'Kalau pengirimnya'),
        benua=cap('di benua lain')['start'],
        malam=cap('Malam ini')['start'],
        ring=vo['ring'], black=vo['black'], sumber=vo['sumber'], end=vo['end'],
    )
    return B

def span(t0, t1):
    """fr(t) = nomor frame render (1 = awal adegan); total = jumlah frame adegan."""
    fr = lambda t: int(round((t - t0) * FPS)) + 1
    return fr, fr(t1)

# rentang tiap shot Blender: (awal, akhir) dalam kunci B (0 = detik 0)
SHOTS = dict(meja=(0.0, 's1End'), warnet=('s2End', 'katanya'), inbox=('katanya', 's3End'), kursi=('s4End', 'diamankan'), lantai=('s5End', 's6End'), tutup=('s7End', 'black'))

def shot_span(B, shot):
    a, b = SHOTS[shot]
    t0 = B[a] if isinstance(a, str) else a
    return t0, B[b]

if __name__ == '__main__':
    import sys
    B = beats(sys.argv[1])
    for k, v in B.items(): print('%-10s %6.2f' % (k, v))
    for s in SHOTS:
        t0, t1 = shot_span(B, s); print(s, round(t0, 2), round(t1, 2), span(t0, t1)[1], 'frame')
