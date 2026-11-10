# WajahDiLukisan — Storyboard (6 style frame)

> Status 10 Nov 2026: **Tahap 4 dari 7**, menunggu persetujuan user.
> Dirender dari `WajahStoryboard-Portrait` (prop `scene` 1–6), 1080×1920, still dibuat di skala 0,5.
> Contact sheet: `out/review/WajahStoryboard-Portrait/storyboard-contact.png`; per frame: `scene-1.png` … `scene-6.png`.
> Set ada di `src/lib/scenes/wajah.tsx`. Kamera, grade, dan tekstur memakai scene kit RipperTape.

## Rute: 2.5D, bukan 3D penuh
- Ruangan galeri dibuat dengan **CSS 3D**: dinding, lantai, dan lukisan berada di ruang 3D sungguhan, jadi kamera bisa dolly menyusuri lorong dengan perspektif benar.
- Semua set lain berupa **lapisan 2.5D** (properti, cahaya, kabut) dengan parallax, handheld, dan kedip.
- Tokoh dan properti digambar sendiri (SVG/CSS): siluet galeri, dua sosok 1820-an, kamus, surat, lilin, lightbox, pita DNA, bingkai emas, dan kartu label.
- Hanya wajah dan dasar lukisan yang memakai gambar CC0/PD (`public/faces/wajah/`).
- Tidak memakai three.js (keputusan user 7 Nov 2026).

## Frame
| # | Frame | VO | Set & properti | Yang bergerak nanti | Audio |
|---|---|---|---|---|---|
| 1 | Galeri malam | 01-hook (0–12 dtk) | Lorong museum 3D, parket, lukisan F2/F3/F7 di dinding samping, lukisan "1562" di ujung disorot lampu dengan kerucut cahaya, dua siluet, tiket "11.11.2012", label "ARSIP 04" | Dolly maju menyusuri lorong. Perempuan menoleh di kata "menoleh". Lampu sorot berdengung | Room tone museum, langkah bergema, w2 pelan |
| 2 | Lukisan | 02-lukisan (12–24) | Lukisan rekonstruksi dalam bingkai emas, wajah tertutup bayangan, gagang rapier di langkan, kartu label | Tilt naik dari rapier ke dagu. "Pelukis: ————" dan "Subjek: ————" diketik saat VO | Dengung lampu, jam, derit lantai |
| 3 | Meja 1822 | 03-legenda, paruh 1 | Kamus terbuka di "Doppelgänger" (kutipan Jean Paul 1796), surat "Pisa — Aug. 15th 1822", miniatur Shelley (F7), pena dan tinta, lilin | Push-in ke entri kamus. Tanggal surat tertulis sendiri di "Percy Shelley". Lilin bergoyang | Lilin, pena di kertas |
| 4 | Teras laut | 03-legenda, paruh 2 | Teras berpagar, bulan, jalur cahaya di laut, kabut rendah, dua sosok yang sama, label "LERICI · JUNI 1822" | Kedua sosok saling mendekat. Keduanya hanya terlihat bersamaan 4 frame di "dirinya sendiri". Air naik menutup layar di "tenggelam" | Ombak, angin, hening 1 dtk sebelum "ia tenggelam" |
| 5 | Lab | 04-dna | Lightbox, foto F1 dan F4 dengan titik pengenal wajah, lembar F5 (satu wajah ×9), map "2022 · BARCELONA", pita DNA A/B, catatan "kebetulan?", cap "TIDAK BERKERABAT" | Slide top-down. Cap mendarat di "orang asing". Pita bergeser menumpuk dan pita yang cocok menyala di "sebagian sama" | Dengung lightbox, kertas, thud cap |
| 6 | Penutup (puncak) | 05-penutup + w1 | Lukisan yang sama dalam gelap, lampu EXIT hijau, "Subjek: ?" | Push-in lambat. Hening 1,5 dtk. Di "wajahmu", wajah terlihat dan menatap kamera selama 4 frame, lalu hitam, lalu w1 "itu kamu." | Sunyi, sub-hit, bisikan dekat, klik |

## VO terukur (dari user, 10 Nov 2026; 24 kHz mono)
| file | durasi |
|---|---|
| 01-hook | 12,24 s |
| 02-lukisan | 11,52 s |
| 03-legenda | 17,12 s |
| 04-dna | 12,20 s |
| 05-penutup | 9,08 s |
| w1-itukamu | 1,44 s |
| w2-kamu | 1,36 s |

Total narator 62,2 s, jadi video ±66 s dengan bisikan dan hening. Kalau targetnya tetap 60 s, jeda di 01 dan 02 bisa dipangkas ±1,5 s per klip dengan ffmpeg.

## Perubahan dari naskah (DECISION)
- DECISION: Lukisan "1562" memakai **lukisan F1 utuh** sebagai dasar, bukan badan vektor buatan sendiri. Versi rig vektor sudah dicoba di still pertama dan terlihat seperti clip-art di sebelah wajah lukisan asli. Bingkai, langkan, rapier, bayangan wajah, pernis, dan retak tetap buatan sendiri. Sarung tangan duel tidak digambar karena terbaca sebagai benda asing; judulnya cukup ada di kartu label.
- DECISION: "Struk kalkulator berisi angka peluang" diganti catatan pensil "kebetulan?". Angka peluang yang spesifik tidak punya sumber, jadi tidak dipakai.
- DECISION: Wajah sosok di teras tidak memakai foto. Keduanya siluet yang identik, karena horor bentuk lebih kuat daripada detail.

## Belum sempurna
- Siluet galeri dan sosok teras masih sederhana. Cukup untuk storyboard, dan akan diperhalus saat animasi (rim light, gerak napas).
- Wajah di adegan 2 hanya berupa gelap tanpa bentuk. Saat animasi, bayangannya bisa sedikit bergerak supaya terasa "menyembunyikan" wajah.
