#!/bin/bash
# SFX ArsipTiang (ARSIP 06), semua disintesis dengan sox (tanpa rekaman pihak lain, tanpa sirene tsunami / uji sirene resmi).
#   bash scripts/sfx/tiang_sfx.sh   -> public/sfx/tiang/*.wav (48 kHz mono)
# Dipakai ulang dari set lain: sfx/angka/radio-on, tune, pencil; sfx/ripper/sub-hit, tape-stop, tape-click, tape-hiss,
# static-burst, amb/paper-slide; sfx/wajah/stamp, riser.
set -euo pipefail
cd "$(dirname "$0")/../.."
O=public/sfx/tiang; mkdir -p "$O"
S="-r 48000 -c 1 -b 16"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT

# --- bed ---
# angin pinus 12 dtk: gemuruh rendah + desir jarum pinus tinggi yang bergelombang
sox -n $S $T/w1.wav synth 12 brownnoise lowpass 800 tremolo 0.13 60 gain -2
sox -n $S $T/w2.wav synth 12 pinknoise sinc 1800-6500 tremolo 0.21 80 gain -18
sox -m $T/w1.wav $T/w2.wav $S "$O/pine-wind.wav" fade t 0.6 12 0.6 norm -6
# dengung kabel listrik 50 Hz 6 dtk (harmonik + desing tipis yang naik-turun)
sox -n $S "$O/cable-hum.wav" synth 6 sine 50 sine 100 sine 150 sine 2950 remix - tremolo 0.3 20 fade t 0.05 6 0.05 norm -10
# jangkrik 8 dtk: kicau pendek jarang di posisi tetap
sox -n $S $T/ch.wav synth 0.16 sine 4400 tremolo 42 100 fade t 0.01 0.16 0.04 gain -8
sox -n $S $T/sil.wav synth 8 sine 0 gain -90
files=()
for at in 0.4 0.9 2.3 2.75 4.1 5.6 6.05 7.2; do sox $T/ch.wav $S $T/ch_$at.wav pad $at 0 trim 0 8; files+=($T/ch_$at.wav); done
sox -m $T/sil.wav "${files[@]}" $S "$O/crickets.wav" norm -14
# dengung neon + detak jam ruang arsip 6 dtk
sox -n $S $T/neon.wav synth 6 sine 120 sine 240 square 120 remix - lowpass 3000 gain -24
sox -n $S $T/tick.wav synth 0.012 whitenoise highpass 2500 fade 0 0.012 0.01 gain -10 pad 0 0.988
sox $T/tick.wav $S $T/ticks.wav repeat 5
sox -m $T/neon.wav $T/ticks.wav $S "$O/archive-room.wav" norm -12
# angin puncak + dengung antena (60 Hz + desing 3,1 kHz)
sox -n $S $T/hw.wav synth 12 brownnoise lowpass 1100 tremolo 0.09 70 gain -2
sox -n $S $T/ant.wav synth 12 sine 60 sine 3100 remix - tremolo 0.5 30 gain -22
sox -m $T/hw.wav $T/ant.wav $S "$O/hill-wind.wav" fade t 0.6 12 0.6 norm -6

# --- radio / HT ---
# statis HT 6 dtk: band-pass, bergelombang, dengan kresek acak
sox -n $S $T/st.wav synth 6 whitenoise sinc 300-3000 tremolo 7 25 gain -6
sox -n $S $T/cr.wav synth 6 whitenoise sinc 1200-3000 tremolo 13 95 gain -16
sox -m $T/st.wav $T/cr.wav $S "$O/ht-static.wav" norm -8
# squelch: klik + semburan noise
sox -n $S $T/sq.wav synth 0.12 whitenoise sinc 500-2800 fade 0.002 0.12 0.04
sox -n $S $T/cl.wav synth 0.006 square 900 fade 0 0.006 0.004
sox $T/cl.wav $T/sq.wav $S "$O/squelch.wav" norm -4
# sirene sintetis 1,2 dtk PATAH-PATAH (potongan nada pendek tidak beraturan, bukan nada panjang naik-turun),
# lewat megafon (overdrive + resonansi corong) dan band-pass siaran
parts=()
i=0
for spec in "0.14 sine 640-760" "0.06 sine 0" "0.10 sine 920" "0.18 sine 760-900" "0.05 sine 0" "0.12 sine 700" "0.09 sine 980-860" "0.07 sine 0" "0.16 sine 820" "0.13 sine 690-640" "0.10 sine 0"; do
  set -- $spec; sox -n $S $T/sr_$i.wav synth $1 $2 $3 fade 0.004 $1 0.01; parts+=($T/sr_$i.wav); i=$((i+1))
done
sox "${parts[@]}" $S $T/siren.wav
sox $T/siren.wav $S "$O/siren.wav" overdrive 18 8 equalizer 1700 1q 6 sinc 300-3000 tremolo 11 30 norm -4
# glitch digital pendek (firasat, frame drop)
sox -n $S "$O/glitch.wav" synth 0.16 square 1700 whitenoise tremolo 60 100 sinc 600-5000 fade 0 0.16 0.03 norm -6

# --- foley ---
# langkah di jarum pinus 4 dtk (±1,8 langkah/dtk): debam rendah + kresek
sox -n $S $T/st1.wav synth 0.13 brownnoise lowpass 1400 fade 0.005 0.13 0.08 gain -4
sox -n $S $T/st2.wav synth 0.09 whitenoise sinc 2000-7000 tremolo 50 90 fade 0.003 0.09 0.06 gain -14
sox -m $T/st1.wav $T/st2.wav $S $T/step.wav pad 0 0.42
sox $T/step.wav $S "$O/steps.wav" repeat 6 norm -6
# napas tertahan 2,6 dtk (tarik, buang)
sox -n $S $T/b1.wav synth 1.1 pinknoise sinc 450-1800 fade q 0.5 1.1 0.5 gain -6
sox -n $S $T/b2.wav synth 1.3 pinknoise sinc 300-1300 fade q 0.2 1.3 0.9 gain -4
sox $T/b1.wav $T/b2.wav $S "$O/breath.wav" pad 0 0.2 norm -10
# camcorder jatuh: debam + gemeretak plastik
sox -n $S $T/f1.wav synth 0.35 sine 70-35 brownnoise remix - lowpass 400 fade 0 0.35 0.25 gain -2
sox -n $S $T/f2.wav synth 0.03 whitenoise highpass 1500 fade 0 0.03 0.02 pad 0 0.07
sox $T/f2.wav $S $T/f3.wav repeat 3 gain -10
sox $T/f3.wav $S $T/f4.wav pad 0.05 0
sox -m $T/f1.wav $T/f4.wav $S "$O/fall.wav" norm -2
# klip logam (foto sampel)
sox -n $S "$O/clip.wav" synth 0.05 square 2600 whitenoise remix - highpass 1200 fade 0 0.05 0.04 norm -6 pad 0 0.1

# --- jumpscare: suku kata pertama n7 dibalik + pitch turun + potongan sirene 0,3 dtk lewat megafon + statis ---
sox public/vo/tiang/edit/n7-tiru.wav $S $T/n7a.wav trim 0.1 0.4 reverse pitch -700 overdrive 20 8 gain -4
sox $T/siren.wav $S $T/sr3.wav trim 0.1 0.3 pitch -300 overdrive 22 8
sox -n $S $T/nz.wav synth 0.4 whitenoise sinc 300-4000 gain -8
sox -m $T/n7a.wav $T/sr3.wav $T/nz.wav $S $T/stg.wav
sox $T/stg.wav $S "$O/stinger.wav" equalizer 1700 1q 5 fade 0 0.62 0.3 norm -2
ls -1 "$O"
