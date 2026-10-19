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

## Auto caption (`CaptionedVideo`)

Komposisi `CaptionedVideo` memutar video dari `public/` dan menampilkan caption animasi gaya TikTok
(kata yang sedang diucapkan di-highlight kuning dan "pop"). Caption dihasilkan otomatis oleh
whisper.cpp (CPU, tanpa GPU) lewat `scripts/transcribe.ts`, lalu dikoreksi dengan `scripts/glossary.json`
untuk nama/istilah yang sering salah dengar.

Alur lokal:

```bash
# 1. Taruh video di public/, lalu transkripsi (install whisper.cpp + unduh model otomatis)
WHISPER_PROMPT="Kakashi, Chidori, Sharingan" npx tsx scripts/transcribe.ts kakashi-chidori.mp4 small id
#    -> public/kakashi-chidori.captions.json

# 2. (Opsional) koreksi manual JSON-nya, atau terapkan ulang glosarium
npx tsx scripts/glossary.ts public/kakashi-chidori.captions.json

# 3. Render
npx remotion render CaptionedVideo out/kakashi-chidori-captioned.mp4 --codec=h264 \
  --props='{"src":"kakashi-chidori.mp4","captionsFile":"kakashi-chidori.captions.json","captions":[],"captionTop":1260,"captionHeight":220,"blurBehindCaptions":true}'
```

Props `captionTop`/`captionHeight` menentukan area caption (komposisi 1080x1920). `blurBehindCaptions`
memburamkan area di belakang caption, berguna untuk menutup subtitle bawaan video sumber.
Durasi komposisi dan isi caption dimuat otomatis di `calculateMetadata`.

Font Montserrat ExtraBold dibundel di `public/fonts/` supaya render tidak bergantung pada jaringan.

## Render lewat GitHub Actions

Dua workflow bisa dijalankan manual dari tab **Actions** → **Run workflow**:

| Workflow | File | Hasil |
| --- | --- | --- |
| Render video | `.github/workflows/render-video.yml` | Render komposisi `HaloDunia` → artifact `video` |
| Transcribe & render captions | `.github/workflows/transcribe-and-render.yml` | Transkripsi video di `public/` dengan whisper.cpp, render `CaptionedVideo` → artifact `captioned-video-<nama>` berisi MP4, frame review, dan captions JSON |

Input workflow caption: nama file video, model Whisper (`small` cepat, `medium` lebih akurat), kode bahasa,
prompt kosakata, opsi lewati transkripsi (pakai JSON yang sudah ada), dan opsi commit hasil kembali ke branch.
Build whisper.cpp dan model di-cache per model, jadi run berikutnya lebih cepat.
Video sumber harus di bawah 100 MB (batas GitHub per file).

## Hasil render

Folder `out/` di-ignore secara default; hasil berikut ditambahkan dengan `git add -f`:

- `out/video.mp4` — render `HaloDunia`
- `out/kakashi-chidori-captioned.mp4` — render `CaptionedVideo` untuk `public/kakashi-chidori.mp4`

## Remotion Agent Skills

Folder `.agents/skills/` (dan symlink di `.claude/skills/`) berisi Remotion Agent Skills yang dipasang lewat `npx remotion skills add`.
