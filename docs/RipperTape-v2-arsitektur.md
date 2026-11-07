# RipperTape v2 — Arsitektur (2D/2.5D, scene-based)

Tanggal: 7 November 2026. Status: usulan untuk dicek, belum dianimasikan.
Menjawab kritik v1: terlalu banyak teks, tidak ada adegan, bisikan mengganggu.

## Prinsip
1. **Teks adalah properti, bukan adegan.** Nama korban ada di kartu yang dipaku, tanggal ada di formulir, surat ditulis tangan. Tidak ada teks melayang di atas gradien.
2. **Setiap bagian narasi punya set sendiri** dengan properti, cahaya, dan gerak kamera yang berbeda. Penonton selalu "berada di suatu tempat".
3. **Kamera tidak pernah diam.** Push, tilt, pan pelan, plus handheld halus (noise deterministik 2–3 px). Cahaya selalu berkedip sedikit (lampu meja, gas, lilin).
4. **Satu grade untuk semua set** supaya terasa satu film: grain per frame, split-tone (bayangan teal, highlight amber), vignette, debu, kedip.
5. **Bisikan = ambience.** Satu lapis, difilter dan diberi ruang (reverb), volume 0,1–0,15, potongan pendek 4–5 kali sepanjang video, tidak di-loop. Yang dekat hanya di puncak dan penutup.

## Struktur kode

```
src/lib/scenes/index.tsx        # scene kit reusable (dipakai naskah berikutnya)
├─ PAL, FONT                    # palet rumah + font (Special Elite, IM Fell English, Homemade Apple, Courier Prime)
├─ NoiseFill                    # tekstur prosedural: kertas, gabus, kayu, bata, kabut (feTurbulence, seeded)
├─ smoothNoise(seed, frame)     # noise halus per frame: handheld, kedip lampu, goyang lilin, hanyut kabut
├─ CameraRig                    # zoom/pan/rotasi + handheld di atas seluruh set
├─ FilmGrade                    # grain, split-tone, vignette, debu, kedip
└─ Paper, Pin, RedString, Stamp, Tape   # properti set

src/Videos/RipperStoryboard.tsx # 7 set sebagai style frame (prop `scene` 1–7), untuk storyboard ini
src/Videos/RipperTape.tsx       # v1 (teks), akan diganti v2 yang merangkai set di atas pada timeline VO
```

Rencana v2 (`RipperTape.tsx`): tiap set jadi komponen `<Set* frame=…>` yang menerima **frame lokal** dan daftar beat; `RipperTape` hanya mengatur `<Sequence>` per adegan, kamera per adegan (`CameraRig` dengan keyframe), transisi (dip-to-black, cut keras, atau "sobekan" kaset), dan audio. Semua angka waktu tetap dari `briefs/RipperTape.md` (VO terukur).

## Peta narasi → set

| # | Narasi (VO) | Set | Properti utama | Kamera | Cahaya |
| --- | --- | --- | --- | --- | --- |
| 1 | 01-hook: "lima perempuan… tinta merah" | **Papan bukti** di meja | 5 kartu korban dengan "foto" ukiran, peta Whitechapel, benang merah, amplop merah "Dear Boss", label kaset | handheld, push-in pelan, berhenti di amplop merah saat kata "merah" | lampu meja amber kiri atas, berkedip |
| 2 | 02-setup: tanggal, Buck's Row, nama korban | **Berkas polisi** | formulir "Metropolitan Police · H Division", kolom diketik satu per satu mengikuti VO, dua baris disensor, cap merah, catatan tangan, noda cangkir, klip | tilt turun mengikuti baris; micro push saat nama | lampu kanan atas |
| 3 | 03-grafiti (awal): Goulston Street | **Jalan berkabut** | bangunan siluet, lampu gas, kabut 3 lapis hanyut, hujan, pantulan di jalan basah, sosok jauh | dolly lateral pelan | lampu gas + jendela |
| 4 | 03-grafiti (lanjut): tulisan kapur dihapus | **Dinding bata** | bata per-tint, tulisan kapur digambar huruf demi huruf, celemek di tanah | push-in ke tulisan, lalu bayangan tangan menghapus (blur + fade) | lentera kanan bawah |
| 5 | 04-surat: kotak, ginjal, "From Hell" | **Surat** | perkamen, tulisan tangan tinta merah-cokelat muncul baris demi baris, kotak kayu, noda | tilt turun mengikuti tulisan, berhenti di "Catch me when you can" | lilin kanan bawah, goyang |
| — | HENING 1,5 dtk | hitam | | | |
| 6 | 05-kelly: Miller's Court, pintu terkunci | **Pintu** | papan kayu, pelat kunci kuningan, cahaya dari lubang kunci dan bawah pintu, dua celah gelap (kaki) | push-in sangat pelan 20 dtk ke lubang kunci | cahaya dari balik pintu |
| ★ | PUNCAK (w3 "belum selesai") | Pintu | celah pintu terbuka 4 frame, sesuatu di celahnya; sobekan + statik | | |
| 7 | 06-penutup: tidak pernah tertangkap | **Papan bukti** (ulang) | kartu lama kabur, kartu baru "?" tinta merah, benangnya menjuntai ke luar frame | pull-back pelan | lampu lebih redup |
| — | w4 "masih di sini", klik stop | hitam | | | |

## Gerak dan transisi
- Antar set: **cut keras** di beat kata, atau **dip-to-black 6 frame**. Satu kali "sobekan kaset" hanya di puncak.
- Entrance properti: tidak ada slide. Kertas sudah di tempatnya; yang bergerak adalah **cahaya** (lampu menyala/berkedip) dan **kamera**. Tulisan muncul dengan diketik/ditulis.
- Benang merah: digambar dari peniti ke peniti (path draw-on) saat nama disebut.
- Tulisan tangan: draw-on per baris dengan mask yang bergerak, bukan fade.

## Audio v2
| Lapisan | Isi | Level |
| --- | --- | --- |
| Narator | 01–06 (ada, dinormalkan −15 LUFS) | 1,0 |
| Ambience | hujan tipis + angin (jalan), room tone + jam (meja/berkas), lilin (surat), dengung rendah (pintu) | 0,15–0,25 |
| Bisikan ambience | w1/w2 dipotong jadi 4–5 fragmen 1–2 dtk, lowpass 2,5 kHz + reverb besar, pan bergeser pelan | 0,08–0,15 |
| Bisikan dekat | w3 di puncak, w4 di akhir | 0,6 / 0,5 |
| SFX | klik kaset, sub-hit, statik, kertas digeser, langkah jauh | sesuai beat |

Bisikan v1 (loop, 0,4–0,7) dibuang.

## Reusable untuk naskah berikutnya
Naskah baru cukup menyebut per adegan: **set** (board / file / street / wall / letter / door / custom), **properti teks** (apa yang diketik/ditulis di set itu), **kamera** (push / tilt / pan / hold), dan **beat audio**. Scene kit yang sama dipakai; set baru ditambahkan ke `src/lib/scenes/` kalau cerita butuh tempat baru.

## Yang belum
- Semua set belum dianimasikan; storyboard ini still.
- Belum ada aset arsip (ukiran, faksimili surat). Kalau disetujui, ambil dari Wikimedia Commons (domain publik 1888) ke `public/archive/`.
- Bisikan ambience belum diproses.
