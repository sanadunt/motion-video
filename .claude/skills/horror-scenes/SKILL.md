---
name: horror-scenes
description: Alur kerja video horor bernarasi berbasis adegan (analog horror arsip) di repo ini. Pakai saat user memberi naskah atau topik horor/true-crime/misteri dan ingin video seperti RipperTape v2, yaitu set 2D/2.5D (papan bukti, berkas, jalan, dinding, surat, pintu) dengan VO dari Google AI Studio, caption sinkron, SFX di setiap transisi, dan grade film. Melengkapi skill motion-studio, bukan menggantikannya.
---

# Horror Scenes

Gaya rumah yang disetujui user (8 Nov 2026) setelah v1 berbasis teks ditolak. Acuan: `briefs/RipperTape.storyboard.md`, `docs/RipperTape-v2-arsitektur.md`, `src/Videos/RipperTape.tsx`.
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
| 2. Riset + naskah | Riset fakta dengan sumber, lalu naskah per adegan (template di bawah) dengan baris VO siap tempel ke AI Studio. | brief + `briefs/<Nama>.naskah.md` | ⛔ |
| 3. VO | Generate di AI Studio (alur di memory `render-and-tts-workflow`), normalkan, **transkrip whisper** untuk timing kata, buat `cues`. | `public/vo/<nama>/`, `src/Videos/<nama>-cues.json` | ⛔ (user dengar VO) |
| 4. Storyboard | Satu style frame per set, dirender dari komposisi storyboard. | still per adegan + contact sheet | ⛔ |
| 5. Preview | Animasi lengkap, tapi yang dikirim hanya **preview murah**: render 360×640 satu potongan 8–12 detik yang memuat transisi terpenting, lengkap dengan audio dan caption. | `out/review/<Nama>-preview.mp4` | ⛔ |
| 6. Render | Render 720p per adegan sesuai aturan render di `CLAUDE.md`, mux audio sekali, normalisasi, QA. | `out/<Nama>-Portrait-720p.mp4` | laporan |
| 7. Revisi | Ubah hanya bagian yang diminta. Kalau timing berubah, ubah `cues` saja. Render ulang hanya chunk terdampak. | chunk baru + file gabungan | laporan |

**Blok SIMPAN** di akhir tahap 2, 4, dan 6: tulis ke brief bagian `STATE` ringkasan yang cukup untuk melanjutkan di sesi baru tanpa membaca percakapan: topik, keputusan terkunci (palet hex, font, set, mood), path naskah/VO/cues, daftar chunk dan frame-nya, status tahap. Sesi baru membaca `STATE` dulu, bukan mengulang dari nol.

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
- teks properti dan caption tidak bertabrakan, tidak keluar zona aman, tidak tertutup UI platform (bawah 20%, kanan 12%);
- kontras teks cukup di layar ponsel (tes 360 px);
- caption cocok dengan kata yang diucapkan;
- setiap transisi punya SFX; hening sebelum puncak benar-benar sunyi (cek `volumedetect`);
- loudness dan codec sesuai (`review.mjs --video`).

Laporan akhir maksimal 8 baris: konsep dan alur, spesifikasi, sumber fakta, asumsi, yang sudah diperiksa, dan yang belum sempurna.

## Scene kit (`src/lib/scenes`)
- `index.tsx`: `PAL`, `FONT`, `NoiseFill` (tekstur PNG dari `public/textures/`, dibakar sekali dengan `scripts/bake-textures.mjs`), `smoothNoise`, `CameraRig`, `FilmGrade`, `Paper`, `Pin`, `RedString`, `Stamp`, `Tape`.
- `sets.tsx`: `BoardScene`, `FileScene`, `StreetScene`, `WallScene`, `LetterScene`, `DoorScene`, `LampLight`, `boardGeometry`.
- Set baru: salin pola `WallScene` (tekstur + cahaya praktis + properti + prop animasi 0..1), buat style frame-nya dulu. Jangan pakai `feTurbulence` atau `filter: blur()` besar per frame; bakar ke tekstur.

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
- 2D/2.5D saja, bukan three.js.
- Storyboard dan preview disetujui dulu sebelum render penuh.
- Render lokal di Mac, 720p, per adegan, 2 pekerja (detail di `CLAUDE.md` bagian Aturan render).
- VO dari Google AI Studio; caption harus sinkron per kata lewat whisper.
