#!/bin/zsh
# Render ArsipTiang (ARSIP 06) + mastering audio ke −14 LUFS, puncak < −1 dBTP.
#   zsh scripts/render_tiang.sh lowres   → out/review/ArsipTiang-lowres.mp4 (360×640, satu kali render)
#   zsh scripts/render_tiang.sh final    → out/ArsipTiang-Portrait.mp4 (1080×1920, per chunk adegan, audio dirender sekali)
# Aturan rumah: concurrency 2, nice 15, render per adegan untuk final.
set -euo pipefail
R=${0:A:h:h}; cd $R
COMP=ArsipTiang-Portrait
MODE=${1:-lowres}
TMP=$R/out/review/ArsipTiang-tmp; mkdir -p $TMP out/chunks

master() { # in_audio out_audio.m4a
  local I=$(ffmpeg -hide_banner -nostats -i "$1" -af ebur128 -f null - 2>&1 | awk '/^ *I:/{v=$2} END{print v}')
  local g=$(( -14.0 - I ))
  echo "loudness awal $I LUFS → gain $g dB"
  ffmpeg -hide_banner -loglevel error -y -i "$1" -af "volume=${g}dB,alimiter=limit=0.82:level=false:attack=2:release=80,aresample=48000" -c:a aac -b:a 192k "$2"
  ffmpeg -hide_banner -nostats -i "$2" -af ebur128=peak=true -f null - 2>&1 | awk '/^ *I:/{i=$2} /^ *Peak:/{p=$2} END{print "hasil I", i, "LUFS, true peak", p, "dBFS"}'
}

if [[ $MODE == lowres ]]; then
  nice -n 15 npx remotion render $COMP $TMP/lowres-raw.mp4 --scale=0.3333333333333333 --concurrency=2 --codec=h264 --log=error
  ffmpeg -hide_banner -loglevel error -y -i $TMP/lowres-raw.mp4 -vn -c:a pcm_s16le $TMP/lowres.wav
  master $TMP/lowres.wav $TMP/lowres.m4a
  ffmpeg -hide_banner -loglevel error -y -i $TMP/lowres-raw.mp4 -i $TMP/lowres.m4a -map 0:v -map 1:a -c:v copy -c:a copy -movflags +faststart out/review/ArsipTiang-lowres.mp4
  echo "selesai out/review/ArsipTiang-lowres.mp4"
else
  # chunk per adegan (frame global, inklusif); batas = objek B (lihat brief STATE)
  CHUNKS=(${=CHUNKS:-0-331 332-947 948-1473 1474-2039 2040-2768})
  i=1
  for c in $CHUNKS; do
    out=out/chunks/ArsipTiang-0$i.mp4
    [[ -f $out && -z ${FORCE:-} ]] || nice -n 15 npx remotion render $COMP $out --frames=$c --concurrency=2 --codec=h264 --muted --log=error
    echo "chunk $i ($c) selesai"; i=$((i+1))
  done
  : > $TMP/list.txt; for f in $R/out/chunks/ArsipTiang-0*.mp4; do print -r -- "file '$f'" >> $TMP/list.txt; done
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i $TMP/list.txt -c copy $TMP/video.mp4
  nice -n 15 npx remotion render $COMP $TMP/audio.wav --codec=wav --concurrency=2 --log=error
  master $TMP/audio.wav $TMP/audio.m4a
  ffmpeg -hide_banner -loglevel error -y -i $TMP/video.mp4 -i $TMP/audio.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart out/ArsipTiang-Portrait.mp4
  echo "selesai out/ArsipTiang-Portrait.mp4"
fi
