# WajahDiLukisan (Videos)

## GOAL
Short horor 60 detik tentang "kembaran", dengan **nada skeptis yang menggantung** (keputusan user 10 Nov 2026).
Alurnya: kejadian nyata yang aneh (wajah di lukisan 1562) → legenda doppelgänger sebagai pertanda maut (dibingkai "konon") → jawaban sains "cuma kebetulan" → temuan yang mengganggu jawaban itu (orang asing berwajah kembar berbagi sebagian DNA).
Video ditutup dengan **pertanyaan yang tidak dijawab**. Penonton yang memutuskan sendiri, dan itu yang memancing komentar.
Dipakai di: TikTok / Reels / Shorts. Bisa masuk seri "ARSIP" bersama RipperTape.

## DECISIONS (tahap 1, tebakan terbaik; koreksi per nomor, mis. "3B")
1. Platform: TikTok/Reels/Shorts, **portrait 1080×1920**, render 720p (aturan render repo).
2. Durasi: **±60 dtk** (estimasi narator 58 dtk + hening/bisikan akhir 2,5 dtk; jeda bisa dipangkas).
3. Pesan utama: pertanyaan terbuka, "Kebetulan … atau seseorang sedang memakai wajahmu?"
4. Mood: museum kosong tengah malam, dingin, sunyi; horor dari wajah yang tidak terlihat.
5. Set: 5 adegan, yaitu galeri, lukisan, kamus + teras laut 1822, lab, dan galeri lagi. Set baru yang perlu dibuat: `GalleryScene`, `PaintingScene`, `TerraceScene`, `LabScene`.
6. Palet: gaya rumah RipperTape (teal-hitam, kertas, amber), ditambah **emas bingkai `#A8833A`** dan **putih-biru lightbox `#CFE3EA`** untuk adegan lab.
7. Font: sama dengan RipperTape (Special Elite, IM Fell English, Homemade Apple, Courier Prime), ditambah satu font Fraktur untuk entri kamus. Fontnya perlu dibundel; kalau tidak ada yang lisensinya bebas, entri kamus dipakai IM Fell.
8. VO: narator **Neno**, bisikan **Bodi** (konsisten dengan RipperTape).
9. Musik: drone rendah + pad dingin, tanpa beat; hening total 1,5 dtk sebelum puncak.
10. Caption: ya, sinkron per frasa dari whisper, di zona aman (bukan 20% bawah).
11. CTA: tidak ada di video; cukup label kaset "ARSIP 04" di frame pembuka.
12. Wajah: semua tokoh berupa siluet atau ilustrasi ulang; **tidak memakai foto asli** Galuppo, Brunelle, atau selebriti.

DECISION: Nama Max Galuppo **tidak disebut**. Ia orang biasa yang viral pada 2012, dan ceritanya tetap utuh tanpa namanya.
DECISION: Lukisan 1562 tidak diambil dari gambar museum, tapi dibuat ulang secara prosedural dengan komposisi serupa. Dengan begitu tidak ada urusan izin gambar, dan wajahnya bisa "disembunyikan" lalu "dimunculkan".
DECISION: Nama museum asli tidak dipakai di properti; cukup "Museum Seni · Philadelphia".

## SUMBER (setiap fakta di naskah)
| Kalimat di naskah | Status | Sumber |
|---|---|---|
| Perempuan berhenti di depan lukisan, menoleh ke pacarnya, "itu kamu" | FAKTA (diparafrasekan dari kutipan Nikkie Curtis) | [ABC News 13 Nov 2012](https://abcnews.com/blogs/headlines/2012/11/man-finds-his-doppelganger-in-16th-century-italian-painting) |
| Tiket "11.11.2012", Philadelphia | FAKTA | ABC News, [Hyperallergic](https://hyperallergic.com/man-finds-his-doppelganger-at-philadelphia-museum-of-art) |
| Dilukis 1562, pelukis tidak diketahui, pria tidak teridentifikasi | FAKTA | [Philadelphia Museum of Art, obj. 101988](https://www.philamuseum.org/objects/101988) |
| Kata doppelgänger (properti kamus) | FAKTA | Jean Paul, *Siebenkäs* (1796); [Wikipedia](https://en.wikipedia.org/wiki/Doppelg%C3%A4nger) |
| "Konon, siapa yang bertemu kembarannya tak lama lagi akan mati" | LEGENDA (dibingkai "konon") | folklor doppelgänger dan *fetch* Irlandia; [Cambridge UP](https://assets.cambridge.org/97810093/05761/excerpt/9781009305761_excerpt.pdf) |
| Shelley mengaku berpapasan dengan dirinya sendiri | KLAIM (pengakuan Shelley, dicatat Mary Shelley) | surat Mary Shelley ke Maria Gisborne, 15 Agu 1822 (Bennett, *Letters* vol. 1); [Guardian 2022](https://www.theguardian.com/books/2022/jul/08/for-him-the-poetic-was-political-how-shelley-stands-tall-as-a-great-romantic-poet) |
| Beberapa minggu kemudian ia tenggelam | FAKTA (penampakan sekitar pertengahan Juni 1822; tenggelam 8 Juli 1822) | [British Library](https://blogs.bl.uk/english-and-drama/2018/08/mary-shelley-in-italy-tragedy-with-a-scene-both-affecting-and-sublime.html) |
| Ilmuwan memeriksa DNA orang asing berwajah kembar; tidak berkerabat; sebagian kode genetik sama | FAKTA (9 dari 16 pasangan berbagi banyak SNP) | [Joshi dkk., Cell Reports 2022](https://pubmed.ncbi.nlm.nih.gov/36001980) |
| Properti "2022 · BARCELONA" | FAKTA (Josep Carreras Leukaemia Research Institute, Barcelona) | idem |
| "Kata sains: kebetulan" | Pandangan skeptis umum. Studi 2022 sendiri menyebut kemiripan orang tak berkerabat selama ini "tanpa justifikasi ilmiah" | [i News, kutipan Esteller](https://inews.co.uk/news/science/doppelgangers-similar-habits-education-levels-looks-scientists-reveal-1810073) |
| "Kebetulan … atau seseorang sedang memakai wajahmu?" | Pertanyaan penutup, sengaja tidak dijawab; bukan klaim | — |

## ASET WAJAH (keputusan user 10 Nov 2026)
**Model dan tokoh dibuat sendiri** sebagai rig 2.5D di Remotion: badan, kostum, zirah, bingkai, siluet, dan properti digambar prosedural.
**Hanya wajah** yang memakai gambar berlisensi terbuka, yaitu domain publik dengan rilis CC0 resmi dari museum. Wajah boleh dipotong, di-grade, dan digabung ke rig karena CC0 mengizinkan modifikasi dan pemakaian komersial.
**Sudah diunduh (10 Nov 2026, izin user)** ke `public/faces/wajah/` (total 16 MB); kredit ada di `public/faces/wajah/CREDITS.md`.
Hasil cek visual:
- **F1** berjanggut, rambut gelap, badan besar. Paling cocok untuk bangsawan "1562".
- **F4** (Corneille, baju putih) cukup mirip F1. **Pasangan lab: F1 + F4**, sehingga wajah bangsawan muncul lagi di lab sebagai "kembaran". F3 jadi cadangan.
- **F6** ternyata foto Pierre Petit **berdiri di samping bayangannya sendiri di cermin**, sebuah doppelgänger harfiah dari tahun 1860-an. Dipakai di adegan 3a sebagai foto di meja, dan kemungkinan juga sebagai kilasan 4 frame di puncak.
- **F5**, satu wajah yang diulang 9 kali, dipakai di lightbox lab.
- **F8** hanya 523×760, jadi hanya untuk potret kecil.

Kandidat:

| # | Dipakai untuk | Karya | Sumber | Lisensi | File | Ukuran |
|---|---|---|---|---|---|---|
| F1 | Wajah bangsawan "1562" (adegan 2 & 5) | *Portrait of a Man in a Fur-Trimmed Coat*, pelukis Lombardia, 1535–45 | [Met 436741](https://www.metmuseum.org/art/collection/search/436741) | CC0 (Met Open Access) | DP-18513-001.jpg | 3,4 MB |
| F2 | Cadangan bangsawan | *Portrait of a Man*, pelukis Italia Utara, 1597 | [Met 436747](https://www.metmuseum.org/art/collection/search/436747) | CC0 | ep32.100.88.bw.R.jpg | 2,2 MB |
| F3 | Pasangan "kembar" lab (kiri) | Corneille de Lyon, *Bearded Man in Black*, 1533–75 | [Met 435948](https://www.metmuseum.org/art/collection/search/435948) | CC0 | DP-13587-001.jpg | 3,6 MB |
| F4 | Pasangan "kembar" lab (kanan) | Corneille de Lyon, *Bearded Man in White*, 1533–75 | [Met 435949](https://www.metmuseum.org/art/collection/search/435949) | CC0 | ep1978.301.7.bw.R.jpg | 2,6 MB |
| F5 | Lab: satu wajah diulang (bisa juga dipakai di penutup) | Southworth & Hawes, *Unidentified Woman in Nine Oval Views*, ca. 1850 | [Met 268650](https://www.metmuseum.org/art/collection/search/268650) | CC0 | DP-42243-001.jpg | 2,1 MB |
| F6 | Adegan 3: cermin / diri ganda | Pierre Petit, *Self-Portrait Standing by a Mirror*, 1860-an | [Met 764794](https://www.metmuseum.org/art/collection/search/764794) | CC0 | DP-15801-087.jpg | 2,0 MB |
| F7 | Adegan 3: wajah Shelley | Amelia Curran, *Percy Bysshe Shelley*, 1819 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Portrait_of_Percy_Bysshe_Shelley_by_Curran,_1819.jpg) | Domain publik (PD-Art; di Inggris NPG London masih bisa mengklaim hak atas fotonya) | Portrait_of_Percy_Bysshe_Shelley_by_Curran,_1819.jpg | 0,25 MB |
| F8 | Cadangan Shelley yang lebih aman | William Finden, gravir Shelley setelah Curran | [NYPL](https://old-digitalcollections.nypl.org/items/c4ce8f13-7130-d3e6-e040-e00a180664e5) | Domain publik di AS (menurut NYPL) | dicek saat unduh | ? |

Total ≈ 16 MB, disimpan di `public/faces/wajah/`, dengan file `CREDITS.md` berisi judul, pelukis, tanggal, dan URL.

DECISION: Lukisan "1562" di video adalah **rekonstruksi**: rig kostum bangsawan buatan sendiri dengan wajah F1. Lukisan asli Philadelphia tidak dipakai, karena museum itu tidak merilis gambarnya sebagai CC0.
DECISION: Wajah orang modern (pasangan di galeri) tetap siluet. Tidak ada foto stok orang nyata, karena wajah orang hidup di konteks horor punya risiko hak publisitas.
DECISION: Foto etnografis dari hasil pencarian (potret masyarakat adat, foto medis) **tidak dipakai**, walaupun CC0.
DECISION: Kredit sumber ditaruh di caption postingan, bukan di video (CC0 tidak mewajibkan, tapi diminta secara sopan oleh museum).

## STATE (untuk melanjutkan di sesi baru)
- Topik: doppelgänger / wajah di lukisan 1562, short 60 dtk portrait.
- Tahap: **6 dari 7 selesai (render final)**. User menyetujui versi 3D ("ini baru keren") dan minta Full HD. Final: `out/WajahDiLukisan-Portrait.mp4`, 1080×1920, h264 yuv420p, 30 fps, 2100 frame, 70,0 dtk, 50 MB, AAC 48 kHz, −14,0 LUFS, puncak −1,4 dBFS, faststart. Dirender dalam 6 chunk (`out/chunks/`, 2 pekerja, nice) plus audio sekali, loudnorm 2 pass; total 7,5 menit. QA 20 frame dari file final dengan overlay safe zone ada di `out/review/final-qa/sheet.png`; hening terukur −69 sampai −76 dB.
- Storyboard disetujui user 10 Nov 2026 ("suka banget").
- Animasi: `src/Videos/WajahDiLukisan.tsx`, komposisi `WajahDiLukisan-Portrait`, 70 dtk (2100 frame). Semua beat diturunkan dari `wajah-captions.json`/`wajah-words.json`/`WajahDiLukisan.vo.json` (objek `B`).
- Audio mix: VO dinormalkan ke `public/vo/wajah/mix/` (narator ±−16 LUFS, bisikan ±−23), w2 diolah jadi ambience `mix/w2-amb.wav`. SFX baru (sox) di `public/sfx/wajah/`: waves, riser, under, stamp, waterrise, flicker. Sisanya dari `sfx/ripper/`.
- Preview: `out/review/WajahDiLukisan-preview.mp4`, 360×640, frame 1704–2082 (lab mati → penutup → puncak → "itu kamu").
- Benchmark 720p dengan 2 pekerja: galeri 8 dtk dan lab 5 dtk per 30 frame (di bawah batas 12 dtk), jadi render penuh boleh dilakukan.
- **Safe zone (10 Nov 2026, guideline user "DIKU · Safe Zone YouTube Shorts"):** teks dan wajah hanya di x 60–960, y 380–1540; caption di y 1265–1480. Sudah diterapkan: caption (x 60–960, top 1290), label pita y 400, tiket y 1060, lukisan (bingkai y 300–1050, label y ±1070–1260, EXIT x ≤ 950), lab ditata ulang (`labGeometry`), sosok teras di dalam x 60–960, kartu label muncul hanya saat kamera mundur. Dicek dengan overlay pada 16 still beat (`out/review/safezone/`).
- **3D PSX (10 Nov 2026, permintaan user):** tokoh memakai base mesh CC0 dari skill psx-character, dirender di Blender 5.2. Skrip dan file kerjanya ada di `/Users/mac/Magz Motion/motion-starters/reverse/WajahDiLukisan/`:
  - `psx_lib.py`: pembuat tokoh bersama.
  - `couple_scene.py`: pasangan galeri. Perempuan dibentuk dari mesh pria (bahu dirampingkan, rambut panjang, rok mantel); ia menoleh di kata "menoleh" dan si pria menoleh di "Itu kamu". Hasilnya PNG transparan 320×320 on-twos di `public/3d/wajah/couple/` (199 file, 12 MB).
  - `lerici_scene.py`: adegan teras penuh 3D. Isinya lorong lengkung, langkan, laut berkilau, bulan berhalo, dan lentera. Shelley memakai wajah dari potret Curran (atlas 2 sel: diam dan seram, `face/shelley_atlas.png`). Kembaran muncul 4 frame saat kilat lentera, lalu Shelley menoleh dengan wajah seram saat hening dan kamera mendorong ke kepalanya. Hasilnya `public/3d/wajah/lerici.mp4` (270×480 diperbesar ×4, 15 gambar/dtk, 48 warna + dither, 7 MB).
  - Kedua skrip membaca timing dari `src/Videos/wajah-*.json`. Kalau cues berubah, render ulang Blender (±30 dtk per adegan).
- DECISION: Belum ada base mesh perempuan. Perempuan dibentuk dari mesh pria karena dari belakang sudah terbaca. Kalau perlu, ada kandidat CC0 seperti Titanium Rat lowpoly female, yang butuh izin unduh.
- Low-res penuh: `out/review/WajahDiLukisan-lowres.mp4` (360×640, 70,1 dtk, audio −14,4 LUFS, puncak −1,4 dBFS), menunggu persetujuan user sebelum final 720p.
- Catatan: hening sebelum puncak hanya ±0,8 dtk (sebelum "seseorang"), karena VO menyambung sampai "wajahmu". Mix akhir belum dinormalkan ke −14 LUFS (preview −17,8); itu dikerjakan di tahap 6.
- VO sudah dibuat user di `public/vo/wajah/` (7 file). Whisper + cues dikerjakan di commit 9c2e2a7: `src/Videos/wajah-captions.json` dan `wajah-words.json`, config `briefs/WajahDiLukisan.vo.json`, tabel TIMING VO di naskah induk. Total ≈ 69,9 dtk.
- Storyboard: `briefs/WajahDiLukisan.storyboard.md`, komposisi `WajahStoryboard-Portrait` (scene 1–6), set di `src/lib/scenes/wajah.tsx`, still di `out/review/WajahStoryboard-Portrait/`.
- Aset wajah: 8 file CC0/PD sudah ada di `public/faces/wajah/` (kredit di `CREDITS.md`). Pemetaan: F1 bangsawan, F1+F4 pasangan lab, F5 lightbox, F6 cermin di adegan 3, F7/F8 Shelley.
- Lembar VO siap tempel untuk user: `/Users/mac/re-motion-kit/naskah/WajahDiLukisan-VO.md`. User generate sendiri dan menaruh hasilnya di `public/vo/wajah/`.
- Berikutnya: tahap 3, generate VO di AI Studio, simpan ke `public/vo/wajah/`, lalu whisper → `src/Videos/wajah-cues.json`.
- Riset lengkap: `/Users/mac/re-motion-kit/riset/KEMBARAN-DOPPELGANGER.md`.
