/**
 * WajahDiLukisan — "ARSIP 04", short horor ±70 dtk tentang kembaran (nada skeptis, penutup menggantung).
 * Set: src/lib/scenes/wajah.tsx. Brief, naskah, storyboard: briefs/WajahDiLukisan*.md.
 *
 * Satu sumber timing: posisi klip dari briefs/WajahDiLukisan.vo.json, awal/akhir frasa dari
 * wajah-captions.json, waktu kata dari wajah-words.json (scripts/vo-align.mjs). Tidak ada angka
 * waktu yang diketik manual kecuali jarak relatif (durasi gerak, offset SFX).
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {EASE, ensureFonts, mix, progress, sec, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, NoiseFill, PAL, Tape} from '../lib/scenes';
import {clamp01} from '../lib/scenes/sets';
import {Desk1822Scene, GalleryScene, LabScene, PaintingScene, deskGeometry, labGeometry, paintingGeometry} from '../lib/scenes/wajah';
import captions from './wajah-captions.json';
import vowords from './wajah-words.json';
import voCfg from '../../briefs/WajahDiLukisan.vo.json';

ensureFonts();

export const wajahSchema = z.object({
  grain: z.number().min(0).max(1),
  handheld: z.number().min(0).max(1),
  whisperGain: z.number().min(0).max(1),
  captions: z.boolean(),
  durationInSeconds: z.number().min(40).max(120),
});
export type WajahProps = z.infer<typeof wajahSchema>;
export const wajahDefaults: WajahProps = {grain: 0.55, handheld: 0.6, whisperGain: 0.8, captions: true, durationInSeconds: 70};

/* ---------- timing dari VO ---------- */
const WORD_LEAD = 0.2;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const cap = (prefix: string) => {
  const c = captions.find((x) => norm(x.text).startsWith(norm(prefix)));
  if (!c) throw new Error(`cue tidak ditemukan: ${prefix}`);
  return c;
};
const word = (clip: string, text: string, nth = 0) => {
  const w = vowords.filter((x) => x.clip === clip && x.text === text)[nth];
  if (!w) throw new Error(`kata tidak ditemukan: ${clip}/${text}`);
  return w.t - WORD_LEAD;
};
const at = (file: string) => {
  const c = voCfg.clips.find((x) => x.file === file);
  if (!c) throw new Error(`klip tidak ada di vo.json: ${file}`);
  return c.at;
};
const between = (a: string, b: string) => (cap(a).end + cap(b).start) / 2;

const B = (() => {
  const s1End = between('"Itu kamu', 'Tahun');
  const s2End = between('Prianya', 'Konon');
  const tenggelam = word('03-legenda', 'ia');
  const s4Start = between('Beberapa minggu', 'Kata sains');
  const s5Start = between('sebagian sama', 'Kebetulan');
  const peak = word('05-penutup', 'wajahmu');
  return {
    leader: 0.4,
    turn: word('01-hook', 'menoleh'),
    itu: cap('"Itu kamu').start,
    s1End,
    s1Push: s1End - 0.75,
    year: word('02-lukisan', 'tahun'),
    yearDone: word('02-lukisan', 'dua') + 0.5,
    painter: word('02-lukisan', 'tak'),
    subject: word('02-lukisan', 'prianya'),
    s2End,
    entry: word('03-legenda', 'kembarannya'),
    percy: word('03-legenda', 'percy'),
    s3End: word('03-legenda', 'mengaku'),
    double: word('03-legenda', 'dirinya'),
    hush: tenggelam - 1.0,
    tenggelam,
    s4Start,
    note: word('04-dna', 'kebetulan'),
    stamp: word('04-dna', 'orang'),
    marks: word('04-dna', 'berwajah'),
    merge: word('04-dna', 'kode'),
    glow: word('04-dna', 'sebagian'),
    labOff: s5Start - 0.5,
    s5Start,
    hush2: cap('atau di').end,
    subjQ: word('05-penutup', 'seseorang'),
    snap: word('05-penutup', 'sedang'),
    peak,
    w1: peak + 2.2,
    stop: peak + 4.1,
  };
})();

export const WajahDiLukisan: React.FC<WajahProps> = ({grain, handheld, whisperGain, captions: showCaptions}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = useLayout();
  const W = L.width;
  const H = L.height;
  const t = frame / fps;
  const F = (s: number) => sec(s, fps);
  const p = (from: number, dur: number, ease = EASE.inOut) => progress(frame, F(from), Math.max(1, F(dur)), ease);
  const hh = L.px(2.6) * handheld;
  const peakF = F(B.peak);
  const inPeak = frame >= peakF && frame < peakF + 4;
  const inStatic = frame >= peakF + 4 && frame < peakF + 10;

  /** Kamera: fokus ke titik (px, py) dengan zoom z, tanpa lompatan origin. */
  const focus = (z: number, px: number, py: number) => ({zoom: z, x: -z * (px - W / 2), y: -z * (py - H / 2), origin: '50% 50%'});
  const path = (pts: Array<{t: number; z: number; x: number; y: number}>) => {
    const ts = pts.map((q) => q.t);
    const o = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: EASE.inOut};
    return focus(interpolate(t, ts, pts.map((q) => q.z), o), interpolate(t, ts, pts.map((q) => q.x), o), interpolate(t, ts, pts.map((q) => q.y), o));
  };

  type Shot = {node: React.ReactNode; zoom: number; x: number; y: number; origin?: string; black?: number; water?: number; warm?: number};
  const shot = ((): Shot => {
    /* 1. galeri */
    if (t < B.s1End) {
      const lf = frame - F(B.leader);
      const dolly = p(B.leader, B.s1Push - B.leader);
      const push = p(B.s1Push, B.s1End - B.s1Push, EASE.in);
      const fadeIn = 1 - p(B.leader, 0.7, EASE.out);
      return {
        // pasangan 3D: frame render Blender = frame lokal sejak leader + 1 (couple_scene.py memakai T0 = leader dan cue yang sama)
        node: <GalleryScene L={L} frame={lf} dolly={dolly} coupleFrame={lf + 1} />,
        zoom: mix(push, 1.0, 3.2),
        x: 0,
        y: 0,
        origin: '50% 41%',
        black: t < B.leader ? 1 : fadeIn,
      };
    }

    /* 2. lukisan: tilt dari rapier ke wajah, turun ke label, menembus baris Subjek */
    if (t < B.s2End) {
      const g = paintingGeometry(L);
      const lf = frame - F(B.s1End);
      // fase a: zoom ke badan → wajah (label di luar layar); fase b: kamera netral, label sudah di safe zone
      const bodyY = g.fy + g.t + g.cw * 1.3 * 0.62;
      const lx = g.fx + L.px(280);
      const ly = g.labelY + L.px(150);
      const cam = path([
        {t: B.s1End, z: 2.6, x: W / 2, y: bodyY},
        {t: B.s1End + 0.8, z: 2.1, x: W / 2, y: bodyY},
        {t: B.painter - 1.0, z: 2.0, x: g.faceX, y: g.faceY + L.px(70)},
        {t: B.painter - 0.2, z: 1.0, x: W / 2, y: H / 2},
        {t: B.s2End - 0.55, z: 1.03, x: W / 2, y: H / 2},
        {t: B.s2End, z: 2.6, x: lx, y: ly},
      ]);
      // kartu label baru muncul saat kamera mundur (fase a: potongannya jatuh ke zona UI bawah);
      // judul + tahun diketik cepat begitu kartu muncul, lalu Pelukis/Subjek tepat pada kata VO
      const labelIn = p(B.painter - 0.5, 0.3, EASE.out);
      const lines = Math.min(3, p(B.painter - 0.45, 0.45, (v) => v) * 3) + p(B.painter, 0.5, (v) => v) + p(B.subject, 0.5, (v) => v);
      return {node: <PaintingScene L={L} frame={lf} faceLight={0} labelLines={lines} subjectBlink={labelIn} />, ...cam};
    }

    /* 3. meja 1822: dari baris kamus ke tanggal surat ke miniatur */
    if (t < B.s3End) {
      const d = deskGeometry(L);
      const lf = frame - F(B.s2End);
      const cam = path([
        {t: B.s2End, z: 2.4, x: d.entry[0], y: d.entry[1]},
        {t: B.s2End + 1.6, z: 1.2, x: W / 2, y: H * 0.45},
        {t: B.entry, z: 1.75, x: d.entry[0], y: d.entry[1]},
        {t: B.percy - 0.6, z: 1.8, x: d.entry[0], y: d.entry[1] + L.px(30)},
        {t: B.percy + 0.3, z: 1.7, x: d.date[0], y: d.date[1]},
        {t: B.s3End, z: 1.9, x: d.mini[0], y: d.mini[1]},
      ]);
      const entryGlow = p(B.entry, 0.6, EASE.out) * (1 - p(B.percy - 0.8, 0.8));
      return {node: <Desk1822Scene L={L} frame={lf} dateIn={p(B.percy, 1.0, (v) => v)} entryGlow={entryGlow} candle={0.6} />, ...cam, warm: 0.6};
    }

    /* 4. teras Lerici: adegan PSX 3D penuh dari Blender (motion-starters/reverse/WajahDiLukisan/lerici_scene.py).
       Frame 1 video = B.s3End; kembaran 4 frame, kepala menoleh + wajah seram saat hening sudah ada di render. */
    if (t < B.s4Start) {
      const water = p(B.tenggelam, 0.9, EASE.in);
      const black = p(B.tenggelam + 0.85, 0.15, (v) => v);
      return {
        node: (
          <AbsoluteFill style={{backgroundColor: '#05090c'}}>
            <Sequence from={F(B.s3End)} layout="none">
              <OffthreadVideo src={staticFile('3d/wajah/lerici.mp4')} muted style={{width: W, height: H, imageRendering: 'pixelated'}} />
            </Sequence>
            <Tape x={L.px(70)} y={L.px(400)} w={L.px(370)} h={L.px(44)} rot={1}>
              LERICI · JUNI 1822
            </Tape>
          </AbsoluteFill>
        ),
        zoom: 1.0,
        x: 0,
        y: 0,
        water,
        black,
        warm: 0.25,
      };
    }

    /* 5. lab: catatan, cap, landmark, pita bergabung, lalu lampu mati */
    if (t < B.s5Start) {
      const lf = frame - F(B.s4Start);
      const lg = labGeometry(L);
      // titik fokus dibatasi supaya tepi set tidak ikut terlihat saat zoom
      const clampF = (z: number, x: number, y: number) => ({t: 0, z, x: Math.min(W - W / (2 * z), Math.max(W / (2 * z), x)), y: Math.min(H - H / (2 * z), Math.max(H / (2 * z), y))});
      const k = (tt: number, z: number, x: number, y: number) => ({...clampF(z, x, y), t: tt});
      const cam = path([
        k(B.s4Start, 1.3, lg.prints[0], lg.prints[1]),
        k(B.note - 0.2, 1.35, lg.note[0], lg.note[1]),
        k(B.stamp + 0.1, 1.0, W / 2, H / 2),
        k(B.merge - 0.3, 1.05, W / 2, H * 0.47),
        k(B.glow, 1.5, lg.strips[0], lg.strips[1]),
        k(B.labOff, 1.55, lg.strips[0], lg.strips[1]),
      ]);
      const offT = t - B.labOff;
      const light = offT < 0 ? 1 : offT < 0.06 ? 0.2 : offT < 0.18 ? 0.9 : offT < 0.24 ? 0.1 : offT < 0.32 ? 0.6 : 0;
      const fadeIn = 1 - p(B.s4Start, 0.35, EASE.out);
      return {
        node: (
          <LabScene
            L={L}
            frame={lf}
            note={p(B.note, 1.1, (v) => v)}
            stamp={p(B.stamp, 0.18, EASE.in)}
            marks={p(B.marks, 0.6, EASE.out)}
            merge={p(B.merge, 1.3)}
            glow={p(B.glow, 0.5, EASE.out)}
            light={light}
          />
        ),
        ...cam,
        black: Math.max(fadeIn, offT >= 0.4 ? 1 : 0),
        warm: 0.25,
      };
    }

    /* 6. penutup: lukisan dalam gelap, "?" di label, wajah terlihat 4 frame, hitam */
    if (frame < peakF + 4) {
      const g = paintingGeometry(L);
      const lf = frame - F(B.s5Start);
      const cam = path([
        // tata letak lukisan sudah di safe zone; zoom maksimal 1,04 supaya label tetap di atas zona caption
        {t: B.s5Start, z: 1.0, x: W / 2, y: H / 2},
        {t: B.hush2, z: 1.04, x: W / 2, y: H / 2},
        // dorongan cepat 0,5 dtk tepat sebelum "wajahmu"; caption disembunyikan selama dorongan
        {t: B.peak - 0.5, z: 1.04, x: W / 2, y: H / 2},
        {t: B.peak - 0.05, z: 2.3, x: g.faceX, y: g.faceY + L.px(30)},
      ]);
      const q = t >= B.subjQ;
      const blink = t > B.s5Start + 2.5 && t < B.s5Start + 2.7 ? 0.3 : 1;
      return {
        node: <PaintingScene L={L} frame={lf} faceLight={inPeak ? 1 : 0} spot={inPeak ? 0.9 : 0.15} exit subject={q ? '?' : '————'} labelLines={q ? 4 + p(B.subjQ, 0.4, (v) => v) : 99} subjectBlink={blink} />,
        ...(inPeak ? focus(2.3, g.faceX, g.faceY + L.px(30)) : cam),
        black: 1 - p(B.s5Start, 0.8, EASE.out),
      };
    }

    return {node: null, zoom: 1, x: 0, y: 0, black: 1};
  })();

  const sceneBlack = shot.black ?? 0;

  /* ---------- audio helper ---------- */
  const Clip: React.FC<{src: string; from: number; dur?: number; vol?: number | ((f: number) => number); loop?: boolean}> = ({src, from, dur, vol = 1, loop}) => (
    <Sequence from={F(from)} durationInFrames={dur ? Math.max(1, F(dur)) : undefined}>
      <Audio src={staticFile(src)} volume={vol} loop={loop} />
    </Sequence>
  );
  /** naik-tahan-turun (frame lokal) untuk bed ambience */
  const bed = (dur: number, v: number, inS = 0.6, outS = 0.6) => (f: number) =>
    interpolate(f, [0, F(inS), Math.max(F(inS) + 1, F(dur) - F(outS)), F(dur)], [0, v, v, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const BOUNDS = [B.s1End, B.s2End, B.s3End, B.s5Start];

  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      {shot.node && sceneBlack < 1 && (
        <CameraRig frame={frame} zoom={shot.zoom} x={shot.x} y={shot.y} origin={shot.origin} handheld={hh}>
          {shot.node}
        </CameraRig>
      )}

      {/* air naik menutup layar ("ia tenggelam") */}
      {(shot.water ?? 0) > 0 && (
        <svg style={{position: 'absolute', left: 0, top: H * (1 - (shot.water ?? 0) * 1.15), width: W, height: H * 1.2}} viewBox="0 0 1080 2300" preserveAspectRatio="none">
          <path d={`M0 60 Q 180 ${20 + Math.sin(frame / 3) * 30} 360 60 T 720 60 T 1080 60 L1080 2300 L0 2300 Z`} fill="#06141a" opacity="0.96" />
          <path d={`M0 60 Q 180 ${20 + Math.sin(frame / 3) * 30} 360 60 T 720 60 T 1080 60`} stroke="rgba(170,200,205,0.35)" strokeWidth="6" fill="none" />
        </svg>
      )}

      {shot.node && sceneBlack < 1 && <FilmGrade frame={frame} width={width} height={height} grain={grain} vignette={0.75} flicker={0.4} warm={shot.warm ?? 0.55} />}

      {/* caption per frasa: strip mesin tik di atas zona UI platform */}
      {showCaptions &&
        (() => {
          const c = captions.find((x) => t >= x.start && t < x.end + 0.2);
          if (!c || sceneBlack >= 1 || inPeak || (t >= B.peak - 0.5 && t < B.peak)) return null;
          const chars = Math.min(c.text.length, Math.floor(((t - c.start) * fps) / 1.2));
          const fade = t > c.end ? 1 - (t - c.end) / 0.2 : 1;
          const fs = L.px(L.pick({portrait: 36, landscape: 34, square: 34}));
          return (
            // safe zone Shorts/Reels/TikTok (portrait 1080×1920): teks hanya di x 60–960, caption di y 1265–1480
            <div style={{position: 'absolute', left: L.pick({portrait: L.px(60), landscape: L.safe, square: L.safe}), right: L.pick({portrait: L.px(120), landscape: L.safe, square: L.safe}), top: H * L.pick({portrait: 1290 / 1920, landscape: 0.82, square: 0.79}), display: 'flex', justifyContent: 'center', opacity: fade}}>
              <div
                style={{
                  maxWidth: L.pick({portrait: L.px(860), landscape: L.contentWidth * 0.6, square: L.contentWidth * 0.86}),
                  padding: `${L.px(12)}px ${L.px(22)}px`,
                  background: 'rgba(8,6,5,0.74)',
                  borderLeft: `${L.px(4)}px solid ${PAL.string}`,
                  fontFamily: '"Special Elite", "Courier Prime", monospace',
                  fontSize: fs,
                  lineHeight: 1.3,
                  letterSpacing: L.px(1),
                  color: PAL.paper,
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {c.text.slice(0, chars)}
                {chars < c.text.length ? '▮' : ''}
              </div>
            </div>
          );
        })()}

      {sceneBlack > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp01(sceneBlack)}} />}

      {/* statik sesudah puncak: tile grain diperbesar, tanpa filter per frame */}
      {inStatic && (
        // hanya 6 frame, jadi filter kontras di layar penuh masih murah
        <AbsoluteFill style={{backgroundColor: '#111', filter: 'contrast(9) brightness(0.75)'}}>
          <NoiseFill tex={frame % 2 ? 'grain' : 'grain2'} tileSize={L.px(512)} offset={[frame * 37, frame * 53]} opacity={1} blend="normal" />
          <AbsoluteFill style={{background: `repeating-linear-gradient(180deg, rgba(0,0,0,0.5) 0, rgba(0,0,0,0.5) ${L.px(3)}px, transparent ${L.px(3)}px, transparent ${L.px(7)}px)`}} />
        </AbsoluteFill>
      )}

      {/* ===== AUDIO ===== */}
      <Audio src={staticFile('sfx/ripper/tape-click.wav')} volume={0.55} />
      <Clip src="sfx/ripper/tape-hiss.wav" from={0} dur={B.hush} vol={0.05} loop />
      <Clip src="sfx/ripper/tape-hiss.wav" from={B.tenggelam} dur={B.hush2 - B.tenggelam} vol={0.05} loop />
      {/* bed per set */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.leader} dur={B.s2End - B.leader} vol={bed(B.s2End - B.leader, 0.35)} loop />
      <Clip src="sfx/ripper/hum-50hz.wav" from={B.leader} dur={B.s2End - B.leader} vol={bed(B.s2End - B.leader, 0.07)} loop />
      <Clip src="sfx/ripper/amb/candle.wav" from={B.s2End} dur={B.s3End - B.s2End} vol={bed(B.s3End - B.s2End, 0.5, 0.3, 0.3)} loop />
      <Clip src="sfx/wajah/waves.wav" from={B.s3End} dur={B.hush - B.s3End} vol={bed(B.hush - B.s3End, 0.6, 0.4, 0.25)} loop />
      <Clip src="sfx/ripper/amb/wind.wav" from={B.s3End} dur={B.hush - B.s3End} vol={bed(B.hush - B.s3End, 0.25, 0.4, 0.25)} loop />
      <Clip src="sfx/ripper/hum-50hz.wav" from={B.s4Start} dur={B.labOff - B.s4Start} vol={bed(B.labOff - B.s4Start, 0.22, 0.3, 0.05)} loop />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s4Start} dur={B.hush2 - B.s4Start} vol={(f) => interpolate(f, [0, F(B.s5Start - B.s4Start), F(B.hush2 - B.s4Start) - 6, F(B.hush2 - B.s4Start)], [0, 0.22, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/room.wav" from={B.s5Start} dur={B.hush2 - B.s5Start} vol={bed(B.hush2 - B.s5Start, 0.25, 0.6, 0.1)} loop />
      {/* transisi: riser + thud di setiap batas adegan */}
      {BOUNDS.map((b) => (
        <React.Fragment key={b}>
          <Clip src="sfx/wajah/riser.wav" from={b - 0.75} vol={0.7} />
          <Clip src="sfx/ripper/sub-hit.wav" from={b} vol={0.3} />
        </React.Fragment>
      ))}
      <Clip src="sfx/wajah/waterrise.wav" from={B.tenggelam - 0.1} vol={0.8} />
      <Clip src="sfx/wajah/under.wav" from={B.tenggelam + 0.75} vol={0.7} />
      <Clip src="sfx/wajah/flicker.wav" from={B.labOff} vol={0.12} />
      {/* foley */}
      {[0, 0.25, 0.55, 0.8].map((d) => (
        <Clip key={`pen-${d}`} src="sfx/ripper/amb/chalk-tick.wav" from={B.percy + d} vol={0.25} />
      ))}
      {[0.05, 0.4, 0.75].map((d) => (
        <Clip key={`pencil-${d}`} src="sfx/ripper/amb/chalk-tick.wav" from={B.note + d} vol={0.3} />
      ))}
      <Clip src="sfx/wajah/stamp.wav" from={B.stamp + 0.16} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.stamp + 0.16} vol={0.25} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.merge} vol={0.5} />
      {/* bisikan ambience: jarang, jauh */}
      <Clip src="vo/wajah/mix/w2-amb.wav" from={B.turn - 2.2} vol={0.5 * whisperGain} />
      <Clip src="vo/wajah/mix/w2-amb.wav" from={B.double + 0.05} vol={0.6 * whisperGain} />
      {/* kilat lentera: kembaran terlihat 4 frame */}
      <Clip src="sfx/ripper/sub-hit.wav" from={B.double} vol={0.5} />
      <Clip src="sfx/wajah/flicker.wav" from={B.double - 0.08} vol={0.1} />
      {/* narator */}
      {voCfg.clips.map((c) => (
        <Clip key={c.file} src={`vo/wajah/mix/${c.file}.wav`} from={at(c.file)} />
      ))}
      {/* puncak + penutup */}
      <Clip src="sfx/ripper/sub-hit.wav" from={B.peak} vol={0.9} />
      <Sequence from={peakF + 4} durationInFrames={8}>
        <Audio src={staticFile('sfx/ripper/static-burst.wav')} volume={0.45} />
      </Sequence>
      <Clip src="vo/wajah/mix/w1-itukamu.wav" from={B.w1} vol={0.9 * whisperGain + 0.1} />
      <Clip src="sfx/ripper/tape-stop.wav" from={B.stop} vol={0.8} />
    </AbsoluteFill>
  );
};

export const WAJAH_BEATS = B;
