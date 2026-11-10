# SiaranAngka (Videos), ARSIP 05

## GOAL
Short horor ±70 detik dengan nada **skeptis yang menggantung**. Topiknya Siren Head, tapi makhluk itu sendiri tidak pernah ditampilkan.
Alur: legenda sekolah (Siren Head) → jawaban skeptis (itu karangan seniman, 2018) → temuan yang mengganggu jawaban itu (inspirasinya, siaran angka, nyata dan dipakai mata-mata) → siaran yang masih berdengung sampai sekarang → **pertanyaan yang tidak dijawab**.
Dipakai di: TikTok / Reels / Shorts, seri "ARSIP" (lanjutan RipperTape dan ARSIP 04 WajahDiLukisan).
Riset lengkap: `/Users/mac/re-motion-kit/riset/SIREN-HEAD.md`.

## DECISIONS (tahap 1, tebakan terbaik; koreksi per nomor, mis. "3B")
1. Platform: portrait 1080×1920. Render final **1080p** seperti ARSIP 04. Kalau tidak perlu, 720p.
2. Durasi: **±73 dtk** (estimasi narator 68 dtk + jeda antar klip, bisikan, dan hening akhir). Jeda bisa dipangkas sampai ±65 dtk.
3. Pesan utama: "Monsternya karangan. Siarannya tidak." Ditutup pertanyaan: "angka-angka itu … untuk siapa?"
4. Mood: ruangan gelap jam 2 pagi, desis radio, cahaya amber dari skala radio. Horor datang dari suara, bukan dari makhluk.
5. Set (5 adegan):
   - (1) kelas kosong malam hari, dengan kertas lipat "pernah dengar?" dan angka di papan tulis;
   - (2) meja arsip internet: unggahan 2018 dengan **gambar ditutup cap "TIDAK DITAMPILKAN"**;
   - (3) kamar apartemen 2001, berisi radio gelombang pendek, laptop tua, dan tokoh PSX dilihat dari belakang;
   - (4) padang salju Rusia malam hari, tiang antena dengan lampu merah yang berkedip seirama dengungan (full 3D Blender PSX);
   - (5) kembali ke radio di kelas, saat radio menyala sendiri.
   Set baru: `ClassroomScene`, `ArchiveDeskScene`, `RadioRoomScene`, plus adegan Blender `antena`.
6. Palet: gaya rumah ARSIP (teal-hitam, kertas, amber), ditambah **amber skala radio `#E8A33D`**, **hijau fosfor `#7BD88F`** untuk layar spektrum, dan **biru salju `#9FB4C7`**.
7. Font: sama dengan ARSIP 04 (Special Elite, IM Fell English, Homemade Apple, Courier Prime). Angka di kertas memakai tulisan tangan Homemade Apple.
8. VO: narator **Neno**, bisikan **Bodi** (sama dengan ARSIP 04), dan **satu suara perempuan datar** untuk pembaca angka (diolah jadi suara radio: bandpass + desis).
9. Musik: drone rendah dan desis gelombang pendek. Dengungan "buzzer" disintesis sendiri dengan sox, bukan rekaman asli UVB-76. Hening total 1,5 dtk sebelum "untuk siapa?".
10. Caption: ya, sinkron per kata lewat whisper, di zona caption y 1265–1480.
11. CTA: tidak ada. Label kaset "ARSIP 05" di frame pembuka.
12. Tokoh: Ana Montes orang nyata yang masih hidup, jadi tampil sebagai **tokoh PSX dilihat dari belakang, tanpa wajah mirip**. Tanpa foto.

DECISION: **Siren Head tidak digambar, dimodelkan, atau disiluetkan sama sekali** (hak cipta Trevor Henderson; hak film dipegang Warner Bros.). Namanya hanya disebut di VO dan caption, dalam konteks dokumenter. Gambar asli 2018 diganti properti "unggahan" yang gambarnya ditutup cap, dan caption aslinya tidak dikutip.
DECISION: Tidak ada tiang yang bergerak atau berubah jadi makhluk, dan tidak ada corong/megafon di kepala apa pun. Tiang antena di adegan 4 tetap benda mati.
DECISION: Angka yang dibisikkan adalah **"empat … enam … dua … lima"** (4625 kHz, frekuensi UVB-76). Ini easter egg yang faktual dan sengaja tidak memakai angka dari caption Henderson.
DECISION: Kabar film Warner Bros. **tidak disebut** di video, supaya fokus ke misterinya. Bisa masuk ke caption postingan.
DECISION: Tidak ada logo FBI, Kuba, atau Rusia. Berkas memakai label generik ("BERKAS · 2001").
DECISION: Tidak ada sirene tsunami atau audio BMKG (risiko memicu panik sungguhan).

## SUMBER (setiap fakta di naskah)
| Kalimat di naskah | Status | Sumber |
|---|---|---|
| Anak-anak saling berbisik soal Siren Head di sekolah | KANON (Henderson: jadi "schoolyard boogeyman", cerita lisan anak SD) | [Reactor 2026](https://reactormag.com/artist-trevor-henderson-siren-head-interview) |
| Raksasa yang meneriakkan angka | KANON (caption asli 2018: megafon meneriakkan angka dan kata) | [Reactor](https://reactormag.com/artist-trevor-henderson-siren-head-interview), [Monstrum](https://www.thirteen.org/programs/monstrum/is-siren-head-the-ultimate-modern-monster-esjb8f) |
| "dari hutan" | KANON⚠ (Monstrum: berkeliaran di hutan Pacific Northwest; caption asli justru di pemakaman) | [Monstrum](https://www.thirteen.org/programs/monstrum/is-siren-head-the-ultimate-modern-monster-esjb8f) |
| Karangan, digambar seniman Kanada tahun 2018 | FAKTA (Trevor Henderson, Toronto, Agustus 2018) | [Heat Death](https://heat-death.ghost.io/the-internet-is-the-real-monster), [Wikipedia](https://en.wikipedia.org/wiki/Trevor_Henderson) |
| Inspirasinya siaran radio yang hanya membacakan angka | KANON (Henderson: terobsesi stasiun angka) | [Heat Death](https://heat-death.ghost.io/the-internet-is-the-real-monster), [Monstrum](https://www.thirteen.org/programs/monstrum/is-siren-head-the-ultimate-modern-monster-esjb8f), [Reactor](https://reactormag.com/artist-trevor-henderson-siren-head-interview) |
| 2001, FBI menemukan radio gelombang pendek di kamar seorang analis intelijen Amerika | FAKTA (penggeledahan diam-diam 25 Mei 2001: Sony ICF-2010 di kamar tidur Ana Montes, analis senior DIA; ditangkap 21 Sep 2001) | [FBI](https://www.fbi.gov/history/famous-cases/ana-montes-cuba-spy), [Wikipedia](https://en.wikipedia.org/wiki/Ana_Montes) |
| Tiga malam seminggu ia mencatat angka dari Kuba | FAKTA (Selasa, Kamis, Sabtu pukul 21.00/22.00; suara perempuan "¡Atención!", angka didekripsi di laptop) | [Wikipedia](https://en.wikipedia.org/wiki/Ana_Montes) (mengutip Popkin, *Code Name Blue Wren*, 2023), [Radio World](https://www.radioworld.com/news-and-business/spy-numbers-stations-still-baffle-enthrall) |
| Ia tertangkap | FAKTA (mengaku bersalah 2002, hukuman 25 tahun; bebas 6 Jan 2023, tidak disebut di VO) | [FBI](https://www.fbi.gov/history/famous-cases/ana-montes-cuba-spy) |
| Di Rusia satu frekuensi masih berdengung | FAKTA (UVB-76 "The Buzzer", 4625 kHz, ±25 dengung per menit, 24 jam sehari; masih aktif, callsign NZhTI sejak Des 2020) | [Wikipedia UVB-76](https://en.wikipedia.org/wiki/UVB-76), [Priyom](https://priyom.org/military-stations/russia/the-buzzer) |
| Empat puluh tahun lebih | FAKTA (rekaman tertua yang tersimpan dari 1982; sebagian sumber menyebut 1976) | [Wikipedia UVB-76](https://en.wikipedia.org/wiki/UVB-76) |
| Tak ada yang menjelaskan untuk apa | FAKTA (tujuan stasiun tidak pernah dikonfirmasi pemerintah) | [Wikipedia UVB-76](https://en.wikipedia.org/wiki/UVB-76), [BBC Future](https://www.bbc.com/future/article/20170801-the-ghostly-radio-station-that-no-one-claims-to-run) |
| "Monsternya karangan. Siarannya tidak." / "untuk siapa?" | Penutup; pertanyaan sengaja tidak dijawab, bukan klaim | — |

## HAK CIPTA DAN SENSITIVITAS
- Siren Head © Trevor Henderson. Kita hanya menyebut nama dan fakta penciptaannya (komentar/dokumenter). Tidak ada gambar, model, siluet, fan art, cuplikan game, atau video TikTok Alex Howard.
- Ana Montes: fakta pengadilan disampaikan netral, tanpa wajah, tanpa ejekan. Sensitivitas sedang.
- Tidak ada anak nyata. Kelas kosong; "anak-anak" hanya hadir lewat properti (kertas lipat, tas, bangku).

## STATE (untuk melanjutkan di sesi baru)
- Topik: Siren Head → stasiun angka (sudut A1 dari riset), short ±70 dtk portrait, ARSIP 05.
- Tahap: **1–2 disetujui user (10 Nov 2026: "Oke, lanjut VO"). Tahap 3 (VO) disetujui user ("VO oke, lanjut"). Tahap 4 (storyboard) disetujui user ("Oke, lanjut animasi"). Tahap 5 (preview) disetujui user ("Oke, render 1080p"). Tahap 6 (render final 1080p) selesai.**
- VO (10 Nov 2026, digenerate Claude di AI Studio): 9 klip di `public/vo/angka/` (24 kHz asli), hasil normalisasi 48 kHz di `public/vo/angka/mix/` (narator −16,6 s/d −17,4 LUFS; r1/r2 diolah jadi suara radio −19; bisikan −23/−27). Voice: Neno (narator), Kore (pembaca angka), Bodi (bisikan).
- Durasi narator 71,6 dtk (01 11,88 · 02 16,20 · 03 17,00 · 04 14,80 · 05 11,72). Timeline: 01 @1,0 · 02 @13,5 · 03 @30,3 · 04 @47,9 · 05 @64,8 (jeda 0,6 + hening 1,5 sebelum 05) · w1 "untukmu" @77,8 → total **±80 dtk** (lebih panjang dari estimasi 73). Jeda internal sudah wajar; memangkas jeda >1 dtk hanya menghemat ±2 dtk.
- Cues: `briefs/SiaranAngka.vo.json` → `node scripts/vo-align.mjs briefs/SiaranAngka.vo.json` → `src/Videos/angka-captions.json` + `angka-words.json` (21 frasa, 75/83 kata berjangkar). Whisper per klip di `public/vo/angka/whisper/`.
- File dengar: `out/review/SiaranAngka/vo-dengar.mp3` (seluruh timeline) dan `r2-angka-radio.mp3`.
- Naskah: `briefs/SiaranAngka.naskah.md`. Lembar VO siap tempel: `/Users/mac/re-motion-kit/naskah/SiaranAngka-VO.md`.
- VO akan disimpan di `public/vo/angka/`.
- Storyboard (10 Nov 2026): `briefs/SiaranAngka.storyboard.md`; komposisi `AngkaStoryboard-Portrait` (scene 1–6), set `src/lib/scenes/angka.tsx` (ClassroomScene, ArchiveDeskScene, RadioRoomScene, SnowOverlay, ShortwaveRadio, ArsipLabel). Still + overlay safe zone di `out/review/AngkaStoryboard-Portrait/`.
- Blender (`scripts/blender/angka/`, folder kerja `/Users/mac/Magz Motion/motion-starters/reverse/SiaranAngka`): `montes_char.py` (perempuan PSX dari belakang, pose menulis UP=45 FORE=70, 320×320 transparan) dan `salju_scene.py` (padang salju + antena, timing dari angka-captions.json, adegan 4 = 452 frame dari 47,62 dtk). Still storyboard: `public/storyboard/angka/montes_back.png`, `salju.png`.
- Palet terkunci: gaya rumah ARSIP + amber #E8A33D, fosfor #7BD88F, salju #9FB4C7, papan #1D2A26. Font: Special Elite, Homemade Apple (huruf kecil), Courier Prime.
- Animasi (10 Nov 2026): `src/Videos/SiaranAngka.tsx`, komposisi `SiaranAngka-Portrait` (81 dtk, 2430 frame), semua beat dari cues (objek `B`: s1End 13,24 · s2Cut 26,59 · s2End 30,06 · s3End 47,62 · stop 62,39 · s5Start 64,4 · peak 77,31 · w1 78,01 · tapeStop 79,91). Set tambahan: `RadioCloseScene`, `ghost` di ClassroomScene.
- Blender animasi: `public/3d/angka/salju.mp4` (452 frame, frame 1 = s3End; di-encode langsung dengan ffmpeg karena `psx_post.sh` keluar diam-diam akibat `set -o pipefail` + `ls | head` pada folder 452 file) dan `public/3d/angka/montes/f_0001…0527.png` (on twos, 264 file).
- SFX baru (sox): `scripts/sfx/angka_sfx.sh` → `public/sfx/angka/` (buzz-cycle 2,4 dtk = 72 frame seirama lampu antena, sw-static, tune, crt, key, radio-on, chalk, pencil, snow-wind).
- Preview: `out/review/SiaranAngka-lowres.mp4` (360×640, 81,1 dtk, h264 yuv420p, AAC, −14,1 LUFS, puncak −1,4 dBFS; hening setelah dengungan −78 dB, hening sebelum puncak −78 dB), potongan `out/review/SiaranAngka-preview.mp4` (44–55 dtk: kamar 2001 → putih → salju), lembar safe zone `out/review/SiaranAngka-safezone.png`. Render 1/3 skala: `--scale=0.3333333333333333` (0,3333 membuat tinggi tidak bulat). Waktu render ±4 menit, 2 pekerja.
- **Final (10 Nov 2026):** `out/SiaranAngka-Portrait.mp4`, 1080×1920, h264 yuv420p, 30 fps, 2430 frame, 81,0 dtk, 34,6 MB, AAC 48 kHz, −14,1 LUFS, puncak −1,2 dBTP, faststart (moov di depan). Dirender dalam 5 chunk per adegan (`out/chunks/SiaranAngka-01…05.mp4`: 0-396, 397-901, 902-1428, 1429-1931, 1932-2429; 2 pekerja, nice 15) + audio sekali (`--codec=wav`), loudnorm 2 pass. Benchmark 1080p: 10 dtk / 30 frame. QA 19 frame dari file final dengan overlay safe zone: `out/review/final-qa/sheet.png`; `review.mjs`: `out/review/SiaranAngka-Portrait/contact.png`, `phone.png`. Hening setelah dengungan dan sebelum puncak: −78 dB. Caption dicek sinkron di detik 7, 39, 74.
- Belum sempurna: saat kamera di papan (±2 dtk, adegan 1) tepi kertas lipat terlihat di tepi bawah zona UI (teks terpotong, tidak terbaca); bulan salju masih bola piksel.
