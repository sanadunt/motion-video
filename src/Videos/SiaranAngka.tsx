/**
 * SiaranAngka — "ARSIP 05", short horor ±81 dtk: Siren Head (karangan) → stasiun angka (nyata).
 * Set: src/lib/scenes/angka.tsx. Brief, naskah, storyboard: briefs/SiaranAngka*.md.
 * Siren Head (© Trevor Henderson) TIDAK pernah digambar; hanya namanya di VO, caption, dan tulisan tangan.
 *
 * Satu sumber timing: posisi klip dari briefs/SiaranAngka.vo.json, frasa dari angka-captions.json,
 * kata dari angka-words.json (scripts/vo-align.mjs). Angka yang diketik hanya durasi gerak dan offset SFX.
 * Render Blender (public/3d/angka/) memakai cue yang sama: salju frame 1 = B.s3End, tokoh frame 1 = B.s2End.
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {EASE, ensureFonts, mix, progress, sec, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, NoiseFill, PAL} from '../lib/scenes';
import {clamp01} from '../lib/scenes/sets';
import {
  ArchiveDeskScene,
  ClassroomScene,
  RadioCloseScene,
  RadioRoomScene,
  SnowOverlay,
  archiveGeometry,
  classroomGeometry,
  radioCloseGeometry,
  radioRoomGeometry,
} from '../lib/scenes/angka';
import captions from './angka-captions.json';
import vowords from './angka-words.json';
import voCfg from '../../briefs/SiaranAngka.vo.json';

ensureFonts();

export const siaranAngkaSchema = z.object({
  grain: z.number().min(0).max(1),
  handheld: z.number().min(0).max(1),
  whisperGain: z.number().min(0).max(1),
  captions: z.boolean(),
  durationInSeconds: z.number().min(40).max(120),
});
export type SiaranAngkaProps = z.infer<typeof siaranAngkaSchema>;
export const siaranAngkaDefaults: SiaranAngkaProps = {grain: 0.55, handheld: 0.6, whisperGain: 0.8, captions: true, durationInSeconds: 81};

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
  const s1End = between('raksasa', 'Ia karangan');
  const s2End = between('radio yang', 'Dua ribu');
  const s3End = between('ia mencatat', 'Ia tertangkap'); // = T0 salju_scene.py
  const stop = cap('Tak ada yang').end; // dengungan + lampu antena padam
  const peak = cap('untuk siapa').end + 1.0;
  return {
    siren: word('01-sekolah', 'siren'),
    chalk1: word('01-sekolah', 'angka'),
    s1End,
    stamp: word('02-karangan', 'karangan'),
    date: word('02-karangan', 'dua'),
    nyata: word('02-karangan', 'nyata'),
    radio: word('02-karangan', 'radio'),
    s2Cut: word('02-karangan', 'radio') + 0.45, // match-cut lampu power → kenop radio
    s2End,
    folder: word('03-montes', 'dua'),
    amerika: cap('FBI').end,
    tiga: word('03-montes', 'tiga'),
    catat: word('03-montes', 'mencatat'),
    s3End,
    freq: word('04-buzzer', 'frekuensi'),
    empat: word('04-buzzer', 'empat'),
    stop,
    black4: stop + 8 / 30,
    s5Start: at('05-penutup') - 0.4,
    siaran: word('05-penutup', 'siarannya'),
    angka5: word('05-penutup', 'angkaangka'),
    hush: cap('untuk siapa').end,
    peak,
    w1: peak + 0.7,
    tapeStop: peak + 2.6,
  };
})();

export const SiaranAngka: React.FC<SiaranAngkaProps> = ({grain, handheld, whisperGain, captions: showCaptions}) => {
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

  /** Kamera: fokus ke titik (px, py) dengan zoom z; titik dibatasi supaya tepi set tidak terlihat. */
  const focus = (z: number, px: number, py: number) => {
    const cx = Math.min(W - W / (2 * z), Math.max(W / (2 * z), px));
    const cy = Math.min(H - H / (2 * z), Math.max(H / (2 * z), py));
    return {zoom: z, x: -z * (cx - W / 2), y: -z * (cy - H / 2), origin: '50% 50%'};
  };
  const path = (pts: Array<{t: number; z: number; x: number; y: number}>) => {
    const ts = pts.map((q) => q.t);
    const o = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: EASE.inOut};
    return focus(interpolate(t, ts, pts.map((q) => q.z), o), interpolate(t, ts, pts.map((q) => q.x), o), interpolate(t, ts, pts.map((q) => q.y), o));
  };

  type Shot = {node: React.ReactNode; zoom: number; x: number; y: number; origin?: string; black?: number; white?: number; warm?: number; hideCaption?: boolean};
  const cg = classroomGeometry(L);
  const noteC: [number, number] = [cg.note.x + cg.note.w / 2, cg.note.y + cg.note.h * 0.4];
  const boardC: [number, number] = [cg.board.x + cg.board.w / 2, cg.board.y + cg.board.h / 2];
  const radioC: [number, number] = [cg.radio.x + cg.radio.w / 2, cg.radio.y + cg.radio.w * 0.28];

  const shot = ((): Shot => {
    /* 1. kelas malam: kertas lipat terbuka di "Siren Head", angka kapur di "angka" */
    if (t < B.s1End) {
      const cam = path([
        {t: 0, z: 1.0, x: W / 2, y: H / 2},
        {t: B.siren - 1.2, z: 1.08, x: W / 2, y: H * 0.52},
        {t: B.siren + 0.3, z: 1.4, x: noteC[0], y: noteC[1]},
        {t: B.chalk1 - 0.5, z: 1.42, x: noteC[0], y: noteC[1]},
        {t: B.chalk1 + 0.4, z: 1.58, x: boardC[0], y: boardC[1]},
        {t: B.s1End, z: 1.64, x: boardC[0], y: boardC[1]},
      ]);
      // kedip lampu: kelas mati sesaat, adegan berganti saat menyala
      const d = t - (B.s1End - 0.35);
      const flick = d < 0 ? 0 : d < 0.07 ? 0.85 : d < 0.13 ? 0.1 : d < 0.2 ? 0.9 : 1;
      return {
        node: <ClassroomScene L={L} frame={frame} label ghost={1} chalk={p(B.chalk1, 1.1, (v) => v)} noteOpen={p(B.siren, 0.6, EASE.out)} radioGlow={0.3} />,
        ...cam,
        black: flick,
      };
    }

    /* 2a. meja arsip: cap di "karangan", tanggal diketik di "dua ribu…", dorong ke lampu power di "radio" */
    if (t < B.s2Cut) {
      const ag = archiveGeometry(L);
      const scr: [number, number] = [W / 2, ag.mon.y + ag.mon.h * 0.42];
      const led: [number, number] = [ag.mon.x + ag.mon.w * 0.92 - L.px(7), ag.mon.y + ag.mon.h * 0.955 - L.px(7)];
      const lf = frame - F(B.s1End);
      const cam = path([
        {t: B.s1End, z: 1.0, x: W / 2, y: H * 0.45},
        {t: B.stamp + 0.3, z: 1.12, x: scr[0], y: scr[1]},
        {t: B.date + 1.4, z: 1.2, x: scr[0], y: scr[1]},
        {t: B.radio - 0.2, z: 1.2, x: scr[0], y: scr[1] + L.px(60)},
        {t: B.s2Cut, z: 4.2, x: led[0], y: led[1]},
      ]);
      return {
        node: <ArchiveDeskScene L={L} frame={lf} stamp={p(B.stamp, 0.18, EASE.in)} dateIn={p(B.date, 1.2, (v) => v)} />,
        ...cam,
        black: 1 - p(B.s1End, 0.25, EASE.out),
        warm: 0.4,
        hideCaption: t > B.radio,
      };
    }

    /* 2b. close-up radio: jarum menyapu ke 4,625 MHz */
    if (t < B.s2End) {
      const rg = radioCloseGeometry(L);
      const lf = frame - F(B.s2Cut);
      const sweep = p(B.s2Cut, 1.3, EASE.out);
      const mhz = mix(sweep, 7.4, 4.625);
      const cam = path([
        {t: B.s2Cut, z: 1.5, x: rg.x + rg.w * 0.88, y: rg.y + rg.w * 0.34},
        {t: B.s2Cut + 0.9, z: 1.15, x: W / 2, y: rg.y + rg.w * 0.28},
        {t: B.s2End, z: 1.3, x: rg.x + rg.w * 0.65, y: rg.y + rg.w * 0.12},
      ]);
      const outBlack = p(B.s2End - 0.27, 0.27, (v) => v);
      return {node: <RadioCloseScene L={L} frame={lf} mhz={mhz} glow={0.4 + 0.6 * sweep} readout={sweep > 0.95 ? '4625' : ''} />, ...cam, black: outBlack, warm: 0.6};
    }

    /* 3. kamar 2001: dari kerai turun ke meja; kalender di "tiga malam"; angka ditulis di "mencatat"; menembus kertas jadi putih */
    if (t < B.s3End) {
      const rg = radioRoomGeometry(L);
      const lf = frame - F(B.s2End);
      const winC: [number, number] = [W * 0.29, H * 0.2];
      const calC: [number, number] = [rg.cal.x + rg.cal.w / 2, rg.cal.y + rg.cal.h / 2];
      const padC: [number, number] = [rg.pad.x + rg.pad.w * 0.45, rg.pad.y + rg.pad.h * 0.35];
      const cam = path([
        {t: B.s2End, z: 1.35, x: winC[0], y: winC[1]},
        {t: B.folder + 1.2, z: 1.0, x: W / 2, y: H / 2},
        {t: B.tiga - 0.5, z: 1.05, x: W / 2, y: H * 0.48},
        {t: B.tiga + 0.6, z: 1.45, x: calC[0], y: calC[1]},
        {t: B.catat - 0.4, z: 1.45, x: calC[0], y: calC[1]},
        {t: B.catat + 0.6, z: 1.45, x: padC[0], y: padC[1]},
        {t: B.s3End - 0.5, z: 1.55, x: padC[0], y: padC[1]},
        {t: B.s3End, z: 4.0, x: padC[0], y: padC[1]},
      ]);
      // tokoh on twos: frame lokal ganjil 1,3,5,… dari render montes_char.py (frame_step 2)
      const odd = Math.min(527, Math.floor(lf / 2) * 2 + 1);
      const src = `3d/angka/montes/f_${String(odd).padStart(4, '0')}.png`;
      return {
        node: (
          <RadioRoomScene
            L={L}
            frame={lf}
            womanSrc={src}
            folder={p(B.folder, 0.5, EASE.out)}
            calCircles={p(B.tiga, 1.0, (v) => v)}
            rows={p(B.catat, 2.2, (v) => v) * 3}
          />
        ),
        ...cam,
        black: 1 - p(B.s2End, 0.3, EASE.out),
        white: p(B.s3End - 0.3, 0.3, EASE.in),
        warm: 0.55,
      };
    }

    /* 4. padang salju (Blender): frame 1 video = B.s3End; dengungan berhenti di B.stop, dip-to-black 8 frame */
    if (t < B.s5Start) {
      const lf = frame - F(B.s3End);
      return {
        node: (
          <AbsoluteFill style={{backgroundColor: '#05090c'}}>
            <Sequence from={F(B.s3End)} layout="none">
              <OffthreadVideo src={staticFile('3d/angka/salju.mp4')} muted style={{width: W, height: H, imageRendering: 'pixelated'}} />
            </Sequence>
            <SnowOverlay L={L} frame={lf} freq={p(B.freq, 0.5, EASE.out)} count={p(B.empat, 1.6, EASE.out)} buzz={t < B.stop ? 1 : 0} />
          </AbsoluteFill>
        ),
        zoom: 1,
        x: 0,
        y: 0,
        white: 1 - p(B.s3End, 0.35, EASE.out),
        black: p(B.stop, 8 / 30, (v) => v),
        warm: 0.25,
      };
    }

    /* 5. kelas gelap: radio menyala sendiri di "Siarannya", papan ditulis ulang di "angka-angka", puncak 4 frame */
    if (frame < peakF + 4) {
      const lf = frame - F(B.s5Start);
      const on = t - B.siaran;
      const radioGlow = on < 0 ? 0.12 : on < 0.08 ? 0.9 : on < 0.16 ? 0.2 : on < 0.3 ? 1 : on < 0.36 ? 0.4 : 1;
      const erase = p(B.angka5 - 0.1, 0.25, (v) => v);
      const rewrite = p(B.angka5 + 0.2, 1.2, (v) => v);
      const chalk = t < B.angka5 - 0.1 ? 1 : erase < 1 ? 1 - erase : rewrite;
      const cam = path([
        {t: B.s5Start, z: 1.02, x: W / 2, y: H / 2},
        {t: B.siaran, z: 1.08, x: W / 2, y: H * 0.47},
        {t: B.angka5 - 0.3, z: 1.2, x: boardC[0], y: boardC[1] + L.px(120)},
        {t: B.hush, z: 1.4, x: radioC[0], y: radioC[1]},
        {t: B.peak - 0.5, z: 1.45, x: radioC[0], y: radioC[1]},
      ]);
      return {
        node: <ClassroomScene L={L} frame={lf} dark={inPeak ? 0.2 : 1} radioGlow={radioGlow} chalk={chalk} noteOpen={inPeak ? 1 : 0} noteText={['', 'untukmu.']} />,
        ...(inPeak ? focus(1.75, noteC[0], noteC[1] + L.px(30)) : cam),
        black: 1 - p(B.s5Start, 0.6, EASE.out),
        hideCaption: t >= B.peak - 0.5,
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
  const bed = (dur: number, v: number, inS = 0.6, outS = 0.6) => (f: number) =>
    interpolate(f, [0, F(inS), Math.max(F(inS) + 1, F(dur) - F(outS)), F(dur)], [0, v, v, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const BOUNDS = [B.s1End, B.s2End, B.s3End];

  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      {shot.node && sceneBlack < 1 && (
        <CameraRig frame={frame} zoom={shot.zoom} x={shot.x} y={shot.y} origin={shot.origin} handheld={hh}>
          {shot.node}
        </CameraRig>
      )}
      {shot.node && sceneBlack < 1 && <FilmGrade frame={frame} width={width} height={height} grain={grain} vignette={0.75} flicker={0.4} warm={shot.warm ?? 0.55} />}
      {inPeak && <AbsoluteFill style={{backgroundColor: '#fff6e0', opacity: frame === peakF ? 0.55 : 0.12}} />}

      {/* caption per frasa: strip mesin tik di zona caption Shorts (y 1265–1480) */}
      {showCaptions &&
        (() => {
          const c = captions.find((x) => t >= x.start && t < x.end + 0.2);
          if (!c || sceneBlack >= 1 || shot.hideCaption || inPeak) return null;
          const chars = Math.min(c.text.length, Math.floor(((t - c.start) * fps) / 1.2));
          const fade = t > c.end ? 1 - (t - c.end) / 0.2 : 1;
          const fs = L.px(L.pick({portrait: 36, landscape: 34, square: 34}));
          return (
            <div style={{position: 'absolute', left: L.pick({portrait: L.px(60), landscape: L.safe, square: L.safe}), right: L.pick({portrait: L.px(120), landscape: L.safe, square: L.safe}), top: H * L.pick({portrait: 1290 / 1920, landscape: 0.82, square: 0.79}), display: 'flex', justifyContent: 'center', opacity: fade}}>
              <div
                style={{
                  maxWidth: L.pick({portrait: L.px(860), landscape: L.contentWidth * 0.6, square: L.contentWidth * 0.86}),
                  padding: `${L.px(12)}px ${L.px(22)}px`,
                  background: 'rgba(8,6,5,0.74)',
                  borderLeft: `${L.px(4)}px solid #E8A33D`,
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

      {(shot.white ?? 0) > 0 && <AbsoluteFill style={{backgroundColor: '#eef2f4', opacity: clamp01(shot.white ?? 0)}} />}
      {sceneBlack > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp01(sceneBlack)}} />}

      {/* statik sesudah puncak */}
      {inStatic && (
        <AbsoluteFill style={{backgroundColor: '#111', filter: 'contrast(9) brightness(0.75)'}}>
          <NoiseFill tex={frame % 2 ? 'grain' : 'grain2'} tileSize={L.px(512)} offset={[frame * 37, frame * 53]} opacity={1} blend="normal" />
          <AbsoluteFill style={{background: `repeating-linear-gradient(180deg, rgba(0,0,0,0.5) 0, rgba(0,0,0,0.5) ${L.px(3)}px, transparent ${L.px(3)}px, transparent ${L.px(7)}px)`}} />
        </AbsoluteFill>
      )}

      {/* ===== AUDIO ===== */}
      <Audio src={staticFile('sfx/ripper/tape-click.wav')} volume={0.55} />
      <Clip src="sfx/ripper/tape-hiss.wav" from={0} dur={B.stop} vol={0.05} loop />
      {/* 1. kelas */}
      <Clip src="sfx/ripper/amb/room.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.32, 0.3, 0.2)} loop />
      <Clip src="sfx/ripper/amb/wind.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.12, 0.3, 0.2)} loop />
      <Clip src="sfx/angka/sw-static.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.06, 0.3, 0.2)} loop />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.siren - 0.05} vol={0.5} />
      <Clip src="sfx/angka/chalk.wav" from={B.chalk1} vol={0.45} />
      <Clip src="vo/angka/mix/w2-angka.wav" from={cap('raksasa').end + 0.05} vol={0.45 * whisperGain} />
      <Clip src="sfx/wajah/flicker.wav" from={B.s1End - 0.35} vol={0.14} />
      {/* 2. arsip + radio */}
      <Clip src="sfx/angka/crt.wav" from={B.s1End} dur={B.s2Cut - B.s1End} vol={bed(B.s2Cut - B.s1End, 0.22, 0.3, 0.1)} loop />
      <Clip src="sfx/ripper/amb/room.wav" from={B.s1End} dur={B.s2End - B.s1End} vol={bed(B.s2End - B.s1End, 0.2, 0.3, 0.3)} loop />
      <Clip src="sfx/wajah/stamp.wav" from={B.stamp + 0.16} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.stamp + 0.16} vol={0.25} />
      {Array.from({length: 9}, (_, i) => (
        <Clip key={`key-${i}`} src="sfx/angka/key.wav" from={B.date + i * 0.13} vol={0.35} />
      ))}
      <Clip src="sfx/wajah/riser.wav" from={B.s2Cut - 0.75} vol={0.6} />
      <Clip src="sfx/angka/tune.wav" from={B.s2Cut} vol={0.55} />
      <Clip src="sfx/angka/sw-static.wav" from={B.s2Cut} dur={B.s2End - B.s2Cut} vol={bed(B.s2End - B.s2Cut, 0.18, 0.2, 0.2)} loop />
      {/* 3. kamar 2001 */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s2End} dur={B.s3End - B.s2End} vol={bed(B.s3End - B.s2End, 0.3, 0.4, 0.2)} loop />
      <Clip src="sfx/angka/sw-static.wav" from={B.s2End} dur={B.s3End - B.s2End} vol={bed(B.s3End - B.s2End, 0.08, 0.4, 0.2)} loop />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.folder} vol={0.5} />
      <Clip src="vo/angka/mix/r1-atencion.wav" from={B.amerika + 0.1} vol={0.5} />
      <Clip src="sfx/angka/pencil.wav" from={B.tiga + 0.1} vol={0.35} />
      <Clip src="sfx/angka/pencil.wav" from={B.catat} vol={0.4} />
      <Clip src="sfx/angka/pencil.wav" from={B.catat + 1.1} vol={0.4} />
      {/* 4. salju: dengungan sintesis seirama lampu antena (siklus 72 frame, frame 1 = nyala) */}
      <Clip src="sfx/angka/snow-wind.wav" from={B.s3End} dur={B.stop - B.s3End} vol={bed(B.stop - B.s3End, 0.4, 0.3, 0.02)} loop />
      <Clip src="sfx/angka/buzz-cycle.wav" from={B.s3End} dur={B.stop - B.s3End} vol={0.22} loop />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s3End} dur={B.stop - B.s3End} vol={(f) => interpolate(f, [0, F(B.stop - B.s3End)], [0.05, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.stop} vol={0.6} />
      {/* 5. kelas gelap */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s5Start} dur={B.hush - B.s5Start} vol={bed(B.hush - B.s5Start, 0.22, 0.6, 0.05)} loop />
      <Clip src="sfx/angka/radio-on.wav" from={B.siaran} vol={0.6} />
      <Clip src="sfx/angka/sw-static.wav" from={B.siaran + 0.1} dur={B.hush - B.siaran - 0.1} vol={(f) => interpolate(f, [0, F(B.hush - B.siaran - 0.1) - 3, F(B.hush - B.siaran - 0.1)], [0.08, 0.2, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      <Clip src="vo/angka/mix/r2-angka.wav" from={cap('Siarannya').end + 0.1} vol={0.32} />
      <Clip src="sfx/angka/chalk.wav" from={B.angka5 + 0.2} vol={0.4} />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s5Start} dur={B.hush - B.s5Start} vol={(f) => interpolate(f, [0, F(B.hush - B.s5Start) - 6, F(B.hush - B.s5Start)], [0.08, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      {/* transisi: riser + thud di batas adegan */}
      {BOUNDS.map((b) => (
        <React.Fragment key={b}>
          <Clip src="sfx/wajah/riser.wav" from={b - 0.75} vol={0.6} />
          <Clip src="sfx/ripper/sub-hit.wav" from={b} vol={0.3} />
        </React.Fragment>
      ))}
      {/* narator */}
      {voCfg.clips.map((c) => (
        <Clip key={c.file} src={`vo/angka/mix/${c.file}.wav`} from={at(c.file)} />
      ))}
      {/* puncak + penutup */}
      <Clip src="sfx/ripper/sub-hit.wav" from={B.peak} vol={0.9} />
      <Sequence from={peakF + 4} durationInFrames={8}>
        <Audio src={staticFile('sfx/ripper/static-burst.wav')} volume={0.45} />
      </Sequence>
      <Clip src="vo/angka/mix/w1-untukmu.wav" from={B.w1} vol={Math.min(1, 1.2 * whisperGain + 0.1)} />
      <Clip src="sfx/ripper/tape-stop.wav" from={B.tapeStop} vol={0.8} />
    </AbsoluteFill>
  );
};

export const ANGKA_BEATS = B;
