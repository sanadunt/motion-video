#!/bin/bash
# Frame render PSX -> MP4 bergaya PS1: gerak "on twos" (15 gambar/dtk), perbesar nearest, 48 warna + dither bayer.
#   [AUDIO=vo.wav AUDIO_OFFSET=0.3] psx_post.sh <folder frame f_####.png> <out.mp4> [skala=3] [warna=48] [fps_gambar=15]
# AUDIO: VO/suara ikut di-mux (AAC); AUDIO_OFFSET = detik audio mulai (samakan dengan --offset lipsync.py).
set -euo pipefail
IN="$1"; OUT="$2"; SCALE="${3:-3}"; COLORS="${4:-48}"; STEP_FPS="${5:-15}"
first=$(ls "$IN"/f_*.png | head -1)
IFS=, read W H < <(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$first")
VF="fps=${STEP_FPS},scale=$((W*SCALE)):$((H*SCALE)):flags=neighbor,split[a][b];[a]palettegen=max_colors=${COLORS}:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3,fps=30,format=yuv420p[v]"
if [ -n "${AUDIO:-}" ]; then
  MS=$(awk -v o="${AUDIO_OFFSET:-0}" 'BEGIN{printf "%d", o*1000}')
  nice -n 15 ffmpeg -v error -y -framerate 30 -i "$IN/f_%04d.png" -i "$AUDIO" -filter_complex \
    "$VF;[1:a]adelay=${MS}:all=1,apad[a]" -map "[v]" -map "[a]" -shortest -c:v libx264 -crf 16 -c:a aac -b:a 192k "$OUT"
else
  nice -n 15 ffmpeg -v error -y -framerate 30 -i "$IN/f_%04d.png" -filter_complex "$VF" -map "[v]" -c:v libx264 -crf 16 "$OUT"
fi
echo "ok $OUT ($((W*SCALE))x$((H*SCALE)))"
