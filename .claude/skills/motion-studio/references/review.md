# Review

Tujuannya menemukan masalah lewat gambar, bukan dengan menonton ulang video berkali-kali. Mata cepat terbiasa setelah beberapa kali tonton, jadi ukur dan lihat frame.

## Tingkatan cek (murah → mahal)
1. **Statis:** `npm run lint` + `scripts/audit.mjs`.
2. **Still per format** di frame beat (`review.mjs <Id> --frames ...`), tiga varian.
3. **Teks terpanjang** lewat `--props`.
4. **Potongan pendek** di sekitar transisi atau batas scene: `npx remotion render <Id> out/review/<Id>/cut.mp4 --frames=90-149 --codec=h264`.
5. **Render penuh** + `review.mjs <Id> --video ...`: contact sheet (±1 sel per detik), tes ponsel (lebar 360 px), metadata, loudness.

Naik ke tingkat berikutnya hanya setelah tingkat sebelumnya bersih.

## Checklist critic pass
Baca sebagai sutradara yang galak dan bukan pembuatnya. Untuk setiap gambar:
- Apakah teks utama terbaca di lebar 360 px?
- Ada yang terpotong, keluar margin aman, atau tertutup elemen lain?
- Apakah fokus mata jelas, dengan satu hal yang memiliki layar di tiap momen?
- Apakah font yang termuat benar (bukan fallback serif/Arial)?
- Apakah warna aksen dan background sesuai brief atau props?
- Apakah ada elemen yang diam terlalu lama tanpa alasan, atau bergerak tanpa tugas?
- Apakah hold cukup panjang untuk dibaca?
- Apakah ketiga format sama-sama terasa disusun, bukan sekadar diskalakan?
- 3D: ada benda saling tembus? Garis putih silau di permukaan besar? Benda terlalu kecil di frame?
- Suara: apakah cue jatuh tepat di frame kejadian?

Tulis setiap masalah dengan frame global. Perbaiki **3 yang terburuk**, render ulang hanya bagian yang terdampak, lalu ulangi. Maksimal 3 putaran.

## Format revisi (4 field)
```
WHERE    frame global 195–222 (scene Product)
PROBLEM  kursor menutupi label hasil di frame 210
CHANGE   hanya jalur kursor setelah klik: mulai 204, berhenti di titik istirahat
         di dalam kartu dengan jarak 24 px (×u) dari label, paling lambat 210
KEEP     klik di 195, reveal di 210, geometri kartu, copy, cue audio
```
Setelah edit: still di frame 195, 210, 222, 240 dan potongan 180–249. Cek frame di antaranya untuk lompatan atau tumpang tindih.

Saat menerjemahkan catatan user:
- Mulai dari apa yang mereka **suka** dan harus dipertahankan. Kalau tidak disebut, semua yang tidak disinggung termasuk KEEP.
- Ubah kata relatif ("agak cepat", "lebih besar dikit") menjadi angka, lalu laporkan angkanya supaya user bisa mengoreksi.

## Analisis video referensi
```bash
ffprobe -v error -show_entries stream=width,height,avg_frame_rate:format=duration -of json ref.mp4
ffmpeg -i ref.mp4 -vf "fps=2,scale=540:-2" frames/ref-%04d.jpg
ffmpeg -ss 3.2 -i ref.mp4 -frames:v 20 frames/ref-zoom-%03d.png   # frame berurutan di momen penting
```
Simpan `REFERENCE.md` berisi: daftar cut dengan timestamp dan frame, apa yang bergerak duluan, arah, durasi, perubahan skala/opacity, overshoot, urutan kemunculan teks, lama hold, dan keadaan yang dibawa ke shot berikutnya. Beri label `MEASURED` / `ESTIMATED` / `DECISION`, dan untuk nilai yang tidak pasti sebutkan frame mana yang perlu dicek. Ingat frame rate sumber: 0,5 dtk = 15 frame di 30 fps, tapi 30 frame di 60 fps.

Etika: ambil tata bahasa geraknya (durasi, urutan, posisi kamera, cara benda masuk). Jangan salin karakter, desain, naskah, atau logo orang lain. Tutup analisis dengan 3–5 keputusan untuk versi orisinal kita.

## Sebelum melapor
- Audit 0 error.
- Still tiga format sudah dilihat, plus teks terpanjang.
- Video lolos `review.mjs`: ukuran benar, h264, yuv420p, dan loudness ±2 dari −14 LUFS dengan puncak di bawah −1 dBTP kalau ada suara.
- Hal yang belum beres disebut terus terang di laporan.
