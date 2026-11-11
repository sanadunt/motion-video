# Adegan 3D PSX "Nomor Merah"

Folder kerja (di luar repo): `/Users/mac/Magz Motion/motion-starters/reverse/NomorMerah`.

```bash
zsh scripts/blender/merah/render_all.sh                 # semua: meja warnet inbox kursi lantai tutup → public/3d/merah/*.mp4
zsh scripts/blender/merah/render_all.sh tutup           # satu adegan
SHOT=meja ONLY=1,120 blender -b --factory-startup -P scripts/blender/merah/merah_scenes.py -- "<folder kerja>" "$PWD" 360 640   # still uji
```

- `merah_beats.py`: beat dari cues VO (rumus sama dengan objek `B` di `src/Videos/NomorMerah.tsx`). Cek: `python3 scripts/blender/merah/merah_beats.py .`
- `make_assets.py`: layar LCD 96×64 per frame (font piksel 5×7 sendiri) ke `<folder kerja>/lcd/<shot>/`, layar diam + judul ke `public/3d/merah/lcd/`, tekstur ke `public/3d/merah/tex/`. Dijalankan otomatis oleh `render_all.sh`.
- `merah_scenes.py`: `SHOT=meja|warnet|inbox|kursi|lantai|tutup`. Geometri memakai helper bmesh `../tiang/tiang_lib.py`.
- Kalau timing VO berubah: jalankan ulang `scripts/vo-align.mjs`, lalu `render_all.sh` (LCD dan animasi ikut bergeser).
- Render ±1–2 menit per adegan di 360×640; encode: 15 gambar/dtk, nearest ×3, 48 warna, dither Bayer.
