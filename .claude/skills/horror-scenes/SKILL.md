---
name: horror-scenes
description: Alur kerja video horor bernarasi berbasis adegan (analog horror arsip) di repo ini. Pakai saat user memberi naskah atau topik horor/true-crime/misteri dan ingin video seperti RipperTape v2, yaitu set 2D/2.5D (papan bukti, berkas, jalan, dinding, surat, pintu) dengan VO dari Google AI Studio, bisikan ambience, dan grade film. Melengkapi skill motion-studio, bukan menggantikannya.
---

# Horror Scenes

Gaya rumah yang sudah disetujui user (8 Nov 2026) setelah v1 berbasis teks ditolak. Acuan: `briefs/RipperTape.storyboard.md`, `docs/RipperTape-v2-arsitektur.md`, komponen `src/Videos/RipperTape.tsx`.

## Prinsip yang tidak boleh dilanggar
1. **Teks adalah properti, bukan adegan.** Nama ada di kartu yang dipaku, tanggal di formulir, kalimat di surat yang ditulis tangan. Tidak ada teks melayang di atas gradien. Kalau ragu, tambah set dressing, bukan kurangi.
2. **Setiap bagian narasi punya set sendiri** dengan cahaya praktis (lampu meja, gas, lilin, celah pintu) yang berkedip halus, dan satu gerak kamera lambat (push, tilt, pan) + handheld 2–3 px. Tidak ada layar diam lebih dari 4 detik: kalau narasi panjang, kamera bergerak ke properti lain atau sesuatu di set berubah (noda melebar, kertas baru masuk, bayangan lewat).
3. **Bisikan = ambience.** Fragmen 1–2 dtk, lowpass + reverb, volume efektif rendah, 4–6 kali sepanjang video, tidak pernah di-loop. Hanya puncak dan penutup yang dekat.
4. **Satu grade** (`FilmGrade`): grain per frame, split-tone teal/amber, vignette, debu, kedip.
5. **Tanpa gore.** Horor dari benda, cahaya, hening, dan sesuatu yang hanya terlihat 4 frame.

## Alur dari naskah ke video
1. **Naskah per adegan** dari user atau ditulis Claude: tiap adegan = VO (kalimat), set, properti teks, kamera, beat audio. Template di bawah.
2. **VO dulu** lewat Google AI Studio (alur di memory `render-and-tts-workflow`; receiver lokal untuk menyimpan WAV). Normalkan dengan loudnorm (narator −15 LUFS, bisikan −19). Ukur durasi dengan ffprobe, kunci beat di brief.
3. **Storyboard dulu**: satu still per set dari komposisi storyboard (`RipperStoryboard` sebagai contoh), kirim ke user, tunggu persetujuan.
4. **Animasi**: rangkai set di komponen `<Nama>.tsx` dengan pola RipperTape: objek `B` (detik global), `shot` per rentang waktu yang mengembalikan `{node, zoom, x, y, origin, black}`, `CameraRig`, `FilmGrade`, audio lewat helper `Clip`.
5. Cek still di beat, render potongan 5–7 dtk di transisi dan puncak, render penuh, `review.mjs --video`, loudnorm mix akhir, re-encode CRF 22 kalau > 60 MB.

## Scene kit (`src/lib/scenes`)
- `index.tsx`: `PAL`, `FONT`, `NoiseFill`, `smoothNoise`, `CameraRig`, `FilmGrade`, `Paper`, `Pin`, `RedString`, `Stamp`, `Tape`.
- `sets.tsx`: `BoardScene` (lamp, qPop, cardBlur, closing), `FileScene` (active, t, SHEETS dengan `starts` per baris), `StreetScene` (dolly), `WallScene` (chalkChars, erase, hand), `LetterScene` (boxOnly, stain, paperIn, written, header, candle), `DoorScene` (crack, feet, leakBoost), `LampLight`, `boardGeometry`.
- Set baru: salin pola `WallScene` (tekstur prosedural + cahaya praktis + properti + prop animasi 0..1), tambahkan ke `sets.tsx`, buat style frame-nya dulu.

## Audio
- Bed per set di `public/sfx/ripper/amb/`: room (room tone + detak jam), rain, wind, candle, drone, paper-slide, chalk-tick. Semua sintetis ffmpeg, bebas lisensi.
- Bisikan fragmen: `public/vo/ripper/amb/wf1–5.wav` (contoh pemrosesan: lowpass 2,4 kHz, highpass 250, aecho, −9 dB, fade).
- Target mix −14 LUFS, TP −1,5. Hening total minimal 1,5 dtk sebelum puncak.

## Template naskah per adegan
```
## Adegan N — <nama set>
VO: "<kalimat narator>"                      (klip: NN-nama.wav, durasi diisi setelah diukur)
Set: board | file | street | wall | letter | door | <baru>
Properti teks: <apa yang diketik/ditulis/dicap di set ini, kapan muncul relatif VO>
Kamera: push-in ke <properti> | tilt turun | dolly kiri→kanan | hold + handheld
Cahaya: <sumber>, kedip <halus/liar>
Audio: bed <...>, foley <...>, bisikan <ya/tidak, detik ke->
Transisi keluar: cut | dip-to-black 6 fr | sobekan (hanya puncak)
```

## Keputusan yang sudah diambil user
- 2D/2.5D saja, bukan three.js.
- Storyboard disetujui dulu sebelum animasi.
- Render lokal di Mac.
