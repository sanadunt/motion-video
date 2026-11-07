# RipperTape — Naskah VO (siap tempel ke Google AI Studio)

> STATUS 2026-11-07: semua 10 klip sudah digenerate (Gemini 3.8 Flash TTS, akun gratis) dan tersimpan di
> `public/vo/ripper/`. Suara yang dipakai: narator **Neno**, bisikan Inggris **Tavi**, bisikan Indonesia **Bodi**.
> Durasi terukur ada di `briefs/RipperTape.md` bagian VO TERUKUR. Kalau satu klip digenerate ulang, ukur lagi dan kunci ulang beat.

Semua klip dibuat terpisah supaya bisa ditempatkan per beat dan diatur volume/pan di Remotion.
Simpan hasilnya sebagai WAV di `public/vo/ripper/` dengan nama persis seperti di bawah.

Setiap klip punya dua bagian: **Style instructions** (tempel ke kolom gaya) dan **Teks** (tempel ke kolom teks).
Tanda `…` adalah jeda; biarkan apa adanya, jangan dibaca.

---

## NARATOR (satu suara untuk semua klip 01–06)

Suara yang dicari: laki-laki, rendah, tenang, hampir datar, seperti pembaca arsip yang lelah. Bukan suara iklan.
Pilihan voice AI Studio yang cocok untuk dicoba: **Charon** (dalam, serius) atau **Enceladus** (berdesah). Pakai satu voice yang sama untuk 01–06.

**Style instructions (sama untuk 01–06):**
> Suara narator dokumenter arsip. Bahasa Indonesia. Sangat tenang, pelan, hampir monoton, volume rendah seperti bicara di ruangan sunyi tengah malam. Jeda panjang di setiap "…". Tidak dramatis, tidak berteriak, tidak ada emosi yang ditunjukkan. Artikulasi jelas. Nama-nama orang dibaca lambat dan hati-hati.

### 01-hook.wav
Lima perempuan. … Sebelas minggu. … Dan satu surat … yang ditulis dengan tinta merah.

### 02-setup.wav
Tiga puluh satu Agustus, seribu delapan ratus delapan puluh delapan. … Pukul tiga empat puluh pagi. … Buck's Row, London Timur.
… Mary Ann Nichols.
… Delapan hari kemudian … Annie Chapman.
… Lalu, dalam satu malam yang sama … dua sekaligus. … Elizabeth Stride. … Catherine Eddowes.

### 03-grafiti.wav
Di Goulston Street, … di atas sepotong celemek yang basah, … seseorang menulis dengan kapur di dinding.
… Polisi menghapusnya sebelum matahari terbit.
… Tidak ada yang sempat memotretnya.

### 04-surat.wav
Enam belas Oktober. … Sebuah kotak kecil tiba di meja George Lusk.
… Di dalamnya … separuh ginjal manusia … dan sepucuk surat.
… Surat itu tidak punya alamat pengirim. … Hanya dua kata di bagian atas.
… From Hell.

### 05-kelly.wav
**Style instructions khusus klip ini (ganti yang di atas):**
> Sama seperti sebelumnya, tapi lebih pelan lagi, hampir berbisik, seperti takut didengar seseorang di ruangan yang sama. Napas terdengar. Jeda sangat panjang di setiap "…".

Sembilan November. … Miller's Court.
… Mary Jane Kelly.
… Yang terakhir … tidak ditemukan di jalan.
… Dia ditemukan di dalam kamarnya sendiri.
… Pintunya … terkunci.

### 06-penutup.wav
Dia tidak pernah tertangkap. … Tidak pernah diidentifikasi.
… Surat-suratnya berhenti datang.
… Orang-orang bilang dia berhenti.
… Tapi tidak ada yang pernah bilang … dia selesai.

---

## BISIKAN (suara berbeda dari narator)

Suara yang dicari: tanpa jenis kelamin yang jelas, sangat dekat ke mikrofon, berdesah, hampir tidak bersuara. Coba voice **Enceladus**, **Achernar**, atau **Sulafat**. Boleh beda voice antara W1/W2 (Inggris) dan W3/W4 (Indonesia).

**Style instructions untuk W1 dan W2:**
> Whispered, breathy, extremely close to the microphone, barely voiced. Slow. Slightly uneven rhythm, like someone repeating words to themselves. No emotion, no performance. English.

### w1-fromhell.wav
from hell … from hell … from hell … from hell … from hell … from hell

### w2-catchme.wav
catch me … when you can … catch me … when you can … catch me … catch me … when you can

**Style instructions untuk W3 dan W4:**
> Berbisik sangat dekat ke mikrofon, berdesah, nyaris tanpa suara, pelan. Bahasa Indonesia. Terdengar seperti seseorang tepat di belakang telinga pendengar. Tanpa emosi.

### w3-belum.wav
belum selesai.

### w4-masih.wav
… masih di sini.

---

## Catatan untuk saat generate
- Satu klip = satu kali generate. Unduh WAV, jangan MP3, supaya tidak ada artefak kompresi ganda.
- Kalau AI Studio membaca "…" sebagai kata atau memotong jeda, ganti dengan titik tiga biasa `...` lalu tambah koma.
- Kalau ada kalimat yang diucapkan terlalu cepat, generate ulang klip itu saja; jangan ubah teksnya supaya brief tetap cocok.
- Durasi tiap WAV akan saya ukur dengan ffprobe dan dipakai untuk mengunci beat di `briefs/RipperTape.md`.
