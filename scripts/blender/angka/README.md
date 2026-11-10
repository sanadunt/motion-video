# Render 3D SiaranAngka (ARSIP 05, PSX, Blender 5.2)

Sumber `public/3d/angka/`. Timing dibaca dari `src/Videos/angka-captions.json`; kalau cues VO berubah, render ulang di sini.
Fungsi tokoh dipinjam dari `../wajah/psx_lib.py` (base mesh CC0 `.claude/skills/psx-character/assets/psx_male_base_mesh.glb`).
Aturan: Siren Head tidak pernah dimodelkan. Tiang antena adalah benda mati.

```bash
R="/Users/mac/Magz Motion/motion-video"; B="$R/scripts/blender/angka"; GLB="$R/.claude/skills/psx-character/assets/psx_male_base_mesh.glb"
OUT="/Users/mac/Magz Motion/motion-starters/reverse/SiaranAngka"   # folder kerja (frame mentah, .blend)
# Adegan 4 padang salju -> public/3d/angka/salju.mp4 (452 frame; frame 1 = B.s3End)
nice -n 15 blender -b --factory-startup -P "$B/salju_scene.py" -- "$OUT" "$R" 270 480
ffmpeg -v error -y -framerate 30 -i "$OUT/frames_salju/f_%04d.png" -filter_complex \
  "fps=15,scale=1080:1920:flags=neighbor,split[a][b];[a]palettegen=max_colors=48:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3,fps=30,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -crf 16 -g 30 -movflags +faststart "$R/public/3d/angka/salju.mp4"
# Tokoh kamar 2001 (dari belakang, on twos) -> public/3d/angka/montes/f_0001…0527.png (frame ganjil saja)
TOTAL=527 nice -n 15 blender -b --factory-startup -P "$B/montes_char.py" -- "$OUT" "$GLB" "$R" 320 320
cp "$OUT"/frames_montes/f_*.png "$R/public/3d/angka/montes/"
```
- Uji still dulu: `ONLY=10,50` di depan perintah Blender, hasilnya di `$OUT/stills/`.
- `psx_post.sh` (folder wajah) keluar diam-diam untuk folder dengan ratusan frame (`set -o pipefail` + `ls | head`), jadi salju di-encode langsung dengan ffmpeg di atas.
- Lampu merah antena: nyala 36 frame, mati 36 frame (frame 1 = nyala), padam di cue "Tak ada yang…". `public/sfx/angka/buzz-cycle.wav` (2,4 dtk) diulang dari B.s3End supaya sinkron.
