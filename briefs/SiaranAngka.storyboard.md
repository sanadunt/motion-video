# SiaranAngka (ARSIP 05) — Storyboard (6 style frame)

> Status 10 Nov 2026: **Tahap 4 dari 7**, menunggu persetujuan user.
> Dirender dari `AngkaStoryboard-Portrait` (prop `scene` 1–6), 1080×1920, still dibuat di skala 0,5.
> Contact sheet: `out/review/AngkaStoryboard-Portrait/storyboard-contact.png`; overlay safe zone: `safezone-sheet.png`; per frame: `scene-1.png` … `scene-6.png`.
> Set ada di `src/lib/scenes/angka.tsx`. Kamera, grade, dan tekstur memakai scene kit ARSIP. Blender ada di `scripts/blender/angka/`.

## Rute
- Set 2.5D di Remotion: kelas, meja arsip, dan kamar 2001. Properti digambar sendiri (CSS/SVG): radio gelombang pendek generik "WORLD BAND 12" (bukan merek nyata), CRT, kalender, buku catatan angka, dan map berkas.
- Tokoh kamar 2001: **model PSX dari Blender, dilihat dari belakang** (`montes_char.py` → `public/storyboard/angka/montes_back.png`). Wajahnya tidak pernah terlihat, dan tidak ada kemiripan dengan orang nyata.
- Adegan 4 **full 3D Blender PSX** (`salju_scene.py`): padang salju, tiang antena kisi 58 m, kawat penahan, gubuk pemancar, pagar, garis pohon, dan bulan. Timing dibaca dari `src/Videos/angka-captions.json`. Lampu merah nyala 36 frame, mati 36 frame (dengungan ±25/menit), lalu padam tepat setelah "untuk apa". Still diolah ke 48 warna + dither Bayer.
- **Siren Head tidak pernah tampil**: tidak ada gambar, model, atau siluetnya. Tiang antena tetap benda mati tanpa "kepala".

## Frame
| # | Frame | VO | Set & properti | Yang bergerak nanti | Audio |
|---|---|---|---|---|---|
| 1 | Kelas malam (thumbnail) | 01-sekolah (1,0–12,9 dtk) | Papan tulis "4 6 2 5", label kaset "ARSIP 05", radio di meja guru (skala redup), kertas lipat "kamu pernah dengar siren head ?", bangku, tas tertinggal, jendela dengan pohon | Kertas terbuka di "Siren Head". Angka kapur tergores sendiri di "angka". Pohon bergoyang. Dolly pelan di antara bangku | Desis gelombang pendek, angin, foley kertas dan kapur, w2 "empat… enam…" pelan |
| 2 | Meja arsip | 02-karangan (13,5–29,7) | CRT dengan UI unggahan fiktif "19 · 08 · 2018", ♥ 1.3rb; gambar ditutup kertas **"GAMBAR ASLI · TIDAK DITAMPILKAN · © pembuatnya"** | Tanggal diketik di "dua ribu delapan belas". Cap dihantamkan di "karangan". Push-in ke layar, lalu match-cut lampu power → kenop radio di "radio" | Dengung CRT, klik keyboard, stamp, sapuan tuning |
| 3 | Kamar 2001 | 03-montes (30,3–47,3) | Kerai dengan cahaya lampu jalan, kalender **MAY 2001** dengan Selasa/Kamis/Sabtu dilingkari, tokoh PSX menulis, radio (skala menyala), laptop tua, buku angka 5 digit, map "BERKAS · 2001 · RAHASIA" | Map masuk di "Dua ribu satu". Lingkaran kalender di "Tiga malam seminggu". Baris angka ditulis tangan di "mencatat angka". Tokoh tidak pernah menoleh | Room tone, jam, r1 "Atención" (radio, jauh), pensil |
| 4 | Padang salju, Rusia (3D) | 04-buzzer (47,9–62,7) | Render Blender + label pita "4625 kHz", layar spektrum fosfor (puncak di 4,625 naik-turun seirama dengungan), penghitung "1982 → 2026" | Dolly sangat pelan ke antena. Lampu merah berkedip seirama dengungan. Penghitung berputar di "empat puluh tahun". Semuanya berhenti di "untuk apa" | Dengungan sintesis (bukan rekaman asli), angin salju; setelahnya hening 1,5 dtk |
| 5 | Kelas, gelap | 05-penutup (64,8–76,5) | Kelas yang sama, lampu padam, hanya skala radio menyala di 4625 | Radio menyala sendiri di "Siarannya tidak". Push-in lambat ke radio | Desis naik, r2 angka dekat |
| 6 | Puncak (4 frame) | akhir 05 + w1 | Close-up kertas lipat: tulisan berubah jadi **"untukmu."** selama 4 frame, lalu kembali | Kilat 4 frame, lalu hitam, lalu w1 "untukmu." | Sub-hit, hening, bisikan dekat |

## Safe zone (dicek dengan overlay drawbox)
- Semua teks dan angka ada di x 60–960, y 380–1540. Zona caption y 1265–1480 bebas teks properti. Hook "4 6 2 5" + label ARSIP ada di y ±400–780, karena frame 1 menjadi thumbnail.
- Benda tanpa teks (tas, laptop, pagar, gubuk) boleh menyentuh zona UI.

## Perubahan dari naskah (DECISION)
- DECISION: Nama "siren head" muncul juga sebagai **tulisan tangan anak di kertas lipat** (selain VO dan caption). Ini hanya nama, ditulis huruf kecil, tanpa gambar, dan diperlakukan sebagai properti dokumenter yang sama dengan VO.
- DECISION: Tulisan tangan memakai huruf kecil, karena huruf kapital Homemade Apple tidak terbaca ("UNTUKMU" terbaca "UNJUKMU").
- DECISION: Kalender di kamar 2001 diset **Mei 2001**, bulan penggeledahan diam-diam FBI (25 Mei 2001). Kalendernya berbahasa Inggris, sesuai latar Washington.
- DECISION: Buku angka hanya menampilkan 3 baris, supaya baris ketiga tetap di atas zona caption.
- DECISION: Layar spektrum fosfor dipindah ke kiri di bawah label, supaya tidak menutupi puncak tiang dan lampu merahnya.

## Belum sempurna
- Tokoh PSX kamar 2001 masih kecil dan statis di still. Saat animasi akan ada napas, anggukan menulis, dan rim light dari lampu meja.
- Perspektif bangku depan di kelas masih datar; saat animasi akan diberi parallax dolly supaya ruangnya terasa.
- Bulan di adegan salju berupa bola piksel; bisa diganti piringan dengan halo kalau terasa mengganggu.
