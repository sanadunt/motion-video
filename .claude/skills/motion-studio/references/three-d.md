# 3D dengan three.js di Remotion

Pendekatan yang dipakai di teardown (mesin dari kode) dan film "Watering": semua bentuk dibangun dari kode, satu model murni menentukan pose, dan look diperbaiki lewat still yang dibandingkan dengan referensi.

## Tiga lapis
1. **Model** (`<Nama>.model.ts`, tanpa three.js): dimensi nyata dan satu input (misalnya `t` 0→1, sudut crank, progres logo). Fungsi murni `pose(input)` mengembalikan posisi, rotasi, dan angka untuk label. Bisa dites dan dicek manual.
2. **Geometri** (komponen R3F): membangun mesh sekali (`useMemo`), lalu setiap frame hanya mengatur transform dari `pose(...)`.
3. **Stage**: kamera, lampu, environment, material.

```tsx
const frame = useCurrentFrame();
const {width, height, fps, durationInFrames} = useVideoConfig();
const t = progress(frame, 0, durationInFrames, EASE.inOut);
const p = pose(t);
return (
  <ThreeCanvas width={width} height={height}>
    {/* semua transform dari p, bukan dari useFrame */}
  </ThreeCanvas>
);
```

Aturan:
- **Jangan pakai `useFrame` R3F** untuk animasi, karena jalan di jam sendiri. Semua dari `useCurrentFrame()`.
- Partikel atau simulasi dijalankan sekali secara deterministik (seeded) saat inisialisasi, lalu setiap frame membaca hasilnya. Tidak boleh ada state yang dibawa antar-frame.
- Tekstur dan model dimuat dari `public/` dengan `staticFile()`. Loader async harus dibungkus `delayRender`/`continueRender` supaya frame tidak dirender sebelum aset siap.

## Teknik bentuk dari kode
- **Lathe:** profil 2D diputar, untuk botol, piston, roda, lensa, koin.
- **Tube** di sepanjang `CatmullRomCurve3`: kabel, pipa, jejak gerak, garis cahaya.
- **Extrude:** bentuk 2D dipertebal. **Logo 3D:** parse path SVG logo dengan `SVGLoader`, lalu `ExtrudeGeometry` dengan bevel. Ini jalan paling bersih untuk motion logo 3D.
- **InstancedMesh:** ratusan benda sama dalam satu draw call, misalnya partikel, gigi, ubin, atau kerumunan.
- **Teks 3D:** `Text3D` dari drei butuh file font typeface JSON di `public/`.
- Benda yang kompleks (kursi, tanaman) jangan dibuat dari nol. Pakai model GLB CC0 di `public/` dan biarkan kode yang menata. Membuat dari nol makan waktu dan tetap terlihat palsu.

## Look
- Studio terang atau gelap sesuai tema, dengan **satu warna aksen** untuk bagian yang sedang jadi fokus.
- Objek utama mengisi 60–70% frame. Kamera 3/4 kalau tampak depan terlihat datar.
- Logam: roughness minimal 0,45; envMapIntensity sekitar 0,5 di permukaan besar supaya tidak muncul garis putih silau.
- Emissive di bawah 1,0 kalau pakai bloom, supaya detail tidak hilang.
- Bagian putih atau terang diberi outline atau kontras dengan background.
- Environment map tanpa jaringan: `RoomEnvironment` dari `three/examples/jsm/environments/RoomEnvironment.js` + `PMREMGenerator`, atau HDRI yang dibundel di `public/`.
- Cutaway pakai clipping planes. X-ray atau kaca pakai material transparan. Exploded view: `posisiRakit + arahKeluar × faktor`.
- Air, asap, dan rambut paling susah. Buat kecil dan mengilap, lalu biarkan objek utama yang bekerja.

## Mencocokkan referensi
1. Render still dari kamera utama.
2. Taruh di samping referensi dan buka keduanya dengan `view`.
3. Ubah angka di parameter block, bukan sudut kamera untuk menyembunyikan masalah.
4. Ulangi 2–3 putaran **sebelum** menganimasikan apa pun.

Cek tabrakan: hitung jarak antar part dari model di frame-frame beat, jangan hanya mengandalkan mata.

## Render
- Lokal dengan GPU: coba `--gl=angle`.
- Tanpa GPU (misalnya GitHub Actions): renderer software seperti `--gl=swangle` jauh lebih lambat. Kurangi `--concurrency`, render still dulu, dan pertimbangkan render 3D di lokal saja. Nama flag dan default bisa berbeda antar versi Remotion, jadi cek skill Remotion di `.agents/skills` atau docs untuk versi di `package.json`.
- Kalau frame kosong atau hitam: cek apakah aset belum termuat (delayRender), kamera di dalam objek, atau near/far plane.
- Ukuran canvas selalu dari `useVideoConfig()` supaya ketiga format jalan. Komposisi ulang framing per orientasi (jarak kamera atau FOV) dengan `useLayout().pick(...)`.
