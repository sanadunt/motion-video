#!/bin/bash
# SFX SiaranAngka (ARSIP 05), semua disintesis dengan sox (tanpa rekaman pihak lain, termasuk tanpa rekaman asli UVB-76).
#   bash scripts/sfx/angka_sfx.sh   -> public/sfx/angka/*.wav (48 kHz mono)
set -euo pipefail
cd "$(dirname "$0")/../.."
O=public/sfx/angka; mkdir -p "$O"
S="-r 48000 -c 1 -b 16"

# Siklus "dengungan" 2,4 dtk = 72 frame @30 fps: buzz kasar 1,2 dtk lalu hening 1,2 dtk (±25/menit).
# Disamakan dengan lampu merah salju_scene.py (nyala 36 frame, mati 36 frame, frame 1 = nyala).
sox -n $S /tmp/ak_b1.wav synth 1.2 sawtooth 94 sawtooth 188 square 47 remix - gain -6
sox /tmp/ak_b1.wav $S /tmp/ak_b2.wav overdrive 12 12 lowpass 2400 highpass 70 tremolo 50 25 fade t 0.015 1.2 0.04 norm -3
sox /tmp/ak_b2.wav $S "$O/buzz-cycle.wav" pad 0 1.2

# Desis gelombang pendek (bed, 8 dtk, bisa diulang): noise pita sempit + siulan heterodin yang bergoyang.
sox -n $S /tmp/ak_n.wav synth 8 pinknoise gain -10
sox -n $S /tmp/ak_w.wav synth 8 sine 1320-1180 gain -28 tremolo 0.4 60
sox -m /tmp/ak_n.wav /tmp/ak_w.wav $S /tmp/ak_sw.wav
sox /tmp/ak_sw.wav $S "$O/sw-static.wav" sinc 380-3000 tremolo 0.7 35 fade t 0.05 8 0.05 norm -6

# Sapuan tuning 1,3 dtk: siulan menyapu + desis, berhenti di "nada" stasiun.
sox -n $S /tmp/ak_t1.wav synth 1.3 sine 2600-420 gain -14
sox -n $S /tmp/ak_t2.wav synth 1.3 pinknoise gain -12
sox -m /tmp/ak_t1.wav /tmp/ak_t2.wav $S "$O/tune.wav" sinc 300-3200 tremolo 9 40 fade t 0.02 1.3 0.25 norm -4

# Dengung CRT 6 dtk: 60 Hz + harmonik + desing tinggi tipis.
sox -n $S "$O/crt.wav" synth 6 sine 60 sine 120 sine 15600 remix - gain -8 fade t 0.05 6 0.05 norm -10

# Klik tombol keyboard (20 ms) dan bunyi radio menyala (klik + desis naik).
sox -n $S "$O/key.wav" synth 0.02 whitenoise highpass 2500 fade t 0 0.02 0.015 norm -6 pad 0 0.05
sox -n $S /tmp/ak_r1.wav synth 0.03 whitenoise highpass 1200 norm -3
sox -n $S /tmp/ak_r2.wav synth 0.8 pinknoise sinc 400-3000 fade q 0.6 0.8 0.15 norm -10
sox /tmp/ak_r1.wav /tmp/ak_r2.wav $S "$O/radio-on.wav"

# Kapur menggores (4 goresan pendek) dan pensil (goresan kering halus).
sox -n $S "$O/chalk.wav" synth 0.18 brownnoise highpass 1800 tremolo 40 80 fade t 0.01 0.18 0.06 norm -8 pad 0 0.07 repeat 3
sox -n $S "$O/pencil.wav" synth 0.12 whitenoise sinc 2500-7000 tremolo 30 70 fade t 0.01 0.12 0.05 norm -14 pad 0 0.1 repeat 4

# Angin salju (12 dtk, bisa diulang).
sox -n $S "$O/snow-wind.wav" synth 12 brownnoise lowpass 700 tremolo 0.15 70 fade t 0.5 12 0.5 norm -8

rm -f /tmp/ak_*.wav
ls -1 "$O"
