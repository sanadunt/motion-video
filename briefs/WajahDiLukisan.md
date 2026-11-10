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
- Tahap: **2 dari 7**. Naskah v2 (nada skeptis-menggantung, penutup berupa pertanyaan) ada di `briefs/WajahDiLukisan.naskah.md` dan menunggu persetujuan user.
- Aset wajah: 8 file CC0/PD sudah ada di `public/faces/wajah/` (kredit di `CREDITS.md`). Pemetaan: F1 bangsawan, F1+F4 pasangan lab, F5 lightbox, F6 cermin di adegan 3, F7/F8 Shelley.
- Lembar VO siap tempel untuk user: `/Users/mac/re-motion-kit/naskah/WajahDiLukisan-VO.md`. User generate sendiri dan menaruh hasilnya di `public/vo/wajah/`.
- Berikutnya: tahap 3, generate VO di AI Studio, simpan ke `public/vo/wajah/`, lalu whisper → `src/Videos/wajah-cues.json`.
- Riset lengkap: `/Users/mac/re-motion-kit/riset/KEMBARAN-DOPPELGANGER.md`.
