# ArsipTiang (ARSIP 06) — Storyboard (12 style frame)

> Status 10 Nov 2026: **Tahap 4: storyboard**, menunggu persetujuan user.
> Dirender dari `ArsipTiangStoryboard-Portrait` (prop `scene` 1–12), 1080×1920, still di skala 0,5.
> Contact sheet: `out/review/ArsipTiangStoryboard-Portrait/storyboard-contact.png`; overlay safe zone: `safezone-sheet.png`; per frame `scene-1.png` … `scene-12.png`.
> Set 2.5D: `src/lib/scenes/tiang.tsx`. Blender PSX: `scripts/blender/tiang/` (`tiang_scenes.py`, `face_scene.py`, `tiang_lib.py`, tekstur `make_tex.py`). Still Blender sudah lewat pipeline PSX (nearest ×4, 48 warna, Bayer) di `public/storyboard/tiang/`.

## Rute
- **3D Blender PSX** (pipeline salju ARSIP 05): jalan desa (bagian 1), puncak relay (bagian 3), pendaki dari belakang dan POV camcorder (bagian 4), wajah jumpscare (bagian 5). Timing dibaca dari `src/Videos/tiang-captions.json` / `tiang-words.json`, frame 1 render = detik awal adegan.
- **2.5D Remotion**: meja arsip (map, kalkir skala, foto SAMPEL B, formulir, sketsa tertutup cap, peta topo), HT di pos jaga, OSD camcorder, meja gelap + kantong barang bukti + radio ARSIP 05, kartu kredit.
- Tokoh pendaki: base mesh CC0 skill psx-character, dari belakang, ransel + HT di tali + camcorder di tangan kanan + senter di tangan kiri. Wajah tidak pernah terlihat.
- **Makhluk**: badan = "tiang" daging-karat tanpa palang dan tanpa kabel (bagian 1, 3, 4), puncaknya selalu di luar frame atau di kabut. Wajah hanya di jumpscare (9 frame) + firasat 2 frame. Model 960 tris, tekstur PNG 64–128 px buatan sendiri (`public/3d/tiang/tex/`).

## Frame
| # | Waktu (global) | VO | Isi | Yang bergerak nanti | Audio |
|---|---|---|---|---|---|
| 1 | 0,0 (thumbnail) | 01-hook | Jalan desa malam, deretan tiang ke kabut, lampu natrium di tiang pertama, rumah dengan satu jendela. Label kaset **ARSIP 06 · yang berdiri di antara tiang** | Dolly sangat pelan maju | Angin pinus, dengung kabel 50 Hz, jangkrik, m1 bocor dari kabel |
| 2 | 7,1 "bertambah" | 01-hook | Cut tak kentara: satu tiang ekstra tanpa palang/kabel, puncak di luar frame | Lampu jalan padam 4 frame di "jangan", lalu dip ke meja | Wow-flutter di "bertambah satu", thud |
| 3 | 11,1–31,6 | 02-ciri | Map **BERKAS 06** terbuka di "jauh"; peta topo (lingkaran merah "tidak tercatat"), kalkir skala (manusia 1,7 m vs tiang + "?") di "tiang telepon", foto **SAMPEL B** di "daging", "tidak ada mata" ditulis di "Tanpa mata", cap **TIDAK DITAMPILKAN** di "dua pengeras suara" | Kamera berpindah dari properti ke properti; push-in ke cap; match-cut lingkaran merah → lampu antena | Neon, jam, foley map/kalkir/klip/cap, dropout di "pengeras" |
| 4 | 31,6–33,7 & 38,4–39,6 & 46,5–49,1 | 03a, 03b | Puncak bukit: tiang relay kisi, lampu merah ±0,6 Hz, pinus, kabut abu-hijau, embun beku, pos jaga. Di "suara orang yang kamu kenal" kabut terbuka: **dua tiang** di sebelah antena | Lampu cepat 1,2 dtk di "sirene" (2,5 Hz ≤ 3) | Angin puncak, dengung antena, sirene sintetis patah-patah (bukan sirene tsunami) |
| 5 | 33,7–38,4 & 39,6–46,5 | 03a, k1 | HT **HT-4** generik di bangku pos jaga; LED hijau menyala sendiri di "bersiaran"; LCD frekuensi acak; jendela: kabut + lampu merah jauh | Push-in ke kisi speaker selama k1 dan "suara orang…" | Statis HT, squelch, k1 radio penuh 2 lapis megafon, m2 |
| 6 | 49,1–51,6 | 04-pendaki | Pendaki dari belakang menuruni jalan setapak, siluet di sorot senter | Berjalan, kamera mengikuti | Langkah di jarum pinus, napas |
| 7 | 51,6–65,1 | 04, b1 | POV camcorder (full-frame portrait): **● REC**, SP, baterai, 27.06.2022 23:41; tiang di sisi kiri jalan; nisan kayu di punggung bukit (±52,6) | Senter menyapu tiang di "dua puluh satu" / "dua puluh dua" | Mic camcorder LP 7 kHz, b1, m1 sebelum b2 |
| 8 | 65,1–66,6 | b2 | Kamera berbalik: satu "tiang" berdiri **di tengah jalan setapak** yang baru dilewati, puncaknya hilang di gelap | Berbalik 180°, tracking line | b2 dari HT di tali ransel (suara pendaki sendiri, 2 lapis megafon) |
| 9 | ±66,2 (2 frame) | — | **Firasat**: glitch pita memperlihatkan wajah, digelapkan, potongan atas saja | 2 frame saja | Statis pendek |
| 10 | 68,0–83,75 | 05, 06, n7 | Meja arsip lebih gelap: camcorder di kantong **BARANG BUKTI · 06-C**, map tertutup, radio ARSIP 05 menyala sendiri (amber) | Mundur pelan di 06; skala radio menyala di klik; push-in cepat ke speaker saat n7; hening 1,5 dtk | Klik radio, desis naik, n7 suara narator jadi siaran, hening −78 dB |
| 11 | 83,75 (9 frame) | — | **JUMPSCARE**: dua corong berkarat menyatu leher daging, tanpa mata, dari bawah, cahaya keras dari kiri | Lunge maju dengan frame drop, satu kilatan saja, lalu hitam 0,7 dtk | Lonjakan: suku kata n7 dibalik + sirene 0,3 dtk lewat megafon, puncak < −1 dBTP |
| 12 | 84,75–92,25 | — | Kartu kredit penuh, hitam, teks besar, ditahan 7,5 dtk | Fade-in 0,5 dtk | Desis pita tipis, fade out |

## Safe zone
- Teks properti (label kaset, map, formulir, OSD, kartu kredit) di x 60–960, y 380–1540; caption narator y 1265–1480 (strip mesin tik seperti ARSIP 05), HT/radio dalam kurung siku hijau fosfor.
- Wajah jumpscare: fitur utama (dua mulut corong) di x ±160–900, y ±700–1150.
- OSD camcorder: REC/SP/baterai di y 410–500, tanggal/jam di y 1130–1235 (di atas zona caption).

## DECISION baru di storyboard
- DECISION: Pendaki muncul sebagai shot orang ketiga 2,5 dtk (rekonstruksi), lalu cut ke rekaman camcorder di "merekam".
- DECISION: "Tiang" di belakang pendaki berdiri **di tengah jalan setapak** (bukan di antara pinus) supaya langsung terbaca sebagai sesuatu yang salah tempat; tetap tanpa kepala, puncak hilang di gelap.
- DECISION: Pendar teks hook = label kaset di frame 1 + caption narator; tidak ada teks melayang lain.
- DECISION: Formulir saksi juga berisi "setinggi tiang / kayu? karat? / seperti radio" (tulisan tangan), sebagai set dressing.
