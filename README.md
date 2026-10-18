# motion-video

Video motion graphic vertikal (1080x1920, 30 fps, 8 detik) yang dibuat dengan [Remotion](https://www.remotion.dev).

## Isi video (`HaloDunia`)

| Detik | Animasi |
| ----- | ------- |
| 0–1   | Lingkaran ungu `#8B5CF6` muncul dari tengah, scale 0→1 dengan spring (sedikit membal) |
| 1–3   | Teks **"Halo, Dunia!"** muncul kata per kata (slide up + fade in), jeda 0.2 s antar kata |
| 3–5   | Subjudul "Dibuat oleh AI" (`#A5B4FC`) fade in |
| 5–7   | Angka count-up 0→100% (`#FACC15`) di bagian bawah |
| 7–8   | Semua elemen zoom out + fade out ke hitam |

Latar: gradasi `#0F0F1A` → `#1E1B4B`. Semua gerakan memakai easing/spring, margin aman ≥ 80 px.

Kode komposisi ada di `src/HaloDunia.tsx`, registrasi di `src/Root.tsx`.

## Perintah

```bash
npm install
npm run dev      # buka Remotion Studio (preview interaktif)
npm run render   # render ke out/video.mp4 (h264)
npm run lint     # eslint + tsc
```

Render still frame tertentu, misalnya detik 1, 4, dan 6:

```bash
npx remotion render HaloDunia out/frames --frames=30,120,180 --image-format=png
```

## Render lewat GitHub Actions

Workflow `.github/workflows/render-video.yml` bisa dijalankan manual dari tab **Actions** → **Render video** → **Run workflow**. Hasilnya diunggah sebagai artifact `video`.

## Hasil render

`out/video.mp4` ikut di-commit sebagai hasil render (folder `out/` di-ignore secara default, ditambahkan dengan `git add -f`).

## Remotion Agent Skills

Folder `.agents/skills/` (dan symlink di `.claude/skills/`) berisi Remotion Agent Skills yang dipasang lewat `npx remotion skills add`.
