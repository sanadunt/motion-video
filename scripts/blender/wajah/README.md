# Render 3D WajahDiLukisan (PSX, Blender 5.2)

Sumber dua shot 3D di `public/3d/wajah/`. Tokoh = base mesh CC0 `.claude/skills/psx-character/assets/psx_male_base_mesh.glb`.
Timing dibaca dari `src/Videos/wajah-words.json` dan `wajah-captions.json`. Kalau cues VO berubah, render ulang di sini.

```bash
R="/Users/mac/Magz Motion/motion-video"; B="$R/scripts/blender/wajah"; GLB="$R/.claude/skills/psx-character/assets/psx_male_base_mesh.glb"
OUT="/Users/mac/Magz Motion/motion-starters/reverse/WajahDiLukisan"   # folder kerja (frame mentah, .blend)
# Lerici (adegan teras penuh 3D) -> public/3d/wajah/lerici.mp4
nice -n 15 blender -b --factory-startup -P "$B/lerici_scene.py" -- "$OUT" "$GLB" "$R" 270 480
bash "$B/psx_post.sh" "$OUT/frames_lerici" "$R/public/3d/wajah/lerici.mp4" 4 48 15
# Pasangan galeri -> public/3d/wajah/couple/f_####.png (salin hanya frame ganjil = on twos)
nice -n 15 blender -b --factory-startup -P "$B/couple_scene.py" -- "$OUT" "$GLB" "$R" 320 320
```
- Uji still dulu: `ONLY=1,62,150,214` di depan perintah Blender, hasilnya di `$OUT/stills/`.
- Atlas wajah Shelley (`face/shelley_atlas.png`, 2 sel: diam, seram) dibuat dari `public/faces/wajah/F7-shelley-curran-1819.jpg` dengan `face/make_atlas.py` (venv face-tools MediaPipe; lihat skill psx-character).
