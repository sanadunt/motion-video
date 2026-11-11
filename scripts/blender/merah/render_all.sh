#!/bin/zsh
# Render semua adegan 3D "Nomor Merah" lalu encode PSX (15 gambar/dtk, nearest ×3, 48 warna, Bayer) ke public/3d/merah/.
#   zsh scripts/blender/merah/render_all.sh [meja warnet kursi lantai tutup]
# Langkah 0 (sekali, atau setiap timing VO berubah): make_assets.py membuat urutan layar LCD + tekstur.
set -e
R=${0:A:h:h:h:h}; B=$R/scripts/blender/merah
OUT="/Users/mac/Magz Motion/motion-starters/reverse/NomorMerah"; mkdir -p "$OUT" "$R/public/3d/merah"
PY="/Users/mac/Magz Motion/motion-starters/referensi/face-tools/.venv/bin/python"
SHOTS=($@); (( $#SHOTS )) || SHOTS=(meja warnet kursi lantai tutup)
"$PY" -I "$B/make_assets.py" "$R" "$OUT" > "$OUT/log_assets.txt" 2>&1
enc() { # frames_dir out.mp4
  nice -n 15 ffmpeg -v error -y -framerate 30 -i "$1/f_%04d.png" -filter_complex \
    "fps=15,scale=1080:1920:flags=neighbor,split[a][b];[a]palettegen=max_colors=48:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3,fps=30,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 16 -g 30 -movflags +faststart "$2"
}
for s in $SHOTS; do
  rm -rf "$OUT/frames_$s"
  SHOT=$s nice -n 15 blender -b --factory-startup -P "$B/merah_scenes.py" -- "$OUT" "$R" 360 640 > "$OUT/log_$s.txt" 2>&1
  enc "$OUT/frames_$s" "$R/public/3d/merah/$s.mp4"
  echo "selesai $s $(ls "$OUT/frames_$s" | wc -l) frame"
done
