#!/bin/zsh
# Olah VO ARSIP 06 "Yang Berdiri di Antara Tiang" (ArsipTiang). Hanya sox + ffmpeg, tanpa jaringan.
#
#   zsh scripts/sfx/tiang_vo.sh edit   → public/vo/tiang/edit/*.wav  48 kHz, bersih, jeda internal dipangkas
#   zsh scripts/sfx/tiang_vo.sh mix    → public/vo/tiang/mix/*.wav   diolah + loudness, siap ditempatkan
#   zsh scripts/sfx/tiang_vo.sh dengar → out/review/ArsipTiang/vo-dengar.mp3 (seluruh timeline dari briefs/ArsipTiang.vo.json)
#
# Sumber: public/vo/tiang/<klip>.wav (AI Studio, 24 kHz, rekaman bersih).
# edit/ memiliki timing yang sama dengan mix/ untuk narator dan b1, jadi whisper + vo-align memakai edit/.
# Klip siaran makhluk (k1, b2, n7) di mix/ diberi ekor squelch: suara mulai CREATURE_PRE dtk setelah awal file.
set -euo pipefail
ROOT=${0:A:h:h:h}
SRC=$ROOT/public/vo/tiang
EDIT=$SRC/edit
MIX=$SRC/mix
TMP=$(mktemp -d)
trap 'rm -rf $TMP' EXIT
mkdir -p $EDIT $MIX

NARR=(01-hook 02-ciri 03a-siaran 03b-kenal 04-pendaki 05-hilang 06-satu)
CREATURE=(k1-siaran b2-tambah n7-tiru)
CREATURE_PRE=0.30   # squelch + statis sebelum suara
CREATURE_POST=0.35  # statis + squelch sesudah suara

# Target loudness (LUFS terintegrasi), pola ARSIP 05: narator −17, radio −19, bisikan −23/−27.
LU_NARR=-17; LU_B1=-21; LU_CREATURE=-18; LU_MUMBLE=-46

# Kata kunci narator: "awal akhir mode" dalam detik edit/ (dari whisper edit/, lihat brief).
# wow = wow-flutter pita, drop = dropout 3 frame.
typeset -A KEYS
KEYS[01-hook]="6.55 7.85 wow"          # "bertambah satu"
KEYS[02-ciri]="18.70 18.80 drop"       # "pengeras" (dua PENGERAS suara)
KEYS[06-satu]="5.65 5.75 drop"         # "asalnya"

dur() { soxi -D "$1"; }

# Normalisasi 2 pass sederhana: ukur I, geser gain, limiter −1,5 dBTP.
norm() { # in out target
  local I=$(ffmpeg -hide_banner -nostats -i "$1" -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
  local g=$(( $3 - I ))
  ffmpeg -hide_banner -loglevel error -y -i "$1" -af "volume=${g}dB,alimiter=limit=0.84:level=false:attack=3:release=60,aresample=48000" -ar 48000 -ac 1 -c:a pcm_s16le "$2"
}

edit_clip() { # name batas rasio  (lihat scripts/sfx/vo-gaps.mjs)
  sox -G "$SRC/$1.wav" -b 16 "$TMP/$1.48k.wav" rate -v 48k
  local g=$(node $ROOT/scripts/sfx/vo-gaps.mjs "$TMP/$1.48k.wav" "$EDIT/$1.wav" $2 $3)
  printf "  edit %-11s %6.2f → %6.2f dtk  %s\n" $1 $(dur "$SRC/$1.wav") $(dur "$EDIT/$1.wav") "$g"
}

do_edit() {
  # AI Studio membaca "…" 1–1,8 dtk. Jeda > batas dikompresi (batas + sisa × rasio), urutan panjang tetap.
  # Penutup 05/06 sengaja lebih lapang; b1 tidak diubah (jeda antar hitungan = tegang).
  for n in 01-hook 02-ciri 03a-siaran 03b-kenal 04-pendaki; do edit_clip $n 0.70 0.30; done
  for n in 05-hilang 06-satu; do edit_clip $n 0.90 0.50; done
  edit_clip b1-hitung 9 1
  for n in $CREATURE; do edit_clip $n 0.50 0.30; done
  for n in m1-mumble m2-mumble; do sox "$SRC/$n.wav" -b 16 "$EDIT/$n.wav" rate -v 48k; done
}

# Narator: pita lebar, saturasi tipis, desis halus, wow/dropout di kata kunci.
mix_narr() {
  local n=$1 L=$(dur "$EDIT/$1.wav") fx="[c]anull[v];" k=(${=KEYS[$1]:-})
  # amplop W(t) 0→1→0 dengan rampa r dtk, supaya efek tidak menyala mendadak (klik)
  win() { echo "min(max((t-$1)/$3,0),1)*min(max(($2-t)/$3,0),1)"; }
  if (( ${#k} )); then
    if [[ ${k[3]} == wow ]]; then
      local W=$(win ${k[1]} ${k[2]} 0.06)
      fx="[c]asplit[d][w];[w]vibrato=f=5.5:d=0.35,aeval='val(0)*$W':c=same[wv];[d]aeval='val(0)*(1-$W)':c=same[dv];[dv][wv]amix=inputs=2:normalize=0[v];"
    else
      fx="[c]aeval='val(0)*(1-0.94*$(win ${k[1]} ${k[2]} 0.008))':c=same[v];"
    fi
  fi
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/$n.wav" \
    -f lavfi -i "anoisesrc=color=pink:amplitude=0.004:seed=6:duration=$L:sample_rate=48000" -filter_complex "
      [0]highpass=f=75,equalizer=f=160:t=q:w=1:g=1.5,volume=5dB,asoftclip=type=tanh,volume=-5dB,lowpass=f=11500,lowpass=f=11500[c];
      ${fx}
      [1]highpass=f=2500,lowpass=f=9000[h];
      [v][h]amix=inputs=2:duration=first:normalize=0" -ar 48000 -ac 1 "$TMP/$n.wav"
  norm "$TMP/$n.wav" "$MIX/$n.wav" $LU_NARR
}

# b1: mic camcorder (low-pass 7 kHz, AGC, desis kaset).
mix_b1() {
  local L=$(dur "$EDIT/b1-hitung.wav")
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/b1-hitung.wav" \
    -f lavfi -i "anoisesrc=color=white:amplitude=0.003:seed=7:duration=$L:sample_rate=48000" -filter_complex "
      [0]highpass=f=130,lowpass=f=7000,lowpass=f=7000,acompressor=threshold=-26dB:ratio=5:attack=4:release=180:makeup=3[v];
      [1]lowpass=f=7000[h];
      [v][h]amix=inputs=2:duration=first:normalize=0" -ar 48000 -ac 1 "$TMP/b1.wav"
  norm "$TMP/b1.wav" "$MIX/b1-hitung.wav" $LU_B1
}

# Suara makhluk: dua lapis megafon (A −4 semiton, B asli telat 45 ms), lalu siaran HT
# (band-pass 300–3000 Hz, bitcrush, statis, squelch di awal dan akhir).
mix_creature() {
  local n=$1 e="$EDIT/$1.wav"
  sox "$e" "$TMP/A.wav" pitch -400 highpass 450 lowpass 3800 overdrive 16 6 gain -8 equalizer 1700 1q 5
  sox "$e" "$TMP/B.wav" pad 0.045 0 highpass 450 lowpass 3800 overdrive 12 6 gain -8 equalizer 2100 1q 4
  sox -m -v 0.9 "$TMP/A.wav" -v 0.65 "$TMP/B.wav" "$TMP/AB.wav"
  local V=$(dur "$TMP/AB.wav")
  local L=$(( CREATURE_PRE + V + CREATURE_POST ))
  sox "$TMP/AB.wav" "$TMP/ABp.wav" pad $CREATURE_PRE $CREATURE_POST
  # statis: desis band-pass yang sedikit bergelombang
  sox -n -r 48000 -b 16 -c 1 "$TMP/st.wav" synth $L whitenoise vol 0.07 sinc 300-3000 tremolo 7 25
  # squelch: semburan noise 0,12 dtk + klik, di awal dan akhir
  sox -n -r 48000 -b 16 -c 1 "$TMP/sq.wav" synth 0.12 whitenoise vol 0.45 sinc 500-2800 fade 0.002 0.12 0.04
  sox -n -r 48000 -b 16 -c 1 "$TMP/click.wav" synth 0.006 square 900 vol 0.6 fade 0 0.006 0.004
  sox "$TMP/click.wav" "$TMP/sq.wav" "$TMP/sqA.wav"
  sox "$TMP/sq.wav" "$TMP/click.wav" "$TMP/sqB.wav" reverse
  sox "$TMP/sqB.wav" "$TMP/sqBp.wav" pad $(( L - 0.13 )) 0
  sox -m -v 1 "$TMP/ABp.wav" -v 1 "$TMP/st.wav" -v 1 "$TMP/sqA.wav" -v 1 "$TMP/sqBp.wav" "$TMP/mixed.wav" trim 0 $L
  ffmpeg -hide_banner -loglevel error -y -i "$TMP/mixed.wav" -af "
      highpass=f=300,highpass=f=300,lowpass=f=3000,lowpass=f=3000,
      acrusher=bits=8:mode=log:aa=1:samples=2:mix=0.55,
      volume=4dB,asoftclip=type=atan,volume=-4dB,lowpass=f=3400,lowpass=f=3400" -ar 48000 -ac 1 "$TMP/$n.wav"
  norm "$TMP/$n.wav" "$MIX/$n.wav" $LU_CREATURE
}

# Mumble: dibalik, di-filter, gema kabel; diletakkan sangat pelan (−46 LUFS ≈ −29 dB di bawah narator).
mix_mumble() {
  local n=$1 extra=""
  [[ $n == m2-mumble ]] && extra=",acrusher=bits=9:mode=log:aa=1:samples=3:mix=0.5"
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/$n.wav" -af "
      areverse,highpass=f=350,lowpass=f=2500,aecho=0.8:0.55:70|130:0.35|0.2${extra},
      afade=t=in:d=0.4,areverse,afade=t=in:d=0.6,areverse" -ar 48000 -ac 1 "$TMP/$n.wav"
  norm "$TMP/$n.wav" "$MIX/$n.wav" $LU_MUMBLE
}

do_mix() {
  for n in $NARR; do mix_narr $n; done
  mix_b1
  for n in $CREATURE; do mix_creature $n; done
  for n in m1-mumble m2-mumble; do mix_mumble $n; done
  for f in $MIX/*.wav; do
    printf "  mix %-11s %6.2f dtk  " ${f:t:r} $(dur $f)
    ffmpeg -hide_banner -nostats -i $f -af ebur128=peak=true -f null - 2>&1 | awk '/^ *I:/{i=$2} /^ *Peak:/{p=$2} END{printf "%s LUFS  puncak %s dBFS\n", i, p}'
  done
}

# File dengar: tempatkan mix/ sesuai "timeline" di briefs/ArsipTiang.vo.json, akhiri dengan
# hening 1,5 dtk, lonjakan jumpscare 0,3 dtk, hitam 0,7, lalu kartu kredit (desis pita) 7,5 dtk.
do_dengar() {
  local OUT=$ROOT/out/review/ArsipTiang
  mkdir -p $OUT
  node -e '
    const c = require(process.argv[1]); const items = c.timeline;
    for (const t of items) console.log(`${t.file} ${t.at} ${t.gain ?? 0} ${t.dur ?? 0}`);
    console.log(`__end ${c.end}`);' $ROOT/briefs/ArsipTiang.vo.json > $TMP/tl.txt
  local END=$(awk '$1=="__end"{print $2}' $TMP/tl.txt)
  local args=() i=0 parts=""
  while read -r f at g d; do
    [[ $f == __end ]] && continue
    args+=(-i "$MIX/$f.wav")
    local cut=""
    (( d > 0 )) && cut="atrim=0:$d,afade=t=out:st=$(( d - 0.6 )):d=0.6,"
    parts+="[$i]${cut}adelay=$(( at * 1000 )):all=1,volume=${g}dB[a$i];"
    i=$(( i + 1 ))
  done < $TMP/tl.txt
  # lonjakan jumpscare (penanda dengar saja; desain final di tahap komposisi)
  local JS=$(node -e 'console.log(require(process.argv[1]).jumpscare)' $ROOT/briefs/ArsipTiang.vo.json)
  sox -n -r 48000 -b 16 -c 1 $TMP/js.wav synth 0.3 whitenoise vol 0.8 synth 0.3 sine fmod 380-180 sinc 300-3000 overdrive 20 fade 0.005 0.3 0.12
  args+=(-i $TMP/js.wav)
  parts+="[$i]adelay=$(( JS * 1000 )):all=1[a$i];"
  i=$(( i + 1 ))
  local mixin="" j
  for (( j = 0; j < i; j++ )); do mixin+="[a$j]"; done
  ffmpeg -hide_banner -loglevel error -y "${args[@]}" -filter_complex "${parts}${mixin}amix=inputs=$i:duration=longest:normalize=0,apad=whole_dur=$END,atrim=0:$END" \
    -ar 48000 -ac 1 $TMP/full.wav
  # gain terukur → −14 LUFS, limiter −2 dBFS (headroom untuk true peak MP3 ≤ −1 dBTP)
  ffmpeg -hide_banner -loglevel error -y -i $TMP/full.wav -af "acompressor=threshold=-24dB:ratio=2.5:attack=8:release=220:makeup=1" $TMP/comp.wav
  local I=$(ffmpeg -hide_banner -nostats -i $TMP/comp.wav -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
  ffmpeg -hide_banner -loglevel error -y -i $TMP/comp.wav -af "volume=$(( -14.0 - I ))dB,alimiter=limit=0.79:level=false:attack=2:release=80" \
    -ar 48000 -c:a libmp3lame -b:a 192k $OUT/vo-dengar.mp3
  printf "  dengar %.2f dtk → %s\n" $(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT/vo-dengar.mp3) $OUT/vo-dengar.mp3
}

case ${1:-} in
  edit) do_edit ;;
  mix) do_mix ;;
  dengar) do_dengar ;;
  *) echo "pakai: zsh scripts/sfx/tiang_vo.sh edit|mix|dengar"; exit 1 ;;
esac
