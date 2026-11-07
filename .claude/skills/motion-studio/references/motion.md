# Gerak

## Setiap gerak punya tugas
- **Entrance:** memperkenalkan objek utama.
- **Hold:** memberi waktu membaca dan memahami.
- **Aksi (kursor, highlight, garis):** menunjuk hal berikutnya.
- **Transisi:** membawa mata ke keadaan berikutnya.

Kalau sebuah gerak tidak punya tugas, hapus. Selama hold, gerak pendukung harus cukup tenang supaya teks tetap jadi fokus.

## Durasi patokan pada 30 fps
| Jenis | Frame | Detik |
| --- | --- | --- |
| Micro (tombol ditekan, tick) | 4–8 | 0,13–0,27 |
| Entrance teks/kartu | 12–24 | 0,4–0,8 |
| Pindah posisi besar / push | 20–40 | 0,7–1,3 |
| Exit | 9–15 | 0,3–0,5 (lebih cepat dari entrance) |
| Stagger antar elemen | 3–6 | 0,1–0,2 |
| Mata/antisipasi sebelum aksi | 6–10 | 0,2–0,33 |
| Push kamera halus | skala 1,00→1,03 selama ±90 | 3 |

Benda jatuh mengikuti gravitasi: jatuh 30 cm makan ±7–8 frame. Kalau lebih lambat, terasa melayang.

## Kurva
- `EASE.out` untuk masuk: cepat di awal, mendarat lembut. Ini default.
- `EASE.in` untuk keluar.
- `EASE.inOut` untuk pindah posisi dan gerak kamera.
- `EASE.outBack` atau spring `bouncy` untuk overshoot kecil pada elemen yang ringan dan ceria.
- Spring: `smooth` (tanpa pantul), `snappy` (default UI), `bouncy` (playful), `heavy` (benda besar). Saat menyetel, destinasi tetap dan ubah satu parameter per percobaan.
- Linear hanya untuk gerak yang memang konstan, misalnya rotasi terus-menerus atau scroll ticker.

## Waktu baca
- Patokan: 0,5 dtk + 0,3 dtk per kata, minimal 1,5 dtk (`readingFrames`). Hitung mulai saat teks **sudah terbaca**, bukan saat mulai masuk.
- Hold 8 frame cuma 0,27 dtk, tidak terbaca.
- Cek dengan membaca keras di kecepatan normal. Kalau hold habis sebelum selesai membaca, perpanjang.

## Prinsip yang membuatnya terasa hidup
- **Urutan:** objek utama dulu, pendukung menyusul 0,1–0,2 dtk.
- **Antisipasi:** sedikit gerak berlawanan sebelum gerak besar (misalnya turun 4 px sebelum melompat naik).
- **Follow-through dan settle:** elemen berhenti dengan sisa gerak kecil, tidak berhenti mati.
- **Squash & stretch** untuk benturan, lompatan, splash. Volume tetap terjaga.
- **Karakter tidak pernah benar-benar diam:** napas dan kedip tetap jalan saat hold.
- **Sesuatu yang baru tiap 2–3 dtk** di video atau bumper yang lebih panjang.

## Klise yang dilarang
- Judul di tengah gradien dengan semua elemen fade-in bersamaan.
- Whoosh di setiap cut.
- Kamera melayang acak atau orbit terus-menerus tanpa alasan.
- Label pojok, timecode, bingkai frame tanpa fungsi.
- Bounce di setiap elemen.
- Motion blur yang membuat teks tercoreng saat hold.

## Batas scene dan transisi
- Setiap scene punya keadaan masuk dan keluar. Posisi, skala, dan highlight terakhir scene A menjadi keadaan awal scene B.
- `@remotion/transitions` (`TransitionSeries`) membuat scene tumpang tindih selama transisi, jadi durasi total berkurang. Hitung ini di brief.
- Setelah mengedit satu scene, cek kedua batasnya sebelum menonton keseluruhan.
- Font, palet, spacing, dan elemen berulang ada di pengaturan bersama (`src/lib/studio`). Pengecualian per scene dicatat di brief.

## Motion blur
Pakai hanya untuk entrance cepat, dan pastikan sudah hilang saat elemen settle. Cek still tepat setelah settle: teks harus tajam dan tidak meninggalkan jejak.
