# Pasang kit motion-studio

Ekstrak isi zip ke **root repo**, lalu buka Claude Code di repo itu dan ketik:

> Pasang kit motion-studio sesuai INSTALL.md, laporkan hasilnya.

Langkah di bawah ini untuk Claude Code (atau dikerjakan manual).

## 1. Gabungkan file
- `CLAUDE.md`: kalau repo sudah punya `CLAUDE.md`, **gabungkan**, jangan menimpa. Pertahankan aturan lama yang tidak bertentangan, lalu tambahkan bagian yang belum ada.
- `.claude/skills/motion-studio/`, `src/lib/studio/`, `briefs/_TEMPLATE.md`: file baru, tidak menyentuh apa pun yang sudah ada.
- Tambahkan `out/review/` ke `.gitignore`.

## 2. Dependensi
Cek versi `remotion` di `package.json`, lalu pasang paket dengan versi yang sama persis:
```bash
npx remotion add @remotion/zod-types
npx remotion add @remotion/fonts
```
Kalau `npx remotion add` tidak tersedia di versi ini, pakai `npm i @remotion/zod-types@<versi-remotion> @remotion/fonts@<versi-remotion>`.

`zod`: kalau sudah ada di repo, biarkan. Kalau belum, pasang versi yang direkomendasikan docs Remotion untuk versi di repo. Library sudah diuji dengan zod 3.22 dan zod 4.

Untuk 3D (opsional, baru dipasang saat pertama kali dibutuhkan):
```bash
npx remotion add @remotion/three
npm i three @react-three/fiber && npm i -D @types/three
```

## 3. Font lokal
`src/lib/studio/fonts.ts` mencari file ini:
```
public/fonts/Montserrat-Bold.woff2
public/fonts/Montserrat-ExtraBold.woff2
public/fonts/Inter-Regular.woff2
public/fonts/Inter-SemiBold.woff2
```
Kalau font sudah ada di `public/` dengan nama lain, **ubah daftar di `fonts.ts`**, jangan menduplikasi file. Kalau belum ada:
```bash
npm i -D @fontsource/montserrat @fontsource/inter
mkdir -p public/fonts
cp node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2 public/fonts/Montserrat-Bold.woff2
cp node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff2 public/fonts/Montserrat-ExtraBold.woff2
cp node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2 public/fonts/Inter-Regular.woff2
cp node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2 public/fonts/Inter-SemiBold.woff2
```
Kedua font berlisensi SIL Open Font License, boleh dibundel.

## 4. Verifikasi
```bash
npx tsc --noEmit
npm run lint
node .claude/skills/motion-studio/scripts/audit.mjs
```
Uji coba (tanya user dulu apakah hasilnya mau dipertahankan):
1. Salin `.claude/skills/motion-studio/assets/LowerThird.example.tsx` ke `src/Templates/LowerThird.tsx`, ubah import menjadi `'../lib/studio'`.
2. Daftarkan di `src/Root.tsx` dalam `<Folder name="Templates">` dengan `<FormatVariants>`.
3. Jalankan:
   ```bash
   node .claude/skills/motion-studio/scripts/review.mjs LowerThird-Portrait --frames 15,60,140
   node .claude/skills/motion-studio/scripts/review.mjs LowerThird-Landscape --frames 15,60,140
   node .claude/skills/motion-studio/scripts/review.mjs LowerThird-Square --frames 15,60,140
   ```
4. Buka PNG-nya. Pastikan font Montserrat/Inter termuat dan layout rapi di tiga format.

Kalau `npx remotion still` gagal karena tidak bisa mengunduh browser (jaringan diblokir), jangan diulang-ulang. Catat domainnya dan pakai workflow GitHub Actions.
