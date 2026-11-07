# CLAUDE.md

Panduan kerja untuk Claude (Claude Code, sesi cloud, atau chat) di repo ini.
Repo ini adalah project [Remotion](https://www.remotion.dev) untuk aset motion graphic yang bisa dipakai ulang:
motion logo, transisi, lower third / template teks, bumper intro-outro, caption animasi,
serta video pendek (15–60 detik) maupun panjang (beberapa menit).

Untuk setiap tugas aset, render, review, atau revisi, **pakai skill `motion-studio`**
(`.claude/skills/motion-studio/SKILL.md`). Skill itu menjelaskan cara kerja 8 langkah, brief, critic pass, dan
referensi gerak. Dokumen ini berisi aturan rumah yang skill tersebut ikuti.

## Cara membaca dokumen ini

- Semua yang ada di sini adalah **default**. Instruksi user di chat selalu menang. Kalau instruksinya bertentangan
  dengan dokumen ini, ikuti user dan sebut perbedaannya dalam satu kalimat di laporan.
- Bagian **Aturan tetap** adalah satu-satunya yang tidak dilonggarkan tanpa permintaan eksplisit.
- Kalau ada hal yang tidak diatur di sini, putuskan sendiri dengan wajar dan sebutkan keputusannya di laporan
  dan sebagai `DECISION` di brief aset.
- Baca juga `README.md` untuk perintah dan alur caption, serta Remotion Agent Skills di `.agents/skills/`
  (symlink di `.claude/skills/`). Ikuti best practice dari skills tersebut.
- `docs/RISET-TREN-MOTION-2026.md` berisi riset gaya yang sedang dipakai di media sosial; rujuk saat memilih gaya.

## Aturan tetap

1. **Animasi frame-driven.** Hanya `useCurrentFrame()` + `interpolate()` / `spring()` / `Easing`.
   Tanpa CSS `transition`/`animation`, tanpa `setTimeout`, tanpa `Math.random`/`Date`, tanpa `useFrame` R3F.
   Variasi pakai `random(seed)` dari remotion.
2. **Render tanpa jaringan.** Font, gambar, audio, dan video dibundel di `public/` lalu dimuat dengan `staticFile()`.
   Jangan memakai `@remotion/google-fonts` atau URL eksternal di komponen.
3. **Jangan ubah aset yang sudah ada** (termasuk `HaloDunia` dan `CaptionedVideo`) kecuali diminta.
   Kalau perlu perilaku berbeda, buat komponen baru atau tambah prop opsional yang tidak mengubah default lama.
4. **Ukuran dari `useLayout()`/`useVideoConfig()`.** Jangan hardcode 1080/1920. Posisi dan ukuran dihitung relatif
   terhadap `width`/`height` supaya satu komponen jalan di semua format.
5. **Jangan menyalin** karakter, desain, naskah, atau logo dari referensi orang lain. Ambil tata bahasa geraknya saja
   (durasi, urutan, arah, cara masuk).

## Struktur & konvensi

```
src/
├─ Root.tsx                    # registrasi semua komposisi
├─ <Kategori>/<Nama>.tsx       # satu aset = satu komponen
└─ lib/studio/                 # helper bersama (theme, useLayout, EASE/SPRING, font, FormatVariants)
briefs/                        # satu brief per aset, dari briefs/_TEMPLATE.md
public/                        # font, logo, video sumber, captions JSON, VO (public/vo/)
scripts/                       # transcribe.ts (whisper.cpp), glossary.ts / glossary.json
out/                           # hasil render (di-ignore, commit pakai git add -f)
out/review/                    # still & contact sheet sementara (di-ignore, jangan di-commit)
docs/                          # riset tren, catatan pemasangan kit
.claude/skills/motion-studio/  # skill utama + scripts/audit.mjs, scripts/review.mjs
.github/workflows/             # render-video.yml, transcribe-and-render.yml
```

- Kategori default: `Logo`, `Transitions`, `Templates`, `Bumpers`, `Captions`, `Videos`.
  Boleh menambah kategori baru kalau asetnya tidak cocok ke mana pun.
- Daftarkan di `src/Root.tsx` di dalam `<Folder name="<Kategori>">`, memakai `<FormatVariants>` dari `src/lib/studio`.
- **Props:** teks, warna, logo, durasi (`durationInSeconds`), dan timing penting diekspos lewat props dengan
  schema zod (`zColor()` untuk warna) dan `defaultProps` yang masuk akal, sehingga bisa diedit di Remotion Studio.
- **Durasi fleksibel:** `FormatVariants` mengubah `durationInSeconds` jadi `durationInFrames` lewat `calculateMetadata`.
  Timing internal (misalnya exit = durasi − 0,5 dtk) dihitung relatif `durationInFrames`, bukan angka tetap.
- **Penamaan:** komponen `PascalCase`, id komposisi `<Nama>-<Format>`.
- **Brief dulu:** setiap aset punya `briefs/<Nama>.md` (GOAL, PROPS, LAYOUT, BEATS bernomor frame, DECISIONS).
  Semua angka di komponen harus bisa ditelusuri ke brief; revisi memperbarui brief dulu.

## Helper `src/lib/studio`

- `useLayout()` → `{u, safe, contentWidth, contentHeight, px(n), pick({portrait, landscape, square}), orientation}`.
  `u = sisi pendek / 1080`; semua ukuran desain ditulis dalam "px 1080" lalu `L.px(n)`. `safe` sudah 80/100 px × u.
- `motion.ts`: `sec(detik, fps)`, `EASE.{out,in,inOut,outBack}`, `SPRING.{smooth,snappy,bouncy,heavy}`,
  `progress()`, `springIn()`, `envelope()`, `mix()`, `readingFrames(teks, fps)`.
- `theme.ts`: token default yang hanya jadi `defaultProps`; brand lain = objek tema baru.
- `fonts.ts`: `ensureFonts()` memuat woff2 dari `public/fonts/`; panggil sekali di level modul komponen.
- Pola komponen: lihat `src/Templates/LowerThird.tsx` (dari `.claude/skills/motion-studio/assets/LowerThird.example.tsx`).
  Beat ditulis sebagai satu objek `T` berisi nomor frame di atas komponen, dan semua elemen membaca dari situ.
- Frame di dalam `<Sequence from={x}>` adalah frame lokal. Brief, revisi, dan laporan selalu memakai frame **global**.

## Format

| Format | Ukuran | Margin aman minimal |
| --- | --- | --- |
| Portrait | 1080x1920 | 80 px |
| Landscape | 1920x1080 | 100 px |
| Square | 1080x1080 | 80 px |

- Default 30 fps.
- Daftarkan varian dengan id berakhiran `-Portrait`, `-Landscape`, dan `-Square`. Satu komponen dipakai untuk ketiganya.
- Pengecualian yang wajar: aset yang memang khusus satu format (misalnya caption yang dirancang untuk video vertikal)
  boleh hanya didaftarkan di format itu (`formats={['Portrait']}`). Sebutkan di laporan.
- Kalau user menyebut ukuran, fps, atau rasio lain, ikuti dan tambahkan sebagai varian baru.
- Portrait: zona bawah ±20% dan sisi kanan ±12% sering tertutup UI platform. Jangan taruh teks penting di sana.

## Gaya default

Dipakai kalau user tidak memberikan brand atau arahan lain.

- Background gradasi `#0F0F1A` → `#1E1B4B`. Aksen `#8B5CF6` (ungu) dan `#FACC15` (kuning). Teks putih.
- Font Montserrat (judul) dan Inter (badan), file-nya di `public/fonts/`: `Montserrat-Bold`, `Montserrat-ExtraBold`,
  `Inter-Regular`, `Inter-SemiBold` (semua dari `@fontsource/*`, lisensi OFL). Ada juga `CinzelDecorative-Black`,
  `LilitaOne-Regular`, `LuckiestGuy-Regular` untuk aset tertentu. Kalau butuh weight atau font lain, ambil dari
  `@fontsource/*` atau file dari user, salin ke `public/fonts/`, dan tambahkan ke daftar `FONTS` di `fonts.ts`.
- Gerakan memakai spring atau easing, bukan linear. Hindari gerakan yang terlalu cepat untuk dibaca
  (patokan `readingFrames`: 0,5 dtk + 0,3 dtk per kata, minimal 1,5 dtk).
- Kalau user memberikan brand (warna, font, logo), ikuti brand itu. Kalau brand yang sama dipakai berulang,
  simpan sebagai objek preset agar tidak ditulis ulang di setiap aset.

## Video bernarasi (VO)

- Urutan: brief → naskah per scene → **VO dulu** → beat mengikuti suara → animasi. Jangan animasi dulu baru VO.
- Claude menulis naskah dengan baris VO siap tempel (termasuk petunjuk gaya, jeda, penekanan). User membuat VO
  sendiri di Google AI Studio TTS, lalu menaruh WAV di `public/vo/<nn>-<scene>.wav`. Tidak ada automasi TTS.
- Ukur durasi tiap WAV (`ffprobe`) dan pakai sebagai dasar `T`/`calculateMetadata`, jangan menebak.

## Alur kerja

Sesuaikan dengan besar tugasnya. Perubahan kecil (ganti warna, geser timing) tidak perlu semua langkah.

1. **Pahami permintaan.** Kalau kurang jelas, tanyakan maksimal 3 pertanyaan singkat dalam satu kali tanya.
   Jangan tanya hal yang bisa diputuskan sendiri. Kalau user sedang tidak ada di tempat, ambil interpretasi
   paling masuk akal dan tulis asumsinya sebagai `DECISION` di brief.
2. **Tulis brief**, lalu **buat komponen + registrasi**. Jalankan `npm run lint` dan
   `node .claude/skills/motion-studio/scripts/audit.mjs src/<Kategori>/<Nama>.tsx` sampai 0 error.
3. **Cek still per format sebelum render penuh** dengan `review.mjs --frames` di 3–5 frame beat, tiga varian,
   plus teks terpanjang lewat `--props`. Lihat PNG-nya sendiri. Perbaiki layout dulu sebelum gerak.
4. **Render** ke `out/<Nama>-<Format>.mp4` dengan codec h264, untuk format yang diminta. Kalau tidak disebut, Portrait saja.
5. **Review hasil render** dengan `review.mjs --video`: contact sheet, tes ponsel 360 px, codec/ukuran/loudness.
   Lakukan critic pass (checklist di `references/review.md`), perbaiki 3 masalah terburuk, maksimal 3 putaran.
6. **Commit & push** ke branch yang sedang aktif. Untuk hasil render, gunakan `git add -f out/<file>`. Jangan commit `out/review/`.
7. **Laporan singkat:** apa yang dibuat, props yang bisa diubah, path file, hasil cek, dan `DECISION` yang perlu diputuskan user (maks 3).

Revisi: ubah catatan user jadi WHERE (frame global) / PROBLEM / CHANGE / KEEP sebelum mengedit.

## Perintah

```bash
npm install
npm run dev                                   # Remotion Studio
npm run lint                                  # eslint + tsc
node .claude/skills/motion-studio/scripts/audit.mjs [src/<Kategori>/<Nama>.tsx]   # aturan repo; exit 1 kalau ERROR
node .claude/skills/motion-studio/scripts/review.mjs <Id> --frames 18,60,130 [--props '{"name":"..."}']
node .claude/skills/motion-studio/scripts/review.mjs <Id> --video out/<Id>.mp4   # contact.png, phone.png, metadata
npx remotion render <Id> out/<nama>.mp4 --codec=h264
npx remotion render <Id> out/review/<Id>/cut.mp4 --frames=90-149 --codec=h264   # potongan di batas scene
npx remotion still <Id> out/frames/<nama>-f60.png --frame=60
```

Untuk caption otomatis (whisper.cpp, glosarium), lihat `README.md`. Pemasangan kit: `docs/motion-studio-INSTALL.md`.

## Lingkungan render

- **Default: lokal di Mac user.** ffmpeg/ffprobe ada di `/opt/homebrew/bin`. Perintah di atas langsung bisa dipakai.
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
