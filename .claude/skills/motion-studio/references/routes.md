# Memilih rute

| Kalau asetnya… | Rute | Di mana |
| --- | --- | --- |
| Teks, bentuk, logo flat, transisi, caption, infografis | **A. 2D kode** (React/SVG + interpolate/spring) | Remotion, semua format, bisa dirender di Actions |
| Logo 3D, objek atau mesin, kamera bergerak di ruang | **B. 3D kode** (`@remotion/three`) | Remotion, sebaiknya render lokal dengan GPU |
| Cerita dengan karakter flat di latar berlapis | **C. 2.5D di Remotion** | Remotion |
| Set sinematik kaya cahaya, karakter ber-rig | **D. Eksternal** (Blender) → diimpor | Blender lokal, Remotion untuk merakit |

Default ke rute A. Naik ke B, C, atau D hanya kalau brief memang butuh kedalaman, cahaya, atau material yang tidak bisa didapat dari 2D.

## C. 2.5D di Remotion
- Karakter dibuat dari bagian SVG terpisah (kepala, badan, lengan, kaki) dengan warna flat dan satu ketebalan outline. Ekspresi diganti per beat dari set mata dan mulut (replacement animation).
- Latar 3–5 lapis dengan parallax: lapis jauh bergerak lebih sedikit. Push-in kamera = skala seluruh lapisan dengan faktor berbeda per lapis.
- Bayangan kontak lembut di bawah kaki supaya karakter menapak.
- Shot baru untuk setiap ide baru di naskah (±2 dtk). Kamera slow push-in atau dolly dengan alasan.
- Acting: tulis satu baris acting per shot (pikiran, antisipasi, aksi, hold). Mata dulu, jangan bounce tanpa henti.
- Alternatif 3D: karakter sebagai plane bertekstur di dalam scene `@remotion/three` dengan material unlit (`MeshBasicMaterial`) supaya tidak terkena shading lampu set.

## D. Aset eksternal (Blender, Aseprite, dll.)
- Render di luar sebagai PNG sequence (alpha) atau ProRes 4444/WebM alpha, letakkan di `public/`.
- Impor video dengan `<OffthreadVideo>`. Untuk PNG sequence:
  ```tsx
  <Img src={staticFile(`seq/f${String(frame).padStart(4, '0')}.png`)} />
  ```
  Frame rate sumber harus cocok dengan 30 fps, atau dipetakan secara eksplisit.
- Blender lewat MCP: bangun set dalam 3 pass (block → light → dress) dan cek still di tiap pass. Preview 480p dulu karena render 1080p bisa makan berjam-jam. Pakai aset library (BlenderKit, Poly Haven CC0), jangan membuat furnitur dari nol.
- Sprite pixel art (misalnya dari Aseprite/Bonebase): spritesheet dipotong per frame berdasarkan `Math.floor(frame / framesPerSprite)`, skala kelipatan bulat, `imageRendering: 'pixelated'`.

## Library dan tool lain
**Cocok di Remotion:** three.js + drei (helper R3F, tanpa `useFrame`), D3 (hanya untuk skala dan layout, render tetap React), `@remotion/transitions`, `@remotion/layout-utils`, `@remotion/paths` (morph/draw path SVG), `@remotion/shapes`, `@remotion/noise` (noise deterministik), Lottie via `@remotion/lottie`.

**Hindari di dalam komponen** karena punya jam sendiri: GSAP, Anime.js, mo.js, Theatre.js. Kalau memang harus, timeline di-pause dan di-seek ke `frame / fps` di setiap render, dan itu harus disetujui user dulu.

**Di luar repo, berguna:** Auto-Editor (memotong jeda diam footage sebelum CaptionedVideo), Subtitle Edit (merapikan timing caption), Audacity (membersihkan audio), RIFE (slow motion footage), OBS (rekam layar untuk klip produk), FFmpeg/ffprobe (cek dan encode).
