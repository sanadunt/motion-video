---
name: motion-studio
description: Alur kerja lengkap untuk semua pekerjaan motion graphic di repo Remotion "Re-motion". Pakai skill ini setiap kali diminta membuat, merevisi, merender, atau mereview aset video, yaitu motion logo, transisi, lower third, template teks, bumper intro/outro, caption animasi, video pendek atau panjang, adegan 3D three.js, karakter 2.5D, atau klip launch produk. Pakai juga saat user memberi brief, timing dalam detik atau frame, referensi video, atau catatan revisi, meskipun tidak menyebut kata "skill".
---

# Motion Studio

Skill ini mengubah permintaan menjadi aset Remotion yang reusable, terukur, dan sudah dicek sendiri sebelum dilaporkan. Aturan rumah ada di `CLAUDE.md` root repo; skill ini menjelaskan cara mengerjakannya dengan baik.

## Lima prinsip

1. **Frame adalah satu-satunya jam.** Semua gerak berasal dari `useCurrentFrame()` lewat `interpolate`/`spring`. Tidak ada CSS transition/animation, timer, `Math.random`, `Date`, atau `useFrame` milik R3F. Variasi pakai `random(seed)`. Dengan begitu frame mana pun bisa dirender ulang dan hasilnya sama.
2. **Timing dulu, visual mengikuti.** Tulis beat sebagai nomor frame dalam satu objek `T` di atas komponen, dan semua elemen membaca dari situ. Revisi cukup mengubah angka. Untuk mekanisme 3D, satu fungsi model murni menentukan semua pose (lihat `references/three-d.md`).
3. **Satu komponen, tiga format.** Ukuran dari `useLayout()` di `src/lib/studio`, bukan angka 1080/1920. Daftarkan dengan `<FormatVariants>` sehingga muncul `-Portrait`, `-Landscape`, `-Square`.
4. **Lihat sendiri sebelum melapor.** Render still di frame beat, buka gambarnya dengan tool `view`, dan perbaiki. Laporan hanya setelah lolos cek.
5. **Revisi lokal dan terukur.** Setiap perbaikan menyebut lokasi frame, masalah, perubahan, dan apa yang tidak boleh berubah. Jangan merapikan hal lain di luar yang diminta.

## Alur kerja per tugas

### 0. Orientasi (sekali per sesi)
- Baca `CLAUDE.md`, `package.json` (versi Remotion, zod), `src/Root.tsx`, dan isi `public/fonts`.
- Pastikan `src/lib/studio/` ada. Kalau belum, ikuti `INSTALL.md` atau beri tahu user.
- Lihat skill Remotion di `.agents/skills` untuk API yang spesifik versi.

### 1. Pahami dan tulis brief
- Tentukan kategori (Logo, Transitions, Templates, Bumpers, Captions, Videos) dan rute (2D kode, 3D three.js, 2.5D, aset eksternal). Panduan memilih: `references/routes.md`.
- Tulis `briefs/<Nama>.md` dari template `briefs/_TEMPLATE.md`. Format dan contohnya ada di `references/brief.md`.
- Kalau ada yang benar-benar tidak bisa diputuskan, tanya **maksimal 3 pertanyaan singkat**, lalu kerjakan. Sisanya putuskan sendiri dan tandai `DECISION` di brief supaya user bisa mengubahnya.
- Kalau ada video referensi: ekstrak frame, ukur, pisahkan `MEASURED` / `ESTIMATED` / `DECISION`. Ambil tata bahasanya, jangan salin desainnya (`references/review.md` bagian Referensi).

### 2. Bangun
- Mulai dari pola `assets/LowerThird.example.tsx`. Isinya schema zod (`zColor` untuk warna), `durationInSeconds`, objek beat `T`, `useLayout()`, dan helper `EASE`/`SPRING`/`progress`/`springIn`/`envelope`.
- File: `src/<Kategori>/<Nama>.tsx`. Registrasi di `src/Root.tsx` dalam `<Folder name="<Kategori>">` memakai `<FormatVariants>`.
- Prinsip gerak, durasi, waktu baca, dan klise yang dilarang: `references/motion.md`. Detail format dan zona aman: `references/formats.md`.
- Jangan ubah komposisi lain (HaloDunia, CaptionedVideo, dan aset yang ada) kecuali diminta.

### 3. Cek statis
```bash
npm run lint
node .claude/skills/motion-studio/scripts/audit.mjs src/<Kategori>/<Nama>.tsx
```
Semua ERROR wajib diperbaiki. WARN boleh tetap ada asalkan disengaja, dan alasannya disebut di laporan.

### 4. Cek still per format, sebelum render penuh
Pilih 3–5 frame dari beat penting di brief: entrance mendarat, momen utama, sebelum keluar. Lalu:
```bash
node .claude/skills/motion-studio/scripts/review.mjs <Nama>-Portrait --frames 18,60,130
node .claude/skills/motion-studio/scripts/review.mjs <Nama>-Landscape --frames 18,60,130
node .claude/skills/motion-studio/scripts/review.mjs <Nama>-Square --frames 18,60,130
```
Buka setiap PNG dengan `view`. Cek: teks terbaca, tidak terpotong, tidak tumpang tindih, berada di dalam margin aman, warna aksen benar, dan font yang benar sudah termuat (bukan fallback). Ulangi juga dengan **teks terpanjang** yang masuk akal lewat `--props`. Kalau teks membungkus melebihi batas baris di brief, perbaiki layout dulu sebelum menyentuh gerak.

### 5. Render
```bash
npx remotion render <Nama>-Portrait out/<Nama>-Portrait.mp4 --codec=h264
```
Format yang dirender sesuai permintaan, dan portrait saja kalau tidak disebut. Untuk transisi atau batas scene, cek dulu potongan pendek dengan `--frames=<a>-<b>`. Untuk 3D, tambahkan flag `--gl` (lihat `references/three-d.md`).

### 6. Review hasil render
```bash
node .claude/skills/motion-studio/scripts/review.mjs <Nama>-Portrait --video out/<Nama>-Portrait.mp4
```
Lihat `contact.png` dan `phone.png`. Script juga mengecek ukuran, codec h264, yuv420p, dan loudness kalau ada suara. Lalu lakukan **critic pass**: anggap kamu bukan pembuatnya dan pakai checklist di `references/review.md`. Catat setiap masalah dengan nomor frame, perbaiki 3 yang terburuk, render ulang hanya bagian itu, ulangi. Batasnya 3 putaran; masalah yang tersisa dilaporkan.

### 7. Commit dan push
```bash
git add src/<Kategori>/<Nama>.tsx src/Root.tsx briefs/<Nama>.md
git add -f out/<Nama>-*.mp4
git commit -m "feat(<kategori>): <Nama> (portrait[, landscape, square])"
git push
```
Jangan commit `out/review/`. Push ke branch yang sedang aktif.

### 8. Laporan singkat
Pakai urutan ini:
- **Dibuat:** satu atau dua kalimat tentang aset dan geraknya.
- **Props:** nama, tipe, dan default yang bisa diubah di Studio.
- **File:** komponen, brief, dan video.
- **Cek:** frame yang dilihat, hasil audit, dan apa yang diperbaiki di critic pass.
- **Perlu kamu putuskan:** item `DECISION` yang paling berpengaruh, maksimal 3.

## Menerima revisi
- Ubah catatan user menjadi format 4 field sebelum mengedit: **WHERE** (frame global), **PROBLEM**, **CHANGE**, **KEEP**. Kalau user tidak menyebut apa yang harus dipertahankan, anggap semua yang tidak disebut harus tetap sama.
- Urutan perbaikan: yang salah atau hilang → keterbacaan → timing → detail visual.
- Bedakan frame lokal di dalam `<Sequence from={x}>` dengan frame global. Di laporan selalu tulis frame global.
- Setelah edit, render still di frame yang terdampak dan di batas scene sebelum serta sesudahnya.

## Kalau render gagal
- Gagal karena jaringan (unduhan browser, font, aset): **jangan coba ulang berkali-kali.** Sebutkan domain yang diblokir dari pesan error dan arahkan ke workflow GitHub Actions `render-video`.
- Gagal karena kode: baca error, perbaiki, lalu coba still satu frame dulu sebelum render penuh.
- Render 3D sangat lambat atau timeout di Actions: lihat `references/three-d.md` bagian render.

## Referensi (baca saat relevan)
| File | Baca saat |
| --- | --- |
| `references/brief.md` | Menulis brief, mengubah permintaan jadi beat bernomor frame |
| `references/motion.md` | Menentukan gerak, durasi, easing, spring, waktu baca, transisi antar scene |
| `references/formats.md` | Layout responsif, zona aman, registrasi, schema props |
| `references/review.md` | Critic pass, analisis referensi, format revisi |
| `references/three-d.md` | Apa pun yang memakai three.js / `@remotion/three` |
| `references/routes.md` | Memilih rute, karakter 2.5D, sprite, Blender, tool eksternal |
| `references/sound.md` | Ada suara, musik, voice-over, atau cue |
