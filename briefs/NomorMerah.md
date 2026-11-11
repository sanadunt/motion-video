# NomorMerah (Videos) · "Nomor Merah"

## GOAL
Short horor bernarasi ±88 dtk, portrait 1080×1920, 30 fps, tentang rumor "SMS santet / telepon nomor merah" Mei 2008. Nada **skeptis**: legenda dibingkai "konon", klaim "katanya", pengakuan "mengaku"; jawaban resmi diberikan; lalu dua hal yang mengganjal (orang yang mengaku sakit, dan pesan yang sama sudah beredar di negara lain bertahun-tahun sebelumnya). Akhir terbuka: dua pertanyaan tidak dijawab, ponsel bergetar, layar "ANGKAT?", hitam sebelum dijawab.
Dipakai di: TikTok / Reels / Shorts. Video disebut dengan judulnya saja, **tanpa label seri dan tanpa nomor urut** (aturan user 11 Nov 2026).

Naskah, teks klip terkunci, tabel kalimat → sumber: `briefs/NomorMerah.naskah.md`. Storyboard: `briefs/NomorMerah.storyboard.md`. Timing VO: `briefs/NomorMerah.vo.json` + `src/Videos/merah-captions.json` / `merah-words.json`.

## DELIVERY
- Komposisi: `NomorMerah-Portrait` (hanya portrait; set dirancang untuk zona aman Shorts).
- Final: `out/NomorMerah-Portrait.mp4`, 1080×1920, h264 yuv420p, AAC 48 kHz, −14 LUFS, puncak ≤ −1 dBTP, +faststart.
- Preview: `out/review/NomorMerah-lowres.mp4` (360×640, audio sudah −14 LUFS) → **disetujui user dulu** sebelum final 1080p.
- Semua waktu di brief = detik **global**.

## PROPS (bisa diubah di Studio)
| Prop | Tipe | Default | Guna |
|---|---|---|---|
| `grain` | 0–1 | 0,5 | butir film |
| `handheld` | 0–1 | 0,6 | goyang kamera tangan |
| `captions` | boolean | true | caption narator |
| `showTitle` | boolean | true | judul piksel merah di 2,7 dtk pertama |
| `pesanGain` | 0–2 | 1 | volume suara pesan (speaker ponsel) |
| `bisikGain` | 0–2 | 1 | volume bisikan |
| `sourceLines` | daftar string | 3 baris, lihat komponen | isi kartu sumber |
| `durationInSeconds` | angka | 88,43 (dari `vo.json` `end`) | panjang komposisi |

## STRUKTUR (detik global, semua batas diturunkan dari cues VO)
| # | Waktu | Klip VO | Set | Teks properti |
|---|---|---|---|---|
| 1 | 0,00–6,01 | 01-hook, w1a | **Blender PSX `meja`**: ponsel candybar generik di meja kayu, lampu meja hangat, bergetar; digit nomor pemanggil memerah satu per satu padahal layarnya monokrom. Judul piksel merah di atas (frame 0 = thumbnail) | LCD: `PANGGILAN MASUK` · `0866-XXX-XXXX` · `ANGKAT / TOLAK`; judul `NOMOR MERAH` |
| 2 | 6,01–15,11 | 02-sebar, s1a, s1b | **Remotion 2.5D**: peta kertas Sumatera–Jawa (poligon low-poly digambar sendiri) di meja; titik menyala berurutan Pekanbaru, Duri, Bengkalis → Lubuk Basung, Bengkulu → Jambi, Koba, Jakarta → Banyuwangi; amplop SMS melompat antar titik; garis putus merah | pita tanggal `7 MEI 2008` → `8` → `9` → `13 MEI 2008`; nama kota |
| 3a | 15,11–20,42 | 03-konon (kalimat 1), s1c | **Blender PSX `warnet`**: lorong warnet 2008, deretan CRT berpendar (forum tak terbaca), bilik triplek, kipas angin, kabut asap | secarik label bercap `KONON` |
| 3b | 20,42–24,04 | 03-konon (kalimat 2), s1d | **Blender PSX `inbox`**: ponsel di meja bilik; kotak masuk terisi `Fwd: Fwd: Fwd:` beruntun, lalu pesan terbuka | label `KATANYA:`; LCD: `SUDAH 7 ORANG TEWAS DI JAKARTA …` (ringkasan isi rumor, kata sendiri) |
| 4 | 24,04–30,41 | 04-resmi | **Remotion**: tiga kliping (judul ditulis ulang) jatuh ke meja | `ISU "TELEPON MAUT" RESAHKAN WARGA` + cap `HOAKS` · `POLISI: KABAR BOHONG` + kutipan pendek bersumber · `TIDAK ADA KEMATIAN YANG TERBUKTI` + garis bawah merah + sumber kecil |
| 5a | 30,41–34,65 | 05-iseng (awal) | **Blender PSX `kursi`**: ruang periksa, kursi kosong dari belakang, meja, lampu gantung | — |
| 5b | 34,65–43,22 | 05-iseng | **Remotion**: map berkas `PENGIRIM AWAL` | `STATUS: DIAMANKAN POLISI RIAU` (diketik) + `kata humas Ditjen Postel, 13 Mei 2008` · `JUMLAH: SATU ORANG` · cap `ISENG` · `NAMA:` ditutup balok hitam + tulisan tangan `tidak pernah diumumkan` · kotak foto kosong `?` |
| 6 | 43,22–57,52 | 06-sakit | **Blender PSX `lantai`**: ponsel di lantai ubin, tangan low-poly kaku di tepi frame; di "memerah" layar dibanjiri merah dan cahaya merah berdenyut pelan; di "kejang" jari menegang. Di atasnya (Remotion): catatan dan kliping | `MENGAKU: pusing · lemas · pingsan` (Antara, 15 Mei 2008) · kliping `Seorang pria mengaku: layar memerah, tangan kejang` (Kompas, 14 Mei 2008) · label `SUGESTI?` + `Wagub Bengkulu, 15 Mei 2008` |
| 7 | 57,52–69,50 | 07-dunia | **Remotion**: peta dunia low-poly di meja; pin + benang merah Nigeria → India → Pakistan → Indonesia; catatan daftar gelombang dicentang; foto layar monokrom dengan kata `RED` | pita `2004 NIGERIA` · `2006 INDIA` · `2007 PAKISTAN` · `2008 INDONESIA`; `2007 · layar tanpa warna` |
| 8 | 69,50–84,48 | 08-tutup, w1b | **Blender PSX `tutup`**: meja yang sama, lampu padam, garis bayangan kisi jendela, sorot mobil lewat di "di benua lain?"; push-in pelan | LCD: `1 TAK TERJAWAB` · `0866-XXX-XXXX` merah |
| 9 | 84,48–86,73 | — | sama: ponsel bergetar, layar berganti | LCD: `ANGKAT?  [YA]  [TIDAK]`, kursor berkedip di `[YA]` |
| 10 | 86,73–88,43 | — | hitam; kartu sumber | `SUMBER` · `Kompas, detikcom, Antara,` · `Ditjen Postel (Mei 2008)` · `J. Bonhomme, Tracés 21 (2011)` |

## DECISIONS (diputuskan Claude di tahap build; user boleh koreksi per nomor)
1. **DECISION: durasi 88,4 dtk** (target ±87). Narator dipangkas dari 88,3 ke 82,0 dtk hanya dengan memendekkan jeda "…" (batas 0,70 dtk, rasio 0,30; klip 08 lebih lapang 0,90/0,50). Tempo bicara tidak diubah. Jarak antar klip 0,25 dtk (0,40 sebelum klip 08). Kalau mau tepat 87: rapatkan jeda klip 08 (−1 dtk).
2. **DECISION: adegan ponsel, warnet, ruang periksa, dan lantai dibuat 3D PSX di Blender** (360×640 → ×3, 15 gambar/dtk, 48 warna + dither), set kertas/peta/berkas di Remotion 2.5D. three.js tidak dipakai.
3. **DECISION: layar LCD digambar sendiri** dengan font piksel 5×7 buatan sendiri (PIL), 96×64 piksel, dijadikan tekstur emisi per frame. Ponsel = candybar generik tanpa merek dan tanpa logo.
4. **DECISION: nomor di layar `0866-XXX-XXXX`** (awalan 0866 bagian dari rumor; sisa digit disamarkan). Tidak ada nama operator di mana pun.
5. **DECISION: adegan 8 memakai layar "1 TAK TERJAWAB"** dengan nomor merah, baru di adegan 9 ponsel bergetar lagi dan layar bertanya `ANGKAT?`. Tanpa nada dering di penutup (keputusan user no. 6); nada dering ciptaan sendiri hanya terdengar pelan di adegan 1.
6. **DECISION: label `KONON` / `KATANYA:` / `SUGESTI?` berupa secarik kertas bercap** yang ditempel di atas rekaman 3D (bahasa "catatan penyunting"), bukan teks melayang.
7. **DECISION: suara pesan (s1) dipotong 4 kalimat** dan diletakkan di bawah narator: s1a di jeda setelah "Mei dua ribu delapan", s1b di "dari Riau", s1c di lorong warnet, s1d ("kirim ke teman dan saudara semua") saat kotak masuk terisi. Level 19 dB di bawah narator.
8. **DECISION: bisikan hanya dua kali**: w1a di jeda sebelum narator mengucap "jangan diangkat" (adegan 1), w1b di jeda setelah "di benua lain?" (adegan 8). 28 dB di bawah narator.
9. **DECISION: caption dipotong di jeda "…" dan di batas kalimat** (25 frasa), teks tetap dari naskah (termasuk ejaan "meneleponmu").
10. **DECISION: India 2006** muncul di peta dan daftar (Bonhomme 2011) walau tidak disebut di VO, sesuai rencana adegan.
11. **DECISION: storyboard** tidak dibuat sebagai komposisi terpisah; style frame diambil langsung dari komposisi utama di detik beat (lihat `briefs/NomorMerah.storyboard.md`).
12. **DECISION: kutipan langsung di kliping** hanya dua, sangat pendek, dan bersumber: Kadiv Humas Mabes Polri (Kompas, 9 Mei 2008) dan Polda Riau (detikcom, 14 Mei 2008). Judul kliping lain ditulis ulang.

## LOOK
- Palet: gaya rumah (teal-hitam, kertas `#D9C9A6`, amber lampu) + merah LCD `#E21C0E`, merah tinta `#A8231A`, hijau-abu LCD `#96A88A`, daratan peta `#6F8068`, laut kertas `#C9CDBD`.
- Font: Special Elite (judul properti, caption), Courier Prime (sumber, label kecil), IM Fell English (judul kliping, cap), Homemade Apple (tulisan tangan), font piksel 5×7 sendiri (LCD, judul).
- Grade: `FilmGrade` scene kit di semua adegan (butir, vignette, split-tone).

## SAFE ZONE
Teks dan elemen penting di x 60–960, y 380–1540. Caption narator y 1265–1480 (strip mesin tik, garis kiri merah). Teks properti di y 380–1220. Judul di y 408–578 (frame 0 = thumbnail). Layar LCD pada close-up di y ±495–975. Kartu sumber di y ±860–1010.

## KESELAMATAN
Tanpa jumpscare, tanpa sirene. Denyut merah ≤ 0,45 Hz (jauh di bawah 3 kali per detik); merah jenuh tidak pernah memenuhi layar (hanya layar ponsel + pendar di sekitarnya). Kursor `[YA]` berkedip ±1,9 Hz di area kecil. Loudness −14 LUFS, puncak ≤ −1 dBTP.

## AUDIO
- VO: `zsh scripts/sfx/merah_vo.sh edit|mix|dengar` → `public/vo/merah/edit/` (jeda dipangkas) dan `mix/` (narator −17 LUFS dengan warna pita tipis; s1a–d speaker ponsel kecil −36 LUFS; w1a–b bisikan −45 LUFS).
- SFX sintesis sendiri: `bash scripts/sfx/merah_sfx.sh` → `public/sfx/merah/` (ring = nada dering monofonik ciptaan sendiri motif D minor, vibrate, vibrate-one, warnet, sms, tick, pulse, neon, off). Dipakai ulang: sub-hit, tape-hiss, static-burst, room, drone, paper-slide (ripper); stamp, riser (wajah); key, pencil (angka); clip (tiang). **Tanpa sirene.**
- Setiap batas adegan punya bunyi (riser + thud, atau thud saja di cut keras).

## SUMBER
Tabel kalimat → label → sumber dan daftar sumber yang dibuka ulang (10 Nov 2026): `briefs/NomorMerah.naskah.md`. Tidak ada nama orang biasa; pejabat disebut jabatannya saja; "J. Bonhomme" adalah penulis jurnal di kartu sumber.

## STATE
- Tahap 1–3 (rencana, naskah, VO): **disetujui user** 11 Nov 2026. Teks klip terkunci. VO mentah: `public/vo/merah/*.wav` (10 klip, 24 kHz mono).
- VO olahan (11 Nov 2026): `zsh scripts/sfx/merah_vo.sh edit` → narator 88,28 → **82,03 dtk** (hanya jeda yang dipangkas); `mix` → narator −17 LUFS, s1a–d −36, w1a–b −45. Whisper model `small` di `edit/` → `public/vo/merah/whisper/`; `node scripts/vo-align.mjs briefs/NomorMerah.vo.json` → 25 frasa, 103/112 kata berjangkar. File dengar: `out/review/NomorMerah/vo-timeline.mp3`.
- Posisi klip (detik global, `vo.json`): 01 @0,50 · 02 @6,16 · 03 @15,26 · 04 @23,94 · 05 @30,43 · 06 @43,27 · 07 @57,57 · 08 @69,63 · narasi selesai 84,43 · ring 84,48 · hitam 86,73 · sumber 86,93 · akhir 88,43.
- Beat (objek `B` = `merah_beats.py`): s1End 6,01 · s2End 15,11 · katanya 20,42 · s3End 24,04 · s4End 30,41 · diamankan 34,65 · s5End 43,22 · memerah 51,93 · kejang 53,91 · sugesti 56,51 · s6End 57,52 · s7End 69,50 · ring 84,48 · black 86,73.
- Komposisi `NomorMerah-Portrait` (`src/Videos/NomorMerah.tsx`, 2653 frame), set 2.5D `src/lib/scenes/merah.tsx` (MerahTitle, Slip, MapScene + mapGeometry, DateTape, ClipScene, FormScene, NoteOverlay, WorldScene, SourceCard), terdaftar di `src/Root.tsx` folder Videos (`formats={['Portrait']}`).
- 3D: `zsh scripts/blender/merah/render_all.sh [meja warnet inbox kursi lantai tutup]` → `public/3d/merah/{meja,warnet,inbox,kursi,lantai,tutup}.mp4` (181/160/109/128/430/518 frame), layar diam `public/3d/merah/lcd/`, tekstur `public/3d/merah/tex/`. Folder kerja: `/Users/mac/Magz Motion/motion-starters/reverse/NomorMerah`. README: `scripts/blender/merah/README.md`.
- SFX: `bash scripts/sfx/merah_sfx.sh` → `public/sfx/merah/`.
- Render: `zsh scripts/render_merah.sh lowres|final`. Chunk final (frame inklusif): 0-179, 180-452, 453-720, 721-911, 912-1296, 1297-1725, 1726-2084, 2085-2652.
- Cek statis: `npm run lint` bersih, `npx tsc --noEmit` bersih, audit skill 0 error 0 warning (komponen dan set).
- **Tahap 5 (preview, 11 Nov 2026): disetujui user** ("Oke, render 1080p"). `out/review/NomorMerah-lowres.mp4` (360×640, 88,45 dtk, −14,2 LUFS, puncak −1,8 dBTP; limiter master 0,76 supaya puncak AAC tetap di bawah −1 dBTP). Lembar zona aman: `out/review/NomorMerah-Portrait/safezone-lowres.png`.
  - Critic pass 1 (still 0,5 dtk sekali): (1) frame 0 tertutup desis abu-abu → desis jadi lapisan tipis (thumbnail = ponsel + judul); (2) label "Lubuk Basung" dan label kiri terpotong tepi frame saat kamera bergeser → label pindah sisi, akhir adegan mundur memperlihatkan seluruh jalur; (3) adegan penutup terlalu gelap dan nomor merah kurang kontras → cahaya bulan dinaikkan, LCD digelapkan, merah dicerahkan. Juga: cap HOAKS tertutup kliping lain, label SUGESTI? menutup butir "pingsan", nilai STATUS keluar zona aman saat zoom, adegan kotak masuk terlalu gelap.
  - Critic pass 2 (dari file lowres): (1) getar dan dering adegan 1 terlalu dekat levelnya dengan narator → diturunkan; (2) frame akhir peta terlalu kecil dan terlalu ke atas → zoom 1,2 dengan Banyuwangi tetap di atas zona caption; (3) cap HOAKS terpotong tepi kertas → diperkecil dan digeser.
  - Sinkron caption: awal 25 frasa dicocokkan dengan awal suara di timeline VO, selisih terbesar 0,10 dtk. Whisper pada mix akhir membaca seluruh narasi dengan benar. Hening setelah hitam −91 dB.
- Belum sempurna (jujur): tangan low-poly di adegan 6 terbaca sebagai tangan mengepal yang kaku, bukan tangan yang detail; pembuka adegan 7 (peta dunia utuh) menyisakan bidang meja gelap di atas dan bawah; nama kota di peta kecil di layar ponsel saat peta ditampilkan utuh; "Nigeria"/"Pakistan" pada benang merah bergantung pada timing kata angka whisper (±0,3 dtk).
- **Tahap 6 (final 1080p, 11 Nov 2026): selesai dan disetujui user** ("Ya, commit & push"). `out/NomorMerah-Portrait.mp4`, 1080×1920, h264 yuv420p, 30 fps, 2653 frame, 88,43 dtk, 65,8 MB, AAC 48 kHz, −14,2 LUFS, true peak −1,9 dBTP, faststart (moov sebelum mdat). Dirender dengan `zsh scripts/render_merah.sh final` (8 chunk adegan di `out/chunks/NomorMerah-01…08.mp4`, 2 pekerja, nice 15, ±9 menit total termasuk audio sekali `--codec=wav`).
  - QA dari file final: lembar zona aman 32 frame (batas tiap adegan, beat, penutup) `out/review/final-qa-merah/sheet.png`; `review.mjs`: `out/review/NomorMerah-Portrait/contact.png`, `phone.png`. Hening setelah hitam −91 dB; getar penutup rata-rata −18,5 dB (tanpa nada dering). Caption: mix sama dengan preview (selisih awal frasa ≤ 0,10 dtk).
