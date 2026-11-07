# Suara

Banyak motion graphic terlihat selesai saat suara mati. Begitu suara dinyalakan, cut meleset dari beat atau frame terakhir datang sebelum musik selesai.

## Cue list di brief
Tulis cue di samping kejadian visual, dengan nomor frame yang sama:
```
TOMBOL DITEKAN   frame 195   klik, transien terkuat di sini
HASIL MUNCUL     frame 210   aksen reveal
LOGO MENDARAT    frame 438   musik selesai (resolve)
```

## Aturan
- Suara hanya untuk kejadian fisik atau penting: benturan, klik, reveal, logo mendarat. Tidak ada bed suara yang menutupi semuanya, kecuali musik memang diminta.
- Suara jatuh tepat di frame kejadian, atau 1 frame sesudahnya supaya terasa berasal dari gambar.
- File suara sering punya jeda atau lead-in. Cari puncak transiennya di waveform, lalu geser klip supaya puncak itu jatuh di frame kejadian. Jangan sekadar menyelaraskan awal file.
- Whoosh tidak boleh lebih dari dua kali dalam satu aset.
- Voice-over selalu di atas, musik di bawahnya.
- Musik selesai (resolve) di frame terakhir atau saat logo mendarat, tidak terpotong di tengah frase.
- Target master untuk sosial media: sekitar −14 LUFS integrated, true peak di bawah −1 dBTP. `review.mjs` mengukurnya.

## Di Remotion
- File suara di `public/sfx/` atau `public/music/`, dimuat dengan `staticFile()`.
- Satu `<Sequence from={frameCue}>` per cue berisi komponen audio. Volume bisa berupa fungsi frame untuk fade atau ducking. Nama komponen dan prop trim (misalnya `startFrom` vs `trimBefore`) tergantung versi Remotion, jadi cek skill Remotion di `.agents/skills`.
- Pisahkan efek suara dan musik di track yang berbeda supaya posisi dan volumenya bisa diatur sendiri-sendiri.
- Kalau aset tanpa suara akan dipakai di video lain, biarkan senyap, dan sediakan prop opsional untuk menyalakan sfx-nya.

## Cek
- Dengarkan di headphone dan speaker ponsel: event terkeras, cue terpelan yang penting, dan bagian akhir.
- Untuk caption dari voice-over, pakai `scripts/transcribe.ts` yang sudah ada beserta `glossary.json`. Cut shot sebaiknya jatuh di awal kata yang relevan.
