# Riset Tren Motion Graphic 2026 dan Rekomendasi Aset untuk Repo Ini

Tanggal riset: 27 Oktober 2026.
Tujuan: menentukan gaya motion graphic apa yang sedang dipakai di media sosial (TikTok, Reels, Shorts, X, Threads)
dan YouTube, lalu memilih mana yang layak dibangun sebagai aset Remotion yang bisa dipakai ulang di repo ini.

## Ringkasan

1. **Caption animasi kata-per-kata sudah jadi standar.** Dari 13,5 juta klip pendek yang dianalisis OpusClip
   (Jan–Mar 2026), 80% memakai caption dan 79% di antaranya animasi; caption statis tinggal 1,6%.
   Gaya yang paling sering disebut: karaoke highlight (kata aktif berubah warna/membesar), highlight wave
   (sapuan warna melintasi frasa), dan bold pop (1–2 kata besar per layar).
2. **Kinetic typography** adalah tren yang paling banyak disebut lintas sumber untuk konten pendek: teks besar
   yang geraknya mengikuti makna kata dan ritme suara.
3. **Tekstur dan "ketidaksempurnaan"** naik daun sebagai reaksi terhadap konten AI yang terlalu halus:
   grain, kertas, tape, VHS, goresan tangan, jump cut. Berdampingan dengan gaya kebalikannya, **minimal hangat**
   (gradasi lembut, palet natural, gerak subtil).
4. **Hybrid 2D + 3D ringan**: parallax, depth, extrusion sederhana, glass/blur, tanpa pipeline 3D penuh.
5. **Transisi**: yang berkinerja bukan yang paling banyak, tapi set kecil yang konsisten: blur, push, wipe,
   zoom, whip pan, dan potongan yang mengikuti beat audio.
6. **Format fleksibel**: satu master edit diturunkan ke portrait, landscape, dan square. Ini sudah jadi konvensi repo.

## Metode dan batasan

- Sumber: artikel tren 2026 dari studio dan vendor (Envato, Renderforest, Genesis, Monkyvision, Demotion, Senate
  Media, Tangence, Videobolt), data penggunaan caption OpusClip, rekap podcast School of Motion, serta katalog
  komponen Remotion (Elements resmi dan koleksi React Video Editor).
- **Thread Reddit, X, dan Threads tidak bisa diambil langsung** dari sesi ini (mesin pencari tidak mengembalikan
  thread komunitas). Jadi yang dirangkum adalah tren yang dipublikasikan, bukan sentimen komunitas mentah.
  Angka performa dari vendor caption (mis. "retensi naik 40%") tidak punya metodologi yang bisa diperiksa,
  sehingga tidak dipakai sebagai dasar keputusan.
- Tren yang butuh 3D penuh, AI generatif, atau AR berada di luar jangkauan Remotion dan dicatat tapi tidak direkomendasikan.

## Tren per kategori

### Caption dan teks bicara

| Gaya | Ciri | Cocok untuk |
| --- | --- | --- |
| Karaoke / word highlight | Frasa 2–5 kata tampil, kata aktif berubah warna atau membesar | Konten cepat, talking head, komedi |
| Highlight wave | Frasa penuh tampil, sapuan warna bergerak kiri ke kanan mengikuti suara | Tutorial, edukasi (penonton bisa baca duluan) |
| Bold pop | 1–2 kata besar per layar, masuk dengan pop/scale | Hook 3 detik pertama, punchline |
| Pill / rounded box | Teks di dalam kotak bulat yang bergerak mengikuti kata | Konten bersih, brand |

Konvensi yang berulang: sans-serif tebal, outline gelap atau shadow, posisi tengah atau sepertiga atas
(menghindari UI platform), kontras tinggi.

### Tipografi kinetik

- Teks sebagai elemen utama, bukan pelengkap: kata muncul per kata/per huruf, berganti ukuran, berputar,
  mengikuti beat.
- "Letters that breathe": variable font weight/width yang beranimasi.
- Tipografi oversized untuk opener dan bumper.

### Transisi

- Set dasar yang paling sering dipakai: cross dissolve, fade through black, push/slide, wipe, zoom through,
  whip pan, blur, iris/clock wipe, blinds, pixel/glitch.
- Prinsip: sedikit jenis, dipakai konsisten, dan selaras dengan beat audio. Transisi kamera (whip pan, zoom punch)
  tetap populer di TikTok/Reels.

### Logo dan branding

- Reveal yang umum: stroke draw (garis tergambar), blur reveal, bounce drop, split, glitch, spin, typewriter.
- Sistem logo "hidup": logo punya idle animation (nafas, putaran pelan) dan versi sting pendek 1–2 detik
  untuk disisipkan di tengah video, bukan hanya intro 5 detik.
- Gaya sticker/cel-spin: elemen berputar flat 2D dengan duplikat bertahap untuk kesan "jiplak sel".

### Tekstur, retro, dan handmade

- Grain/noise overlay, tekstur kertas, tape, sobekan, jump cut, goresan tangan, jitter ringan.
- Analog nostalgia: VHS, tungsten hangat, scanline, chromatic aberration.
- Efek ini sering diaplikasikan sebagai layer di atas konten apa pun, jadi cocok dibuat sebagai komponen overlay.

### Depth dan hybrid 2D/3D

- Parallax layer (background, mid, foreground bergerak dengan kecepatan berbeda).
- Glassmorphism: panel blur frosted, soft shadow, border tipis.
- Extrusion sederhana dan bayangan 3D palsu pada teks (seperti bayangan "JUICER").

### Minimal hangat dan gradasi lembut

- Gradasi ambient yang bergerak pelan, palet natural, ruang kosong besar, gerak subtil.
- Berguna sebagai latar untuk lower third, quote card, dan kartu statistik.

### Procedural / coded motion

- Partikel, grid berdenyut, pola generatif, gelombang. Remotion unggul di sini karena semuanya kode.

### Elemen yang sudah tersedia sebagai acuan (bisa diadaptasi)

- **Remotion Elements** (resmi): 5 gaya caption, 6 background (notebook paper, paper texture, starburst, waves,
  zigzags, liquid contours), efek (peel, shine, tear apart, wiggling callout), overlay (name/location lower third,
  social safe zones), text effects (circle marker, strike through, text marker, spinning wheel), YouTube
  (comment highlight, end card, subscribe nudge).
- **React Video Editor templates** (MIT, 81 komponen): 9 transisi, 9 logo reveal, 9 intro/outro (lower third,
  end card, subscribe reminder, chapter title, countdown, credits), 9 background, 9 cinematic (camera shake,
  film burn, letterbox, whip pan, zoom pulse), 9 teks, 9 chart.

## Rekomendasi: mana yang layak dipasang di repo ini

Prioritas dinilai dari seberapa sering dipakai di konten pendek, kecocokan dengan Remotion, dan seberapa besar
bisa dipakai ulang lintas video.

### Prioritas 1: bangun dulu (dipakai hampir di setiap video)

| Aset | Kategori | Spesifikasi singkat |
| --- | --- | --- |
| Caption Word Highlight | Captions | Varian baru dari `PoppingWordCaptions`: tanpa pop, hanya warna; prop `highlightColor`, `fontSize`, posisi atas/tengah/bawah |
| Caption Highlight Wave | Captions | Sapuan warna kiri ke kanan mengikuti timestamp kata; untuk tutorial |
| Caption Bold Pop | Captions | 1–2 kata per halaman (`combineTokensWithinMilliseconds` kecil), scale-in spring, untuk hook |
| Kinetic Title | Templates | Judul 1–3 baris, animasi per kata/per huruf (slide, pop, rotate), prop teks, warna, align; durasi via `calculateMetadata` |
| Lower Third | Templates | Nama + jabatan, masuk 0,3–0,5 detik, keluar lebih cepat, tahan sesuai panjang teks; varian pill dan bar |
| Transition Pack dasar | Transitions | Fade through black, push, slide wipe, zoom through, whip pan, blur dissolve; dibuat sebagai presentation untuk `TransitionSeries` |
| Logo Sting pendek | Logo | Versi 1,5–2 detik dari motion logo (mis. Isekai Juicer) untuk sisipan tengah video, plus idle loop |

### Prioritas 2: berikutnya (menaikkan kualitas produksi)

| Aset | Kategori | Spesifikasi singkat |
| --- | --- | --- |
| Overlay Grain + Vignette | Effects (kategori baru) | Noise animasi, vignette, opsi scanline/VHS, chromatic aberration tipis; prop intensitas |
| Hook Card | Bumpers | 3 detik pertama: teks besar bold pop + background bergerak + flash; prop teks dan warna |
| End Card / CTA | Bumpers | Subscribe nudge, follow, tombol pulse, slot untuk 2 video berikutnya (landscape) atau 1 CTA (portrait) |
| Parallax Background | Backgrounds (kategori baru) | 3 layer bergerak beda kecepatan + gradasi ambient; prop warna dan kecepatan |
| Glass Panel | Templates | Panel frosted blur untuk teks/quote/statistik di atas video |
| Number Counter / Stat Card | Templates | Angka count-up dengan satuan, bar progres; untuk konten data |
| Text Marker / Underline | Effects | Garis stabilo atau underline yang "digambar" di bawah kata tertentu |

### Prioritas 3: opsional (bergantung gaya konten)

| Aset | Kategori | Catatan |
| --- | --- | --- |
| Paper/Tape Collage | Backgrounds | Tekstur kertas, sobekan, tape; butuh aset gambar tekstur di `public/` |
| Glitch / Pixel Transition | Transitions | Cocok untuk gaming dan tech |
| Cel-Spin / Sticker Spin | Effects | Elemen berputar bertahap, cocok untuk ikon dan emoji vektor |
| Speed Lines / Comic burst | Effects | Untuk konten anime dan gaming (sudah ada contoh di Remotion Elements) |
| Chapter Title / Section Divider | Templates | Untuk video panjang |
| Quote Card | Templates | Teks kutipan + atribusi, background gradasi lembut |

### Tidak direkomendasikan untuk repo ini

- 3D sinematik (Cinema 4D/Unreal), AR/XR, AI-generated actors, B-roll generatif: di luar jangkauan Remotion
  atau butuh pipeline lain.
- Micro-interaction UI (hover, scroll): relevan untuk web, bukan video.

## Prinsip desain yang bisa dibakukan (preset)

- Caption: Montserrat ExtraBold atau Inter Bold, 60–80 px (1080 lebar), outline gelap 1/10 ukuran font,
  2–5 kata per halaman, posisi default tengah-bawah di atas safe zone 200 px untuk portrait.
- Timing masuk 0,3–0,5 detik, keluar 0,2–0,3 detik; spring damping 10–14 untuk pop, 200 untuk gerak halus.
- Satu video memakai maksimal 2 jenis transisi.
- Safe margin: portrait/square 80 px, landscape 100 px (sesuai `CLAUDE.md`).
- Setiap aset punya varian Portrait, Landscape, Square dan props yang bisa diedit di Studio.

## Sumber

- [Envato: 11 Motion Design Trends for 2026](https://elements.envato.com/learn/motion-design-trends)
- [Renderforest: Design Trends 2026](https://www.renderforest.com/blog/design-trends-in-2026)
- [Genesis: Motion Design Trends 2026](https://genesismotiondesign.com/motion-design-trends-2026/)
- [Monkyvision: Top 12 Motion Design Trends 2026](https://monkyvision.com/blog/motion-design-trends/)
- [Demotion: 7 Trending Motion Graphic Styles](https://trydemotion.com/blog/trending-motion-graphic-styles)
- [Senate Media: Key animation trends for 2026](https://www.senatemedia.co.uk/2026/02/from-vivid-gradients-to-liquid-glass-key-animation-trends-for-2026/)
- [Tangence: Top Motion Graphic Trends in 2026](https://www.tangence.com/blog/top-motion-graphic-trends-in-2026-every-brand-should-know/)
- [Videobolt: Top Motion Graphics Trends for 2026](https://blog.videobolt.net/post/top-motion-graphics-trends-2026)
- [Graphic Design Junction: Video and Motion Creative Trends 2026](https://graphicdesignjunction.com/2026/01/video-and-motion-creative-trends-2026/)
- [GarageFarm: 16 Animation Trends 2026](https://garagefarm.net/blog/animation-trends-to-watch)
- [School of Motion: End of Year 2025 recap](https://schoolofmotion.com/blog/eoy2025)
- [Medium: Typography Trends 2026–2027](https://medium.com/design-bootcamp/typography-trends-2026-2027-when-letters-begin-to-breathe-8499fb6c5ef1)
- [OpusClip: Video Captions & Caption Strategy 2026 (data 13,5 juta klip)](https://www.opus.pro/research/best-caption-strategy-short-form)
- [OpusClip: Short-Form Video Trends 2026](https://www.opus.pro/blog/short-form-video-trends-reshaping-creator-marketing-2026)
- [Recapo: Best Caption Styles for Shorts, Reels & TikTok](https://recapo.ai/blog/best-caption-styles-for-shorts/)
- [ClipForge: AI Caption Styles That Boost Engagement](https://clip-forge.io/blog/ai-caption-styles-engagement-data-2026)
- [Clipspeed: Auto-Caption Guide 2026](https://www.clipspeed.ai/blog/how-to-add-captions-viral-shorts.html)
- [Oakgen: Animated lower thirds and overlays for YouTube](https://oakgen.ai/blog/animated-lower-thirds-and-overlays-for-youtube)
- [Wayin: TikTok Transitions, 6 Popular Styles 2026](https://wayin.ai/blog/tiktok-transitions/)
- [ShortGenius: Transisi After Effects untuk video viral](https://shortgenius.com/id/blog/transisi-after-effects-pro-video-viral)
- [Creatify: 10+ transisi dan gaya caption](https://creatify.ai/id/blog/video-editor-upgrades-10-transitions-and-caption-styles)
- [Remotion Elements](https://www.remotion.dev/elements)
- [Remotion resources](https://www.remotion.dev/docs/resources)
- [React Video Editor: 81 Remotion templates (MIT)](https://github.com/reactvideoeditor/remotion-templates)
