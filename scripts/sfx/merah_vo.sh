#!/bin/zsh
# Olah VO "Nomor Merah" (NomorMerah). Hanya sox + ffmpeg, tanpa jaringan. Pola: scripts/sfx/tiang_vo.sh.
#
#   zsh scripts/sfx/merah_vo.sh edit   → public/vo/merah/edit/*.wav  48 kHz, bersih, jeda internal dipangkas
#   zsh scripts/sfx/merah_vo.sh mix    → public/vo/merah/mix/*.wav   diolah + loudness, siap ditempatkan
#   zsh scripts/sfx/merah_vo.sh dengar → out/review/NomorMerah/vo-timeline.mp3 (timeline dari briefs/NomorMerah.vo.json)
#
# Sumber: public/vo/merah/<klip>.wav (AI Studio, 24 kHz mono, rekaman bersih). Teks klip terkunci: tidak ada generate ulang.
# edit/ dan mix/ narator memiliki timing yang sama, jadi whisper + vo-align memakai edit/.
# s1 (suara pesan) dipotong per kalimat → s1a..s1d, diolah jadi speaker ponsel kecil. w1 (bisikan) → w1a, w1b.
set -euo pipefail
ROOT=${0:A:h:h:h}
SRC=$ROOT/public/vo/merah
EDIT=$SRC/edit
MIX=$SRC/mix
TMP=$(mktemp -d)
trap 'rm -rf $TMP' EXIT
mkdir -p $EDIT $MIX

NARR=(01-hook 02-sebar 03-konon 04-resmi 05-iseng 06-sakit 07-dunia 08-tutup)
# Target loudness (LUFS terintegrasi): narator −17; suara pesan 19 dB di bawahnya; bisikan 28 dB di bawahnya.
LU_NARR=-17; LU_PESAN=-36; LU_BISIK=-45

dur() { soxi -D "$1"; }

norm() { # in out target
  local I=$(ffmpeg -hide_banner -nostats -i "$1" -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
  local g=$(( $3 - I ))
  ffmpeg -hide_banner -loglevel error -y -i "$1" -af "volume=${g}dB,alimiter=limit=0.84:level=false:attack=3:release=60,aresample=48000" -ar 48000 -ac 1 -c:a pcm_s16le "$2"
}

edit_clip() { # name batas rasio  (lihat scripts/sfx/vo-gaps.mjs)
  sox -G "$SRC/$1.wav" -b 16 "$TMP/$1.48k.wav" rate -v 48k
  local g=$(node $ROOT/scripts/sfx/vo-gaps.mjs "$TMP/$1.48k.wav" "$EDIT/$1.wav" $2 $3)
  printf "  edit %-9s %6.2f → %6.2f dtk  %s\n" $1 $(dur "$SRC/$1.wav") $(dur "$EDIT/$1.wav") "$g"
}

# Potong file per kalimat di jeda sunyi ≥ 0,3 dtk → <prefix>a.wav, <prefix>b.wav, ... (kepala 0,05, ekor 0,15 dtk)
split_clip() { # in prefix
  sox -G "$1" -b 16 "$TMP/split.wav" rate -v 48k
  node -e '
    const {spawnSync} = require("node:child_process");
    const [inp, prefix] = process.argv.slice(1);
    const det = spawnSync("ffmpeg", ["-hide_banner", "-i", inp, "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"], {encoding: "utf8"}).stderr;
    const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(det).slice(1).reduce((a, x) => a * 60 + +x, 0);
    const st = [...det.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
    const en = [...det.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
    const sil = st.map((s, i) => [s, en[i] ?? dur]);
    const merged = [];                        // jeda yang nyaris bersambung dianggap satu
    for (const s of sil) { const p = merged.at(-1); if (p && s[0] - p[1] < 0.05) p[1] = s[1]; else merged.push([...s]); }
    let cur = merged.length && merged[0][0] <= 0.01 ? merged.shift()[1] : 0;
    const segs = [];
    for (const [s, e] of merged) { segs.push([cur, s]); cur = e; }
    if (dur - cur > 0.2) segs.push([cur, dur]);
    segs.forEach(([a, b], i) => {
      const out = `${prefix}${String.fromCharCode(97 + i)}.wav`;
      const x = Math.max(0, a - 0.05), y = Math.min(dur, b + 0.15);
      spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", inp, "-af", `atrim=${x}:${y},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${(y - x - 0.08).toFixed(3)}:d=0.08`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", out]);
      console.log(`  potong ${out.split("/").pop()}  ${a.toFixed(2)}–${b.toFixed(2)}  (${(y - x).toFixed(2)} dtk)`);
    });' "$TMP/split.wav" "$2"
}

do_edit() {
  # AI Studio membaca "…" 0,7–1,4 dtk. Jeda > batas dikompresi (batas + sisa × rasio), urutan panjang jeda tetap.
  # Klip penutup 08 sengaja lebih lapang (dua pertanyaan butuh ruang).
  for n in 01-hook 02-sebar 03-konon 04-resmi 05-iseng 06-sakit 07-dunia; do edit_clip $n 0.70 0.30; done
  edit_clip 08-tutup 0.90 0.50
  split_clip "$SRC/s1-pesan.wav" "$EDIT/s1"
  split_clip "$SRC/w1-bisik.wav" "$EDIT/w1"
  local t=0; for n in $NARR; do t=$(( t + $(dur "$EDIT/$n.wav") )); done
  printf "  total narator edit/: %.2f dtk\n" $t
}

# Narator: bersih, sedikit warna pita lama (saturasi tipis, desis halus). Tetap jelas.
mix_narr() {
  local n=$1 L=$(dur "$EDIT/$1.wav")
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/$n.wav" \
    -f lavfi -i "anoisesrc=color=pink:amplitude=0.004:seed=8:duration=$L:sample_rate=48000" -filter_complex "
      [0]highpass=f=75,equalizer=f=160:t=q:w=1:g=1.5,volume=5dB,asoftclip=type=tanh,volume=-5dB,lowpass=f=11500,lowpass=f=11500[v];
      [1]highpass=f=2500,lowpass=f=9000[h];
      [v][h]amix=inputs=2:duration=first:normalize=0" -ar 48000 -ac 1 "$TMP/$n.wav"
  norm "$TMP/$n.wav" "$MIX/$n.wav" $LU_NARR
}

# Suara pesan: speaker ponsel kecil di atas meja (band-pass sempit, resonansi 1,9 kHz, bitcrush ringan, pantulan pendek).
mix_pesan() {
  local n=$1
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/$n.wav" -af "
      highpass=f=520,highpass=f=520,lowpass=f=3300,lowpass=f=3300,
      equalizer=f=1900:t=q:w=1.2:g=7,
      acrusher=bits=8:mode=log:aa=1:samples=3:mix=0.5,
      volume=6dB,asoftclip=type=atan,volume=-6dB,
      aecho=0.9:0.5:11|23:0.35|0.2,lowpass=f=3600" -ar 48000 -ac 1 "$TMP/$n.wav"
  norm "$TMP/$n.wav" "$MIX/$n.wav" $LU_PESAN
}

# Bisikan: ambience jauh (low-pass, gema ruang), sangat pelan.
mix_bisik() {
  local n=$1
  ffmpeg -hide_banner -loglevel error -y -i "$EDIT/$n.wav" -af "apad=pad_dur=1.2" "$TMP/$n.p.wav"
  local L=$(dur "$TMP/$n.p.wav")
  sox "$TMP/$n.p.wav" "$TMP/$n.r.wav" highpass 250 lowpass 4200 reverb 55 60 70 100 20 fade t 0.08 $L 0.9
  norm "$TMP/$n.r.wav" "$MIX/$n.wav" $LU_BISIK
}

do_mix() {
  for n in $NARR; do mix_narr $n; done
  for f in $EDIT/s1?.wav; do mix_pesan ${f:t:r}; done
  for f in $EDIT/w1?.wav; do mix_bisik ${f:t:r}; done
  for f in $MIX/*.wav; do
    printf "  mix %-9s %6.2f dtk  " ${f:t:r} $(dur $f)
    ffmpeg -hide_banner -nostats -i $f -af ebur128=peak=true -f null - 2>&1 | awk '/^ *I:/{i=$2} /^ *Peak:/{p=$2} END{printf "%s LUFS  puncak %s dBFS\n", i, p}'
  done
}

# File dengar: tempatkan mix/ sesuai "timeline" di briefs/NomorMerah.vo.json (tanpa SFX), −14 LUFS.
do_dengar() {
  local OUT=$ROOT/out/review/NomorMerah
  mkdir -p $OUT
  node -e '
    const c = require(process.argv[1]);
    for (const t of c.timeline) console.log(`${t.file} ${t.at} ${t.gain ?? 0}`);
    console.log(`__end ${c.end}`);' $ROOT/briefs/NomorMerah.vo.json > $TMP/tl.txt
  local END=$(awk '$1=="__end"{print $2}' $TMP/tl.txt)
  local args=() i=0 parts=""
  while read -r f at g; do
    [[ $f == __end ]] && continue
    args+=(-i "$MIX/$f.wav")
    parts+="[$i]adelay=$(( at * 1000 )):all=1,volume=${g}dB[a$i];"
    i=$(( i + 1 ))
  done < $TMP/tl.txt
  local mixin="" j
  for (( j = 0; j < i; j++ )); do mixin+="[a$j]"; done
  ffmpeg -hide_banner -loglevel error -y "${args[@]}" -filter_complex "${parts}${mixin}amix=inputs=$i:duration=longest:normalize=0,apad=whole_dur=$END,atrim=0:$END" \
    -ar 48000 -ac 1 $TMP/full.wav
  local I=$(ffmpeg -hide_banner -nostats -i $TMP/full.wav -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
  ffmpeg -hide_banner -loglevel error -y -i $TMP/full.wav -af "volume=$(( -14.0 - I ))dB,alimiter=limit=0.79:level=false:attack=2:release=80" \
    -ar 48000 -c:a libmp3lame -b:a 192k $OUT/vo-timeline.mp3
  printf "  dengar %.2f dtk → %s\n" $(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT/vo-timeline.mp3) $OUT/vo-timeline.mp3
}

case ${1:-} in
  edit) do_edit ;;
  mix) do_mix ;;
  dengar) do_dengar ;;
  *) echo "pakai: zsh scripts/sfx/merah_vo.sh edit|mix|dengar"; exit 1 ;;
esac
