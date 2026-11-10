---
name: horror-scenes
description: Alur kerja video horor bernarasi berbasis adegan (analog horror arsip) di repo ini, dari riset topik + naskah sampai render 1080p. Pakai saat user memberi topik, blog, atau naskah horor/true-crime/misteri/urban legend dan ingin video seperti RipperTape v2 atau WajahDiLukisan, yaitu set 2D/2.5D (papan bukti, berkas, galeri, surat, lab) plus tokoh dan adegan 3D PSX dari Blender, dengan VO dari Google AI Studio, caption sinkron di safe zone Shorts, SFX di setiap transisi, dan grade film. Melengkapi skill motion-studio dan psx-character, bukan menggantikannya.
---

# Horror Scenes

Gaya rumah yang disetujui user (8 Nov 2026) setelah v1 berbasis teks ditolak. Acuan: `briefs/RipperTape.storyboard.md`, `docs/RipperTape-v2-arsitektur.md`, `src/Videos/RipperTape.tsx`.
**Acuan terbaru (10 Nov 2026, disetujui user: "ini baru keren"):** `WajahDiLukisan`. File-filenya: `briefs/WajahDiLukisan*.md`, `src/Videos/WajahDiLukisan.tsx`, `src/lib/scenes/wajah.tsx`, `scripts/blender/wajah/`. Mulai video horor berikutnya dari pola ini.
**Satu video = satu session.** Video baru dimulai di session baru (`start_session`), tidak ditumpuk di session video sebelumnya. Revisi video yang sudah jadi tetap di session-nya sendiri.
Revisi 9 Nov 2026: alur bertahap, preview sebelum render, satu sumber timing, dan SFX wajib, diadaptasi dari dua panduan yang user simpan (`PANDUAN-VIDEO-MOTION.md` dan `Super-Prompt.txt`, ringkasannya di `/Users/mac/re-motion-kit/RESOURCE-THREADS.md` bagian 9) plus pelajaran dari kegagalan render dan caption di RipperTape.

## Prinsip yang tidak boleh dilanggar
1. **Teks adalah properti, bukan adegan.** Nama ada di kartu yang dipaku, tanggal di formulir, kalimat di surat yang ditulis tangan. Tidak ada teks melayang di atas gradien. Kalau ragu, tambah set dressing.
2. **Tidak ada yang sekadar muncul.** Setiap elemen masuk dengan gerak (diketik, ditulis, digeser, cahaya menyala), setiap adegan punya satu gerak kamera lambat + handheld 2–3 px, dan tidak ada layar diam lebih dari 4 detik.
3. **Transisi punya makna dan bunyi.** Lihat bagian Transisi dan Suara. Transisi tanpa SFX dianggap belum selesai.
4. **Satu sumber timing.** Semua angka waktu (adegan, kamera, teks properti, caption, SFX) diturunkan dari timing kata VO. Tidak ada angka waktu yang ditebak di dua tempat.
5. **Bisikan = ambience.** Fragmen 1–2 detik, lowpass + reverb, pelan, 4–6 kali sepanjang video, tidak pernah di-loop. Hanya puncak dan penutup yang dekat.
6. **Satu grade** (`FilmGrade`) untuk semua adegan. **Tanpa gore**: horor dari benda, cahaya, hening, dan sesuatu yang terlihat hanya 4 frame.
7. **Fakta bersumber.** Untuk true crime dan sejarah, setiap tanggal, nama, dan angka di naskah punya sumber di brief. Yang tidak terverifikasi ditandai, bukan dikarang.
8. **Lihat sendiri sebelum menyerahkan.** Klaim "bagus" hanya setelah memeriksa frame dari file final. Batasan dan yang belum sempurna disebut terus terang.

## Alur bertahap (gerbang persetujuan)

Awali setiap laporan ke user dengan posisi, misalnya **"Tahap 3 dari 7: VO"**. Jangan lanjut melewati gerbang ⛔ sebelum user bilang oke, kecuali user bilang "skip" (pakai tebakan terbaik dan lanjut). Simpan setiap jawaban user ke brief; jangan bertanya ulang.

| Tahap | Isi | Output | Gerbang |
| --- | --- | --- | --- |
| 1. Rencana kilat | Tebak semua keputusan (platform, rasio, durasi, pesan utama, mood, set, palet, musik, SFX, caption, CTA), tampilkan sebagai daftar bernomor dengan rekomendasi. User cukup koreksi nomor tertentu ("3B"). Maksimal 3 pertanyaan terbuka. | `briefs/<Nama>.md` bagian DECISIONS | ⛔ |
| 2. Riset + naskah | Riset fakta dengan sumber (bagian Riset di bawah), lalu naskah per adegan (template di bawah). Untuk user juga dibuat **lembar VO siap tempel** di folder session: teks dan style tiap klip dalam blok kode, nama file, checklist, dan estimasi durasi (±0,63 dtk per kata + ±1 dtk per "…"). | brief + `briefs/<Nama>.naskah.md` + lembar VO | ⛔ |
| 3. VO | User generate sendiri di AI Studio, atau Claude yang menjalankan alur di memory `render-and-tts-workflow`. Lalu cek isi dengan whisper (salah dengar nama dilaporkan ke user), normalkan per klip ke `mix/`, dan buat `cues`. | `public/vo/<nama>/`, `src/Videos/<nama>-captions.json`/`-words.json` | ⛔ (user dengar VO) |
| 4. Storyboard | Satu style frame per set, dirender dari komposisi storyboard, **sudah ditata di safe zone** (bagian Safe zone). | still per adegan + contact sheet | ⛔ |
| 5. Preview | Animasi lengkap. Kirim **preview murah** (360×640, potongan 8–12 dtk, transisi terpenting, dengan audio dan caption), lalu **render penuh resolusi rendah** (360×640, audio sudah −14 LUFS) beserta lembar safe zone. Ini preferensi user: low-res penuh dulu sebelum final. | `out/review/<Nama>-preview.mp4`, `out/review/<Nama>-lowres.mp4` | ⛔ |
| 6. Render | Final **1080p kalau user minta "full HD"** (selain itu 720p), per chunk dengan 2 pekerja dan nice, audio dirender sekali (`--codec=wav`), loudnorm 2 pass ke −14 LUFS, `+faststart`, QA dari file final. Contoh skrip: render WajahDiLukisan (6 chunk, total 7,5 menit). | `out/<Nama>-Portrait.mp4` | laporan |
| 7. Revisi | Ubah hanya bagian yang diminta. Kalau timing berubah, ubah `cues` saja. Render ulang hanya chunk terdampak. | chunk baru + file gabungan | laporan |

**Blok SIMPAN** di akhir tahap 2, 4, dan 6: tulis ke brief bagian `STATE` ringkasan yang cukup untuk melanjutkan di sesi baru tanpa membaca percakapan: topik, keputusan terkunci (palet hex, font, set, mood), path naskah/VO/cues, daftar chunk dan frame-nya, status tahap. Sesi baru membaca `STATE` dulu, bukan mengulang dari nol.

## Riset (tahap 2)
- **Ide topik:** 6–10 kandidat. Tiap kandidat berisi hook, inti cerita, status **FAKTA / KLAIM / LEGENDA**, sensitivitas, set visual, format, dan link sumber, lalu satu rekomendasi. Simpan di folder session (`riset/`).
- **Blog atau artikel dari user:** cek setiap klaim ke sumber primer (arsip, museum, jurnal, berita asli) dan laporkan yang salah. Contoh: blog Enigma salah tahun dan mengarang detail "Florence/Emilia".
- **Nada yang disukai user:** skeptis dan menggantung. Urutannya: kejadian nyata yang aneh → legenda (dibingkai "konon"; kesaksian dibingkai "mengaku") → jawaban sains → temuan yang mengganggu jawaban itu → **pertanyaan yang tidak dijawab** di akhir.
- **Korban nyata** (pembantaian, kekerasan berbasis tuduhan) diberi sensitivitas tinggi, nadanya dokumenter, tanpa nama korban, dan tidak dijadikan tontonan.
- **Wajah hanya dari sumber CC0/PD:** The Met Open Access (API v1.1 `search?hasImages=true&q=...&limit=`, lalu `objects/<id>` dengan `isPublicDomain`), NGA, AIC (API-nya bisa terblokir Cloudflare), Rijksmuseum, Smithsonian, dan Wikimedia PD-Art. Minta izin sebelum mengunduh (sebut nama file, sumber, ukuran), lalu tulis `public/faces/<nama>/CREDITS.md`. Foto etnografis atau medis tidak dipakai walaupun CC0. Orang modern (yang masih hidup) cukup siluet atau model 3D, bukan foto stok. Lukisan museum yang tidak dirilis CC0 dibuat ulang (rekonstruksi).

## Safe zone Shorts/Reels/TikTok (portrait 1080×1920, guideline user)
- Teks, angka, dan wajah hanya di **x 60–960, y 380–1540**. Area UI: atas 0–380, bawah 1540–1920 (judul + tombol), kanan 960–1080 (like/komen/share).
- **Caption** short biasa di **y 1265–1480**, dipusatkan di x 60–960 (container `left: 60px; right: 120px`, `top: 1290`). Untuk short afiliasi caption di y 1120–1200, dan kiri bawah x 60–360, y 1240–1540 dikosongkan untuk stiker "SHOP".
- Hook/judul diletakkan di tengah atas (y ±400–760), karena frame pertama menjadi thumbnail.
- Properti teks (label pita, tiket, kartu label, map) diletakkan di dalam kotak dan di atas zona caption. Saat kamera zoom, teks pendukung harus keluar frame atau tetap di dalam kotak. Kartu yang potongannya jatuh ke zona UI dimunculkan hanya saat kamera mundur. Caption disembunyikan selama dorongan kamera cepat 0,5 dtk sebelum puncak.
- **Cek:** gambar kotak guideline langsung di still dengan `drawbox` (ffmpeg drawbox tidak menulis alpha, jadi overlay PNG transparan tidak bisa dipakai). Merah di luar safe zone, kuning untuk safe zone, biru untuk zona caption. Tile semua still beat, lalu lihat.

## Tokoh dan adegan 3D (PSX, Blender) — disetujui user 10 Nov 2026
- Tokoh orang memakai **base mesh PSX** dari skill `psx-character`, bukan siluet SVG (user: "lebih proporsional"). Adegan yang terasa paling lemah boleh dibuat **full 3D di Blender**. three.js tetap tidak dipakai.
- Pola teruji ada di `scripts/blender/wajah/` (lihat README):
  - `psx_lib.py`: membuat tokoh dengan wajah atlas, HEAD_MAP front.
  - Skrip adegan yang **membaca timing dari `src/Videos/<nama>-words.json`** dengan rumus `B` yang sama, sehingga frame 1 render = detik awal adegan.
  - Shot penuh: render 270×480, lalu `psx_post.sh … 4 48 15` menghasilkan MP4 1080×1920. Di Remotion dipasang dengan `<Sequence from={F(start)}><OffthreadVideo muted/></Sequence>`, dan teks overlay (label pita) tetap dari Remotion.
  - Tokoh di set 2.5D: PNG transparan 320×320 (`film_transparent`), on twos (hanya frame ganjil), dipasang sebagai `<Img>` billboard di ruang CSS 3D dengan `imageRendering: pixelated`.
- **Ritme horor yang berhasil:** lentera padam lalu kilat putih 4 frame (kembaran muncul dekat kamera, mata kosong) lalu hilang. Di jeda hening, kamera mendorong ke kepala tokoh yang menoleh, dan wajahnya berganti ke sel seram. Semua beat ini dibuat di Blender (keyframe `hide_render`, energi lampu CONSTANT).
- Render Blender murah (±30 dtk per adegan 9 dtk), jadi revisi cukup render ulang adegan itu.

## Satu sumber timing (cues)
1. VO per klip → `npx tsx scripts/transcribe.ts <file> base id` (whisper.cpp) → timestamp kata.
2. `scripts/vo-align.mjs` memetakan frasa naskah ke timestamp kata → `cues` (detik global): `{clip, start, end, text}` per frasa.
3. Komponen membaca `cues` untuk caption, properti teks (baris formulir, tulisan surat), pergantian lembar, snap kamera, dan posisi SFX. Objek `B` hanya berisi batas adegan, dan batas itu juga diturunkan dari `cues`.
4. Jangan pakai deteksi jeda sunyi untuk timing frasa: narator berhenti di tengah kalimat dan semua frasa sesudahnya bergeser.
5. Verifikasi sinkron di file final: ambil frame di 3 titik (awal, tengah, akhir) dan cocokkan teks caption dengan kata yang diucapkan di detik itu.

## Transisi (pilih variasi tiap batas, jangan satu jenis terus)
- **Cut keras tepat di kata kunci** (nama, tanggal, "pintunya").
- **Dip-to-black 6–10 frame** sebelum ganti tempat.
- **Match-cut bentuk**: lubang kunci → mata, lingkaran cap → bulan, benang merah → garis jalan.
- **Objek memenuhi layar**: kamera menembus amplop, celah pintu, atau bayangan sampai gelap lalu adegan baru.
- **Kedip cahaya**: lampu mati sesaat, adegan berganti saat menyala.
- **Sobekan kaset / statik**: hanya di puncak, maksimal sekali.

## Suara (wajib, semua dari kode atau sumber bebas lisensi)
- **Setiap batas adegan**: whoosh atau riser pendek mulai ±0,3 detik sebelum batas, thud atau sub-hit kecil tepat di batas. Waktunya dibaca dari `cues`, bukan ditebak.
- **Musik/drone berlapis** dengan struktur: masuk tenang → menanjak → puncak → lepas/hening. Untuk horor: drone rendah, pad dingin, denyut pelan, tanpa beat ceria.
- **Bed per set** di `public/sfx/ripper/amb/` (room tone + detak jam, hujan, angin, lilin, drone) dan foley per aksi (kertas digeser, kapur, klik kaset).
- **Hening total** minimal 1,5 detik sebelum puncak.
- Narator −15 LUFS, bisikan −19, mix akhir −14 LUFS dengan puncak di bawah −1 dBTP.

## QA dari file final (wajib sebelum menyerahkan)
Ambil frame dari MP4 final (bukan dari still komposisi) di setiap batas adegan, puncak, dan 3 titik caption. Periksa:
- teks properti dan caption tidak bertabrakan, dan semuanya di dalam safe zone (x 60–960, y 380–1540; caption y 1265–1480), dicek dengan lembar overlay `drawbox`;
- kontras teks cukup di layar ponsel (tes 360 px);
- caption cocok dengan kata yang diucapkan;
- setiap transisi punya SFX; hening sebelum puncak benar-benar sunyi (cek `volumedetect`);
- loudness dan codec sesuai (`review.mjs --video`).

Laporan akhir maksimal 8 baris: konsep dan alur, spesifikasi, sumber fakta, asumsi, yang sudah diperiksa, dan yang belum sempurna.

## Scene kit (`src/lib/scenes`)
- `index.tsx`: `PAL`, `FONT`, `NoiseFill` (tekstur PNG dari `public/textures/`, dibakar sekali dengan `scripts/bake-textures.mjs`), `smoothNoise`, `CameraRig`, `FilmGrade`, `Paper`, `Pin`, `RedString`, `Stamp`, `Tape`.
- `sets.tsx`: `BoardScene`, `FileScene`, `StreetScene`, `WallScene`, `LetterScene`, `DoorScene`, `LampLight`, `boardGeometry`.
- `wajah.tsx` (WajahDiLukisan):
  - `FaceCrop` (potong wajah dengan rect ternormalisasi), `GoldFrame`, `NoblemanCanvas` (lukisan rekonstruksi + bayangan wajah `faceLight`), `MuseumLabel` (`lines` diketik per baris).
  - `GalleryScene` (lorong CSS 3D + `CoupleBillboard`), `PaintingScene` + `paintingGeometry`, `Desk1822Scene` + `deskGeometry`, `LabScene` + `labGeometry` (landmark wajah, pita DNA, cap), `TerraceScene` (2D lama; versi videonya diganti render Blender).
- Set baru: salin pola `WallScene` (tekstur + cahaya praktis + properti + prop animasi 0..1), buat style frame-nya dulu. Jangan pakai `feTurbulence` atau `filter: blur()` besar per frame; bakar ke tekstur.
- **Kamera tanpa lompatan:** fokus ke titik dengan `focus(z, px, py)`, yaitu `x = -z·(px − W/2)`, `y = -z·(py − H/2)`, origin di tengah. Gerakan dibuat dengan `path([...])` (interpolate + EASE.inOut). Batasi titik fokus supaya tepi set tidak terlihat (`x ∈ [W/2z, W − W/2z]`), atau perpanjang latar set di luar frame.
- **Jebakan CSS 3D:** `mix-blend-mode` (dan blend sejenis) pada anak `transform-style: preserve-3d` meratakan seluruh ruangan 3D, jadi gambar jadi buram dan raksasa. Efek cahaya di ruang 3D dibuat tanpa blend. `filter` aman dipakai di dalam elemen 2D anak dinding.
- Wajah: buat turunan `public/faces/<nama>/web/` dulu (diperkecil dengan ffmpeg, versi abu-abu dibakar), jangan memuat file asli 3–4 MB tiap frame. Untuk crop dan landmark, posisi mata/hidung/mulut diukur per foto supaya kedua "kembaran" sejajar.

## Template naskah per adegan
```
## Adegan N — <nama set>
VO: "<kalimat narator>"                      (klip NN-nama.wav; timing dari cues)
Sumber fakta: <link/arsip>
Set: board | file | street | wall | letter | door | <baru>
Properti teks: <apa yang diketik/ditulis/dicap, kata VO pemicunya>
Kamera: push-in ke <properti> | tilt turun | dolly | hold + handheld
Cahaya: <sumber>, kedip <halus/liar>
Audio: bed <...>, foley <...>, bisikan <ya/tidak>
Transisi keluar: <jenis> + SFX <whoosh/riser + thud>
```

## Keputusan yang sudah diambil user
- Set 2D/2.5D di Remotion, bukan three.js. **Tokoh orang memakai model PSX 3D, dan adegan terlemah boleh full 3D Blender** (10 Nov 2026).
- Storyboard dan preview disetujui dulu sebelum render penuh, lalu **render penuh resolusi rendah** sebelum final.
- Render lokal di Mac, per adegan, 2 pekerja (detail di `CLAUDE.md` bagian Aturan render). 720p bawaan; 1080p kalau user minta full HD.
- Semua portrait mengikuti safe zone guideline user (bagian Safe zone).
- VO dari Google AI Studio; caption harus sinkron per kata lewat whisper.
- Satu video = satu session baru.
