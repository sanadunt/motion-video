# ArsipTiang (Videos), ARSIP 06 · "Yang Berdiri di Antara Tiang"

## GOAL
Fan film Siren Head **non-komersial**, ±92 dtk, portrait 1080×1920, 30 fps. Dibawakan sebagai berkas kasus nyata (in-world). Penonton harus merasakan: tiang yang "bertambah satu" itu bukan tiang, dan ia bisa bicara dengan suaramu. Ditutup jumpscare close-up wajah (9 frame), lalu kartu kredit penuh untuk Trevor Henderson.
Dipakai di: TikTok / Reels / Shorts, seri ARSIP (lanjutan ARSIP 05 "Siaran Angka"). Monetisasi **mati**.

Naskah, peta adegan, lapisan audio: `briefs/ArsipTiang.naskah.md`. Rencana induk: `/Users/mac/re-motion-kit/naskah/ARSIP06-RENCANA.md`. Riset lore: `/Users/mac/re-motion-kit/riset/SIREN-HEAD.md`.

## DELIVERY
- Komposisi: `ArsipTiang-Portrait` (hanya portrait yang dirender), storyboard `ArsipTiangStoryboard-Portrait`.
- Final: `out/ArsipTiang-Portrait.mp4`, 1080p (user minta 1080p seperti ARSIP 04/05), h264 yuv420p, AAC, −14 LUFS, puncak < −1 dBTP.
- Semua waktu di brief = detik **global**. Timing VO dari `briefs/ArsipTiang.vo.json` + `src/Videos/tiang-captions.json` / `tiang-words.json`.

## STRUKTUR (detik global, dari VO yang disetujui)
| # | Waktu | Set | VO |
|---|---|---|---|
| 1 | 0,0–11,0 | Jalan desa malam, deretan tiang ke kabut (Blender PSX) + label kaset ARSIP 06 | 01-hook |
| 2 | 11,0–31,4 | Meja arsip: map BERKAS 06, kalkir skala, foto SAMPEL B, formulir, sketsa TIDAK DITAMPILKAN, peta topo (Remotion 2.5D) | 02-ciri |
| 3 | 31,4–49,2 | Puncak bukit: tiang relay + lampu merah, pinus, kabut, embun beku (Blender) → HT di bangku pos jaga (Remotion) | 03a, k1, 03b |
| 4 | 49,2–68,0 | Pendaki dari belakang (Blender, psx-character) → rekaman camcorder POV, tiang di sisi jalan setapak, kuburan bukit, tiang ekstra di antara pinus, kamera jatuh | 04, b1, b2 |
| 5 | 68,0–84,75 | Meja arsip gelap: camcorder di kantong barang bukti, radio ARSIP 05 menyala → hening 1,5 → **jumpscare 9 frame @83,75** → hitam | 05, 06, n7 |
| 6 | 84,75–92,25 | Kartu kredit, ditahan 7,5 dtk | — |

## DECISIONS (koreksi per nomor; lanjutan dari naskah 1–11)
12. **Pendaki dari belakang** muncul di awal bagian 4 sebagai shot orang ketiga (rekonstruksi berkas, bukan footage), lalu cut ke rekaman camcorder di kata "merekam". Wajahnya tidak pernah terlihat. Base mesh CC0 dari skill psx-character, ransel + senter.
13. **Wajah makhluk** = tafsiran sendiri dari kanon tertulis: leher tinggi dari daging busuk dengan pelat dan pita besi berkarat yang menyatu, palang besi seperti lengan tiang, dua corong pengeras suara berkarat menghadap ke depan dan sedikit melebar ke kiri-kanan, ujung belakang corong terbungkus gumpalan daging, kabel terjuntai. Tidak ada mata, mulut, gigi, atau wajah manusia. Tidak ada referensi gambar Henderson, fan art, fan game, atau video Alex Howard yang dibuka.
14. **Tiang ekstra** (bagian 1 dan 4) = badan makhluk yang sama, dilihat sebagai tiang tanpa palang dan tanpa kabel, puncaknya hilang di kabut. Teksturnya daging-karat yang sangat gelap, jadi dari jauh terbaca kayu tua.
15. **HT** adalah properti generik "HT-4" tanpa merek, LCD hijau fosfor #7BD88F, LED hijau. Dibuat di Remotion (CSS), seperti radio ARSIP 05.
16. **Tekstur** dibuat sendiri dengan PIL (`scripts/blender/tiang/make_tex.py`), 64–128 px, di `public/3d/tiang/tex/`. Foto SAMPEL B di meja arsip memakai tekstur yang sama dengan wajah jumpscare.
17. **Firasat 2 frame** = render wajah yang sama, digelapkan, hanya potongan atas (bibir corong), di dalam glitch pita saat kamera berbalik (±65,0 dtk).

## LOOK
- Palet: gaya rumah ARSIP (teal-hitam, kertas, amber) + amber skala radio `#E8A33D`, fosfor `#7BD88F`, kabut pinus abu-hijau `#5d6b63`, lampu jalan natrium `#d9a441`, merah antena `#ff1206`, karat `#8a4a22`, daging `#7d5a52`.
- 3D: Blender EEVEE 270×480 → 15 gambar/dtk, nearest ×4, 48 warna, dither Bayer (pipeline salju ARSIP 05).
- Font: Special Elite (judul, label), Courier Prime (OSD, kredit, caption HT), Homemade Apple huruf kecil (tulisan tangan).
- Grade: `FilmGrade` scene kit untuk set 2.5D; camcorder diberi tracking line, chroma bleed, head-switching.

## SAFE ZONE
Teks, angka, dan wajah di x 60–960, y 380–1540. Caption narator y 1265–1480. Hook/label di y ±400–760 (frame 1 = thumbnail). Fitur wajah jumpscare di dalam zona wajah. Kartu kredit di dalam zona aman.

## KESELAMATAN JUMPSCARE
Kilatan ≤ 3 kali per detik (satu kilatan saja di puncak; lampu antena ±0,6 Hz), true peak < −1 dBTP, loudness total −14 LUFS. Peringatan jumpscare/kilatan ada di caption postingan.

## SUMBER
Lore dan label KANON/KLAIM: tabel SUMBER LORE di `briefs/ArsipTiang.naskah.md`. Kasus, tempat (Bukit Karangsunyi), tanggal (27.06.2022), dan pendaki dikarang sendiri. Tidak ada lembaga nyata, tidak ada sirene tsunami.

## STATE
- Tahap 1–3 (rencana, naskah, VO): **disetujui user** 10 Nov 2026. Detail VO di `briefs/ArsipTiang.naskah.md` bagian STATE.
- Tahap 4 (storyboard, 10 Nov 2026): **disetujui user** ("Oke, lanjut animasi"). `briefs/ArsipTiang.storyboard.md`; komposisi `ArsipTiangStoryboard-Portrait` (`src/Videos/TiangStoryboard.tsx`, scene 1–12); set 2.5D `src/lib/scenes/tiang.tsx` (TiangLabel, TiangDeskScene + tiangDeskGeometry, HTScene + htGeometry, CamcorderOSD, TapeGlitchImg, CreditCard). Still + lembar di `out/review/ArsipTiangStoryboard-Portrait/` (`storyboard-contact.png`, `safezone-sheet.png`, `jumpscare-frames.png`, `scene-N.png`); lembar dibuat `zsh scripts/blender/tiang/sheets.sh`.
- Blender (`scripts/blender/tiang/`, folder kerja `/Users/mac/Magz Motion/motion-starters/reverse/ArsipTiang`): `make_tex.py` (tekstur PIL, jalankan dengan python venv face-tools `-I`), `tiang_lib.py` (geometri bmesh tanpa bpy.ops: 4 dtk per adegan, bukan 4 menit), `tiang_scenes.py` (SHOT=jalan|relay|pendaki|cam, timing dari cues), `face_scene.py` (jumpscare 12 frame, makhluk 960 tris), `psx_still.sh` (still → PSX 48 warna). Uji still: `ONLY=1,250` di depan perintah. Still PSX untuk storyboard: `public/storyboard/tiang/`.
- Beat Blender (detik global, rumus = objek B Remotion): s1End 11,06 · tambah 7,14 · jangan 9,26 · s2End 31,59 · bersiaran 33,67 · sirene 38,44 · kenal 46,52 · s3End 49,13 · rekam 51,61 · kubur 52,64 · hitung 55,9 · c21 60,99 · c22 63,85 · c23 65,01 · turn 65,11 · back 66,56 · again 67,01 · fall 67,36 · s4End 68,0 · jumpscare 83,75 · kredit 84,75–92,25.
- Tahap 5 (animasi + preview, 10 Nov 2026): **disetujui user** ("Oke, render 1080p").
  - Komposisi `ArsipTiang-Portrait` (`src/Videos/ArsipTiang.tsx`, 92,3 dtk = 2769 frame), objek `B` = rumus yang sama dengan `tiang_scenes.py`. Prop: grain, handheld, mumbleGain, captions, durationInSeconds.
  - 3D: `zsh scripts/blender/tiang/render_all.sh [jalan relay pendaki cam face]` → `public/3d/tiang/{jalan,relay,pendaki,cam}.mp4` (334/528/76/493 frame) + `public/3d/tiang/face/f_0001…0012.png` (PSX). Total render ±6 menit.
  - SFX: `bash scripts/sfx/tiang_sfx.sh` → `public/sfx/tiang/` (pine-wind, cable-hum, crickets, archive-room, hill-wind, ht-static, squelch, siren patah-patah, glitch, steps, breath, fall, clip, stinger). Sisanya dipakai ulang dari angka/ripper/wajah.
  - Render: `zsh scripts/render_tiang.sh lowres|final` (mastering: ukur I → gain ke −14 LUFS → alimiter 0,82). Chunk final: 0-331, 332-947, 948-1473, 1474-2039, 2040-2768.
  - Preview: `out/review/ArsipTiang-lowres.mp4` (360×640), potongan `out/review/ArsipTiang-preview.mp4` (79,5–88,5: radio → hening → jumpscare → kredit), lembar `out/review/ArsipTiang-safezone.png`.
  - Critic pass 1: (1) push-in radio memperlihatkan teks map terpotong → spotlight gelap di sekitar radio setelah menyala; (2) frame hening lebih terang dari wajah (luma 67 vs 30) → hening digelapkan, wajah brightness 1,45 (frame pertama 1,7); (3) radio tidak di tengah → fokus ke tengah badan radio.
- **Tahap 6 (final 1080p, 10 Nov 2026): selesai.** `out/ArsipTiang-Portrait.mp4`, 1080×1920, h264 yuv420p, 30 fps, 2769 frame, 92,3 dtk, 42,5 MB, AAC 48 kHz, −14,1 LUFS, true peak −1,2 dBTP, faststart (moov sebelum mdat). Dirender dengan `zsh scripts/render_tiang.sh final` (5 chunk adegan di `out/chunks/ArsipTiang-01…05.mp4`, 2 pekerja, nice 15, ±10 menit total + audio sekali `--codec=wav`).
  - QA dari file final: lembar safe zone 25 frame `out/review/final-qa-tiang/sheet.png`; `review.mjs`: `out/review/ArsipTiang-Portrait/contact.png`, `phone.png` (360 px terbaca). Hening sebelum puncak −91 dB. Luma rata-rata saat jumpscare 26 → 23–29 → hitam 16, jadi satu kilatan isi tanpa lonjakan terang. Caption dicek sinkron di detik 7,6 / 41,5 / 75.
  - Belum sempurna: rekaman camcorder gelap (hanya kolam senter); serpih embun beku dekat kamera kadang tampil sebagai kotak putih; saat wajah jumpscare dikecilkan 8%, tepi gambar kadang terlihat samar sebagai kotak di latar hitam; tab "BUKIT KARANGSUNYI" samar di bawah radio saat hening (tertutup gelap, tidak terbaca).
