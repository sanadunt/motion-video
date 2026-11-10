# ArsipTiang (ARSIP 06) · "Yang Berdiri di Antara Tiang": naskah VO dan peta adegan

> STATUS 10 Nov 2026: **naskah disetujui, VO disetujui** (user, 10 Nov 2026: "VO approved, go on"). Berikutnya storyboard. Belum ada storyboard, aset 3D, atau komposisi.
> Rencana induk: `/Users/mac/re-motion-kit/naskah/ARSIP06-RENCANA.md`. Riset lore: `/Users/mac/re-motion-kit/riset/SIREN-HEAD.md`.
> Lembar VO siap tempel: `/Users/mac/re-motion-kit/naskah/ARSIP06-VO.md`. Kalau teks di sini diubah, ubah juga di lembar VO.

Fan film Siren Head **non-komersial** (monetisasi mati), portrait 1080×1920, 30 fps, target ±85–90 dtk.
Narasi in-world: dibawakan seperti berkas kasus nyata. Kata "fiksi/rekaan" baru muncul di kartu kredit.

---

## Estimasi durasi

Rumus: 0,63 dtk per kata + ±1 dtk per "…". Klip ambience (m1, m2) dilapis di bawah, jadi tidak menambah durasi.

| Klip | Suara | Kata | "…" | Estimasi |
|---|---|---|---|---|
| 01-hook | Neno | 15 | 1 | ±10,5 dtk |
| 02-ciri | Neno | 24 | 1 | ±16,1 dtk |
| 03a-siaran | Neno | 8 | 1 | ±6,0 dtk |
| k1-siaran | Kore (HT) | 5 | 0 | ±3,2 dtk |
| 03b-kenal | Neno | 7 | 1 | ±5,4 dtk |
| 04-pendaki | Neno | 14 | 1 | ±9,8 dtk |
| b1-hitung | Bodi (camcorder) | 6 | 1 | ±4,8 dtk |
| b2-tambah | Bodi → makhluk (HT) | 3 | 0 | ±1,9 dtk |
| 05-hilang | Neno | 4 | 1 | ±3,5 dtk |
| 06-satu | Neno | 11 | 1 | ±7,9 dtk |
| n7-tiru | Neno → makhluk (radio) | 2 | 0 | ±1,8 dtk |
| **Total suara di timeline** | | | | **±70,9 dtk** |

Komponen lain: jeda antar klip (±12 × 0,45 dtk ≈ 5,4), pembuka pita 0,5, beat visual tanpa VO setelah "dua puluh tiga" 1,5, hening total 1,5, jumpscare + hitam 1,0, dan kartu kredit 7,5. Totalnya **±88–89 dtk**.

ARSIP 05 ternyata 5–10% lebih panjang dari estimasi, karena AI Studio membaca "…" lebih lama. Kalau total melewati 92 dtk, jeda "…" dipangkas di editing; tidak perlu generate ulang.

---

## Peta adegan (waktu = estimasi global; dikunci ulang setelah VO diukur)

### Bagian 1 · Hook (0,0–11,0) — 3D PSX Blender
**Visual:** jalan desa malam di tepi hutan pinus. Deretan tiang listrik kayu berjajar ke kabut, lampu jalan kuning di tiang pertama saja. Pipeline PSX sama dengan salju ARSIP 05: 48 warna, dither Bayer, filter nearest.
- Label kaset "ARSIP 06" di frame pertama (frame pertama sekaligus thumbnail).
- Teks hook di atas tengah, y 400–760.
- Kamera dolly maju sangat pelan di tengah jalan.
- Pemicu "bertambah satu": pada satu cut tak kentara, ada satu tiang ekstra di barisan kabut. Tiang itu tanpa palang dan tanpa kabel, puncaknya hilang dalam kabut. Ia hanya *ada*, tidak bergerak.
- Pemicu "jangan hitung lagi": lampu jalan padam 4 frame lalu menyala lagi, kemudian dip ke meja arsip.

**VO:** 01-hook (Neno): *"Kalau kamu menghitung tiang listrik di jalan pulang… dan jumlahnya bertambah satu, jangan hitung lagi."*

**Audio:**
- Narator dengan warna pita (pita lebar, saturasi tipis, desis halus), wow-flutter singkat di "bertambah satu".
- Bed: angin pinus, dengung kabel listrik 50 Hz (sox), jangkrik jarang.
- Mumble m1 sangat pelan (−32 dB relatif narator), dibalik dan di-band-pass, seolah bocor dari kabel.

**Transisi:** lampu padam, lalu thud rendah, lalu meja arsip.

### Bagian 2 · Berkas (11,5–27,6) — meja arsip 2.5D
**Visual:** reuse `ArchiveDeskScene` (ARSIP 05). Map kasus bertuliskan **"BERKAS 06 · YANG BERDIRI DI ANTARA TIANG"**, tab lokasi "BUKIT KARANGSUNYI", tanggal masuk berkas "27.06.2022".
- Pemicu "tiang telepon tua": kertas kalkir dengan diagram skala menggeser masuk. Siluet manusia 1,7 m di sebelah tiang telepon tua; di samping tiang ada tanda tanya tulisan tangan. Tidak ada angka tinggi.
- Pemicu "daging busuk … besi berkarat": foto barang bukti "SAMPEL B" dijepit klip, berisi close-up tekstur karat bercampur daging. Ini PNG yang sama dengan tekstur jumpscare, jadi teksturnya dipakai ulang.
- Pemicu "Tanpa mata": kolom formulir "CIRI WAJAH:" diisi tulisan tangan "tidak ada mata" (Homemade Apple, huruf kecil).
- Pemicu "dua pengeras suara": sketsa saksi ditutup kertas bercap **"TIDAK DITAMPILKAN"**. Kamera push-in pelan ke cap.
- Peta topografi fiktif di bawah map: garis tiang putus-putus, satu titik dilingkari merah dengan catatan "tidak tercatat".

**VO:** 02-ciri (Neno): *"Dari jauh, ia tampak seperti tiang telepon tua. … Dari dekat: daging busuk dan besi berkarat, menyatu. Tanpa mata. Di tempat kepala, dua pengeras suara."*

**Audio:**
- Narator berwarna pita, dropout 3 frame di "pengeras suara".
- Bed ruangan arsip: dengung lampu neon, jam dinding.
- Foley: map dibuka, kertas kalkir, klip, cap dihantam.

**Transisi:** match-cut. Lingkaran merah di peta menjadi lampu merah antena (bagian 3), dengan SFX tuning sweep.

### Bagian 3 · Siaran (28,2–43,7) — 3D PSX Blender, "adegan salju" versi hutan pinus
**Visual:** puncak bukit malam. Kabut dingin dan butir embun beku melayang (pipeline partikel salju ARSIP 05, warna lebih abu-hijau). Pinus PSX, tiang relay antena dengan lampu merah berkedip pelan (±0,6 Hz, aman fotosensitif). Lalu cut ke pos jaga kayu: HT tergeletak di bangku.
- Pemicu "bersiaran": LED HT menyala sendiri, hijau.
- Pemicu "sirene": lampu merah antena berkedip lebih cepat sebentar, tetap ≤3 kali per detik.
- Saat k1: kamera close-up ke kisi speaker HT. Layar LCD HT memutar frekuensi acak.
- Pemicu "suara orang yang kamu kenal": push-in lambat ke kisi speaker. Di latar, kabut terbuka sesaat dan memperlihatkan dua tiang di sebelah antena. Seharusnya hanya ada satu.

**VO:**
- 03a-siaran (Neno): *"Pengeras suara itu bersiaran. … Potongan kata, statis, sirene."*
- k1-siaran (Kore, keluar dari HT): *"Selamat malam. Jalan pulang ditutup."*
- 03b-kenal (Neno): *"Dan kadang, … suara orang yang kamu kenal."*

**Audio:**
- Narator berwarna pita.
- k1 diproses penuh sebagai **siaran makhluk**: band-pass 300–3000 Hz, bitcrush ringan, statis, squelch klik di awal dan akhir. Lalu **dua lapis megafon**: lapis A pitch −4 semiton; lapis B pitch asli, telat 45 ms; keduanya didistorsi megafon. Dipotong-potong supaya terdengar seperti kolase siaran.
- Pemicu "sirene": sirene sintetis sox 1,2 dtk, patah-patah, lewat megafon dan band-pass. Bentuknya **bukan** sirene tsunami: tidak ada nada panjang naik-turun yang stabil.
- Bed: angin puncak, dengung antena, statis HT. Saat tidak bersiaran, HT hanya berdesis (KANON⚠: saat diam, ia memancarkan desis).
- Mumble m2 di bawah statis, −30 dB.

**Transisi:** statis HT membesar, lalu cut keras ke rekaman camcorder.

### Bagian 4 · Rekaman (44,4–68,1) — found footage camcorder (3D PSX + overlay)
**Visual:** rekaman camcorder full-frame portrait (DECISION), dengan artefak pita: tracking line, chroma bleed, head-switching noise di bawah.
- OSD di dalam zona aman: "● REC", "SP", baterai, "27.06.2022 23:41".
- Senter pendaki menyorot jalan setapak turun. Di awal ada kuburan tua di punggung bukit: nisan kayu miring di antara pinus, lewat sekilas.
- Tiang listrik kayu berjajar di sisi jalan setapak.
- Saat b1: senter menyapu tiap tiang sesuai hitungan.
- Pemicu b2: dari HT di tali ransel, terdengar suara si pendaki sendiri mengucap "dua puluh tiga". Kamera berbalik. Di antara pinus berdiri satu tiang yang puncaknya hilang ke kabut.
- **Firasat 2 frame**: glitch pita memperlihatkan wajah makhluk sekilas, sangat gelap, potongan atas saja, dari render jumpscare yang sama. Hanya satu kilasan.
- Beat visual 1,5 dtk tanpa VO: kamera menoleh lagi, tiang itu sudah tidak ada. Kamera jatuh ke tanah, miring, lalu statis.
- Pemicu "Kameranya ditemukan": cut ke meja arsip. Camcorder di dalam kantong plastik barang bukti, label "BARANG BUKTI · 06-C".
- Pemicu "Pendakinya tidak": hold, lalu kamera mundur pelan.

**VO:**
- 04-pendaki (Neno): *"Seorang pendaki merekam jalan turun dari Bukit Karangsunyi. … Ia menghitung tiang, untuk mengusir takut."*
- b1-hitung (Bodi, suara mic camcorder): *"Dua puluh satu. … Dua puluh dua."*
- b2-tambah (Bodi → makhluk, keluar dari HT): *"Dua puluh tiga."*
- 05-hilang (Neno): *"Kameranya ditemukan. … Pendakinya tidak."*

**Audio:**
- 04 dan 05: narator berwarna pita.
- b1: mic camcorder. Low-pass 7 kHz, sedikit kompresi otomatis, langkah kaki di jarum pinus, napas.
- b2: radio penuh (seperti k1) dan dua lapis megafon. Ini callback "meniru suara". Dibuat dari klip Bodi yang sama supaya jelas itu suaranya sendiri.
- Saat kamera jatuh: thud, lalu dengung kabel naik, lalu statis putus. Ruang kosong setelahnya −60 dB.
- Mumble m1 muncul lagi sesaat sebelum b2, −28 dB.

**Transisi:** potongan pita (tape stop), lalu meja arsip.

### Bagian 5 · Penutup dan jumpscare (68,9–81,9) — meja arsip, radio ARSIP 05
**Visual:** meja arsip yang sama, lebih gelap. Di pojok meja ada radio gelombang pendek ARSIP 05 (reuse `ShortwaveRadio`), sebagai crossover.
- Saat 06: kamera mundur pelan, map ditutup.
- Pemicu klik radio: skala radio menyala sendiri dengan amber #E8A33D, jarum bergeser.
- Saat n7: push-in cepat ke speaker radio.
- **Hening total 1,5 dtk**: frame diam, hanya skala radio menyala.
- **JUMPSCARE (9 frame, ±0,3 dtk)**: close-up wajah makhluk, Blender low poly 300–800 tris, PSX.
  - Dua corong pengeras suara berkarat menyatu dengan leher dari daging busuk. Tanpa mata.
  - Sudut dari bawah, cahaya keras dari satu sisi. Glitch dan frame drop 1–2 frame.
  - Fitur utama di dalam zona wajah x 60–960, y 380–1540.
  - Hanya **satu** kilatan; tidak ada flicker berulang.
- Hitam total 0,7 dtk.

**VO:**
- 06-satu (Neno): *"Ia hanya ada satu. … Tak ada yang tahu dari mana asalnya."*
- n7-tiru (Neno → makhluk, keluar dari radio): *"hitung lagi."*

**Audio:**
- 06: narator berwarna pita, dropout di "asalnya".
- Klik radio, lalu desis naik.
- n7: siaran penuh dan dua lapis megafon. Suara narator sendiri dipakai makhluk untuk membalik perintah hook ("jangan hitung lagi" menjadi "hitung lagi").
- Hening −78 dB selama 1,5 dtk.
- Lonjakan jumpscare: suku kata pertama n7 dibalik dan dipitch turun, ditambah sirene sintetis 0,3 dtk lewat megafon dan statis. Puncak ≤ −1 dBTP.
- Hitam: hening, lalu desis pita kembali pelan ke kartu kredit.

### Bagian 6 · Kartu kredit (82,0–89,5)
**Visual:** kartu hitam, teks putih besar di dalam zona aman x 60–960, y 380–1540. Fade-in 0,5 dtk, **hold ≥ 6 dtk**, tanpa caption di atasnya. Font Special Elite (judul) dan Courier Prime (isi).

```
SIREN HEAD
karakter fiksi ciptaan
TREVOR HENDERSON
(pertama diunggah Agustus 2018)

Fan film non-komersial.
Tidak berafiliasi dengan Trevor Henderson maupun Warner Bros.
Kasus, tempat, dan nama dalam video ini rekaan.
Cerita, visual, dan suara dibuat sendiri.
Narasi: suara sintetis.
```

**Audio:** desis pita tipis, dengung kabel sangat pelan. Fade out di 1 detik terakhir.

---

## Caption di layar
- Narator: caption sinkron per kata (whisper + `vo-align.mjs`) di y 1265–1480, x 60–960.
- HT dan radio (k1, b2, n7) diberi caption berbeda: Courier Prime, di dalam kurung siku, warna fosfor #7BD88F. Contoh: `[HT] selamat malam. jalan pulang ditutup.`
- Bisikan camcorder (b1): caption kecil abu-abu.
- Tidak ada caption di frame jumpscare dan di kartu kredit.

## Caption postingan (draf)
```
ARSIP 06 · Yang Berdiri di Antara Tiang

Fan film non-komersial. Siren Head adalah karakter fiksi ciptaan Trevor Henderson (2018). Tidak berafiliasi dengan Trevor Henderson maupun Warner Bros. Kasus, tempat, dan nama dalam video ini rekaan. Narasi: suara sintetis.

⚠️ Ada jumpscare dan kilatan cahaya di akhir.

#sirenhead #trevorhenderson #horor #fanfilm #arsip
```

---

## VO (teks final untuk TTS)

**Narator (Neno)**
- 01-hook: Kalau kamu menghitung tiang listrik di jalan pulang… dan jumlahnya bertambah satu, jangan hitung lagi.
- 02-ciri: Dari jauh, ia tampak seperti tiang telepon tua. … Dari dekat: daging busuk dan besi berkarat, menyatu. Tanpa mata. Di tempat kepala, dua pengeras suara.
- 03a-siaran: Pengeras suara itu bersiaran. … Potongan kata, statis, sirene.
- 03b-kenal: Dan kadang, … suara orang yang kamu kenal.
- 04-pendaki: Seorang pendaki merekam jalan turun dari Bukit Karangsunyi. … Ia menghitung tiang, untuk mengusir takut.
- 05-hilang: Kameranya ditemukan. … Pendakinya tidak.
- 06-satu: Ia hanya ada satu. … Tak ada yang tahu dari mana asalnya.

**Neno → makhluk (diproses di pasca-produksi)**
- n7-tiru: hitung lagi.

**Siaran HT (Kore)**
- k1-siaran: Selamat malam. Jalan pulang ditutup.
- m2-mumble: (ambience) Cuaca … malam ini … jalan … pulang … selamat malam …

**Pendaki (Bodi)**
- b1-hitung: Dua puluh satu. … Dua puluh dua.
- b2-tambah: Dua puluh tiga.
- m1-mumble: (ambience) … pulang … dingin … siapa … di sini … pulang …

---

## SUMBER LORE (setiap ciri makhluk di naskah)
| Kalimat di naskah | Label | Sumber |
|---|---|---|
| "tampak seperti tiang telepon tua" | KANON (caption 2018: sebesar tiang telepon tua) + KANON (bisa menyatu dengan latar) | Reactor 2026, Monstrum |
| "daging busuk dan besi berkarat, menyatu" | KANON | Reactor 2026 |
| "Tanpa mata" | KANON | Reactor 2026 |
| "Di tempat kepala, dua pengeras suara" | KANON (megafon di "kepala") | Reactor 2026, Heat Death, Monstrum |
| "bersiaran … potongan kata, statis, sirene" | KANON (siaran regional, kata acak, sirene) | NOW Toronto 2020, Reactor |
| Suara dua lapis dan mendengung (desain audio) | KANON | caption 2018 via Reactor/Monstrum |
| "suara orang yang kamu kenal", HT memutar suara pendaki, radio memakai suara narator | KANON (bisa memakai suara seseorang) + KANON⚠ (meniru untuk memancing korban) | NOW Toronto, Monstrum |
| HT berdesis saat diam | KANON⚠ (white noise saat tidur) | Monstrum |
| "Ia hanya ada satu" | KANON | Tumblr 30 Nov 2018 (arsip) |
| "Tak ada yang tahu dari mana asalnya" | KANON (sengaja tanpa asal-usul) | Heat Death, Reactor |
| Hutan, kuburan tua di bukit | Latar kanon dipakai secara umum (hutan: KANON⚠ Monstrum; pemakaman tua: caption 2018). Lokasinya kita ganti ke tempat karangan. | — |

**Tidak dipakai (sengaja):** kalimat dan deret kata dari caption 2018; angka 40 kaki; fan-lore (1964/1966/1992, Tanyard Creek); KLAIM (gigi di dalam sirene, kepala berputar, "duta", "the void"); nama "Siren Head" di dalam narasi (hanya muncul di kartu kredit dan caption postingan).

## DECISIONS (koreksi per nomor)
1. **Nama tempat:** Bukit Karangsunyi (hutan pinus fiktif). Pencarian web 10 Nov 2026 tidak menemukan tempat nyata dengan nama ini. Tidak ada nama desa, nama orang, atau lembaga. Pendaki tidak bernama.
2. **Tanggal:** 27.06.2022 23:41, hanya di OSD camcorder dan tab berkas, tidak diucapkan. Angka 18 sengaja dihindari karena ada di caption asli.
3. **Hook 10,5 dtk** (teksnya terkunci), jadi bagian 1 lebih panjang dari 7 dtk di rencana. Bagian lain dipendekkan supaya total tetap ±88 dtk.
4. **Makhluk tak dinamai di narasi.** Di dunia cerita ia "yang berdiri di antara tiang". Nama Siren Head baru muncul di kartu kredit.
5. **Bagian 3** memakai kabut dan embun beku, bukan salju. Hutan pinus Indonesia tidak bersalju, tapi tampilan partikelnya mengambil pipeline salju ARSIP 05 yang paling user suka.
6. **Firasat 2 frame** di glitch camcorder (bagian 4), bukan di sketsa arsip.
7. **n7-tiru** digenerate sebagai klip terpisah. Alternatifnya, potong "hitung lagi" langsung dari 01-hook: makhluk benar-benar memakai rekaman suara narator, tapi sambungannya mungkin terdengar.
8. **Kalimat siaran Kore** ("Selamat malam. Jalan pulang ditutup.") dikarang sendiri, terdengar seperti siaran lokal biasa yang dipotong. Bukan peringatan resmi, tanpa nama lembaga.
9. **Rekaman camcorder full-frame portrait**, OSD di dalam zona aman, tidak pakai letterbox 4:3.
10. **Kartu kredit** ditambah baris "Kasus, tempat, dan nama dalam video ini rekaan."
11. **Peringatan jumpscare/kilatan** ditaruh di caption postingan, bukan di video, supaya tidak merusak kesan in-world. Alternatif: kartu peringatan 1 dtk di awal.

## STATE
- Tahap 1 (naskah): disetujui user 10 Nov 2026 ("Oke, lanjut VO").
- Tahap 2 (VO): selesai 10 Nov 2026, **disetujui user** ("VO approved, go on"). Timeline 92,25 dtk diterima apa adanya (02 tidak digenerate ulang). Digenerate Claude di AI Studio (Gemini 3.8 Flash TTS) lewat built-in browser; audio diambil dari `audio.src` dan dikirim ke penerima lokal, tanpa dialog unduh.
  - 13 klip mentah 24 kHz di `public/vo/tiang/`: Neno (01, 02, 03a, 03b, 04, 05, 06, n7), Kore (k1, m2), Bodi (b1, b2, m1). Style: narator untuk 01–05 dan n7, style khusus untuk 06, penyiar untuk k1/m2, pendaki berbisik untuk b1/b2/m1 (semua diverifikasi lewat label chip Style sebelum Run).
  - Take cadangan (tidak dipakai) di `out/review/ArsipTiang/raw/`: `01-hook.take1` (teks tergandakan), `*.style06` (k1, m2, n7, 01 sempat ter-generate dengan style 06), `03a-siaran.take1` (whisper mendengar "sirena"; take yang dipakai terdengar "sirene").
  - Pelafalan: "Karangsunyi" terbaca *ka-rang-su-nyi* (whisper small tanpa prompt menulis "karang sunyi"). Teks semua klip narator dicek dengan whisper small.
  - Olah suara: `zsh scripts/sfx/tiang_vo.sh edit|mix|dengar` (sox + ffmpeg, tanpa jaringan).
    - `edit/` = 48 kHz bersih. Jeda internal di atas batas dikompresi oleh `scripts/sfx/vo-gaps.mjs` (−35 dB; narator batas 0,70 dtk rasio 0,30; 05/06 batas 0,90 rasio 0,50; b1 utuh), kepala 0,1 dan ekor 0,2 dtk. Timing `edit/` = `mix/` untuk narator dan b1.
    - `mix/` = siap tempel. Narator: pita lebar (HP 75 Hz, LP 11,5 kHz), saturasi tanh tipis, desis pink, wow-flutter di "bertambah satu" (01, 6,55–7,85), dropout 0,1 dtk di "pengeras" (02, 18,70) dan "asalnya" (06, 5,65), −17 LUFS. b1: mic camcorder (LP 7 kHz, AGC, desis), −21,5 LUFS. k1/b2/n7: dua lapis megafon (A −4 semiton, B asli telat 45 ms, overdrive + resonansi corong) lalu HT (BP 300–3000 Hz, bitcrush 8 bit, statis bergelombang, squelch + klik di awal dan akhir), −18 LUFS; **suara mulai 0,30 dtk setelah awal file**. m1/m2: dibalik, band-pass, gema kabel (m2 + bitcrush), −46 LUFS (±−29 dB di bawah narator); pemotongan fragmen dilakukan di komposisi.
  - Durasi nyata (mentah → edit): 01 10,56→10,24 · 02 21,92→19,95 · 03a 8,68→8,31 · k1 3,84→3,68 · 03b 4,88→4,45 · 04 11,08→9,95 · b1 4,96→4,70 · b2 1,36→1,10 · 05 5,88→4,78 · 06 7,08→6,31 · n7 1,80→1,69. Total suara mentah **82,0 dtk** (estimasi 70,9), setelah edit **75,2 dtk**. Paling meleset: 02 (+3,9 dtk dari estimasi meski sudah dipangkas), 03a (+2,3), 05 (+1,3).
  - Timeline (`briefs/ArsipTiang.vo.json` → `timeline`): 01 @0,50 · 02 @11,19 · 03a @31,59 · k1 @40,00 (suara 40,30) · 03b @44,48 · 04 @49,38 · b1 @59,43 · b2 @64,23 (suara 64,53) · 05 @68,02 · 06 @73,25 · n7 @79,86 (suara 80,16) · hening 82,25–83,75 · jumpscare @83,75 · hitam · kartu kredit 84,75–92,25. Mumble: m1 @2,4 (8 dtk, −3 dB), m2 @37,0 (3 dtk), m1 @61,9 (2,3 dtk, +1 dB). **Total ±92,3 dtk** (estimasi ±88; batas pangkas 92).
  - Cues: `node scripts/vo-align.mjs briefs/ArsipTiang.vo.json` → `src/Videos/tiang-captions.json` + `tiang-words.json` (19 frasa, 91/99 kata berjangkar). Whisper small per klip `edit/` di `public/vo/tiang/whisper/` (narator dengan WHISPER_PROMPT="Karangsunyi", b1/b2/n7 tanpa prompt).
  - File dengar: `out/review/ArsipTiang/vo-dengar.mp3` (92,25 dtk, seluruh timeline dengan mumble dan penanda lonjakan jumpscare; hening sebelum jumpscare −91 dB; −15,0 LUFS, puncak −1,4 dBTP). Loudness akhir −14 LUFS dikejar di mix final bersama bed ambience.
- Tahap berikut setelah VO disetujui (sesi terpisah): storyboard, Blender (jalan desa, puncak relay, wajah jumpscare), preview low-res, final 1080p.
