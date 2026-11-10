# Cari & pakai model 3D (properti, kendaraan, bangunan) untuk adegan PSX

## Sumber (urutan pilihan)
| Sumber | Lisensi umum | Cocok untuk | Catatan |
| --- | --- | --- | --- |
| Kenney.nl | CC0 | properti, kendaraan, bangunan low-poly | unduh langsung (zip), paling aman |
| Quaternius | CC0 | paket low-poly (kota, hutan, kendaraan, karakter) | unduh langsung / itch.io |
| Poly Pizza (poly.pizza) | CC0 atau CC-BY per model | cari cepat model low-poly | cek lisensi per model; CC-BY = wajib kredit |
| Poly Haven | CC0 | model realistis, tekstur | poly tinggi: turunkan dengan `--tris` |
| itch.io (cari "PSX", "PS1 asset pack") | beda-beda | gaya retro siap pakai | baca halaman lisensi tiap paket; banyak "name your price" |
| Sketchfab | CC-BY/CC0 (filter "downloadable") | koleksi terbesar | unduh butuh login: user yang mengunduh |

Jangan pakai: karakter/benda/logo dari film, game, atau merek tertentu walaupun ada di situs gratis; lisensi "editorial only"; model tanpa lisensi jelas. Untuk benda sederhana (kotak surat, tiang listrik, kursi, pintu) pertimbangkan memodelkan sendiri lewat skrip Blender: lebih cepat dan pasti cocok gayanya.

## Alur
1. Cari 3–5 kandidat (WebSearch / halaman sumber). Tampilkan ke user: nama, sumber, lisensi persis, ukuran unduhan, jumlah segitiga kalau ada, gambar pratinjau (link).
2. **Minta izin sebelum mengunduh** (sebut nama file, sumber, ukuran). Kalau butuh login, user yang mengunduh lalu memberi path.
3. Simpan di `/Users/mac/Magz Motion/motion-starters/referensi/assets-3d/<nama>/` (zip asli + `src/` hasil ekstrak, folder baru yang kosong) + `LICENSE-NOTE.md` (sumber URL, lisensi persis, tanggal cek, teks kredit kalau CC-BY).
4. Ubah ke PSX dan cek still 4 sudut:
   ```bash
   nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_prop.py" -- <model.glb|.gltf|.fbx|.obj> <outdir> [--tris 800] [--tex 64] [--size 2.0]
   ```
   Hasil: `<outdir>/prop_psx.blend` (siap di-append ke adegan), `<outdir>/prop_turn.png` (4 sudut, 240×320 per sudut, Closest, tanpa AA).
5. Tunjukkan still ke user dulu, baru masukkan ke adegan/animasi.

## Patokan ukuran PSX
- Properti kecil 50–300 segitiga, kendaraan 300–1500, bangunan 500–3000. Tekstur 32–128 px, interpolasi Closest.
- Skala dunia: karakter base mesh tingginya ±1,95 unit; `--size` = ukuran sisi terpanjang model setelah impor (mis. kursi 1.0, mobil 4.0, rumah 8.0).
- Dalam adegan: pakai efek yang sama dengan `psx_char.py` (jitter Geometry Nodes, kabut per material, lampu tanpa bayangan).
