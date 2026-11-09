# PSX and N64 male base mesh (Orange Juice Games)

- Sumber: https://orange-juice-games.itch.io/psx-and-n64-male-base-mesh
- Lisensi: Creative Commons Zero v1.0 Universal (CC0), bebas dipakai termasuk komersial, tanpa kredit wajib (dicek 9 Nov 2026 di halaman itch.io).
- File: `psx_male_base_mesh.zip` (11 KB, diunduh user) → `src/psx_male_base_mesh.glb` (38 KB).
- Isi: 1 mesh 264 sisi, tinggi ±1,95 unit, A-pose, UV sederhana, tanpa material; armature 24 tulang gaya Rigify (spine, spine.001–003, shoulder/upper_arm/forearm/hand, pelvis/thigh/shin/foot/toe/heel). Tidak ada tulang kepala: kepala ikut `spine.003`. Ada 1 Icosphere nyasar (dibuang oleh skrip).
- Catatan impor: importer glTF Blender memberi armature rotasi quaternion 90°. Setelah `rotation_mode='XYZ'` dan rotasi nol, depan model = -Y lokal (menghadap kamera di -Y), kanan penonton = +X.
- Dipakai oleh: `motion-starters/reverse/CicakDinding/uji-gaya/psx/psx_char.py`.
