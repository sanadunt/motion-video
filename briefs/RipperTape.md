# RipperTape (Videos)

## GOAL
Penonton merasa sedang menonton kaset arsip yang seharusnya tidak mereka tonton: cerita Jack the Ripper diceritakan tenang, lalu kaset itu sendiri "menjawab". Horornya dari yang tidak terlihat dan dari hening, bukan dari darah.
Dipakai di: TikTok / Reels / Shorts, satu video utuh. Bisa jadi seri "ARSIP" bernomor.

## DELIVERY
- Komposisi: RipperTape-Portrait (yang dirender: Portrait). Landscape/Square didaftarkan tapi dirender hanya kalau diminta.
- 30 fps, durasi default **138 dtk** (4140 frame), dikunci ke total VO asli yang sudah diukur ffprobe.
- Semua nomor frame di bawah adalah frame GLOBAL komposisi, sudah DIKUNCI ke durasi WAV di `public/vo/ripper/`.

## VO TERUKUR (24 kHz mono PCM, Gemini 3.8 Flash TTS; narator Neno, bisikan EN Tavi, bisikan ID Bodi)
| file | durasi | jeda sunyi (>0,6 dtk) |
| --- | --- | --- |
| 01-hook.wav | 11,20 s | 3 jeda, 3,0 s |
| 02-setup.wav | 28,52 s | 9 jeda, 8,0 s |
| 03-grafiti.wav | 18,40 s | 4 jeda, 4,2 s |
| 04-surat.wav | 27,72 s | 7 jeda, 9,2 s |
| 05-kelly.wav | 20,56 s | 6 jeda, 8,3 s |
| 06-penutup.wav | 19,16 s | 4 jeda, 5,1 s |
| w1-fromhell.wav | 12,80 s | loop |
| w2-catchme.wav | 12,92 s | loop |
| w3-belum.wav | 2,04 s | |
| w4-masih.wav | 1,92 s | |
Kalau mau versi lebih pendek, jeda bisa dipangkas dengan ffmpeg (silencedetect → atrim/concat) tanpa generate ulang; narator murni tanpa jeda ±88 s.

## PROPS (editable di Studio)
| prop | tipe | default | batas |
| --- | --- | --- | --- |
| tapeLabel | string | "ARSIP 03" | maks 12 karakter |
| tapeSubtitle | string | "WHITECHAPEL — 1888" | maks 24 karakter |
| timestampStart | string | "02:14:37" | HH:MM:SS |
| accent | color | #B8372B (merah tinta pudar) | |
| paper | color | #D9CBB0 (krem kertas tua) | |
| grain | number | 0.6 | 0–1 |
| trackingIntensity | number | 0.5 | 0–1 |
| whisperGain | number | 0.8 | 0–1 |
| durationInSeconds | number | 60 | 45–90 |

## LOOK
Analog horror sinematik. Bukan Montserrat: judul dan kartu memakai mono mesin tik (Courier Prime / Special Elite, dibundel ke public/fonts, OFL) dan serif kaku untuk kutipan surat. Palet: hitam pekat, krem kertas tua, merah tinta pudar, hijau-cokelat VHS. Ciri khas: timestamp kaset di pojok kiri atas yang terus berjalan, dan satu momen 4 frame sosok di ambang pintu.

Lapisan efek (semua deterministik dari frame, pakai `random(seed)` dan `@remotion/noise`):
- Grain halus bergerak tiap frame; vignette; sedikit lengkung CRT lewat `transform: perspective`/skala tepi.
- Garis tracking horizontal lewat 3–4 kali di seluruh durasi, hanya di beat tertentu.
- Chromatic aberration kecil (offset merah/biru 2–3 px × u) yang membesar saat gangguan.
- "Sobekan" frame (slice horizontal digeser) hanya pada beat PUNCAK.
- Teks diketik huruf demi huruf; satu kata sempat "salah" selama 2 frame lalu dikoreksi (beat 3).

## LAYOUT (unit u = sisi pendek/1080)
- Portrait: timestamp di kiri atas (safe, safe). Teks utama di tengah vertikal, lebar maks contentWidth × 0,86, maks 3 baris. Zona bawah 20% kosong (UI platform). Kartu nama korban: daftar rata kiri, mulai 32% tinggi.
- Landscape: teks di sepertiga kiri, "layar kaset" di kanan. Square: seperti portrait, teks sedikit lebih kecil.
- Urutan layer: hitam → "footage" (gradien gelap + noise + gerak kamera) → sosok (beat 6 saja) → teks → grain/tracking/vignette → timestamp.
- Gerak kamera: push-in skala 1,00→1,04 kontinu sepanjang video, EASE.inOut, tidak pernah berhenti.

## BEATS (DIKUNCI ke VO asli, 30 fps; jarak antar klip narator 0,8 dtk)
| frame | dtk | kejadian | fokus mata | emosi/kesan |
| --- | --- | --- | --- | --- |
| 0 | 0.0 | Hitam. Leader kaset: countdown 3-2-1 statik 0,6 dtk, bunyi klik play | tengah | "ini rekaman" |
| 18 | 0.6 | Timestamp mulai berjalan. Kartu: ARSIP 03 / WHITECHAPEL — 1888 diketik | kartu | dingin |
| 30 | 1.0 | VO 01 HOOK (11,2 s → selesai 366). Kata "merah" → warna aksen menyala 2 frame | teks | ganjil |
| 390 | 13.0 | VO 02 SETUP (28,5 s → selesai 1246). Nama korban muncul satu per satu seperti daftar polisi, tiap nama saat diucapkan | daftar | tenang, berat |
| 1050 | 35.0 | Tracking line pertama lewat saat "dua sekaligus" | gangguan | tidak nyaman |
| 1269 | 42.3 | VO 03 GRAFITI (18,4 s → selesai 1821). Teks kapur muncul lalu "dihapus" (blur + fade) sebelum selesai dibaca | tulisan | frustrasi |
| 1449 | 48.3 | Bisikan W1 masuk pelan di kiri (gain 0,15 → 0,4), loop sampai 2688 | | ada yang lain |
| 1845 | 61.5 | VO 04 SURAT (27,7 s → selesai 2677). Kotak kecil; dua kata "From Hell" diketik serif merah, gemetar 1 px, saat diucapkan (±2610) | dua kata | mual |
| 2085 | 69.5 | Bisikan W2 masuk di kanan; W1 + W2 naik sampai hampir menutup narator (gain 0,7) | | ditekan |
| 2520 | 84.0 | Chromatic aberration membesar, timestamp mulai lompat angka | timestamp | kaset rusak |
| 2688 | 89.6 | HENING TOTAL: semua track mati, dengung hilang, 1,5 dtk hitam hampir pekat | kosong | menahan napas |
| 2733 | 91.1 | VO 05 KELLY (20,6 s → selesai 3351), nyaris bisik. Teks "Miller's Court" | teks | intim, salah |
| 3366 | 112.2 | PUNCAK: sobekan frame + sosok di ambang pintu 4 frame (3366–3369) + bisikan W3 (2,0 s) sangat dekat, keras | sosok | terkejut |
| 3370 | 112.3 | Statik penuh 6 frame, lalu hitam | | |
| 3405 | 113.5 | VO 06 PENUTUP (19,2 s → selesai 3981). Kartu: "Pelakunya tidak pernah diidentifikasi." | kartu | dingin |
| 4005 | 133.5 | Kartu: ARSIP 03 — BERAKHIR. Timestamp berhenti | kartu | selesai? |
| 4050 | 135.0 | Hening 1,5 dtk sudah lewat; bisikan W4 "…masih di sini." (1,9 s) sendirian, dekat, tanpa musik | | belum selesai |
| 4125 | 137.5 | Klik stop. Hitam sampai 4140 | | |

## MOTION
- Push-in kamera: EASE.inOut 1,00→1,04 selama seluruh durasi; tidak pernah diam.
- Teks diketik: 1 karakter tiap 2 frame, kursor blok berkedip 15 frame on/off. Entrance kartu tanpa slide, hanya muncul (kaset tidak "menganimasi").
- Nama korban: fade 8 frame (EASE.out), hold sesuai readingFrames, tidak keluar (menumpuk jadi daftar).
- Grafiti dihapus: blur 0→14 px (×u) + opacity 1→0 selama 24 frame, EASE.in, dimulai sebelum penonton selesai membaca (sengaja).
- "From Hell": gemetar ±1 px (×u) dari random(seed+frame), bukan Math.random.
- Puncak: sobekan 3 slice horizontal digeser ±40 px (×u) selama 4 frame; sosok opacity 0,85 tanpa fade masuk/keluar.
- Timestamp: normal +1 detik per 30 frame; di beat 990–1080 lompat acak deterministik.
- Yang tetap diam: posisi timestamp (kecuali lompat angka), lebar kolom teks.

## SOUND
| frame | cue | file (public/vo/ripper/ atau public/sfx/) |
| --- | --- | --- |
| 0 | klik play + hiss kaset konstan (gain 0,12) sampai 4125 | sfx/tape-hiss (buat/ambil CC0) |
| 0 | dengung listrik rendah 50 Hz (gain 0,08) sampai 2688, lalu kembali di 3405 | sfx/hum-50hz |
| 30 | VO 01 | vo/ripper/01-hook.wav |
| 390 | VO 02 | vo/ripper/02-setup.wav |
| 1269 | VO 03 | vo/ripper/03-grafiti.wav |
| 1449 | W1 bisikan kiri, pan −0,7, gain 0,15→0,4 (fade 90 frame) | vo/ripper/w1-fromhell.wav (loop sampai 2688) |
| 1845 | VO 04 | vo/ripper/04-surat.wav |
| 2085 | W2 bisikan kanan, pan +0,7, gain 0→0,7 (fade 150 frame), loop sampai 2688 | vo/ripper/w2-catchme.wav |
| 2688 | SEMUA MATI (hard cut, tanpa fade) | |
| 2733 | VO 05 (gain 0,9) | vo/ripper/05-kelly.wav |
| 3366 | W3 bisikan tengah, sangat dekat, gain 1,0, bersamaan sub-bass 40 Hz 12 frame | vo/ripper/w3-belum.wav + sfx/sub-hit |
| 3370 | statik putih 6 frame (gain 0,6) | sfx/static-burst |
| 3405 | VO 06 | vo/ripper/06-penutup.wav |
| 4050 | W4 bisikan tengah, sendirian, gain 0,8 | vo/ripper/w4-masih.wav |
| 4125 | klik stop | sfx/tape-stop |

Target loudness −14 LUFS, puncak < −1 dBTP. Bisikan jangan sampai lebih keras dari narator kecuali di 3366.
Klip VO di `public/vo/ripper/` sudah dinormalkan (loudnorm): narator −15 LUFS, w1/w2 −19, w3 −12, w4 −14, TP −1,5. Mentahan AI Studio (−25 LUFS) disimpan di `out/review/vo-orig/` (tidak di-commit).
Setelah render, mix akhir dinormalkan sekali lagi tanpa render ulang:
`ffmpeg -i out/RipperTape-Portrait.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/x.mp4` (hasil −14,4 LUFS, TP −1,3).

## CHECKS
- Still wajib: 18, 120, 900, 1500, 2610, 2700, 2900, 3367 (sosok), 3500, 4005, 4080.
- Teks terbaca di 360 px; nama korban tidak terpotong di landscape.
- Sosok di 3366–3369 harus benar-benar hanya 4 frame (cek still 3365 dan 3370 kosong).
- Hening di 2688–2733 benar-benar sunyi (cek waveform).
- Tidak ada aset, font, atau suara dari jaringan.

## DECISIONS
- DECISION: Format portrait, durasi **138 dtk** mengikuti VO asli (narator total 125,6 s, 38 s di antaranya jeda). Target awal 60 dtk tidak tercapai tanpa memotong jeda, dan jeda itu bagian dari nada arsip. Alternatif: pangkas jeda dengan ffmpeg (narator ±95 s) lalu geser beat; atau potong ke 2 klip (hook + surat) untuk versi teaser 60 dtk.
- DECISION: Sosok di puncak adalah siluet SVG backlit di ambang pintu, diblur 2,5 px dan di-skew acak per frame supaya tidak terbaca sebagai ikon; pintu berkedip deterministik sepanjang video agar ruang tidak kosong. Alternatif: foto/cutout sosok nyata di `public/`.
- DECISION: Suara dari pustaka gratis AI Studio: narator Neno, bisikan Inggris Tavi, bisikan Indonesia Bodi. Pustaka 2.000+ suara dan filter bahasa butuh kunci berbayar.
- DECISION: Ada narator (tenang, pelan) plus 2 lapis bisikan. Alternatif: tanpa narator, hanya teks + bisikan.
- DECISION: Dibingkai sebagai "kaset arsip" tanpa menyebut stasiun atau institusi nyata, supaya tidak meniru seri analog horror yang ada dan tidak meniru lembaga sungguhan.
- DECISION: Korban disebut dengan nama, tanpa deskripsi luka. Horor datang dari surat, tulisan kapur, hening, dan sosok 4 frame.
- DECISION: Bisikan memakai potongan kalimat asli surat (bahasa Inggris) + bisikan Indonesia orisinal ("belum selesai", "masih di sini").
- DECISION: Font mono/serif baru (Courier Prime, Special Elite, atau EB Garamond dari @fontsource) karena Montserrat/Inter tidak cocok untuk analog horror.
