"""Synthesise the sound effects for the MeneuroborosMinimal logo sting.

Everything is generated from noise and sine waves, so the sounds are original and
license-free, and the render never needs the network.

Usage:  python3 scripts/sfx/meneuroboros_sfx.py
Output: public/sfx/meneuroboros/*.wav  (48 kHz, 16-bit, mono)
Needs:  numpy, scipy
"""
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48_000
OUT = Path(__file__).resolve().parents[2] / "public" / "sfx" / "meneuroboros"
rng = np.random.default_rng(1984)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="bandpass", fs=SR, output="sos"), x)


def lowpass(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="lowpass", fs=SR, output="sos"), x)


def highpass(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="highpass", fs=SR, output="sos"), x)


def sweep_band(x, f0, f1, width=0.9, block=0.008):
    """Band-pass whose centre moves exponentially from f0 to f1 (block-wise, crossfaded)."""
    n = len(x)
    bs = int(block * SR)
    out = np.zeros(n)
    win = np.hanning(bs * 2)
    for start in range(0, n, bs):
        p = start / max(1, n - 1)
        fc = f0 * (f1 / f0) ** p
        lo, hi = fc / (1 + width), min(fc * (1 + width), SR / 2 - 100)
        seg = x[max(0, start - bs): start + bs]
        y = band(seg, lo, hi)
        w = win[: len(y)]
        out[max(0, start - bs): max(0, start - bs) + len(y)] += y * w
    return out


def env_adsr(dur, a, d_shape="exp", d=None, peak_at=None):
    t = t_axis(dur)
    if peak_at is None:
        peak_at = a
    e = np.where(t < peak_at, (t / max(peak_at, 1e-6)) ** 1.5, 1.0)
    if d_shape == "exp":
        e = e * np.where(t < peak_at, 1.0, np.exp(-(t - peak_at) / (d or dur / 4)))
    return e


def fade(x, fin=0.005, fout=0.02):
    n = len(x)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def norm(x, peak):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def save(name, x):
    OUT.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    wavfile.write(OUT / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"{name}.wav  {len(x) / SR:.2f}s")


# 1. whoosh-in: the snakes drawing themselves on (rising sweep)
def whoosh_in():
    dur = 1.25
    t = t_axis(dur)
    x = sweep_band(noise(dur), 260, 2600, width=0.8)
    rumble = lowpass(noise(dur), 180) * 0.6
    e = (t / dur) ** 2.2 * np.where(t > dur - 0.12, np.linspace(1, 0, len(t)) ** 0 * (dur - t) / 0.12, 1)
    return fade(norm((x + rumble) * e, 0.55))


# 2. bite: soft low thump when each snout closes on its tail
def bite():
    dur = 0.9
    t = t_axis(dur)
    f = 46 + 34 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    over = np.sin(2 * np.pi * np.cumsum(f * 2.02) / SR) * np.exp(-t / 0.12) * 0.35
    click = lowpass(noise(dur), 2200) * np.exp(-t / 0.006) * 0.9
    return fade(norm(body + over + click, 0.85), 0.001, 0.05)


# 3. hiss: a short snake hiss after the bite
def hiss():
    dur = 0.75
    t = t_axis(dur)
    x = band(noise(dur), 3800, 11000, order=3)
    trem = 1 + 0.25 * np.sin(2 * np.pi * 23 * t)
    e = np.minimum(1, t / 0.06) * np.exp(-np.maximum(0, t - 0.12) / 0.2)
    return fade(norm(x * trem * e, 0.32))


# 4. letters: a quick zip of 12 tiny ticks, rising in pitch
def letters():
    n, step = 12, 0.035
    dur = n * step + 0.25
    out = np.zeros(int(dur * SR))
    for i in range(n):
        tick_d = 0.03
        tt = t_axis(tick_d)
        fc = 2400 * (1.06 ** i)
        tick = band(noise(tick_d), fc / 1.5, min(fc * 1.5, 20000)) * np.exp(-tt / 0.005)
        tone = np.sin(2 * np.pi * fc * 0.5 * tt) * np.exp(-tt / 0.008) * 0.4
        s = int(i * step * SR)
        out[s: s + len(tick)] += (tick + tone) * (0.6 + 0.4 * i / n)
    return fade(norm(out, 0.28))


# 5. blink: a tiny wet tick
def blink():
    dur = 0.12
    t = t_axis(dur)
    f = 1500 - 700 * (t / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.018)
    return fade(norm(x, 0.16), 0.001, 0.01)


# 6. whoosh-out: falling sweep for the outro, speeding up
def whoosh_out():
    dur = 1.15
    t = t_axis(dur)
    x = sweep_band(noise(dur), 2400, 220, width=0.8)
    e = np.minimum(1, t / 0.25) ** 1.5 * np.minimum(1, (dur - t) / 0.18)
    return fade(norm(x * e * (0.6 + 0.4 * t / dur), 0.5))


# 7. gulp: the snakes swallow the last bit of themselves
def gulp():
    dur = 0.45
    t = t_axis(dur)
    f = 90 + 360 * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)
    pop = band(noise(dur), 300, 1500) * np.exp(-t / 0.01) * 0.5
    return fade(norm(x + pop, 0.7), 0.001, 0.04)


# 8. pad: a dark, quiet bed under the whole sting (looped/trimmed in Remotion)
def pad():
    dur = 8.0
    t = t_axis(dur)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t)
    x = (
        np.sin(2 * np.pi * 55 * t)
        + 0.6 * np.sin(2 * np.pi * 82.4 * t + 0.3)
        + 0.35 * np.sin(2 * np.pi * 110.3 * t + 1.1) * lfo
        + 0.15 * np.sin(2 * np.pi * 164.8 * t) * (1 - lfo)
    )
    air = lowpass(noise(dur), 600) * 0.08
    return fade(norm(lowpass(x + air, 900), 0.3), 0.05, 0.3)


if __name__ == "__main__":
    for name, fn in [
        ("whoosh-in", whoosh_in),
        ("bite", bite),
        ("hiss", hiss),
        ("letters", letters),
        ("blink", blink),
        ("whoosh-out", whoosh_out),
        ("gulp", gulp),
        ("pad", pad),
    ]:
        save(name, fn())
