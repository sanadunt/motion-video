# Format, layout, dan registrasi

## Tiga format, satu komponen
| Varian | Ukuran | Margin aman |
| --- | --- | --- |
| `-Portrait` | 1080×1920 | 80 px |
| `-Landscape` | 1920×1080 | 100 px |
| `-Square` | 1080×1080 | 80 px |

`useLayout()` dari `src/lib/studio` memberi:
- `u`: skala dengan sisi pendek 1080 sebagai basis. Desain dalam "px 1080", lalu kalikan `u` (atau pakai `L.px(n)`). Dengan begitu render preview yang lebih kecil tetap proporsional.
- `safe`: margin aman yang sudah dikali `u`.
- `contentWidth` / `contentHeight`: area di dalam margin.
- `pick({portrait, landscape, square})`: nilai berbeda per orientasi.

Jangan menulis 1080, 1920, atau posisi piksel absolut di komponen. Kalau brief dari referensi memakai koordinat absolut (misalnya x96, y112 di 1080×1080), ubah jadi relatif terhadap `safe`, `contentWidth`, atau persentase tinggi.

## Komposisi ulang, bukan sekadar skala
Landscape bukan portrait yang diperlebar. Pertimbangkan per orientasi:
- **Portrait:** tumpuk vertikal, teks lebih besar relatif terhadap lebar, maksimal 2 baris judul. Zona bawah ±20% dan sisi kanan ±12% sering tertutup UI platform (caption, tombol). Ini patokan kasar, jadi jangan taruh teks penting di sana.
- **Landscape:** susun berdampingan, teks boleh lebih lebar, lower third cukup di sepertiga kiri bawah.
- **Square:** di antara keduanya. Jaga elemen tidak terlalu rapat ke tepi atas dan bawah.

Setelah layout, render still di ketiga varian dan bandingkan. Kesalahan paling umum adalah teks yang pas di landscape tapi pecah jadi 3 baris di portrait.

## Uji teks terpanjang
Render still dengan `--props` berisi teks terpanjang yang masuk akal, misalnya nama 30 karakter atau judul 8 kata. Kalau melebihi batas baris: perkecil font secara bertahap (batas bawah ditulis di brief), lebarkan kotak, atau pindahkan informasi ke beat lain. Pertimbangkan `fitText`/`measureText` dari `@remotion/layout-utils` kalau ukuran harus otomatis.

## Props yang bisa diedit di Studio
- Schema `z.object({...})`, warna pakai `zColor()` dari `@remotion/zod-types` supaya muncul color picker, teks panjang pakai `zTextarea()`.
- Wajib ada `durationInSeconds`. `FormatVariants` memakai `calculateMetadata` untuk mengubahnya jadi `durationInFrames`.
- Logo/gambar: prop string path relatif ke `public/` dan dimuat dengan `staticFile()`. Jangan pakai URL jaringan.
- Default harus masuk akal dan langsung terlihat bagus tanpa diubah.
- Timing internal tetap dihitung relatif terhadap `durationInFrames` (misalnya keluar = durasi − 0,5 dtk), supaya aset tetap benar saat durasi diubah.

## Registrasi di Root.tsx
```tsx
import {Folder} from 'remotion';
import {FormatVariants} from './lib/studio';
import {LowerThird, lowerThirdSchema, lowerThirdDefaults} from './Templates/LowerThird';

<Folder name="Templates">
  <FormatVariants
    id="LowerThird"
    component={LowerThird}
    schema={lowerThirdSchema}
    defaultProps={lowerThirdDefaults}
  />
</Folder>
```
- Nama Folder: Logo, Transitions, Templates, Bumpers, Captions, Videos. Gabung ke Folder yang sudah ada, jangan menduplikasi.
- Id hanya huruf, angka, dan tanda hubung. Hasilnya `LowerThird-Portrait`, `LowerThird-Landscape`, `LowerThird-Square`.
- Kalau aset hanya masuk akal di satu format, beri `formats={['Portrait']}` dan sebutkan alasannya di laporan.

## Frame lokal dan global
Di dalam `<Sequence from={120}>`, `useCurrentFrame()` mulai dari 0. Frame lokal 30 = frame global 150. Brief, revisi, dan laporan selalu memakai frame global. Kalau perlu, tulis keduanya: "global 150 (lokal 30 di scene Product)".

## Transisi sebagai aset
Transisi reusable sebaiknya berupa komponen yang menerima `progress` 0→1, atau dibuat sebagai presentation untuk `@remotion/transitions`. Komposisi demonya menampilkan dua panel contoh, A dan B, supaya bisa direview. Durasi dan arah transisi diatur lewat props.
