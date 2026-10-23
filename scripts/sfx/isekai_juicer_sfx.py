"""
Sintesis efek suara sederhana untuk motion logo (tanpa aset eksternal).
Pakai: python3 scripts/sfx/isekai_juicer_sfx.py  ->  public/sfx/isekai-juicer/*.wav (44.1 kHz, mono, 16-bit)
"""
import math
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "sfx", "isekai-juicer")
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, attack=0.005, release=0.1, hold=None):
    a = int(SR * attack)
    r = int(SR * release)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[n - r :] = np.linspace(1, 0, r)
    return e


def lowpass(x, cutoff):
    # one-pole IIR lowpass, cheap but enough for SFX
    dt = 1 / SR
    rc = 1 / (2 * math.pi * cutoff)
    alpha = dt / (rc + dt)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def lowpass_sweep(x, c0, c1):
    dt = 1 / SR
    n = len(x)
    cut = np.geomspace(c0, c1, n)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(n):
        rc = 1 / (2 * math.pi * cut[i])
        alpha = dt / (rc + dt)
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def save(name, x, gain=0.9):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * gain
    pcm = (x * 32767).astype("<i2")
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{name}: {len(x) / SR:.2f}s")


# 1. Portal membuka: dengung naik + shimmer bergetar (1.6 s)
def portal_open():
    tt = t(1.6)
    f = 70 * (2 ** (tt / 1.6 * 2.2))  # naik ~2 oktaf
    phase = 2 * np.pi * np.cumsum(f) / SR
    hum = 0.6 * np.sin(phase) + 0.3 * np.sin(2 * phase) + 0.15 * np.sin(3 * phase)
    shimmer = np.zeros_like(tt)
    for k, base in enumerate([880, 1320, 1760, 2640]):
        vib = np.sin(2 * np.pi * (6 + k) * tt) * 8
        shimmer += 0.25 * np.sin(2 * np.pi * (base + vib) * tt + k) * (tt / 1.6) ** 1.5
    noise = lowpass_sweep(rng.standard_normal(len(tt)), 300, 4000) * 0.35 * (tt / 1.6)
    x = (hum + shimmer + noise) * env(len(tt), 0.05, 0.35)
    return x


# 2. Kilau sihir: arpeggio nada tinggi cepat dengan ekor (0.9 s)
def sparkle():
    tt = t(0.9)
    x = np.zeros_like(tt)
    notes = [1047, 1319, 1568, 2093, 2637, 3136]
    for i, f in enumerate(notes):
        start = int(SR * 0.07 * i)
        seg = tt[: len(tt) - start]
        tone = np.sin(2 * np.pi * f * seg) * np.exp(-seg * 9) * 0.5
        tone += np.sin(2 * np.pi * f * 2 * seg) * np.exp(-seg * 14) * 0.15
        x[start:] += tone
    return x * env(len(tt), 0.002, 0.15)


# 3. Pop buah keluar portal: klik + nada pendek (0.18 s), beberapa pitch
def pop(pitch):
    tt = t(0.18)
    f = pitch * np.exp(-tt * 18) + pitch * 0.5
    phase = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(phase) * np.exp(-tt * 28)
    click = lowpass(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 120) * 0.8
    return (tone + click) * env(len(tt), 0.001, 0.05)


# 4. Cipratan jus: semburan noise lowpass dengan gelembung (0.7 s)
def splash():
    tt = t(0.7)
    body = lowpass_sweep(rng.standard_normal(len(tt)), 2500, 500) * np.exp(-tt * 5)
    bubbles = np.zeros_like(tt)
    for _ in range(14):
        s = rng.uniform(0.02, 0.5)
        f = rng.uniform(500, 1500)
        idx = tt >= s
        seg = tt[idx] - s
        bubbles[idx] += np.sin(2 * np.pi * (f + 600 * seg) * seg) * np.exp(-seg * 40) * 0.25
    return (body + bubbles) * env(len(tt), 0.003, 0.2)


# 5. Hantaman teks: sub-boom + transien (0.8 s)
def impact():
    tt = t(0.8)
    f = 160 * np.exp(-tt * 10) + 45
    phase = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(phase) * np.exp(-tt * 4.5)
    crack = lowpass(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 45) * 0.9
    return (boom + crack) * env(len(tt), 0.001, 0.25)


# 6. Dentum akhir + chord hangat (2.2 s)
def final_chord():
    tt = t(2.2)
    x = np.zeros_like(tt)
    for i, f in enumerate([196, 294, 392, 494, 587]):  # G major-ish spread
        x += np.sin(2 * np.pi * f * tt) * np.exp(-tt * (1.4 + i * 0.2)) * (0.5 - i * 0.06)
        x += np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 3) * 0.1
    thump = np.sin(2 * np.pi * (90 * np.exp(-tt * 8) + 40) * tt) * np.exp(-tt * 5) * 0.8
    return (x + thump) * env(len(tt), 0.003, 0.6)


save("portal-open.wav", portal_open())
save("sparkle.wav", sparkle(), 0.7)
for i, p in enumerate([900, 1100, 1300, 760, 1500]):
    save(f"pop-{i + 1}.wav", pop(p), 0.8)
save("splash.wav", splash(), 0.85)
save("impact.wav", impact())
save("final-chord.wav", final_chord(), 0.8)
