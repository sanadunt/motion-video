#!/bin/zsh
# Render semua adegan 3D ArsipTiang lalu encode PSX (15 gambar/dtk, nearest ×4, 48 warna, Bayer) ke public/3d/tiang/.
# psx_post.sh tidak dipakai (keluar diam-diam untuk ratusan frame); encode langsung dengan ffmpeg seperti salju ARSIP 05.
#   zsh scripts/blender/tiang/render_all.sh [jalan relay pendaki cam face]
set -e
R=${0:A:h:h:h:h}; B=$R/scripts/blender/tiang
OUT="/Users/mac/Magz Motion/motion-starters/reverse/ArsipTiang"; mkdir -p "$OUT" "$R/public/3d/tiang/face"
SHOTS=($@); (( $#SHOTS )) || SHOTS=(jalan relay pendaki cam face)
enc() { # frames_dir out.mp4
  nice -n 15 ffmpeg -v error -y -framerate 30 -i "$1/f_%04d.png" -filter_complex \
    "fps=15,scale=1080:1920:flags=neighbor,split[a][b];[a]palettegen=max_colors=48:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3,fps=30,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 16 -g 30 -movflags +faststart "$2"
}
for s in $SHOTS; do
  rm -rf "$OUT/frames_$s"
  if [[ $s == face ]]; then
    nice -n 15 blender -b --factory-startup -P "$B/face_scene.py" -- "$OUT" "$R" 270 480 > "$OUT/log_face.txt" 2>&1
    for f in "$OUT"/frames_face/f_*.png; do zsh "$B/psx_still.sh" "$f" "$R/public/3d/tiang/face/${f:t}"; done
  else
    SHOT=$s nice -n 15 blender -b --factory-startup -P "$B/tiang_scenes.py" -- "$OUT" "$R" 270 480 > "$OUT/log_$s.txt" 2>&1
    enc "$OUT/frames_$s" "$R/public/3d/tiang/$s.mp4"
  fi
  echo "selesai $s $(ls "$OUT/frames_$s" | wc -l) frame"
done
