---
name: psx-character
description: Bikin karakter 3D low-poly gaya PS1/PS2 horor (Forbidden Siren, Vagrant Story, PSX horror) di Blender headless, dengan ekspresi wajah dari atlas tekstur, efek PSX (vertex jitter, kabut, resolusi rendah, warna terbatas + dither), rig bawaan base mesh CC0, gerakan menoleh/idle, dan jalan dengan kunci kaki (IK). Pakai skill ini setiap kali user mau karakter 3D, low poly, PSX/PS1/PS2, retro 3D, "ala Siren", mimik dari tekstur, karakter jalan di lorong, base mesh, atau mau mengubah art/PNG wajah sendiri jadi karakter 3D bergerak, walaupun user tidak menyebut "PSX" secara langsung. Hasilnya urutan PNG + MP4 yang bisa dimasukkan ke video Remotion (skill horror-scenes).
---

# PSX Character

Alur teruji (9 Nov 2026, Blender 5.2, MacBook M1): base mesh CC0 → material otomatis per bagian tubuh → wajah dari **atlas ekspresi** → animasi lewat rig (idle menoleh, atau jalan + IK) → efek PSX → render EEVEE 240×320 → pasca-proses pixel/palet. Render 5 detik ±13 dtk, sangat ringan.

Contoh hasil dan riwayat uji: `/Users/mac/Magz Motion/motion-starters/reverse/CicakDinding/uji-gaya/` (`psx_walk.mp4`, `psx_char.mp4`, `psx/README.md`, `PERBANDINGAN.md`).

## Isi skill
- `scripts/psx_char.py`: skrip Blender utama (impor .glb, material, atlas wajah, rig, animasi, lorong, kabut, jitter, kamera, render).
- `scripts/face_atlas.py`: generator atlas contoh 4 ekspresi 32×32 (normal, kedip, bicara, seram), tanpa dependensi.
- `scripts/psx_post.sh`: frame → MP4 PS1 (15 gambar/dtk, perbesar nearest, 48 warna + dither).
- `assets/psx_male_base_mesh.glb`: base mesh pria CC0 (Orange Juice Games), rig 24 tulang gaya Rigify. Lisensi di `assets/psx_male_base_mesh.LICENSE.md`.
- `assets/face_atlas_example.png`: atlas contoh.

## Perintah
```bash
SK="/Users/mac/Magz Motion/motion-video/.claude/skills/psx-character"
OUT="<folder kerja>"            # di luar src/ repo; mis. motion-starters/... atau out/review/<Nama>/psx
cp "$SK/assets/face_atlas_example.png" "$OUT/face_atlas.png"   # atau atlas gambaran user

# idle (90 frame): menoleh, kedip, bicara, lalu kepala patah ke kamera + wajah seram
nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320

# jalan mendekati kamera (150 frame) dengan kunci kaki IK, berhenti, kepala patah + zoom mendadak
ANIM=walk nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320

bash "$SK/scripts/psx_post.sh" "$OUT/frames_walk" "$OUT/psx_walk.mp4"     # idle: "$OUT/frames_char"
```
Variabel: `ANIM=walk|idle`, `IK=1|0`, `FACE_ATLAS=<png>`, `CELLS=<jumlah ekspresi>`, `FRAMES=<n>` (uji cepat: `FRAMES=3`).
Output: `frames_char/` atau `frames_walk/`, `psx_char.blend` / `psx_walk.blend` (bisa dibuka user untuk diedit).

## Alur kerja per permintaan
1. **Uji 3 frame dulu** (`FRAMES=3`), lihat 1 frame. Baru render penuh. Ini menangkap salah arah atau tekstur hilang dalam 3 dtk, bukan 3 menit.
2. **Cek dari file, bukan perasaan.** Buat contact sheet dari frame (`ffmpeg ... select=...,tile=`), lihat. Untuk masalah gerak, ukur dari `.blend` dengan skrip kecil (posisi telapak per frame, arah lutut), seperti saat memverifikasi IK.
3. **Ubah hanya bagian yang diminta** di salinan skrip (lihat "Bagian yang biasa diubah"). Jangan edit `scripts/` milik skill untuk satu proyek; salin dulu ke folder kerja.
4. Masukkan ke video: urutan PNG/MP4 jadi layer di Remotion (skill `horror-scenes`), atau langsung dipakai sebagai shot.

## Bagian yang biasa diubah (di `psx_char.py`)
- **Ekspresi per frame**: daftar `EXPR = [(frame, indeks_sel), ...]` (idle dan walk punya daftarnya sendiri). Ganti patah (CONSTANT) memang disengaja.
- **Atlas dari art user**: PNG sel 32×32 (boleh lebih besar, asal seragam) berjajar ke kanan, pinggir sel diwarnai seperti kulit sisi kepala (`skin` #b07a5a). Set `CELLS` sesuai jumlah sel.
- **Warna baju/kulit/rambut**: dict `M` (hex). Pembagian material otomatis dari tulang dominan tiap sisi (tabel `GROUP`).
- **Gerak kepala/napas/bahu**: `head_turn(frame, derajat, angguk)`, skala `spine.001`, rotasi `shoulder.*`.
- **Jalan**: `Y0` (titik mulai), `SPEED` (m/dtk), `WALK_END` (frame berhenti), `SNAP` (frame kepala patah), `LEG` (sudut fase, dipakai kalau `IK=0`), `STRIDE_FWD`/`STANCE`/`LIFT` (IK).
- **Kamera**: blok `if ANIM == 'walk'` (lensa 30 mm → zoom mendadak 85 mm di `SNAP`).
- **Efek PSX**: `STEP` jitter (0,007 = halus; 0,012 = goyang kuat), `fog(near, far)`, palet/dither di `psx_post.sh`.
- **Base mesh lain**: harus rig gaya Rigify (nama tulang `spine.003`, `thigh.L`, `shin.L`, `foot.L`, `upper_arm.L`, `hand.L`). Sumbu tulang dan sudut pole IK dicari otomatis (`axis_for`, pencarian pole per kaki), jadi tidak perlu menebak. Rig lain: sesuaikan `GROUP` dan nama tulang. Kandidat CC0 lain: Titanium Rat lowpoly female, Bald Monkey dummy (lihat `motion-starters/README.md`).

## Jebakan yang sudah terbukti (jangan diulang)
- **Importer glTF menyimpan rotasi 90° di quaternion armature.** Set `rotation_mode='XYZ'` dengan rotasi nol: depan model = **-Y lokal**, kanan penonton = +X. Salah asumsi sumbu → wajah menempel di sisi kepala. Kalau ragu, render 3 sudut dengan penanda sebelum menebak.
- `bmesh.from_mesh()` tidak menghitung normal: panggil `bm.normal_update()` sebelum memilih sisi berdasarkan normal.
- `transform_apply(scale=True)` juga menerapkan lokasi dan rotasi secara default. Pakai `location=False, rotation=False`.
- `bpy.ops.mesh.subdivide` dalam loop: **deselect semua dulu** tiap iterasi. Kalau tidak, bidang lama ikut dipecah berulang sampai jutaan polygon dan Blender crash (render 9 dtk jadi crash 5 menit).
- Blender 5: `action.fcurves` sudah tidak ada. Pakai `bpy_extras.anim_utils.action_get_channelbag_for_slot(action, slot).fcurves`. `bpy_prop_collection` tidak bisa dijumlahkan dengan `+`; bungkus `list()`.
- Sudut pole IK harus dinilai di frame saat **kaki itu sedang mengayun** (lutut menekuk). Kalau dinilai saat kaki lurus, lutut melenceng ke samping.
- Pengukuran tulang: pakai ruang armature (`pose_bone.tail`), jangan `rig.matrix_world` setelah mengubah transform tanpa depsgraph yang jelas.
- `ffmpeg` sekarang stable 9.0.2 (tanpa `drawtext`, `-vsync` diganti `-fps_mode`). Jangan `brew upgrade` tanpa `--dry-run` (pernah merusak ffmpeg).

## Aturan mesin dan biaya
- Satu proses Blender sekaligus, selalu `nice -n 15`. Resolusi kerja 240×320 (vertikal); jangan render besar lalu dikecilkan.
- Biaya terukur di sesi pembuatan: atlas + kepala ±28 rb token, efek PSX ±19 rb, base mesh ±38 rb, jalan ±19 rb, IK ±13 rb. Dengan skill ini, pemakaian ulang cukup salin + ubah parameter (perkiraan beberapa ribu token per shot).
- Aset pihak ketiga: hanya CC0/MIT/izin jelas; catat sumber dan lisensi di samping file. Foto wajah orang hanya dengan izin pemiliknya.
