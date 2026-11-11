# NomorMerah — Storyboard (10 style frame)

> Style frame diambil langsung dari komposisi `NomorMerah-Portrait` di detik beat (tidak ada komposisi storyboard terpisah).
> Still: `out/review/NomorMerah-Portrait/` (lembar zona aman `safezone-1.png` … `safezone-5.png`).
> Set 2.5D: `src/lib/scenes/merah.tsx`. Blender PSX: `scripts/blender/merah/` (`merah_scenes.py`, `make_assets.py`, `merah_beats.py`, `render_all.sh`).

## Rute
- **3D Blender PSX** (360×640 → nearest ×3, 15 gambar/dtk, 48 warna, dither Bayer): `meja`, `warnet`, `inbox`, `kursi`, `lantai`, `tutup`. Timing dibaca dari `src/Videos/merah-*.json` lewat `merah_beats.py` (rumus = objek `B` di komponen); frame 1 render = detik awal adegan.
- **Layar LCD**: 96×64 piksel, font 5×7 buatan sendiri, dibuat per frame oleh `make_assets.py` lalu dipasang sebagai tekstur emisi. Digit memerah, banjir merah, dan kursor `[YA]` ada di tekstur, jadi selalu sinkron dengan VO.
- **2.5D Remotion**: peta Sumatera–Jawa, kliping, berkas, catatan pengakuan, peta dunia, label bercap, kartu sumber. Pulau dan benua = poligon low-poly dari koordinat kasar yang ditulis tangan.
- **Tanpa wajah**: manusia hanya tangan low-poly (adegan 6). Kursi periksa kosong, kotak foto di berkas kosong.

## Frame
| # | Waktu (global) | VO | Isi | Yang bergerak | Audio |
|---|---|---|---|---|---|
| 1 | 0,0 (thumbnail) – 6,0 | 01-hook | Ponsel candybar di meja kayu, lampu meja hangat; judul piksel merah `NOMOR MERAH` di y 408–578 | Push-in pelan ke layar; ponsel bergetar dan bergeser; digit `0866-XXX-XXXX` memerah satu per satu dari "nomor" sampai "merah" | desis judul, nada dering ciptaan sendiri (pelan), getar di kayu, tik tiap digit, bisikan w1a di jeda |
| 2 | 6,0–15,1 | 02-sebar | Peta kertas Sumatera–Jawa di meja, penggaris, pensil; pita tanggal | Peta digeser masuk; titik menyala berurutan + nama kota diketik; amplop SMS melompat; garis putus merah; kamera dari Riau turun ke selatan lalu mundur memperlihatkan seluruh jalur di "Jawa" | kertas, ketikan, bip pesan tiap titik, s1a + s1b (speaker ponsel) |
| 3 | 15,1–20,4 | 03 "Konon…" | Lorong warnet: CRT berpendar, bilik triplek, kipas angin berputar, kabut | Dolly maju lalu menoleh ke satu monitor forum; label `KONON` ditempel | dengung CRT + kipas, ketikan jarang, cap, s1c |
| 4 | 20,4–24,0 | 03 "Katanya…" | Ponsel di meja bilik, cahaya CRT biru | Kotak masuk terisi 5 `Fwd: Fwd: Fwd:` beruntun lalu pesan terbuka baris demi baris; label `KATANYA:` | bip beruntun, cap, s1d ("kirim ke teman dan saudara semua") |
| 5 | 24,0–30,4 | 04-resmi | Tiga kliping di meja | Kliping jatuh satu per satu; cap `HOAKS` di "kabar bohong"; garis bawah merah di "terbukti"; kamera turun ke kliping ketiga | kertas, cap + thud, pensil |
| 6 | 30,4–34,7 | 05 (awal) | Ruang periksa: kursi kosong dari belakang, meja, map, lampu gantung | Push-in pelan; lampu sedikit bergetar | dengung neon, drone tipis |
| 7 | 34,7–43,2 | 05 | Berkas `PENGIRIM AWAL` | `DIAMANKAN POLISI RIAU` diketik di "diamankan"; cap `ISENG` di "iseng"; balok hitam menutup nama di "Namanya"; tulisan tangan `tidak pernah diumumkan` | ketikan, cap, geser, pensil |
| 8 | 43,2–57,5 | 06-sakit | Ponsel di lantai ubin, tangan kaku di kanan bawah; catatan `MENGAKU:` + kliping Jakarta di atas | Butir gejala diketik di "mengaku jatuh sakit"; kliping masuk di "Di Jakarta"; layar dibanjiri merah di "memerah" + cahaya merah berdenyut 0,45 Hz; jari menegang di "kejang"; label `SUGESTI?` di "sugesti" | ruang sunyi, getar sekali, denyut rendah, drone naik, cap |
| 9 | 57,5–69,5 | 07-dunia | Peta dunia + catatan daftar gelombang | Pin + pita tahun menancap di "Nigeria", (India), "Pakistan", dan "merah" (Indonesia); benang merah putus-putus menyambung; foto layar `RED` masuk di "nomornya sudah" | pin, kertas, bip |
| 10 | 69,5–88,4 | 08-tutup | Meja yang sama, gelap, garis kisi jendela; layar `1 TAK TERJAWAB` + nomor merah → `ANGKAT? [YA] [TIDAK]` → hitam → kartu sumber | Push-in sangat pelan; sorot mobil menyapu di "di benua lain?"; di 84,5 ponsel bergetar dan layar berganti; hitam di 86,7 | drone naik, bisikan w1b, getar (tanpa nada dering), klik layar mati, hening |

## Safe zone
- Teks properti (pita tanggal, nama kota, label bercap, kliping, berkas, pita tahun, catatan) di x 60–960, y 380–1220; caption di y 1265–1480.
- LCD close-up: adegan 1 akhir y ±495–975; adegan 4 y ±600–1020; adegan 9 y ±560–1010. Semua di dalam x 60–960.
- Kartu sumber di y ±820–1010.
