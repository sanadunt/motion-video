#!/bin/bash
# Frame render PSX -> MP4 bergaya PS1: gerak "on twos" (15 gambar/dtk), perbesar nearest, 48 warna + dither bayer.
#   psx_post.sh <folder frame f_####.png> <out.mp4> [skala=3] [warna=48] [fps_gambar=15]
set -euo pipefail
IN="$1"; OUT="$2"; SCALE="${3:-3}"; COLORS="${4:-48}"; STEP_FPS="${5:-15}"
first=$(ls "$IN"/f_*.png | head -1)
IFS=, read W H < <(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$first")
nice -n 15 ffmpeg -v error -y -framerate 30 -i "$IN/f_%04d.png" -filter_complex \
  "fps=${STEP_FPS},scale=$((W*SCALE)):$((H*SCALE)):flags=neighbor,split[a][b];[a]palettegen=max_colors=${COLORS}:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3,fps=30,format=yuv420p" \
  -c:v libx264 -crf 16 "$OUT"
echo "ok $OUT ($((W*SCALE))x$((H*SCALE)))"
