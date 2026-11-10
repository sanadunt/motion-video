# WajahDiLukisan — Naskah VO + Adegan (siap tempel ke Google AI Studio)

> STATUS 10 Nov 2026: **Tahap 3 dari 7 (VO) selesai.** 7 klip di `public/vo/wajah/`, cues di `src/Videos/wajah-captions.json` + `wajah-words.json`, config `briefs/WajahDiLukisan.vo.json`. Pelafalan Percy Shelley sudah dicek user. Berikutnya: tahap 4 (set/komponen adegan).
> Fakta dan sumber ada di `briefs/WajahDiLukisan.md` bagian SUMBER.
> Riset lengkap ada di `/Users/mac/re-motion-kit/riset/KEMBARAN-DOPPELGANGER.md`.

Format: portrait 9:16, target **±60 detik**. Lima klip narator ditambah dua bisikan.
Simpan hasilnya di `public/vo/wajah/` sebagai WAV dengan nama persis seperti di bawah.
Tanda `…` adalah jeda; biarkan apa adanya.

Estimasi durasi memakai ukuran RipperTape: narator Neno ≈ 0,63 dtk per kata, dan setiap `…` ≈ 1 dtk.
Totalnya: narator ±58 dtk, ditambah hening dan bisikan akhir ±2,5 dtk, jadi **±60 dtk**.
Hening 1 detik sebelum "ia tenggelam" disisipkan saat editing, bukan lewat `…`, supaya durasinya bisa dikontrol.
Kalau hasil TTS lebih panjang, jeda bisa dipangkas dengan ffmpeg tanpa generate ulang.

---

## NARATOR (satu voice untuk klip 01–05)

Voice: **Neno**, sama dengan RipperTape, supaya terasa satu seri.

**Style instructions (sama untuk 01–05):**
> Suara narator dokumenter arsip. Bahasa Indonesia. Sangat tenang, pelan, hampir monoton, volume rendah seperti bicara di ruangan museum yang kosong tengah malam. Jeda panjang di setiap "…". Tidak dramatis, tidak berteriak. Artikulasi jelas. Kalimat yang diapit tanda kutip diucapkan lebih pelan dan lebih dekat, seperti menirukan bisikan orang lain.

### 01-hook.wav  (±10 dtk)
Seorang perempuan berhenti di depan lukisan tua, … lalu menoleh ke pacarnya. … "Itu kamu."

### 02-lukisan.wav  (±9 dtk)
Tahun seribu lima ratus enam puluh dua. … Pelukisnya tak dikenal. … Prianya juga.

### 03-legenda.wav  (±17 dtk)
Konon, siapa yang bertemu kembarannya … tak lama lagi mati. … Penyair Percy Shelley mengaku berpapasan dengan dirinya sendiri. … Beberapa minggu kemudian ia tenggelam.

### 04-dna.wav  (±12,5 dtk)
Kata sains: kebetulan. … Tapi saat orang asing berwajah kembar diperiksa, … kode genetik mereka … sebagian sama.

### 05-penutup.wav  (±9 dtk)
**Style instructions khusus klip ini (ganti yang di atas):**
> Sama seperti sebelumnya, tapi lebih pelan lagi, hampir berbisik, seperti takut didengar seseorang di ruangan yang sama. Napas terdengar. Jeda sangat panjang di setiap "…". Kalimat terakhir diucapkan sebagai pertanyaan yang tidak dijawab, nada naik sedikit di akhir.

Kebetulan … atau di suatu tempat, … seseorang sedang memakai wajahmu?

---

## BISIKAN (voice Bodi, Indonesia)

**Style instructions:**
> Berbisik sangat dekat ke mikrofon, berdesah, nyaris tanpa suara, pelan. Bahasa Indonesia. Terdengar seperti seseorang tepat di belakang telinga pendengar. Tanpa emosi.

### w1-itukamu.wav
itu kamu.

### w2-kamu.wav
… kamu …

Penggunaan: w2 muncul dua kali sebagai ambience pelan (adegan 1 dan 3). w1 muncul sekali saja, dekat dan jelas, di detik terakhir.

---

## TIMING VO (dari cues, detik global) — diisi otomatis 10 Nov 2026

Sumber: `src/Videos/wajah-captions.json` (awal/akhir frasa) dan `src/Videos/wajah-words.json` (waktu kata), dibuat `node scripts/vo-align.mjs briefs/WajahDiLukisan.vo.json`. Pemicu per kata sudah dikurangi 0,2 dtk (WORD_LEAD). Jeda antar klip 0,6 dtk; `03-legenda.wav` sudah disisipi hening 1 dtk sebelum "ia tenggelam" (asli di `03-legenda.orig.wav`).

| Klip | Mulai | Selesai | Durasi |
|---|---|---|---|
| 01-hook | 1.00 | 13.24 | 12.24 |
| 02-lukisan | 13.90 | 25.42 | 11.52 |
| 03-legenda | 26.00 | 44.12 | 18.12 |
| 04-dna | 44.80 | 57.00 | 12.20 |
| 05-penutup | 57.80 | 66.88 | 9.08 |

| Adegan | Dari | Sampai |
|---|---|---|
| adegan1 | 0.00 | 13.57 |
| adegan2 | 13.57 | 25.71 |
| adegan3 | 25.71 | 44.46 |
| adegan4 | 44.46 | 57.40 |
| adegan5 | 57.40 | 69.88 |

| Pemicu | Detik |
|---|---|
| menoleh (01) | 8.84 |
| “Itu kamu.” mulai (01) | 11.92 |
| “tak dikenal” → Pelukis: ———— (02) | 21.04 |
| “Prianya juga” → Subjek: ———— (02) | 23.24 |
| “kembarannya” → entri kamus terbaca (03) | 29.12 |
| “Percy Shelley” → tanggal surat (03, awal 3b) | 34.00 |
| “dirinya sendiri” → dua sosok 4 frame (03) | 37.74 |
| hening 1 dtk sebelum “ia tenggelam” (03) | 41.96 |
| “ia tenggelam” (03) | 42.96 |
| “kebetulan” → struk kalkulator (04) | 46.78 |
| “orang asing” → cap TIDAK BERKERABAT (04) | 49.54 |
| “sebagian sama” → pita menyala (04) | 55.12 |
| “Kebetulan” (05) | 57.80 |
| hening 1,5 dtk sebelum “seseorang…” (05) | 62.08 |
| “wajahmu” → wajah terlihat 4 frame, lalu hitam (05) | 65.58 |
| w1 “itu kamu.” (hitam) | 67.78 |
| klik stop / akhir | 69.98 |

Total video ≈ 69.9 dtk (target ±60). Kalau mau dipadatkan, pangkas jeda antar klip di `at` (config) dan/atau jeda `…` di dalam klip dengan ffmpeg, lalu jalankan ulang vo-align.

## PETA ADEGAN

Detik di bawah masih estimasi. Setelah VO jadi, semua timing diambil dari `cues` whisper.

## Adegan 1 — Galeri malam (0–10)
VO: 01-hook
Sumber fakta: ABC News 13 Nov 2012. Kejadian 11 Nov 2012, dan yang pertama melihat kemiripannya adalah pacarnya.
Set: **baru `GalleryScene`**. Lorong museum gelap, lantai parket mengkilap, bingkai-bingkai emas di dinding, satu lampu sorot galeri yang menyala, bangku kayu.
Properti teks: tiket masuk di lantai, tercetak "MUSEUM SENI · PHILADELPHIA · 11.11.2012". Nama museum asli tidak dipakai.
Tokoh: dua siluet tanpa wajah. Siluet perempuan menoleh tepat di kata "menoleh".
Kamera: dolly pelan menyusuri lorong, berhenti di belakang dua siluet + handheld.
Cahaya: lampu sorot berdengung, berkedip halus.
Audio: room tone museum (AC, dengung lampu), langkah sepatu bergema, w2 sangat pelan di akhir.
Transisi keluar: kamera menembus bingkai emas sampai memenuhi layar (objek memenuhi layar) + whoosh/thud.

## Adegan 2 — Lukisan (10–23)
VO: 02-lukisan
Sumber fakta: halaman koleksi Philadelphia Museum of Art (1562, artist/maker unknown, "unidentified man").
Set: **baru `PaintingScene`**. Lukisan bangsawan dibuat ulang secara prosedural: baju zirah rantai, gagang rapier, sarung tangan duel, retak cat (craquelure), pernis menguning. **Wajahnya di bayangan**, hanya janggut dan dagu yang terlihat.
Properti teks: kartu label museum di samping bingkai, diketik saat VO berjalan:
- "Potret Bangsawan dengan Sarung Tangan Duel · Italia, 1562"
- "Pelukis: ————" (tepat di "tak dikenal")
- "Subjek: ————" (tepat di "Prianya juga")
Kamera: tilt naik pelan dari gagang pedang ke dagu, berhenti sebelum mata.
Cahaya: lampu sorot dari atas, pantulan kaca pelindung bergeser.
Audio: dengung lampu, detak jam galeri, satu derit lantai jauh.
Transisi keluar: match-cut dari garis kosong "Subjek: ————" ke garis judul di halaman kamus (adegan 3) + riser pendek.

## Adegan 3 — Kamus dan teras laut, 1822 (23–41)
VO: 03-legenda
Sumber fakta: asal kata doppelgänger, Jean Paul *Siebenkäs* (1796). Surat Mary Shelley ke Maria Gisborne, 15 Agu 1822. Shelley tenggelam 8 Juli 1822.
Status: legenda pertanda maut = LEGENDA; penampakan Shelley = KLAIM (pengakuan Shelley sendiri yang dicatat istrinya). Naskah sudah memakai kata "Konon" dan "mengaku".
Set: dua bagian.
- **3a. Meja tulis lilin (`LetterScene`).** Kamus Jerman tua terbuka di entri "Doppelgänger" (huruf Fraktur). Di sebelahnya surat bertuliskan "Pisa, 15 Agustus 1822".
- **3b. Teras laut malam (baru, `TerraceScene`).** Teras berbatu di atas laut, pagar, bulan tertutup awan. Satu sosok berjalan dari kiri. Di ujung kanan teras, **sosok yang sama** berjalan ke arahnya.
Properti teks: entri kamus terbaca saat "kembarannya"; tanggal surat tertulis sendiri saat "Percy Shelley".
Kamera: 3a push-in ke entri kamus. 3b wide statis + handheld, lalu kedua sosok terlihat bersamaan hanya **4 frame** di kata "dirinya sendiri".
Cahaya: lilin (3a); bulan dan pantulan laut (3b).
Audio: lilin, pena di kertas (3a); ombak, angin (3b); w2 pelan sekali; **hening 1 detik** sebelum "ia tenggelam".
Transisi keluar: air naik memenuhi layar, lalu dip-to-black 8 frame + sub-hit teredam (seperti di bawah air).

## Adegan 4 — Lab (41–55)
VO: 04-dna
Sumber fakta: Joshi dkk., *Cell Reports* 23 Agu 2022. 32 pasangan; 16 pasangan dinilai mirip oleh 3 program pengenal wajah; 9 pasangan berbagi banyak SNP; tidak berkerabat.
Set: **baru `LabScene`**. Meja lightbox dingin. Di atasnya pasangan potret hitam-putih yang **digambar ulang sebagai ilustrasi**, bukan foto asli Brunelle. Ada cetakan pita DNA (gel bands) dan map berkas "2022 · BARCELONA".
Properti teks: di "kebetulan", kalkulator tua mencetak struk angka peluang. Di "orang asing", cap merah "TIDAK BERKERABAT" mendarat di map. Dua lembar pita DNA bergeser saling menumpuk, dan baris yang cocok menyala merah tepat di "sebagian sama".
Kamera: top-down, slide pelan ke kanan, push-in ke pita yang menyala.
Cahaya: lightbox putih kebiruan berkedip satu kali.
Audio: dengung lightbox, kertas digeser, cap stempel (thud).
Transisi keluar: kedip cahaya. Lightbox mati, dan saat lampu menyala lagi kita kembali di galeri.

## Adegan 5 — Galeri, lukisan yang sama (55–64)
VO: 05-penutup, lalu w1
Set: `PaintingScene` lagi, sekarang tanpa lampu sorot; hanya cahaya exit sign hijau samar.
Properti teks: kartu label "Subjek: ————" berkedip sekali. Di kata "wajahmu", garis kosong itu berubah menjadi satu tanda tanya "?" yang diketik.
Kamera: push-in sangat pelan ke wajah lukisan (hening total 1,5 dtk sebelum "seseorang sedang memakai wajahmu").
Puncak (4 frame): di kata "wajahmu", wajah di lukisan **pertama kali terlihat**, dan matanya menatap kamera. Lalu hitam. Pertanyaannya **tidak dijawab**: tidak ada teks penutup, tidak ada kesimpulan.
Penutup: hitam, w1 "itu kamu." dekat, lalu klik stop.
Audio: room tone turun ke sunyi, sub-hit + statik halus di puncak, lalu w1 dan klik.

---

## Catatan saat generate
- Satu klip = satu kali generate. Unduh WAV, bukan MP3.
- Angka tahun sudah ditulis dengan huruf supaya pelafalannya pasti.
- "Percy Shelley" harus terdengar "Persi Syeli". Kalau TTS salah baca, ganti tulisannya jadi "Persi Syeli" di klip itu saja.
- "doppelgänger" sengaja tidak diucapkan supaya pelafalan TTS tidak kacau. Kata itu hanya muncul sebagai properti di kamus.
