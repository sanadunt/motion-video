#!/bin/bash
# SFX "Nomor Merah", semua disintesis dengan sox (tanpa rekaman pihak lain, TANPA sirene, tanpa nada dering pabrikan).
#   bash scripts/sfx/merah_sfx.sh   -> public/sfx/merah/*.wav (48 kHz mono)
# Dipakai ulang dari set lain: sfx/ripper/sub-hit, tape-hiss, amb/room, amb/drone, amb/paper-slide; sfx/wajah/stamp, riser;
# sfx/angka/key, pencil; sfx/tiang/clip.
set -euo pipefail
cd "$(dirname "$0")/../.."
O=public/sfx/merah; mkdir -p "$O"
S="-r 48000 -c 1 -b 16"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT

# --- nada dering monofonik CIPTAAN SENDIRI (motif D minor, 12 not + jeda, diulang 2x) lewat speaker piezo kecil ---
# not: D5 F5 A5 F5 | E5 G5 Bb5 - | A5 F5 D5 -   (frekuensi Hz, durasi dtk; 0 = diam)
i=0; parts=()
for spec in "587.3 0.13" "698.5 0.13" "880.0 0.13" "698.5 0.13" "0 0.05" "659.3 0.13" "784.0 0.13" "932.3 0.26" "0 0.09" "880.0 0.13" "698.5 0.13" "587.3 0.34" "0 0.45"; do
  set -- $spec
  if [ "$1" = "0" ]; then sox -n $S $T/n_$i.wav synth $2 sine 0 gain -90
  else sox -n $S $T/n_$i.wav synth $2 square $1 fade 0.003 $2 0.02 gain -6; fi
  parts+=($T/n_$i.wav); i=$((i+1))
done
sox "${parts[@]}" $S $T/mel.wav
sox $T/mel.wav $T/mel.wav $S "$O/ring.wav" gain -4 sinc 900-4200 equalizer 2600 1q 5 norm -6

# --- getar ponsel di meja kayu: motor ±155 Hz + gemeretak badan plastik + dengung papan ---
vib() { # durasi out
  sox -n $S $T/v1.wav synth $1 square 155 gain -6 lowpass 420 tremolo 27 55 gain -8
  sox -n $S $T/v2.wav synth $1 brownnoise sinc 180-1400 tremolo 77 95 gain -10
  sox -n $S $T/v3.wav synth $1 sine 78 gain -10
  sox -m $T/v1.wav $T/v2.wav $T/v3.wav $S "$2" fade t 0.03 $1 0.07
}
vib 0.80 $T/vb.wav
sox $T/vb.wav $S "$O/vibrate-one.wav" norm -5
sox $T/vb.wav $S $T/vbp.wav pad 0 0.32
sox $T/vbp.wav $T/vbp.wav $T/vb.wav $S "$O/vibrate.wav" norm -5     # 0,8 nyala / 0,32 diam ×2 + 0,8 nyala = 3,04 dtk

# --- warnet 12 dtk: dengung CRT (100 Hz + harmonik + desing tinggi tipis), kipas angin, ketikan jarang ---
sox -n $S $T/hum.wav synth 12 sine 100 sine 200 sine 300 remix - lowpass 1200 gain -16
sox -n $S $T/whine.wav synth 12 sine 7800 tremolo 0.4 25 gain -40
sox -n $S $T/fan1.wav synth 12 brownnoise lowpass 900 tremolo 3.1 35 gain -6
sox -n $S $T/fan2.wav synth 12 pinknoise sinc 1500-5000 tremolo 6.2 30 gain -24
sox -n $S $T/k.wav synth 0.025 whitenoise sinc 1500-6000 fade 0 0.025 0.02 gain -12
sox -n $S $T/sil.wav synth 12 sine 0 gain -90
files=()
for at in 0.7 0.84 1.02 1.9 3.3 3.42 3.6 3.77 5.2 6.6 6.75 6.9 8.4 9.1 9.24 10.6 10.8; do sox $T/k.wav $S $T/k_$at.wav pad $at 0; files+=($T/k_$at.wav); done
sox -m $T/sil.wav "${files[@]}" $S $T/keys.wav gain -8
sox -m $T/hum.wav $T/whine.wav $T/fan1.wav $T/fan2.wav $T/keys.wav $S "$O/warnet.wav" fade t 0.5 12 0.5 norm -8

# --- nada pesan masuk ciptaan sendiri: dua bip pendek naik ---
sox -n $S $T/b1.wav synth 0.07 square 1318 fade 0.002 0.07 0.02 gain -8
sox -n $S $T/b2.wav synth 0.11 square 1760 fade 0.002 0.11 0.04 gain -8
sox -n $S $T/bs.wav synth 0.04 sine 0 gain -90
sox $T/b1.wav $T/bs.wav $T/b2.wav $S "$O/sms.wav" gain -4 sinc 900-4200 norm -8

# --- tik LCD (digit berubah merah) ---
sox -n $S "$O/tick.wav" synth 0.03 square 2100 fade 0 0.03 0.025 sinc 1200-5000 norm -10 pad 0 0.05

# --- denyut rendah pelan (adegan pengakuan sakit) ---
sox -n $S $T/p1.wav synth 0.22 sine 62-44 fade 0.004 0.22 0.16
sox -n $S $T/p2.wav synth 0.26 sine 55-40 fade 0.004 0.26 0.2 gain -5
sox -n $S $T/ps.wav synth 0.13 sine 0 gain -90
sox $T/p1.wav $T/ps.wav $T/p2.wav $S "$O/pulse.wav" norm -4 pad 0 0.4

# --- dengung lampu neon ruang periksa 6 dtk ---
sox -n $S "$O/neon.wav" synth 6 sine 100 sine 200 square 100 remix - gain -12 lowpass 2600 tremolo 0.7 12 fade t 0.05 6 0.05 norm -16

# --- klik layar mati (potong ke hitam) ---
sox -n $S "$O/off.wav" synth 0.02 square 300 fade 0 0.02 0.015 lowpass 1500 norm -8 pad 0 0.05

for f in "$O"/*.wav; do printf "%-18s %5.2f dtk\n" "$(basename $f)" "$(soxi -D $f)"; done
