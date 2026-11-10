---
name: psx-character
description: Bikin karakter 3D low-poly gaya PS1/PS2 horor (Forbidden Siren, Vagrant Story, PSX horror) di Blender headless, dengan ekspresi wajah dari atlas tekstur (dari video atau potret diam), efek PSX (vertex jitter, kabut, resolusi rendah, warna terbatas + dither), rig bawaan base mesh CC0, gerakan menoleh/idle, jalan dengan kunci kaki (IK), adegan multi-tokoh dengan set yang dimodelkan lewat skrip, dan tokoh berlatar transparan untuk ditempel di video. Pakai skill ini setiap kali user mau karakter 3D, low poly, PSX/PS1/PS2, retro 3D, "ala Siren", mimik dari tekstur, karakter jalan di lorong, base mesh, atau mau mengubah art/PNG wajah sendiri jadi karakter 3D bergerak, walaupun user tidak menyebut "PSX" secara langsung. Hasilnya urutan PNG + MP4 yang bisa dimasukkan ke video Remotion (skill horror-scenes).
---

# PSX Character

Alur teruji (9 Nov 2026, Blender 5.2, MacBook M1): base mesh CC0 → material otomatis per bagian tubuh → wajah dari **atlas ekspresi** → animasi lewat rig (idle menoleh, atau jalan + IK) → efek PSX → render EEVEE 240×320 → pasca-proses pixel/palet. Render 5 detik ±13 dtk, sangat ringan.

Contoh hasil dan riwayat uji: `/Users/mac/Magz Motion/motion-starters/reverse/CicakDinding/uji-gaya/` (`psx_walk.mp4`, `psx_char.mp4`, `psx/README.md`, `PERBANDINGAN.md`).

## RESEP YANG DISETUJUI USER (9 Nov 2026): video wajah → karakter PSX berekspresi
Hasil acuan: `/Users/mac/Magz Motion/motion-starters/reverse/FaceRip/psx_atlas_idle.mp4` dan `psx_atlas_talk.mp4` (user: "udah oke banget"). Jalankan urutan ini apa adanya, baru ubah kalau diminta.
```bash
SK="/Users/mac/Magz Motion/motion-video/.claude/skills/psx-character"
FT="/Users/mac/Magz Motion/motion-starters/referensi/face-tools"      # venv mediapipe + model landmark & segmentasi
OUT="<folder kerja di luar repo, mis. motion-starters/reverse/<Nama>>"; mkdir -p "$OUT"
# 1. video wajah -> 1080p
nice -n 15 ffmpeg -i <video> -vf scale=-2:1080 -an -c:v libx264 -crf 14 "$OUT/face_1080p.mp4"
# 2. rip: atlas_wide_8.png (8 FOTO ekspresi asli + rambut), skin_tile.png, meta.json (skin_hex, hair_hex, nose_check)
nice -n 15 "$FT/.venv/bin/python" -I "$SK/scripts/rip_face.py" "$OUT/face_1080p.mp4" "$OUT/rip" --cell 64 --colors 32
# 3. cek still 4 sudut dulu (ANIM=turn), tunjukkan ke user sebelum animasi
cd "$OUT" && HEAD_MAP=front FACE_ATLAS="$OUT/rip/atlas_wide_8.png" SKIN_HEX="<skin_hex>" HAIR_HEX="<hair_hex>" \
  SKIN_TILE="$OUT/rip/skin_tile.png" ANIM=turn nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320
# 4. animasi: idle (menoleh, kedip, patah ke kamera + seram) dan/atau bicara dengan lip-sync VO
#    (ganti ANIM=turn jadi ANIM=idle, atau ANIM=talk EXPR_JSON="$OUT/expr.json" dari lipsync.py; lihat bagian Lip-sync)
bash "$SK/scripts/psx_post.sh" "$OUT/frames_char" "$OUT/psx_idle.mp4"                     # +faststart otomatis
AUDIO=vo.wav AUDIO_OFFSET=0.3 bash "$SK/scripts/psx_post.sh" "$OUT/frames_talk" "$OUT/psx_talk.mp4"
```
Tulis setiap variabel env langsung di depan perintah dengan kutip (path ada spasi). `SKIN_HEX`/`HAIR_HEX` dibaca dari `rip/meta.json`.

**QA wajib sebelum melapor** (user pernah menemukan cacat yang terlewat):
1. `meta.json`: sel mana yang asli/lemah/sintetis; `nose_check` ≈ 0.
2. Lihat `atlas_wide_8.png` diperbesar: 8 wajah utuh, tidak ada lubang, tangan tidak menutupi wajah.
3. Still 4 sudut (`ANIM=turn`): wajah hanya di depan, samping/belakang rambut, tidak ada goresan, dagu tidak bergaris gelap.
4. MP4 final: ukur kecerahan **area kepala** tiap frame (`crop=<kotak kepala>,signalstats`, tidak boleh ada frame < 70% rata-rata), lalu lihat lembar semua frame (`tile`). Jangan pakai rata-rata seluruh layar.
5. Urutan atom MP4 `ftyp, moov, ..., mdat` (faststart), supaya tidak hitam di pemutar.

Preferensi user yang sudah pasti: wajah **hanya di depan** (stretch sedikit ke atas/samping), belakang = rambut asli; ekspresi dari **foto diam**, bukan video penuh; still dulu baru animasi; gaya PS1 (240×320, 15 gambar/dtk, 48 warna + dither).

## Adegan multi-tokoh + set buatan sendiri (pola WajahDiLukisan, disetujui user 10 Nov 2026)
Contoh teruji ada di `scripts/blender/wajah/` (repo). README di sana berisi perintah render ulang.
- `psx_lib.py`: versi ringkas pembuat tokoh dari `psx_char.py` (HEAD_MAP front). `make_char(tag, coat, pants, atlas, skin, hair)` mengimpor glb **berkali-kali** dalam satu adegan (objek baru dikenali dari selisih `bpy.data.objects`), masing-masing dengan material wajah dan Mapping sendiri. Fungsi lain: `key_expr`, `head_turn`, `breathe(ch, total)`.
- `lerici_scene.py`: shot penuh 3D. Tokoh asli + kembaran, set teras vila dimodelkan dengan kubus dan silinder (lengkung dari balok kecil, langkan, laut dengan Noise bump, kilau bulan dari kotak emisif, bulan + halo, lentera), kabut per material, langit gradasi (World: Generated Z → ColorRamp), kamera maju lalu mendorong ke kepala saat hening.
- `couple_scene.py`: tokoh untuk set 2.5D, latar transparan (`film_transparent`, PNG RGBA). Cahaya tepi samping + isi redup, supaya tidak menjadi siluet hitam.
- **Timing dari cues repo:** skrip membaca `src/Videos/<nama>-words.json` / `-captions.json` dengan rumus yang sama seperti objek `B` di Remotion (WORD_LEAD 0,2). `fr(t) = round((t − T0)·30) + 1`, sehingga frame 1 render = detik awal adegan.
- **Muncul hanya N frame:** keyframe `hide_render` dan `hide_viewport` pada rig dan body (True → False di F → True di F+4), plus lampu kilat energi CONSTANT.
- **Perempuan dari mesh pria** (belum ada base mesh perempuan): skala rig (0.86, 0.9, 0.93), rambut panjang = UV sphere 8×6 diskala dan di-parent ke tulang `spine.003`, rok mantel = kerucut 8 sisi di-parent ke `spine`. Parent ke tulang: set `parent`, `parent_type='BONE'`, `parent_bone`, lalu set `matrix_world`. Dari belakang hasilnya terbaca sebagai perempuan.
- **Atlas wajah dari potret diam** (bukan video): `face/landmarks.py` (MediaPipe Face Landmarker → mata, mulut, dagu, bbox) lalu `face/make_atlas.py`. Crop "wide" dibuat dengan wajah ±50% lebar dan titik tengah (0,5; 0,55 dari atas). Segmentasi `selfie_multiclass`: latar diganti rambut, baju diganti kulit. Sel 2 "seram" = rongga mata gelap bertepi lembut (elips + GaussianBlur, bukan cincin), mulut gelap tipis, kulit pucat (latar dan rambut tidak ikut pucat). Hasilnya atlas 128×64 (2 sel 64).

## Model 3D lain (pesawat, rumah, properti)
Cari model CC0/CC-BY (Kenney, Quaternius, Poly Pizza, Poly Haven, paket PSX itch.io, Sketchfab), **minta izin sebelum mengunduh**, simpan dengan `LICENSE-NOTE.md`, lalu ubah ke PSX: `blender -b --factory-startup -P "$SK/scripts/psx_prop.py" -- <model> <outdir> --tris 800 --tex 64 --size <meter>` (still 4 sudut + `prop_psx.blend`). Detail sumber, lisensi, patokan segitiga: `references/assets-3d.md`.

## Isi skill
- `scripts/psx_char.py`: skrip Blender utama (impor .glb, material, atlas wajah, rig, animasi, lorong, kabut, jitter, kamera, render).
- `scripts/face_atlas.py`: atlas contoh 8 ekspresi 32×32 (`--cells 4` untuk layout lama) dan **template kosong** untuk digambar user (`--template --size 64`). Tanpa dependensi.
- `scripts/lipsync.py`: timing kata whisper → bentuk mulut per frame (`EXPR_JSON` untuk `psx_char.py`). Opsi `--audio` menutup mulut saat hening.
- `scripts/rip_face.py`: video wajah → atlas 8 ekspresi + urutan wajah per frame, otomatis dan sudah dipixelize (butuh venv face-tools, lihat bagian "Rip wajah dari video").
- `scripts/psx_post.sh`: frame → MP4 PS1 (15 gambar/dtk, perbesar nearest, 48 warna + dither), opsional VO ikut (`AUDIO=`, `AUDIO_OFFSET=`).
- `assets/psx_male_base_mesh.glb`: base mesh pria CC0 (Orange Juice Games), rig 24 tulang gaya Rigify. Lisensi di `assets/psx_male_base_mesh.LICENSE.md`.
- `assets/face_atlas_8.png` (atlas 8 ekspresi), `assets/face_atlas_template_64.png` (template kosong 8 sel 64×64 bergaris bantu), `assets/face_atlas_example.png` (layout 4 lama).

## Atlas wajah (layout 8 sel, kiri → kanan)
| Sel | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Isi | diam (mulut tertutup) | kedip | mulut A | mulut O/U | mulut E/I | senyum | takut | seram |

Sel persegi berjajar ke kanan; jumlah sel dibaca otomatis dari lebar ÷ tinggi PNG. Ukuran sel 32 (paling PS1) sampai 64 (lebih detail). Pinggir sel = warna kulit sisi kepala (#b07a5a). Untuk art user: berikan `face_atlas_template_64.png` (garis bantu: mata 34%, hidung 60%, mulut 72% dari atas; titik magenta di pojok = nomor sel; garis magenta di tepi ditimpa saja). Satu sel = mata + mulut sekaligus, jadi kedip hanya terjadi saat mulut diam.

## Rip wajah dari video (otomatis)
Kalau user mengirim video wajah (mis. stok Pexels, rekaman sendiri, aktor dengan izin), langsung jalankan ini. Satu perintah menghasilkan atlas 8 ekspresi **dan** urutan wajah per frame, keduanya sudah diluruskan dan dipixelize.
```bash
FT="/Users/mac/Magz Motion/motion-starters/referensi/face-tools"     # venv mediapipe + model (di luar repo)
nice -n 15 ffmpeg -i <video> -vf scale=-2:1080 -an -c:v libx264 -crf 14 "$OUT/face_1080p.mp4"   # 4K -> 1080p dulu
nice -n 15 "$FT/.venv/bin/python" -I "$SK/scripts/rip_face.py" "$OUT/face_1080p.mp4" "$OUT/rip" --cell 64 --colors 32
# hasil: rip/atlas_8.png, rip/seq/f_####.png (30 fps), rip/skin_tile.png (ubin kulit), rip/meta.json (skin_hex, nose_check, sumber tiap sel), rip/preview.png
```
- **Pakai sebagai atlas** (bisa lip-sync): `FACE_ATLAS=$OUT/rip/atlas_8.png SKIN_HEX=<meta.skin_hex> SKIN_TILE=$OUT/rip/skin_tile.png`.
- **Pakai sebagai wajah video** (gaya Forbidden Siren, wajah asli bergerak di kepala low-poly): `FACE_SEQ=$OUT/rip/seq SKIN_HEX=<...> SKIN_TILE=$OUT/rip/skin_tile.png` (`SEQ_OFFSET=<frame>` untuk mulai dari tengah). Atlas dan `EXPR` diabaikan di mode ini.
- Cara kerja: MediaPipe Face Landmarker (478 titik + 52 skor ekspresi) per frame → wajah diluruskan dari 3 titik (dua mata, tengah mulut, dihaluskan ±2 frame) ke posisi atlas → supersample 4× lalu perkecil (pixelize) → palet bersama k-means 32 warna → luar oval = warna sisi kepala.
- Pemilihan sel: skor ekspresi tertinggi per sel, dikurangi penalti kepala menoleh. Sel mulut (A, O, E, senyum) hanya mengganti **area bibir**: topeng = gabungan poligon kontur luar bibir frame diam dan frame sumber (landmark), dilebarkan sedikit, tepi lembut, dipotong di bawah hidung. Sel kedip hanya area kontur mata. Sebelum ditempel, frame sumber **digeser supaya pusat mulut/matanya tepat di posisi frame diam**. Hasilnya: mata tidak ikut menunduk, tidak ada hidung dobel, tidak ada mulut dobel.
- **Cek otomatis hidung dobel**: `meta.json` → `nose_check` = selisih rata-rata kotak hidung tiap sel mulut/mata terhadap sel diam (harus ≈ 0; > 2 dicetak `PERINGATAN`). Selalu baca angka ini dan lihat `preview.png` sebelum melapor.
- **Sambungan wajah–kepala** (semua wajib, sudah otomatis): (1) `psx_char.py` menggabungkan verteks dobel dari glTF (532 → 134) dan memakai shading halus; tanpa ini tiap sisi low-poly terlihat terpisah dengan garis keras di tengah wajah. (2) `skin_tile.png` = ubin kulit dari pipi/dahi video itu sendiri (potongan yang kena rambut/bayangan disaring), dipasang di kulit kepala, leher, dan tangan dengan proyeksi kotak sebesar lebar wajah. (3) Tepi oval dan dagu memudar ke ubin itu, dan helai rambut gelap di pinggir oval diganti ubin. (4) Area wajah di kepala lebar (normal depan > 0,15, sampai `FACE_TOP` 90%). Rambut cat hanya di atas + belakang; pelipis dan samping kepala = kulit. (5) Lampu tanpa bayangan real-time (bayangan 1-sampel EEVEE = bintik di permukaan halus). `FACE_TOP=0.8` mengembalikan poni rambut cat.
- Ekspresi yang tidak ada di video: E memakai frame E terbaik walau lemah (`video (lemah)`) atau mulut A, **tidak pernah diremas** (meremas memunculkan garis bibir ganda); senyum dari sudut bibir diam yang ditarik ke atas (`sintetis`); seram selalu digambar. Laporkan ke user sel mana yang asli/lemah/sintetis. Hasil terbaik kalau video berisi orang yang bicara/berekspresi jelas menghadap kamera.
- Batas: tangan yang menutupi wajah dan kepala menoleh jauh menurunkan kualitas (frame itu kalah skor, tapi tetap ada di urutan video). Wajah orang nyata hanya dengan izin/lisensi yang jelas.
- Setup sekali (sudah ada di Mac ini): `uv venv --python 3.12 $FT/.venv && VIRTUAL_ENV=$FT/.venv uv pip install mediapipe` (±350 MB) dan model `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task` (3,8 MB) ke `$FT/models/`.
- Uji pertama (9 Nov 2026): video Pexels 19 dtk 4K → 473 frame berwajah, proses 13 dtk; 5 sel asli + 2 olahan + 1 sintetis. Contoh: `motion-starters/reverse/FaceRip/` (`psx_videoface.mp4`, `psx_ripatlas_talk.mp4`).

### Wajah di depan + rambut asli (HEAD_MAP=front) — pilihan user (9 Nov 2026)
User menilai semua cara "stretch sampai belakang" jelek (planar tembus, silinder melar, 360° melar). Yang dipilih: **foto hanya di bagian depan kepala, tumpah sedikit ke atas dan ke samping; belakang = warna rambut**.
```bash
# rip_face.py sudah menghasilkan wide.png (wajah + rambut, potongan 2x) dan hair_hex di meta.json
HEAD_MAP=front FACE_ATLAS=$OUT/rip/wide.png SKIN_HEX=<meta.skin_hex> HAIR_HEX=<meta.hair_hex> ANIM=turn \
  nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320
# ANIM=turn = 4 still (0, 40, 80, 150 derajat) untuk menilai dari banyak sudut sebelum membuat animasi
```
- Crop cerdas = **segmentasi per piksel** MediaPipe `selfie_multiclass_256x256.tflite` (Apache-2.0, 16 MB, di `face-tools/models/`): latar → warna rambut, baju → kulit, kulit wajah dan rambut tidak pernah disentuh. Jangan menyaring latar dengan warna (pernah membuat lubang hitam di tengah wajah).
- **Animasi front** (disetujui user): `HEAD_MAP=front FACE_SEQ=$OUT/rip/seq_wide` (urutan potongan lebar per frame, segmentasi per frame, palet tetap dari frame diam) dengan `ANIM=idle` atau `ANIM=talk SEQ_OFFSET=<frame>`. Contoh: `motion-starters/reverse/FaceRip/psx_front_anim.mp4`. Tangan/lengan di atas dagu (kelas kulit badan) otomatis diganti warna rambut. Sisi rahang/bawah dagu = kulit (bukan rambut, supaya tidak ada garis gelap seperti tali helm).
- Path dengan spasi ("Magz Motion"): jangan menyimpan variabel env dalam satu string lalu `env $VAR`. Nilainya terpotong dan skrip diam-diam kembali ke atlas default. Tulis tiap `VAR="..."` langsung di depan perintah.
- **Atlas ekspresi FOTO (disarankan, permintaan user):** `atlas_wide_8.png` dari `rip_face.py` = 8 frame asli utuh (potongan lebar + rambut, segmentasi), seram digambar di frame diam. Pakai `HEAD_MAP=front FACE_ATLAS=$OUT/rip/atlas_wide_8.png` dengan `ANIM=idle` atau `ANIM=talk EXPR_JSON=...` (lip-sync). User lebih suka ini daripada wajah video penuh. Contoh: `FaceRip/psx_atlas_idle.mp4`, `psx_atlas_talk.mp4`.
- `FRONT_LIMIT` (default -0.3): sisi kepala dengan normal.y di atas angka ini jadi rambut. Lebih besar = foto lebih jauh ke samping, tapi sisi yang sejajar arah proyeksi menghasilkan goresan garis.
- Alternatif yang dicoba dan ditolak: `planar` (wajah tembus ke belakang), `cyl` (botak, belang ditarik), `cyl360` (wajah melar), `fit` + `--fit head_layout.json` (TPS ke titik Loomis; belum dinilai user, mesh ini tidak punya hidung/mata sehingga titiknya hanya proporsi).
- Repo deteksi/crop lain yang dipertimbangkan: face-parsing BiSeNet (MIT, butuh PyTorch ±1 GB, kelas alis/bibir/mata lebih detail); InsightFace (model non-komersial, hindari).

## Perintah
```bash
SK="/Users/mac/Magz Motion/motion-video/.claude/skills/psx-character"
OUT="<folder kerja>"            # di luar src/ repo; mis. motion-starters/... atau out/review/<Nama>/psx
cp "$SK/assets/face_atlas_8.png" "$OUT/face_atlas.png"   # atau atlas gambaran user

# bicara dengan lip-sync dari VO (bahasa Indonesia): kata per kata dari whisper.cpp repo ini -> bentuk mulut
M="/Users/mac/Magz Motion/motion-video"
ffmpeg -i vo.wav -ar 16000 -ac 1 -sample_fmt s16 "$OUT/vo16.wav"
"$M/whisper.cpp/build/bin/whisper-cli" -m "$M/whisper.cpp/ggml-base.bin" -f "$OUT/vo16.wav" -l id -ml 1 -sow -oj -of "$OUT/words" -np
python3 -I "$SK/scripts/lipsync.py" "$OUT/words.json" "$OUT/expr.json" --audio "$OUT/vo16.wav" --offset 0.3 --set 10.6:creepy
ANIM=talk EXPR_JSON="$OUT/expr.json" nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320
AUDIO=vo.wav AUDIO_OFFSET=0.3 bash "$SK/scripts/psx_post.sh" "$OUT/frames_talk" "$OUT/psx_talk.mp4"

# idle (90 frame): menoleh, kedip, bicara, lalu kepala patah ke kamera + wajah seram
nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320

# jalan mendekati kamera (150 frame) dengan kunci kaki IK, berhenti, kepala patah + zoom mendadak
ANIM=walk nice -n 15 blender -b --factory-startup -P "$SK/scripts/psx_char.py" -- "$OUT" "$SK/assets/psx_male_base_mesh.glb" 240 320

bash "$SK/scripts/psx_post.sh" "$OUT/frames_walk" "$OUT/psx_walk.mp4"     # idle: "$OUT/frames_char"
```
Variabel: `ANIM=idle|walk|talk`, `IK=1|0`, `FACE_ATLAS=<png>`, `FACE_SEQ=<folder f_####.png>`, `SEQ_OFFSET=<frame>`, `SKIN_HEX=<#rrggbb>`, `FACE_TOP=<0.8–0.95>` (batas atas area wajah; default 0,9), `CELLS=<n>` (biasanya otomatis), `EXPR_JSON=<expr.json dari lipsync.py>` (menimpa urutan ekspresi di mode apa pun; di `talk` juga menentukan jumlah frame), `FRAMES=<n>` (uji cepat: `FRAMES=3`).
Output: `frames_char/`, `frames_walk/`, atau `frames_talk/`, plus `psx_char.blend` / `psx_walk.blend` / `psx_talk.blend` (bisa dibuka user untuk diedit).

### Lip-sync: catatan
- Whisper `-ml 1 -sow` memberi timing per kata, tapi durasi kata sering ikut jeda: **selalu pakai `--audio`** (WAV 16-bit) supaya mulut tertutup saat hening. Pada uji VO RipperTape 12 dtk, 137 frame mulut "terbuka palsu" ditutup oleh opsi ini.
- `--offset` = detik VO mulai di dalam shot; samakan dengan `AUDIO_OFFSET`. `--set 10.6:creepy` mengganti wajah mulai detik itu (nama: rest, blink, A, O, E, smile, scared, creepy).
- Aturan: a → A, o/u → O, e/i → E, m/b/p → mulut rapat, angka → E-A; dibagi rata dalam durasi kata; minimal tahan 2 frame. Cocok untuk bahasa Indonesia yang vokalnya jelas.
- Cek hasil: crop area mulut dari beberapa frame pergantian (`select=eq(n\,X)`), bandingkan dengan kata di detik itu.

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
- Rip wajah: **jangan menempel pita horizontal** (mis. "semua baris di bawah 58%"). Pita itu membawa ujung hidung dari frame lain yang sedikit bergeser, sehingga hidung jadi dobel (pernah terjadi di sel E dan O). Pakai elips kecil + geser ke posisi frame diam (`mouth_cell`, `eye_cell`).
- Rip wajah: warna kulit sisi kepala jangan ditebak atau digelapkan manual. Ambil dari tepi wajah itu sendiri; kalau beda, batas tekstur terlihat jelas di render (pernah: pipi terang, kepala gelap 20%).
- Rip wajah: elips/pita tetap tidak cukup untuk mulut. Kalau bentuk mulut berbeda, bibir frame diam mengintip di sampingnya ("mulut dobel"). Topeng harus gabungan poligon bibir kedua frame.
- Base mesh glTF dengan verteks terpisah per sisi: shading halus tidak bekerja sampai verteks digabung (`remove_doubles`). Cek: jumlah verteks turun drastis.
- Cek visual wajib setelah rip: zoom area mulut tiap sel (`crop` + `scale ... flags=neighbor`) dan render kepala dari 3 sudut (depan, menoleh kiri, menoleh kanan). Pernah 2× melapor "sudah beres" padahal user masih melihat mulut dobel dan sambungan; crop pertama juga sempat meleset ke dahi, jadi pastikan crop benar-benar mengenai mulut.
- MP4 dari ffmpeg default menaruh indeks `moov` di akhir file: pemutar app/browser kadang menampilkan layar hitam. `psx_post.sh` sudah memakai `-movflags +faststart -g 30`. Setiap ffmpeg lain yang menghasilkan MP4 untuk user (concat, remux) juga pakai `+faststart`; cek dengan membaca urutan atom (`ftyp, moov, ..., mdat`).
- **Kepala hitam 4 frame di tiap ganti ekspresi** (bug wajah video): indeks ekspresi tidak dibatasi ke jumlah sel, sehingga tekstur 1 sel digeser ke sel 1–2 dan membaca tepi gambar. Sudah dibetulkan (clamp + `FACE_SEQ` mengabaikan EXPR). **Cara cek yang benar:** ukur kecerahan di **area kepala** setiap frame MP4 (`crop=...,signalstats`), jangan rata-rata seluruh layar (kepala kecil, perubahan tidak terlihat), lalu lihat lembar semua frame (`tile`). Pernah lolos 2 kali karena cek seluruh layar dan crop yang meleset.
- `cv2.remap` butuh peta float32 (float64 menghasilkan gambar rusak).
- **Bidang transparan di EEVEE (Blender 5):** `material.blend_method` sudah tidak dipakai. Pakai `surface_render_method = 'BLENDED'`. Gradasi `SPHERICAL` pada bidang ukuran 1 harus diberi Mapping skala ±2,4. Tanpa itu sudut bidang masih bernilai > 0 dan halo terlihat sebagai kotak.
- **Objek di luar frame portrait:** kamera vertikal 270×480 dengan sensor 36 mm memakai sisi panjang, jadi FOV horizontal hanya ±22° (lensa 24). Bulan di sudut 32° tidak terlihat. Hitung `atan(x/y)` sebelum menaruh objek langit.
- **Kabut + laut:** laut yang terlalu gelap dengan kabut jauh hilang menyatu dengan langit. Beri warna laut lebih terang (#16303d), jalur kotak emisif ke arah bulan, dan langit bergradasi ke cakrawala.
- `bpy.ops.object.transform_apply(scale=True)` pada kubus primitif: pakai `location=False, rotation=False` (aturan lama tetap berlaku). Lengkung dari balok-balok kecil cukup untuk gaya PSX.
- UV wajah: v = 0 di bawah (dagu), v = 1 di atas. Menaikkan `fz0` menaikkan posisi mata/mulut di wajah. Sekarang `fz0 = zmin + 10%` supaya mulut tidak terpotong garis rahang (pernah salah arah: menurunkan `fz0` justru menurunkan mulut).
- Pengukuran tulang: pakai ruang armature (`pose_bone.tail`), jangan `rig.matrix_world` setelah mengubah transform tanpa depsgraph yang jelas.
- `ffmpeg` sekarang stable 9.0.2 (tanpa `drawtext`, `-vsync` diganti `-fps_mode`). Jangan `brew upgrade` tanpa `--dry-run` (pernah merusak ffmpeg).

## Aturan mesin dan biaya
- Satu proses Blender sekaligus, selalu `nice -n 15`. Resolusi kerja 240×320 (vertikal); jangan render besar lalu dikecilkan.
- Biaya terukur di sesi pembuatan: atlas + kepala ±28 rb token, efek PSX ±19 rb, base mesh ±38 rb, jalan ±19 rb, IK ±13 rb, lip-sync + atlas 8 sel ±31 rb. Render bicara 12 dtk (370 frame): ±26 dtk. Dengan skill ini, pemakaian ulang cukup salin + ubah parameter (perkiraan beberapa ribu token per shot).
- Aset pihak ketiga: hanya CC0/MIT/izin jelas; catat sumber dan lisensi di samping file. Foto wajah orang hanya dengan izin pemiliknya.
