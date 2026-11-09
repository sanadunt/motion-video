/**
 * RipperTape v2 — "ARSIP 03 / WHITECHAPEL 1888", analog horror berbasis adegan.
 * Set: src/lib/scenes/sets.tsx. Storyboard: briefs/RipperTape.storyboard.md.
 * Semua waktu ditulis dalam detik global (B) dan dikonversi ke frame; VO sudah diukur
 * (briefs/RipperTape.md), jangan geser tanpa mengukur ulang.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {EASE, ensureFonts, mix, progress, sec, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, PAL} from '../lib/scenes';
import captions from './ripper-captions.json';
import vowords from './ripper-words.json';
import {BoardScene, CHALK_TEXT, DoorScene, FileScene, LETTER_LINES, LetterScene, StreetScene, WallScene, boardGeometry, clamp01} from '../lib/scenes/sets';

ensureFonts();

export const ripperTapeSchema = z.object({
  accent: zColor(),
  grain: z.number().min(0).max(1),
  handheld: z.number().min(0).max(1),
  whisperGain: z.number().min(0).max(1),
  durationInSeconds: z.number().min(45).max(240),
});
export type RipperTapeProps = z.infer<typeof ripperTapeSchema>;
export const ripperTapeDefaults: RipperTapeProps = {
  accent: '#B3301F',
  grain: 0.55,
  handheld: 0.6,
  whisperGain: 0.6,
  durationInSeconds: 138,
};

/**
 * Satu sumber timing: awal frasa dari ripper-captions.json dan waktu kata dari ripper-words.json
 * (keduanya dibuat scripts/vo-align.mjs dari whisper + jeda sunyi). Waktu kata whisper rata-rata
 * 0,2 dtk setelah kata mulai terdengar, jadi pemicu visual per kata dikurangi WORD_LEAD.
 */
const WORD_LEAD = 0.2;
const cue = (prefix: string) => {
  const c = captions.find((x) => x.text.startsWith(prefix));
  if (!c) throw new Error(`cue tidak ditemukan: ${prefix}`);
  return c.start;
};
const word = (clip: string, text: string, nth = 0) => {
  const w = vowords.filter((x) => x.clip === clip && x.text === text)[nth];
  if (!w) throw new Error(`kata tidak ditemukan: ${clip}/${text}`);
  return w.t - WORD_LEAD;
};

/** BEATS (detik global). Batas adegan tetap; pemicu di dalam adegan diturunkan dari VO. */
const B = {
  leader: 0.6,
  vo1: 1.0,
  boardPush: cue('Dan satu surat') + 0.5,
  merah: word('01-hook', 'merah'),
  board1End: 12.8,
  vo2: 13.0,
  sheet2: cue('Delapan hari kemudian'),
  sheet3: cue('Elizabeth Stride'),
  sheet4: cue('Catherine Eddowes'),
  fileEnd: 42.0,
  vo3: 42.3,
  streetEnd: cue('seseorang menulis') - 0.3,
  chalkIn: word('03-grafiti', 'menulis'),
  chalkDone: word('03-grafiti', 'menulis') + 3.2,
  erase: cue('Polisi menghapusnya') + 0.5,
  wallEnd: 61.2,
  letterStart: 61.4,
  vo4: 61.5,
  stainFrom: word('04-surat', 'kotak'),
  stainTo: word('04-surat', 'ginjal') + 1.0,
  paperIn: cue('dan sepucuk surat'),
  writeStart: cue('dan sepucuk surat') + 1.0,
  writeEnd: cue('From Hell') - 0.8,
  fromHell: cue('From Hell'),
  silence: 89.6,
  vo5: 91.1,
  feet: cue('Dia ditemukan') + 1.0,
  leak: word('05-kelly', 'pintunya') - 2.0,
  peak: 112.2,
  vo6: 113.5,
  qCard: cue('Tapi tidak ada') + 0.2,
  endCard: 133.5,
  lampOff: 134.5,
  w4: 135.0,
  stop: 137.5,
};
/** Baris formulir lembar Nichols (detik relatif awal adegan berkas): diketik saat diucapkan. */
const SHEET1_STARTS = (() => {
  const rel = (s: number) => s - B.board1End;
  const name = rel(cue('Mary Ann Nichols'));
  return [rel(cue('Tiga puluh satu')), rel(cue('Pukul')), rel(cue("Buck's Row")), name, name + 0.6, name + 1.1, name + 1.6, name + 1.9, name + 2.2];
})();
const VO = {vo1: 11.2, vo2: 28.52, vo3: 18.4, vo4: 27.72, vo5: 20.56, vo6: 19.16, w3: 2.04, w4: 1.92};
const CHALK_LEN = CHALK_TEXT.join('').length;

export const RipperTape: React.FC<RipperTapeProps> = ({grain, handheld, whisperGain}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = useLayout();
  const t = frame / fps;
  const F = (s: number) => sec(s, fps);
  const hh = L.px(2.6) * handheld;
  const peakF = F(B.peak);
  const inPeak = frame >= peakF && frame < peakF + 4;
  const inStatic = frame >= peakF + 4 && frame < peakF + 10;

  /* ---------- pilih adegan + kamera ---------- */
  type Shot = {node: React.ReactNode; zoom: number; x: number; y: number; origin?: string; black?: number};
  const shot = ((): Shot => {
    if (t < B.leader) return {node: null, zoom: 1, x: 0, y: 0, black: 1};

    if (t < B.board1End) {
      const lf = frame - F(B.leader);
      const lamp = progress(frame, F(B.leader), F(0.9), EASE.out);
      const slow = mix(progress(frame, F(B.leader), F(B.board1End - B.leader), EASE.inOut), 1.0, 1.08);
      const push = progress(frame, F(B.boardPush), F(Math.max(1.5, B.merah - B.boardPush)), EASE.inOut);
      const {envelope} = boardGeometry(L);
      const ex = envelope.x + envelope.w / 2;
      const ey = envelope.y + envelope.h / 2;
      const ox = mix(push, L.width / 2, ex);
      const oy = mix(push, L.height / 2, ey);
      return {node: <BoardScene L={L} frame={lf} lamp={lamp} />, zoom: mix(push, slow, 1.75), x: 0, y: 0, origin: `${ox}px ${oy}px`};
    }

    if (t < B.fileEnd) {
      const starts = [B.board1End, B.sheet2, B.sheet3, B.sheet4];
      let active = 0;
      for (let i = 1; i < starts.length; i++) if (t >= starts[i]) active = i;
      const lt = t - starts[active];
      const lf = frame - F(B.board1End);
      // tilt turun mengikuti baris; lembar baru: kembali ke atas lalu turun pelan
      const y =
        active === 0
          ? interpolate(lt, [0, 4, 12, 17], [L.px(90), L.px(60), -L.px(40), -L.px(150)], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          : interpolate(lt, [0, 0.5, 4], [-L.px(150), L.px(60), -L.px(60)], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return {node: <FileScene L={L} frame={lf} active={active} t={lt} firstStarts={SHEET1_STARTS} />, zoom: 1.12, x: 0, y};
    }

    if (t < B.streetEnd) {
      const lf = frame - F(B.fileEnd);
      const p = progress(frame, F(B.fileEnd), F(B.streetEnd - B.fileEnd), EASE.inOut);
      return {node: <StreetScene L={L} frame={lf} dolly={mix(p, -L.px(70), L.px(70))} />, zoom: 1.06, x: 0, y: 0};
    }

    if (t < B.wallEnd) {
      const lf = frame - F(B.streetEnd);
      const chalkChars = Math.floor(progress(frame, F(B.chalkIn), F(B.chalkDone - B.chalkIn), (v) => v) * CHALK_LEN);
      const erase = progress(frame, F(B.erase), F(0.8), EASE.in);
      const hand = progress(frame, F(B.erase - 0.1), F(1.0), (v) => v);
      const push = progress(frame, F(B.chalkIn), F(4.0), EASE.inOut);
      const drift = progress(frame, F(B.erase + 0.8), F(B.wallEnd - B.erase - 1.0), EASE.inOut);
      const black = progress(frame, F(B.wallEnd - 0.2), F(0.2), EASE.in);
      const apronY = L.height * L.pick({portrait: 0.34, landscape: 0.26, square: 0.3});
      return {node: <WallScene L={L} frame={lf} chalkChars={chalkChars} erase={erase} hand={hand} />, zoom: mix(push, 1.0, 1.14) + drift * 0.12, x: 0, y: mix(drift, mix(push, L.px(40), -L.px(30)), -apronY), origin: '45% 40%', black};
    }

    if (t < B.silence) {
      const lf = frame - F(B.letterStart);
      const boxOnly = t < B.paperIn;
      const paperIn = progress(frame, F(B.paperIn), F(0.8), EASE.out);
      const written = progress(frame, F(B.writeStart), F(B.writeEnd - B.writeStart), (v) => v) * LETTER_LINES.length;
      const header = progress(frame, F(B.fromHell), F(0.6), EASE.out);
      const candle = interpolate(t, [B.letterStart, 84, B.silence], [0.3, 0.45, 1.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const boxPush = mix(progress(frame, F(B.letterStart), F(B.paperIn - B.letterStart), EASE.inOut), 1.05, 1.35);
      const stain = progress(frame, F(B.stainFrom), F(B.stainTo - B.stainFrom), EASE.inOut);
      const fs = L.px(L.pick({portrait: 40, landscape: 36, square: 36}));
      const follow = -Math.min(L.px(560), Math.max(0, written - 5) * fs * 1.65 * 0.75);
      const snap = progress(frame, F(B.fromHell), F(0.35), EASE.out);
      const zoom = boxOnly ? boxPush : mix(snap, 1.15, 1.32);
      const y = boxOnly ? 0 : mix(snap, follow, L.px(200));
      const fadeIn = 1 - progress(frame, F(B.letterStart), F(0.25), EASE.out);
      return {node: <LetterScene L={L} frame={lf} boxOnly={boxOnly} paperIn={paperIn} written={written} header={header} candle={candle} stain={stain} />, zoom, x: 0, y, origin: boxOnly ? '50% 50%' : snap > 0 ? '38% 28%' : '50% 30%', black: fadeIn};
    }

    if (t < B.vo5) return {node: null, zoom: 1, x: 0, y: 0, black: 1};

    if (t < B.vo6) {
      const lf = frame - F(B.vo5);
      const push = progress(frame, F(B.vo5), F(B.peak - B.vo5), EASE.inOut);
      const feet = mix(progress(frame, F(B.feet), F(0.5), EASE.inOut), 0, L.px(34));
      const leakBoost = progress(frame, F(B.leak), F(B.peak - B.leak), EASE.in) * 0.25;
      const crack = inPeak ? (frame - peakF + 1) / 4 : 0;
      const black = frame >= peakF + 10 ? 1 : 0;
      const kx = L.width * 0.5;
      const ky = L.height * L.pick({portrait: 0.5, landscape: 0.52, square: 0.5});
      // puncak: cut ke wide 4 frame supaya celah pintu yang terbuka terlihat
      return {node: <DoorScene L={L} frame={lf} crack={crack} feet={feet} leakBoost={leakBoost} />, zoom: inPeak ? 1.0 : mix(push, 1.0, 1.6), x: 0, y: 0, origin: inPeak ? '50% 50%' : `${kx}px ${ky}px`, black};
    }

    if (t < B.lampOff + 1.2) {
      const lf = frame - F(B.vo6);
      const pull = progress(frame, F(B.vo6), F(B.endCard - B.vo6), EASE.inOut);
      const qPop = progress(frame, F(B.qCard), F(0.25), EASE.outBack);
      const lamp = mix(pull, 1.0, 0.65) * (1 - progress(frame, F(B.lampOff), F(1.0), EASE.in));
      const blur = mix(progress(frame, F(B.qCard - 1), F(1.5), EASE.inOut), L.px(0.4), L.px(2.2));
      return {node: <BoardScene L={L} frame={lf} closing lamp={lamp} qPop={qPop} cardBlur={blur} />, zoom: mix(pull, 1.28, 1.0), x: 0, y: 0, origin: '50% 45%'};
    }

    return {node: null, zoom: 1, x: 0, y: 0, black: 1};
  })();

  const sceneBlack = shot.black ?? 0;
  const tearSlices = inPeak
    ? [
        {top: 0, h: 0.33, dx: L.px(mix(random(`tear-a-${frame}`), -40, 40))},
        {top: 0.33, h: 0.3, dx: L.px(mix(random(`tear-b-${frame}`), -40, 40))},
        {top: 0.63, h: 0.37, dx: L.px(mix(random(`tear-c-${frame}`), -40, 40))},
      ]
    : null;

  const rig = (dx = 0) => (
    <CameraRig frame={frame} zoom={shot.zoom} x={shot.x + dx} y={shot.y} origin={shot.origin} handheld={hh}>
      {shot.node}
    </CameraRig>
  );

  /* ---------- audio helper ---------- */
  const Clip: React.FC<{src: string; at: number; dur?: number; vol?: number | ((f: number) => number); loop?: boolean}> = ({src, at, dur, vol = 1, loop}) => (
    <Sequence from={F(at)} durationInFrames={dur ? F(dur) : undefined}>
      <Audio src={staticFile(src)} volume={vol} loop={loop} />
    </Sequence>
  );
  const whisperAt = (name: string, at: number, vol: number) => <Clip key={name + at} src={`vo/ripper/amb/${name}.wav`} at={at} dur={3} vol={vol * whisperGain} />;

  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      {t < B.leader && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: '"Courier Prime", monospace', fontSize: L.px(160), color: 'rgba(217,203,176,0.5)'}}>
          {3 - Math.min(2, Math.floor(t / 0.2))}
        </AbsoluteFill>
      )}

      {shot.node &&
        sceneBlack < 1 &&
        (tearSlices
          ? tearSlices.map((s) => (
              <AbsoluteFill key={s.top} style={{clipPath: `inset(${s.top * 100}% 0 ${(1 - s.top - s.h) * 100}% 0)`}}>
                {rig(s.dx)}
              </AbsoluteFill>
            ))
          : rig())}

      {shot.node && sceneBlack < 1 && <FilmGrade frame={frame} width={width} height={height} grain={grain} vignette={0.75} flicker={0.4} warm={0.55} />}

      {/* caption per frasa: strip mesin tik di atas zona UI platform */}
      {(() => {
        const cap = captions.find((c) => t >= c.start && t < c.end + 0.2);
        if (!cap || sceneBlack >= 1) return null;
        const chars = Math.min(cap.text.length, Math.floor((t - cap.start) * fps / 1.2));
        const fade = t > cap.end ? 1 - (t - cap.end) / 0.2 : 1;
        const fs = L.px(L.pick({portrait: 36, landscape: 34, square: 34}));
        return (
          <div
            style={{
              position: 'absolute',
              left: L.safe,
              right: L.safe,
              top: L.height * L.pick({portrait: 0.74, landscape: 0.82, square: 0.79}),
              display: 'flex',
              justifyContent: 'center',
              opacity: fade,
            }}
          >
            <div
              style={{
                maxWidth: L.contentWidth * L.pick({portrait: 0.9, landscape: 0.6, square: 0.86}),
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
              {cap.text.slice(0, chars)}
              {chars < cap.text.length ? '▮' : ''}
            </div>
          </div>
        );
      })()}
      {sceneBlack > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: sceneBlack}} />}

      {inStatic && (
        <svg style={{position: 'absolute', inset: 0}} width={width} height={height}>
          <filter id="static">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed={frame} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="2.2" intercept="-0.4" />
              <feFuncG type="linear" slope="2.2" intercept="-0.4" />
              <feFuncB type="linear" slope="2.2" intercept="-0.4" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#static)" />
        </svg>
      )}

      {/* ===== AUDIO ===== */}
      <Audio src={staticFile('sfx/ripper/tape-click.wav')} volume={0.6} />
      <Clip src="sfx/ripper/tape-hiss.wav" at={0} dur={B.silence} vol={0.08} loop />
      <Clip src="sfx/ripper/tape-hiss.wav" at={B.vo5} dur={B.stop - B.vo5} vol={0.08} loop />
      {/* bed per set */}
      <Clip src="sfx/ripper/amb/room.wav" at={B.leader} dur={B.fileEnd - B.leader} vol={(f) => interpolate(f, [0, 30], [0, 0.45], {extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/rain.wav" at={B.fileEnd} dur={B.wallEnd - B.fileEnd} vol={0.5} loop />
      <Clip src="sfx/ripper/amb/wind.wav" at={B.fileEnd} dur={B.wallEnd - B.fileEnd} vol={(f) => interpolate(f, [0, 20, F(B.wallEnd - B.fileEnd) - 10, F(B.wallEnd - B.fileEnd)], [0, 0.35, 0.35, 0], {extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/candle.wav" at={B.letterStart} dur={B.silence - B.letterStart} vol={0.55} loop />
      <Clip src="sfx/ripper/amb/drone.wav" at={76} dur={B.silence - 76} vol={(f) => interpolate(f, [0, F(B.silence - 76)], [0, 0.55], {extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/drone.wav" at={B.vo5} dur={B.peak - B.vo5} vol={(f) => interpolate(f, [0, 30, F(B.peak - B.vo5)], [0, 0.3, 0.7], {extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/room.wav" at={B.vo6} dur={B.lampOff - B.vo6} vol={(f) => interpolate(f, [0, 20, F(B.lampOff - B.vo6) - 30, F(B.lampOff - B.vo6)], [0, 0.35, 0.35, 0], {extrapolateRight: 'clamp'})} loop />
      {/* foley */}
      {[B.sheet2, B.sheet3, B.sheet4, B.paperIn].map((a) => (
        <Clip key={`ps-${a}`} src="sfx/ripper/amb/paper-slide.wav" at={a} vol={0.6} />
      ))}
      {[0.1, 0.7, 1.4, 2.0, 2.6, 3.1].map((d) => B.chalkIn + d).map((a) => (
        <Clip key={`ck-${a}`} src="sfx/ripper/amb/chalk-tick.wav" at={a} vol={0.6} />
      ))}
      {/* bisikan ambience: jarang, jauh, pelan */}
      {whisperAt('wf1', 50.4, 0.55)}
      {whisperAt('wf2', 70.0, 0.6)}
      {whisperAt('wf3', 79.5, 0.65)}
      {whisperAt('wf4', 85.0, 0.7)}
      {whisperAt('wf5', 100.0, 0.6)}
      {/* narator */}
      <Clip src="vo/ripper/01-hook.wav" at={B.vo1} dur={VO.vo1} />
      <Clip src="vo/ripper/02-setup.wav" at={B.vo2} dur={VO.vo2} />
      <Clip src="vo/ripper/03-grafiti.wav" at={B.vo3} dur={VO.vo3} />
      <Clip src="vo/ripper/04-surat.wav" at={B.vo4} dur={VO.vo4} />
      <Clip src="vo/ripper/05-kelly.wav" at={B.vo5} dur={VO.vo5} vol={0.9} />
      <Clip src="vo/ripper/06-penutup.wav" at={B.vo6} dur={VO.vo6} />
      {/* puncak + penutup */}
      <Clip src="vo/ripper/w3-belum.wav" at={B.peak} dur={VO.w3 + 0.1} vol={0.6} />
      <Clip src="sfx/ripper/sub-hit.wav" at={B.peak} vol={0.85} />
      <Sequence from={peakF + 4} durationInFrames={8}>
        <Audio src={staticFile('sfx/ripper/static-burst.wav')} volume={0.5} />
      </Sequence>
      <Clip src="vo/ripper/w4-masih.wav" at={B.w4} dur={VO.w4 + 0.1} vol={0.5} />
      <Clip src="sfx/ripper/tape-stop.wav" at={B.stop} vol={0.8} />
      <span style={{display: 'none'}}>{clamp01(0)}</span>
    </AbsoluteFill>
  );
};
