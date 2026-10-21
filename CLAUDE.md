# CLAUDE.md

Panduan kerja untuk Claude (Claude Code, sesi cloud, atau chat) di repo ini.
Repo ini adalah project [Remotion](https://www.remotion.dev) untuk aset motion graphic yang bisa dipakai ulang:
motion logo, transisi, lower third / template teks, bumper intro-outro, caption animasi,
serta video pendek (15–60 detik) maupun panjang (beberapa menit).

## Cara membaca dokumen ini

- Semua yang ada di sini adalah **default**. Instruksi user di chat selalu menang. Kalau instruksinya bertentangan
  dengan dokumen ini, ikuti user dan sebut perbedaannya dalam satu kalimat di laporan.
- Bagian **Aturan tetap** adalah satu-satunya yang tidak dilonggarkan tanpa permintaan eksplisit.
- Kalau ada hal yang tidak diatur di sini, putuskan sendiri dengan wajar dan sebutkan keputusannya di laporan.
- Baca juga `README.md` untuk perintah dan alur caption, serta Remotion Agent Skills di `.agents/skills/`
  (symlink di `.claude/skills/`). Ikuti best practice dari skills tersebut.

## Aturan tetap

1. **Animasi frame-driven.** Hanya `useCurrentFrame()` + `interpolate()` / `spring()` / `Easing`.
   Tanpa CSS `transition`/`animation`, tanpa `setTimeout`, tanpa state yang bergantung waktu nyata.
2. **Render tanpa jaringan.** Font, gambar, audio, dan video dibundel di `public/` lalu dimuat dengan `staticFile()`.
   Jangan memakai `@remotion/google-fonts` atau URL eksternal di komponen.
3. **Jangan ubah aset yang sudah ada** (termasuk `HaloDunia` dan `CaptionedVideo`) kecuali diminta.
   Kalau perlu perilaku berbeda, buat komponen baru atau tambah prop opsional yang tidak mengubah default lama.
4. **Ukuran dari `useVideoConfig()`.** Jangan hardcode 1080/1920. Posisi dan ukuran dihitung relatif
   terhadap `width`/`height` supaya satu komponen jalan di semua format.

## Struktur & konvensi

```
src/
├─ Root.tsx              # registrasi semua komposisi
├─ <Kategori>/<Nama>.tsx # satu aset = satu komponen
└─ ...
public/                  # font, logo, video sumber, captions JSON
scripts/                 # transcribe.ts (whisper.cpp), glossary.ts / glossary.json
out/                     # hasil render (di-ignore, commit pakai git add -f)
.github/workflows/       # render-video.yml, transcribe-and-render.yml
```

- Kategori default: `Logo`, `Transitions`, `Templates`, `Bumpers`, `Captions`, `Videos`.
  Boleh menambah kategori baru kalau asetnya tidak cocok ke mana pun.
- Daftarkan di `src/Root.tsx` di dalam `<Folder name="<Kategori>">`.
- **Props:** teks, warna, logo, durasi, dan timing penting diekspos lewat props dengan `defaultProps` yang masuk akal,
  sehingga bisa diedit di Remotion Studio tanpa mengubah kode. Gunakan schema zod kalau sudah dipakai di repo
  atau kalau aset punya banyak props.
- **Durasi fleksibel:** kalau durasi aset bergantung pada props (jumlah teks, panjang video, dll.),
  hitung lewat `calculateMetadata` alih-alih angka tetap.
- **Penamaan:** komponen `PascalCase`, id komposisi `<Nama>-<Format>`.

## Format

| Format | Ukuran | Margin aman minimal |
| --- | --- | --- |
| Portrait | 1080x1920 | 80 px |
| Landscape | 1920x1080 | 100 px |
| Square | 1080x1080 | 80 px |

- Default 30 fps.
- Daftarkan varian dengan id berakhiran `-Portrait`, `-Landscape`, dan `-Square`. Satu komponen dipakai untuk ketiganya.
- Pengecualian yang wajar: aset yang memang khusus satu format (misalnya caption yang dirancang untuk video vertikal)
  boleh hanya didaftarkan di format itu. Sebutkan di laporan.
- Kalau user menyebut ukuran, fps, atau rasio lain, ikuti dan tambahkan sebagai varian baru.

## Gaya default

Dipakai kalau user tidak memberikan brand atau arahan lain.

- Background gradasi `#0F0F1A` → `#1E1B4B`. Aksen `#8B5CF6` (ungu) dan `#FACC15` (kuning). Teks putih.
- Font Montserrat atau Inter, file-nya di `public/fonts/`. Saat ini tersedia `Montserrat-ExtraBold.woff2`.
  Kalau butuh weight atau font lain, ambil dari npm (`@fontsource/*`) atau dari file yang diberikan user,
  lalu salin ke `public/fonts/`.
- Gerakan memakai spring atau easing, bukan linear. Hindari gerakan yang terlalu cepat untuk dibaca.
- Kalau user memberikan brand (warna, font, logo), ikuti brand itu. Kalau brand yang sama dipakai berulang,
  simpan sebagai objek preset agar tidak ditulis ulang di setiap aset.

## Alur kerja

Sesuaikan dengan besar tugasnya. Perubahan kecil (ganti warna, geser timing) tidak perlu semua langkah.

1. **Pahami permintaan.** Kalau kurang jelas, tanyakan maksimal 3 pertanyaan singkat dalam satu kali tanya.
   Jangan tanya hal yang bisa diputuskan sendiri. Kalau user sedang tidak ada di tempat, ambil interpretasi
   paling masuk akal dan tulis asumsinya.
2. **Buat komponen + registrasi**, lalu jalankan `npm run lint` (eslint + tsc) sampai bersih.
3. **Render** ke `out/<nama>.mp4` dengan codec h264, untuk format yang diminta. Kalau tidak disebut, render Portrait saja.
4. **Cek visual.** Ambil minimal 3 still frame di titik penting (awal animasi masuk, puncak, dan akhir) lalu lihat sendiri.
   Pastikan teks terbaca, tidak terpotong, tidak tumpang tindih, dan berada di dalam margin aman.
   Perbaiki dulu sebelum melapor.
5. **Commit & push** ke branch yang sedang aktif. Untuk hasil render, gunakan `git add -f out/<file>`.
6. **Laporan singkat:** apa yang dibuat, props yang bisa diubah, path file, dan hal yang perlu diputuskan user.

## Perintah

```bash
npm install
npm run dev                                   # Remotion Studio
npm run lint                                  # eslint + tsc
npx remotion render <Id> out/<nama>.mp4 --codec=h264
npx remotion still <Id> out/frames/<nama>-f60.png --frame=60
npx remotion render <Id> out/frames --frames=30,90,150 --image-format=png
```

Untuk caption otomatis (whisper.cpp, glosarium), lihat `README.md`.

## Lingkungan render

- **Laptop atau GitHub Actions:** perintah di atas langsung bisa dipakai.
- **Sandbox dengan jaringan terbatas** (misalnya sesi cloud): Remotion mungkin gagal mengunduh Chrome Headless Shell.
  Cari browser yang sudah terpasang (misalnya `find / -name headless_shell -o -name chrome-headless-shell 2>/dev/null`)
  lalu tambahkan `--browser-executable=<path>`. Jangan menyimpan path ini ke `remotion.config.ts`
  karena berbeda di tiap mesin.
- **Kalau gagal karena jaringan**, jangan render ulang berkali-kali. Sebutkan domain yang gagal diakses,
  lalu arahkan ke workflow Actions: `render-video` (input: id komposisi) atau `transcribe-and-render`.

## Git

- Kerja di branch yang sedang aktif kecuali user meminta branch lain. Jangan force-push dan jangan menulis ulang history.
- Pesan commit singkat dan jelas, misalnya `Add LogoReveal (Logo) + portrait render`.
- Batas GitHub 100 MB per file. Untuk video yang besar, render dengan `--crf` lebih tinggi atau sebutkan ke user
  sebelum di-commit.
- Hapus frame review sementara yang tidak perlu disimpan. Commit frame hanya kalau diminta.
