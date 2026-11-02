# motion-video

Video motion graphic vertikal (1080x1920, 30 fps, 8 detik) yang dibuat dengan [Remotion](https://www.remotion.dev).

## Isi video (`HaloDunia`)

| Detik | Animasi |
| ----- | ------- |
| 0–1   | Lingkaran ungu `#8B5CF6` muncul dari tengah, scale 0→1 dengan spring (sedikit membal) |
| 1–3   | Teks **"Halo, Dunia!"** muncul kata per kata (slide up + fade in), jeda 0.2 s antar kata |
| 3–5   | Subjudul "Dibuat oleh AI" (`#A5B4FC`) fade in |
| 5–7   | Angka count-up 0→100% (`#FACC15`) di bagian bawah |
| 7–8   | Semua elemen zoom out + fade out ke hitam |

Latar: gradasi `#0F0F1A` → `#1E1B4B`. Semua gerakan memakai easing/spring, margin aman ≥ 80 px.

Kode komposisi ada di `src/HaloDunia.tsx`, registrasi di `src/Root.tsx`.

## Perintah

```bash
npm install
npm run dev      # buka Remotion Studio (preview interaktif)
npm run render   # render ke out/video.mp4 (h264)
npm run lint     # eslint + tsc
```

Render still frame tertentu, misalnya detik 1, 4, dan 6:

```bash
npx remotion render HaloDunia out/frames --frames=30,120,180 --image-format=png
```

## Motion logo "Isekai Juicer"

Logo vektor + animasi 6 detik dengan efek suara untuk game *Isekai Juicer* (Ucok, penyihir dari dunia lain
yang portalnya malah memuntahkan buah, kini jadi tukang jus). Emblem: portal ungu berputar, gelas jus di
tengah, enam buah terlempar keluar; wordmark "ISEKAI" (Cinzel Decorative) + "JUICER" (Luckiest Guy).

| Komposisi | Ukuran | Keterangan |
| --- | --- | --- |
| `IsekaiJuicer-Landscape` | 1920x1080 | motion logo + SFX |
| `IsekaiJuicer-Portrait` | 1080x1920 | motion logo + SFX |
| `IsekaiJuicer-Square` | 1080x1080 | motion logo + SFX |
| `IsekaiJuicer-Logo` (Still) | 1200x1200 | PNG logo statis; props `background` (false = transparan) dan `showText` (false = emblem saja) |

Kode: `src/Logo/isekai-juicer/Art.tsx` (grafik SVG, semua nilai animasi lewat prop `anim`),
`src/Logo/IsekaiJuicer.tsx` (timeline + audio), `src/Logo/IsekaiJuicerStill.tsx`.
Props motion: `fadeOut`, `sound`, `volume`.

Efek suara di `public/sfx/isekai-juicer/`: `portal-open`, `sparkle`, `pop-1..5`, `splash`, `impact`, `final-chord`
disintesis oleh `scripts/sfx/isekai_juicer_sfx.py` (numpy, bebas lisensi); `whoosh` dan `ding` dari remotion.media.

```bash
npx remotion render IsekaiJuicer-Landscape out/isekai-juicer-landscape.mp4 --codec=h264
npx remotion still IsekaiJuicer-Logo out/isekai-juicer-logo.png
npx remotion still IsekaiJuicer-Logo out/logo-transparent.png --props='{"background":false,"showText":true}'
python3 scripts/sfx/isekai_juicer_sfx.py   # regenerasi SFX kalau ingin ubah karakternya
```

## CrewReveal (Characters)

Ilustrasi grup 7 karakter (PNG datar) yang dihidupkan dari cutout manual per karakter.
Gadis jaket biru (karakter 1) pop-in duluan, lalu karakter 2..7 bergantian keluar dari belakang
karakter yang sudah ada. Idle: napas, goyang kecil per karakter dengan paralaks, dua helai rambut
bergoyang, kilau di permata pedang dan jepit rambut, layar TV berpendar. Semua karakter berkedip
dengan jadwal sendiri-sendiri (karakter 3 kedip ganda); kepala TV (karakter 6) "berkedip" dengan
memipihkan huruf J dan A di layarnya. Jadwalnya di `BLINK_AT` (frame fase idle).

| Komposisi | Ukuran | Frame | Keterangan |
| --- | --- | --- | --- |
| `CrewReveal-Portrait` / `-Landscape` / `-Square` | 1080x1920 / 1920x1080 / 1080x1080 | 285 | fase `full` = in + idle + out |
| `CrewRevealIn-Portrait` | 1080x1920 | 60 | masuk, dimainkan sekali |
| `CrewRevealIdle-Portrait` | 1080x1920 | 180 | loop mulus (frame 180 == frame 0) |
| `CrewRevealOut-Portrait` | 1080x1920 | 45 | "in" diputar balik: 7 hilang dulu, gadis depan terakhir |
| `CrewReveal-Web` | 900x1272 | 240 | latar transparan, rasio ilustrasi asli, in + idle, bawah memudar (untuk web) |

Kode: `src/Characters/CrewReveal.tsx`. Tata letak lapisan dibaca dari `public/crew/layers.json`.

### Lapisan (`scripts/layers/crew_layers.py`)

Masukan: 7 PNG transparan hasil potong manual, ukuran & posisi sama dengan ilustrasi asli
(`scripts/layers/crew-source/magz-1.png` .. `magz-7.png`, 2604x3683). Nomor = urutan muncul =
urutan kedalaman (1 paling depan). Skrip hanya membaca file itu, lalu menulis ke `public/crew/`:

- `front.png` — karakter 1 tanpa dua helai rambut bawah; di bawah helai diisi jaket/rambut di sampingnya
- `hair-left.png`, `hair-right.png` — helai rambut yang bergoyang
- `char-2.png` .. `char-7.png` — karakter lain; bagian yang tertutup karakter di depannya ditambal 40 px
  supaya saat lapisan bergerak yang tersingkap adalah tambalan, bukan lubang
- `eyes-mask.png` — area mata karakter 1 tanpa poni, kelopak kedip hanya digambar di sini
- `blink-char-{2,3,4,5,7}.png` — area kelopak karakter lain (bingkai kacamata karakter 4 tetap di atas)
- `tv-j.png`, `tv-a.png` — huruf di layar TV; layar di `char-6.png` ditambal di baliknya
- `layers.json` — kotak tiap lapisan (ruang 1414x2000), titik jangkar "muncul", kelopak, warna kulit

```bash
python3 -m venv .venv && .venv/bin/pip install opencv-python-headless pillow numpy
.venv/bin/python scripts/layers/crew_layers.py scripts/layers/crew-source/magz-{1,2,3,4,5,6,7}.png
```

Koordinat kotak helai rambut, poligon mata (`EYES`, `BLINKS`) dan huruf TV di skrip khusus untuk ilustrasi ini.

### Props

| Prop | Default | Fungsi |
| --- | --- | --- |
| `phase` | `"full"` | `"in"`, `"idle"`, `"out"`, atau `"full"` |
| `bgTop`, `bgBottom` | `#1B1F4B`, `#0B0A1E` | gradasi latar |
| `glowColor` | `#5B4DD6` | cahaya di belakang grup |
| `skinColor`, `skinColorRight` | `#FCEEEF` | warna kelopak mata kiri / kanan (kulit di bawah mata) |
| `fitMode` | `"contain"` | `contain` = seluruh ilustrasi terlihat, `cover` = isi penuh frame (tepi terpotong) |
| `motionAmount` | `1` | kekuatan gerak idle (0 = diam kecuali kedip) |
| `particles` | `true` | partikel cahaya di latar |
| `fadeBottom` | `0` | pudar ke transparan di bagian bawah (0..1 dari tinggi frame); `CrewReveal-Web` memakai `0.1` |

```bash
npx remotion render CrewReveal-Portrait out/crew-reveal-portrait.mp4 --codec=h264
npx remotion render CrewRevealIdle-Portrait out/crew-reveal-idle-portrait.mp4 --codec=h264
npx remotion render CrewReveal-Portrait out/crew-cover.mp4 --codec=h264 --props='{"fitMode":"cover"}'
```

### Di web sebagai video transparan (disarankan untuk web statis)

`CrewReveal-Web` dirender ke dua file dengan alpha. Latarnya transparan, jadi satu video cocok untuk
tema gelap dan terang. Isinya In (0–2 s) lalu Idle (2–8 s); keyframe ada di detik 2.

| File | Codec | Untuk |
| --- | --- | --- |
| `out/crew-reveal-web.webm` | VP9 + alpha | Chrome, Edge, Firefox, Android |
| `out/crew-reveal-web-hevc.mov` | HEVC + alpha | Safari macOS & iOS |

```bash
S=$(mktemp -d)
npx remotion render CrewReveal-Web $S/master.mov --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png
ffmpeg -i $S/master.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -deadline good -cpu-used 2 \
  -row-mt 1 -force_key_frames 0,2 -g 240 -an out/crew-reveal-web.webm
# HEVC alpha butuh encoder VideoToolbox (macOS)
ffmpeg -i $S/master.mov -c:v hevc_videotoolbox -alpha_quality 0.8 -q:v 55 -tag:v hvc1 \
  -force_key_frames 0,2 -g 240 -an out/crew-reveal-web-hevc.mov
```

Snippet HTML/CSS/JS ada di `docs/crew-reveal-embed.html` (sekaligus demo dengan tombol ganti tema).
Urutan `<source>` penting: HEVC ditandai `video/quicktime`, yang hanya diklaim Safari, jadi Chrome
tidak mengambil file HEVC (alpha HEVC belum tentu tampil di sana) dan memakai WebM. Script-nya
memutar In sekali, me-loop Idle dengan melompat ke detik 2 saat `ended`, dan menampilkan pose diam
kalau autoplay ditolak (mode hemat daya iOS) atau `prefers-reduced-motion` aktif.

### Di web dengan `@remotion/player` (untuk web React)

Keadaan akhir "in" sama dengan frame 0 "idle", dan frame terakhir "idle" bersambung ke frame 0-nya,
jadi satu `<Player>` cukup: mainkan In sekali, ganti ke Idle yang di-loop, lalu Out saat keluar.

```tsx
import { Player, PlayerRef } from "@remotion/player"; // npm i @remotion/player@4.0.536
import { useEffect, useRef, useState } from "react";
import {
  CrewReveal,
  CREW_IDLE_FRAMES,
  CREW_IN_FRAMES,
  CREW_OUT_FRAMES,
  CrewPhase,
} from "./Characters/CrewReveal";

const DURATION = { in: CREW_IN_FRAMES, idle: CREW_IDLE_FRAMES, out: CREW_OUT_FRAMES };

export const CrewHero: React.FC<{ leaving: boolean; onGone?: () => void }> = ({ leaving, onGone }) => {
  const ref = useRef<PlayerRef>(null);
  const [phase, setPhase] = useState<Exclude<CrewPhase, "full">>("in");

  useEffect(() => {
    if (leaving) setPhase("out");
  }, [leaving]);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    p.seekTo(0);
    p.play();
    const onEnded = () => (phase === "in" ? setPhase("idle") : phase === "out" ? onGone?.() : undefined);
    p.addEventListener("ended", onEnded);
    return () => p.removeEventListener("ended", onEnded);
  }, [phase, onGone]);

  return (
    <Player
      ref={ref}
      component={CrewReveal}
      inputProps={{
        phase,
        bgTop: "#1B1F4B",
        bgBottom: "#0B0A1E",
        glowColor: "#5B4DD6",
        skinColor: "#FCEEEF",
        skinColorRight: "#FCEEEF",
        fitMode: "contain",
        motionAmount: 1,
        particles: true,
      }}
      durationInFrames={DURATION[phase]}
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      loop={phase === "idle"}
      autoPlay
      controls={false}
      style={{ width: "100%" }}
    />
  );
};
```

Salin `public/crew/` ke folder statis web-mu (Player memakai `staticFile()`, jadi file harus
tersedia di `/crew/...`). Komponen juga meng-import `public/crew/layers.json` lewat path relatif
`../../public/crew/layers.json`; sesuaikan path import itu kalau struktur folder web-mu berbeda. Untuk transparansi di atas halaman, set `bgTop`/`bgBottom` ke `transparent`
dan `particles: false`.

## Auto caption (`CaptionedVideo`)

Komposisi `CaptionedVideo` memutar video dari `public/` dan menampilkan caption animasi gaya TikTok
(kata yang sedang diucapkan di-highlight kuning dan "pop"). Caption dihasilkan otomatis oleh
whisper.cpp (CPU, tanpa GPU) lewat `scripts/transcribe.ts`, lalu dikoreksi dengan `scripts/glossary.json`
untuk nama/istilah yang sering salah dengar.

Alur lokal:

```bash
# 1. Taruh video di public/, lalu transkripsi (install whisper.cpp + unduh model otomatis)
WHISPER_PROMPT="Kakashi, Chidori, Sharingan" npx tsx scripts/transcribe.ts kakashi-chidori.mp4 small id
#    -> public/kakashi-chidori.captions.json

# 2. (Opsional) koreksi manual JSON-nya, atau terapkan ulang glosarium
npx tsx scripts/glossary.ts public/kakashi-chidori.captions.json

# 3. Render
npx remotion render CaptionedVideo out/kakashi-chidori-captioned.mp4 --codec=h264 \
  --props='{"src":"kakashi-chidori.mp4","captionsFile":"kakashi-chidori.captions.json","captions":[],"captionTop":1260,"captionHeight":220,"blurBehindCaptions":true}'
```

Props `captionTop`/`captionHeight` menentukan area caption (komposisi 1080x1920). `blurBehindCaptions`
memburamkan area di belakang caption, berguna untuk menutup subtitle bawaan video sumber.
Durasi komposisi dan isi caption dimuat otomatis di `calculateMetadata`.

Font Montserrat ExtraBold dibundel di `public/fonts/` supaya render tidak bergantung pada jaringan.

## Render lewat GitHub Actions

Dua workflow bisa dijalankan manual dari tab **Actions** → **Run workflow**:

| Workflow | File | Hasil |
| --- | --- | --- |
| Render video | `.github/workflows/render-video.yml` | Render komposisi `HaloDunia` → artifact `video` |
| Transcribe & render captions | `.github/workflows/transcribe-and-render.yml` | Transkripsi video di `public/` dengan whisper.cpp, render `CaptionedVideo` → artifact `captioned-video-<nama>` berisi MP4, frame review, dan captions JSON |

Input workflow caption: nama file video, model Whisper (`small` cepat, `medium` lebih akurat), kode bahasa,
prompt kosakata, opsi lewati transkripsi (pakai JSON yang sudah ada), dan opsi commit hasil kembali ke branch.
Build whisper.cpp dan model di-cache per model, jadi run berikutnya lebih cepat.
Video sumber harus di bawah 100 MB (batas GitHub per file).

## Hasil render

Folder `out/` di-ignore secara default; hasil berikut ditambahkan dengan `git add -f`:

- `out/video.mp4` — render `HaloDunia`
- `out/kakashi-chidori-captioned.mp4` — render `CaptionedVideo` untuk `public/kakashi-chidori.mp4`
- `out/isekai-juicer-{landscape,portrait,square}.mp4` — motion logo Isekai Juicer
- `out/isekai-juicer-logo.png`, `out/isekai-juicer-logo-transparent.png`, `out/isekai-juicer-emblem-transparent.png` — logo statis
- `out/crew-reveal-{portrait,landscape}.mp4` — CrewReveal fase full
- `out/crew-reveal-{in,idle,out}-portrait.mp4` — CrewReveal per fase (idle bisa di-loop)
- `out/crew-reveal-web.webm`, `out/crew-reveal-web-hevc.mov` — CrewReveal transparan untuk web

## Remotion Agent Skills

Folder `.agents/skills/` (dan symlink di `.claude/skills/`) berisi Remotion Agent Skills yang dipasang lewat `npx remotion skills add`.
