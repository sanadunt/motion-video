# Lip-sync: timing kata (whisper) -> daftar ekspresi per frame untuk psx_char.py (EXPR_JSON).
#   python3 lipsync.py <kata.json> <out_expr.json> [--fps 30] [--offset 0.3] [--tail 1.0]
#                     [--cells 8|4] [--blink 3.4] [--set 9.5:creepy --set 11:rest ...]
# Input yang dikenali (otomatis):
#   - whisper.cpp -oj (pakai -ml 1 -sow supaya per kata): {"transcription":[{"offsets":{"from":ms,"to":ms},"text":..}]}
#   - Caption Remotion: [{"text":..,"startMs":..,"endMs":..}]
#   - umum: [{"text":..,"start":detik,"end":detik}]
# Aturan (cocok untuk bahasa Indonesia, vokalnya jelas a-i-u-e-o):
#   tiap kata dipecah jadi urutan vokal -> bentuk mulut (a=A, o/u=O, e/i=E); m/b/p = mulut menutup sesaat;
#   bentuk dibagi rata sepanjang durasi kata, minimal 2 frame (gaya PS1 "on twos"); jeda antarkata > 0,12 dtk = diam.
#   Kedip hanya saat mulut diam (sel wajah memuat mata + mulut sekaligus), dengan pola tetap (bukan acak).
import sys, json, math, re

a = sys.argv[1:]
SRC, OUT = a[0], a[1]
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
FPS, OFFSET, TAIL, CELLS, BLINK = opt('--fps', 30), opt('--offset', 0.3), opt('--tail', 1.0), opt('--cells', 8), opt('--blink', 3.4)
SETS = [a[i + 1] for i, x in enumerate(a) if x == '--set']
LAYOUT = {8: dict(rest=0, blink=1, A=2, O=3, E=4, smile=5, scared=6, creepy=7),
          4: dict(rest=0, blink=1, A=2, O=2, E=2, smile=0, scared=2, creepy=3)}[CELLS]

def load(path):
    d = json.load(open(path))
    if isinstance(d, dict) and 'transcription' in d:
        return [(s['text'], s['offsets']['from'] / 1000, s['offsets']['to'] / 1000) for s in d['transcription']]
    out = []
    for w in d:
        if 'startMs' in w: out.append((w['text'], w['startMs'] / 1000, w['endMs'] / 1000))
        else: out.append((w['text'], float(w['start']), float(w['end'])))
    return out

AUDIO = opt('--audio', '')
words = [(re.sub(r"[^a-zA-Z0-9']", '', t).lower(), s, e) for t, s, e in load(SRC)]
words = [(t, s, e) for t, s, e in words if t and e > s]
VIS = {'a': 'A', 'o': 'O', 'u': 'O', 'e': 'E', 'i': 'E'}

def visemes(word):
    seq = []
    for ch in word:
        if ch.isdigit(): seq += ['E', 'A']                # angka diucapkan: bentuk umum
        elif ch in VIS: seq.append(VIS[ch])
        elif ch in 'mbp': seq.append('rest')            # bibir rapat
    out = []
    for v in seq:                                        # gabungkan yang berulang
        if not out or out[-1] != v: out.append(v)
    return out or ['E']

F = lambda t: int(round((t + OFFSET) * FPS)) + 1       # detik audio -> frame (1-based)
end_t = (words[-1][2] if words else 0) + TAIL
N = F(end_t)
track = ['rest'] * (N + 1)                             # indeks 1..N
for t, s, e in words:
    vs = visemes(t); f0, f1 = F(s), max(F(e), F(s) + 2)
    step = max(2, (f1 - f0) // len(vs))
    for k, v in enumerate(vs):
        for f in range(f0 + k * step, min(f1, f0 + (k + 1) * step) if k < len(vs) - 1 else f1):
            if 1 <= f <= N: track[f] = v
# --audio: mulut hanya terbuka saat suara terdengar (whisper sering memasukkan jeda ke durasi kata)
if AUDIO:
    import wave, array
    w = wave.open(AUDIO, 'rb'); ch, sw, sr = w.getnchannels(), w.getsampwidth(), w.getframerate()
    if sw != 2: sys.exit('--audio butuh WAV 16-bit PCM (konversi: ffmpeg -i in -ac 1 -ar 16000 -sample_fmt s16 out.wav)')
    pcm = array.array('h', w.readframes(w.getnframes())); w.close()
    if ch > 1: pcm = pcm[::ch]
    hop = sr // FPS; rms = []
    for i in range(0, len(pcm), hop):
        seg = pcm[i:i + hop]; rms.append(math.sqrt(sum(x * x for x in seg) / max(1, len(seg))))
    ref = sorted(rms)[int(len(rms) * 0.95)] or 1
    quiet = 0
    for f in range(1, N + 1):
        i = int(round((f - 1) / FPS * FPS - OFFSET * FPS))   # frame video -> indeks jendela audio
        loud = 0 <= i < len(rms) and rms[i] > 0.12 * ref
        if track[f] in ('A', 'O', 'E') and not loud: track[f] = 'rest'; quiet += 1
    print(f'audio: {quiet} frame mulut ditutup karena hening')
# kedip: pola tetap, hanya di frame yang mulutnya diam, 4 frame
k = 0
while True:
    t = BLINK * (k + 1) + ((k * 7) % 5) * 0.25
    f = F(t - OFFSET)
    if f + 4 > N: break
    if all(track[x] == 'rest' for x in range(f, f + 4)):
        for x in range(f, f + 4): track[x] = 'blink'
    k += 1
# penimpaan manual: --set detik:ekspresi berlaku sampai --set berikutnya
for spec in sorted(SETS, key=lambda x: float(x.split(':')[0])):
    t, name = spec.split(':'); f0 = F(float(t) - OFFSET)
    for f in range(max(1, f0), N + 1): track[f] = name
# tahan minimal 2 frame (gaya PS1 "on twos"): potongan 1 frame ikut bentuk sebelumnya
for f in range(2, N):
    if track[f] != track[f - 1] and track[f] != track[f + 1]:
        track[f] = track[f - 1]
expr = []
for f in range(1, N + 1):
    c = LAYOUT[track[f]]
    if not expr or expr[-1][1] != c: expr.append([f, c])
json.dump({'fps': FPS, 'cells': CELLS, 'frames': N, 'offset': OFFSET, 'expr': expr}, open(OUT, 'w'))
counts = {n: sum(1 for f in range(1, N + 1) if track[f] == n) for n in LAYOUT}
print(f'{len(words)} kata, {N} frame ({N / FPS:.1f} dtk), {len(expr)} pergantian; frame per bentuk: {counts}')
