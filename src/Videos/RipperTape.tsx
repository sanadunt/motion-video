/**
 * RipperTape — "ARSIP 03 / WHITECHAPEL 1888".
 * Analog horror: kaset arsip bernarasi yang perlahan "menjawab".
 * Brief: briefs/RipperTape.md. Semua waktu ditulis dalam detik di T lalu
 * dikonversi ke frame; VO sudah diukur dengan ffprobe, jangan geser tanpa
 * mengukur ulang.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {EASE, ensureFonts, mix, progress, sec, useLayout} from '../lib/studio';

ensureFonts();

export const ripperTapeSchema = z.object({
  tapeLabel: z.string().max(12),
  tapeSubtitle: z.string().max(24),
  timestampStart: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  accent: zColor(),
  paper: zColor(),
  grain: z.number().min(0).max(1),
  trackingIntensity: z.number().min(0).max(1),
  whisperGain: z.number().min(0).max(1),
  durationInSeconds: z.number().min(45).max(240),
});

export type RipperTapeProps = z.infer<typeof ripperTapeSchema>;

export const ripperTapeDefaults: RipperTapeProps = {
  tapeLabel: 'ARSIP 03',
  tapeSubtitle: 'WHITECHAPEL — 1888',
  timestampStart: '02:14:37',
  accent: '#B8372B',
  paper: '#D9CBB0',
  grain: 0.6,
  trackingIntensity: 0.5,
  whisperGain: 0.8,
  durationInSeconds: 138,
};

const MONO = '"Special Elite", "Courier Prime", "Courier New", monospace';
const CHALK = '"Courier Prime", "Courier New", monospace';
const SERIF = '"EB Garamond", Georgia, "Times New Roman", serif';

/** BEATS dalam detik (frame global = sec(x, fps)). Sumber: briefs/RipperTape.md. */
const B = {
  leaderEnd: 0.6,
  vo1: 1.0, // 11.20 s
  vo2: 13.0, // 28.52 s
  trackA: 35.0,
  vo3: 42.3, // 18.40 s
  chalkIn: 48.8,
  chalkErase: 52.8,
  w1: 48.3,
  vo4: 61.5, // 27.72 s
  w2: 69.5,
  fromHell: 86.6,
  aberr: 84.0,
  silence: 89.6,
  vo5: 91.1, // 20.56 s
  peak: 112.2,
  vo6: 113.5, // 19.16 s
  endCard: 133.5,
  w4: 135.0,
  stop: 137.5,
};

const VO = {
  vo1: 11.2,
  vo2: 28.52,
  vo3: 18.4,
  vo4: 27.72,
  vo5: 20.56,
  vo6: 19.16,
  w1: 12.8,
  w2: 12.92,
  w3: 2.04,
  w4: 1.92,
};

/** Teks diketik: 1 karakter tiap `perChar` frame. */
const typed = (text: string, frame: number, start: number, perChar = 2) => {
  const n = Math.max(0, Math.floor((frame - start) / perChar));
  return text.slice(0, Math.min(text.length, n));
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const timestampAt = (start: string, seconds: number) => {
  const [h, m, s] = start.split(':').map(Number);
  const total = h * 3600 + m * 60 + s + Math.floor(seconds);
  return `${pad2(Math.floor(total / 3600) % 24)}:${pad2(Math.floor(total / 60) % 60)}:${pad2(total % 60)}`;
};

type Line = {at: number; text: string; accentWord?: string; dim?: boolean};

/** Subtitle per fase: muncul diketik saat kata diucapkan. Jam = detik global. */
const LINES: Line[] = [
  {at: 1.2, text: 'LIMA PEREMPUAN.'},
  {at: 4.0, text: 'SEBELAS MINGGU.'},
  {at: 6.8, text: 'DAN SATU SURAT'},
  {at: 9.3, text: 'DITULIS DENGAN TINTA MERAH.', accentWord: 'MERAH'},
];

const SETUP_HEAD: Line[] = [
  {at: 13.2, text: '31 AGUSTUS 1888 · 03.40'},
  {at: 21.5, text: "BUCK'S ROW, LONDON TIMUR", dim: true},
];

const VICTIMS: Line[] = [
  {at: 24.5, text: 'MARY ANN NICHOLS'},
  {at: 30.0, text: 'ANNIE CHAPMAN'},
  {at: 38.0, text: 'ELIZABETH STRIDE'},
  {at: 40.0, text: 'CATHERINE EDDOWES'},
];

const GRAFFITI_HEAD: Line[] = [
  {at: 42.6, text: 'GOULSTON STREET', dim: true},
  {at: 45.2, text: 'SEPOTONG CELEMEK. SEBARIS KAPUR.', dim: true},
];

const LETTER_LINES: Line[] = [
  {at: 62.0, text: '16 OKTOBER 1888', dim: true},
  {at: 65.0, text: 'SEBUAH KOTAK KECIL.'},
  {at: 71.5, text: 'SEPARUH GINJAL MANUSIA.'},
  {at: 76.0, text: 'DAN SEPUCUK SURAT.'},
];

const KELLY_LINES: Line[] = [
  {at: 91.4, text: '9 NOVEMBER 1888', dim: true},
  {at: 93.5, text: "MILLER'S COURT", dim: true},
  {at: 96.5, text: 'MARY JANE KELLY'},
  {at: 108.5, text: 'PINTUNYA TERKUNCI.'},
];

const CLOSING_LINES: Line[] = [
  {at: 114.0, text: 'TIDAK PERNAH TERTANGKAP.'},
  {at: 117.5, text: 'TIDAK PERNAH DIIDENTIFIKASI.'},
  {at: 128.5, text: 'TIDAK ADA YANG BILANG', dim: true},
  {at: 131.0, text: 'DIA SELESAI.'},
];

/** Momen garis tracking lewat: [mulai detik, durasi detik]. */
const TRACKING: Array<[number, number]> = [
  [35.0, 0.5],
  [52.8, 0.6],
  [84.2, 0.5],
  [86.0, 0.4],
  [87.6, 0.5],
  [88.8, 0.4],
  [112.2, 0.6],
];

export const RipperTape: React.FC<RipperTapeProps> = ({
  tapeLabel,
  tapeSubtitle,
  timestampStart,
  accent,
  paper,
  grain,
  trackingIntensity,
  whisperGain,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const L = useLayout();
  const t = frame / fps; // detik global
  const F = (s: number) => sec(s, fps);

  const peakF = F(B.peak);
  const inPeak = frame >= peakF && frame < peakF + 4;
  const inStatic = frame >= peakF + 4 && frame < peakF + 10;
  const inSilence = t >= B.silence && t < B.vo5;
  const afterStop = t >= B.stop;
  const isBlack = t < B.leaderEnd || inSilence || afterStop || (frame >= peakF + 10 && t < B.vo6);

  // Push-in kamera kontinu, tidak pernah diam.
  const push = mix(progress(frame, 0, durationInFrames, EASE.inOut), 1.0, 1.04);

  // Chromatic aberration: kecil, membesar menjelang hening dan di puncak.
  const aberr =
    (inPeak ? 7 : 0) +
    interpolate(t, [B.aberr, B.silence], [0.6, 4], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
      (t >= B.aberr && t < B.silence ? 1 : 0) +
    (t < B.aberr ? 0.6 : 0);
  const ab = L.px(aberr);
  const abShadow = `${-ab}px 0 rgba(255,40,40,0.55), ${ab}px 0 rgba(40,160,255,0.45)`;

  // Timestamp: berjalan normal, lompat acak di 84–89,6, berhenti di endCard.
  const tsSeconds = Math.min(t, B.endCard);
  const jumping = t >= B.aberr && t < B.silence;
  const tsJump = jumping ? Math.floor(random(`ts-${frame}`) * 5000 - 2500) : 0;
  const timestamp = timestampAt(timestampStart, Math.max(0, tsSeconds + tsJump));

  // Tracking band
  let trackY = -1;
  let trackStrength = 0;
  for (const [start, dur] of TRACKING) {
    if (t >= start && t < start + dur) {
      trackY = (t - start) / dur;
      trackStrength = trackingIntensity;
    }
  }
  const trackShift = trackY >= 0 ? L.px(mix(random(`trk-${frame}`), -6, 6)) * trackStrength : 0;

  // Blok teks utama: ukuran per orientasi.
  const fsBody = L.px(L.pick({portrait: 44, landscape: 40, square: 42}));
  const fsHead = L.px(L.pick({portrait: 34, landscape: 32, square: 32}));
  const textW = L.contentWidth * L.pick({portrait: 0.86, landscape: 0.5, square: 0.82});
  const textLeft = L.safe + (L.orientation === 'landscape' ? 0 : (L.contentWidth - textW) / 2);
  const textTop = L.height * L.pick({portrait: 0.3, landscape: 0.24, square: 0.26});

  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  const renderLines = (lines: Line[], endSec: number, opts?: {gap?: number; size?: number}) => {
    if (t >= endSec) return null;
    const size = opts?.size ?? fsBody;
    return lines.map((ln, i) => {
      const start = F(ln.at);
      if (frame < start) return null;
      const txt = typed(ln.text, frame, start);
      const done = txt.length === ln.text.length;
      const isLast = i === lines.length - 1 || frame < F(lines[i + 1].at);
      const parts = ln.accentWord ? txt.split(ln.accentWord) : [txt];
      const accentHit = ln.accentWord && txt.includes(ln.accentWord);
      const flash = accentHit && frame - start < ln.text.indexOf(ln.accentWord!) * 2 + 4;
      return (
        <div
          key={ln.text}
          style={{
            fontFamily: MONO,
            fontSize: size,
            lineHeight: 1.35,
            letterSpacing: L.px(2),
            color: ln.dim ? 'rgba(217,203,176,0.55)' : paper,
            textShadow: abShadow,
            marginBottom: L.px(opts?.gap ?? 10),
            whiteSpace: 'pre-wrap',
          }}
        >
          {parts.length > 1 ? (
            <>
              {parts[0]}
              <span style={{color: flash ? '#FF4A3D' : accent}}>{ln.accentWord}</span>
              {parts[1]}
            </>
          ) : (
            txt
          )}
          {isLast && !done && cursorOn ? '█' : isLast && !done ? ' ' : ''}
        </div>
      );
    });
  };

  // Grafiti kapur: muncul 48,8, dihapus 52,8 (blur + fade 0,8 dtk), sengaja sebelum selesai dibaca.
  const chalkVisible = t >= B.chalkIn && t < B.chalkErase + 1.0;
  const erase = progress(frame, F(B.chalkErase), F(0.8), EASE.in);
  const chalkText = typed(
    'The Juwes are the men that will not be blamed for nothing',
    frame,
    F(B.chalkIn),
    1,
  );

  // "From Hell": gemetar ±1 px deterministik.
  const fromHellOn = t >= B.fromHell && t < B.silence;
  const fhIn = progress(frame, F(B.fromHell), F(0.25), EASE.out);
  const jx = L.px(mix(random(`fh-x-${frame}`), -1.2, 1.2));
  const jy = L.px(mix(random(`fh-y-${frame}`), -1.2, 1.2));

  // Sosok di ambang pintu: hanya 4 frame.
  const doorW = L.px(L.pick({portrait: 300, landscape: 260, square: 280}));
  const doorH = doorW * 2.1;
  const doorLeft = L.width * L.pick({portrait: 0.5, landscape: 0.73, square: 0.5}) - doorW / 2;
  const doorTop = L.height * L.pick({portrait: 0.55, landscape: 0.5, square: 0.52}) - doorH / 2;
  const flicker = 0.85 + 0.15 * random(`door-${Math.floor(frame / 3)}`);
  const doorGlow =
    interpolate(t, [B.vo2, B.vo5, B.peak], [0.12, 0.16, 0.26], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    flicker *
    (inPeak ? 2.2 : 1);

  const scene = (sliceShift = 0) => (
    <AbsoluteFill
      style={{
        transform: `scale(${push}) translateX(${trackShift + sliceShift}px)`,
        transformOrigin: '50% 55%',
      }}
    >
      {/* footage: ruang gelap */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, #23231B 0%, #101109 55%, #060605 100%)',
        }}
      />
      {/* lantai: garis cakrawala samar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: doorTop + doorH * 0.98,
          height: L.height - (doorTop + doorH * 0.98),
          background: 'linear-gradient(180deg, rgba(60,56,40,0.18) 0%, rgba(0,0,0,0) 40%)',
        }}
      />
      {/* ambang pintu, samar sepanjang video, makin jelas menjelang puncak */}
      {t >= B.vo2 && (
        <div
          style={{
            position: 'absolute',
            left: doorLeft,
            top: doorTop,
            width: doorW,
            height: doorH,
            background: `linear-gradient(180deg, rgba(120,110,80,${doorGlow}) 0%, rgba(60,55,40,${doorGlow * 0.6}) 100%)`,
            boxShadow: `0 0 ${L.px(80)}px rgba(120,110,80,${doorGlow * 0.5})`,
          }}
        />
      )}
      {/* sosok: 4 frame */}
      {inPeak && (
        <svg
          style={{
            position: 'absolute',
            left: doorLeft + doorW * 0.08,
            top: doorTop - doorH * 0.06,
            opacity: 0.78,
            filter: `blur(${L.px(2.5)}px)`,
            transform: `skewX(${mix(random(`fig-${frame}`), -4, 4)}deg)`,
          }}
          width={doorW}
          height={doorH * 1.1}
          viewBox="0 0 100 230"
        >
          <path
            d="M48 14 C54 12 59 19 58 28 C57 37 53 42 49 43 C44 43 40 37 40 29 C40 21 43 15 48 14 Z M31 230 L33 86 C34 64 40 50 49 48 C58 48 66 60 66 84 L68 230 Z M40 60 L26 150 L31 152 L43 70 Z M60 58 L74 140 L69 143 L57 68 Z"
            fill="#040403"
          />
        </svg>
      )}

      {/* timestamp */}
      {!afterStop && (
        <div
          style={{
            position: 'absolute',
            left: L.safe,
            top: L.safe,
            fontFamily: CHALK,
            fontSize: L.px(30),
            letterSpacing: L.px(3),
            color: 'rgba(217,203,176,0.85)',
            textShadow: abShadow,
          }}
        >
          <span style={{color: t < B.endCard && Math.floor(frame / 15) % 2 === 0 ? accent : 'transparent'}}>
            ●{' '}
          </span>
          REC {timestamp}
        </div>
      )}

      {/* kartu judul kaset */}
      {t < B.vo2 && (
        <div
          style={{
            position: 'absolute',
            right: L.safe,
            top: L.safe,
            textAlign: 'right',
            fontFamily: MONO,
            color: 'rgba(217,203,176,0.75)',
            fontSize: fsHead,
            letterSpacing: L.px(3),
            lineHeight: 1.3,
            textShadow: abShadow,
          }}
        >
          <div>{typed(tapeLabel, frame, F(0.6), 2)}</div>
          <div style={{fontSize: fsHead * 0.7}}>{typed(tapeSubtitle, frame, F(1.2), 2)}</div>
        </div>
      )}

      {/* blok teks utama */}
      <div style={{position: 'absolute', left: textLeft, top: textTop, width: textW}}>
        {renderLines(LINES, B.vo2)}
        {t >= B.vo2 && t < B.vo3 && renderLines(SETUP_HEAD, B.vo3, {size: fsHead})}
        {t >= B.vo2 && t < B.vo3 && (
          <div style={{marginTop: L.px(28)}}>{renderLines(VICTIMS, B.vo3, {gap: 18})}</div>
        )}
        {t >= B.vo3 && t < B.chalkIn && renderLines(GRAFFITI_HEAD, B.chalkIn, {size: fsHead})}
        {t >= B.vo4 && renderLines(LETTER_LINES, B.silence)}
        {t >= B.vo5 && renderLines(KELLY_LINES, B.peak)}
        {t >= B.vo6 && renderLines(CLOSING_LINES, B.endCard)}
        {t >= B.endCard && !afterStop && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: fsBody,
              letterSpacing: L.px(3),
              color: paper,
              textShadow: abShadow,
            }}
          >
            {typed(`${tapeLabel} — BERAKHIR`, frame, F(B.endCard), 2)}
          </div>
        )}
      </div>

      {/* grafiti kapur */}
      {chalkVisible && (
        <div
          style={{
            position: 'absolute',
            left: textLeft,
            top: textTop,
            width: textW,
            fontFamily: CHALK,
            fontSize: fsBody * 0.95,
            lineHeight: 1.4,
            color: 'rgba(235,230,215,0.92)',
            transform: `rotate(-1.5deg)`,
            filter: `blur(${mix(erase, 0, L.px(14))}px)`,
            opacity: 1 - erase,
            textShadow: `0 0 ${L.px(6)}px rgba(255,255,255,0.35)`,
          }}
        >
          {chalkText}
        </div>
      )}
      {t >= B.chalkErase + 3.5 && t < B.vo4 && (
        <div style={{position: 'absolute', left: textLeft, top: textTop, width: textW}}>
          {renderLines([{at: B.chalkErase + 3.5, text: 'TIDAK ADA FOTO.', dim: true}], B.vo4)}
        </div>
      )}

      {/* From Hell */}
      {fromHellOn && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: L.height * L.pick({portrait: 0.56, landscape: 0.5, square: 0.55}),
            textAlign: 'center',
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: L.px(L.pick({portrait: 128, landscape: 120, square: 116})),
            color: accent,
            opacity: fhIn,
            transform: `translate(${jx}px, ${jy}px)`,
            textShadow: `0 0 ${L.px(30)}px rgba(184,55,43,0.45), ${abShadow}`,
          }}
        >
          From Hell
        </div>
      )}
    </AbsoluteFill>
  );

  // Sobekan 3 slice saat puncak.
  const tearSlices = inPeak
    ? [
        {top: 0, h: 0.33, dx: L.px(mix(random(`tear-a-${frame}`), -40, 40))},
        {top: 0.33, h: 0.3, dx: L.px(mix(random(`tear-b-${frame}`), -40, 40))},
        {top: 0.63, h: 0.37, dx: L.px(mix(random(`tear-c-${frame}`), -40, 40))},
      ]
    : null;

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      {/* leader 3-2-1 */}
      {t < B.leaderEnd && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: CHALK,
            fontSize: L.px(160),
            color: 'rgba(217,203,176,0.6)',
          }}
        >
          {3 - Math.min(2, Math.floor(t / 0.2))}
        </AbsoluteFill>
      )}

      {!isBlack &&
        (tearSlices ? (
          tearSlices.map((s) => (
            <AbsoluteFill
              key={s.top}
              style={{clipPath: `inset(${s.top * 100}% 0 ${(1 - s.top - s.h) * 100}% 0)`}}
            >
              {scene(s.dx)}
            </AbsoluteFill>
          ))
        ) : (
          scene()
        ))}

      {/* hening: hitam hampir pekat, hanya sisa dengung visual */}
      {inSilence && (
        <AbsoluteFill style={{backgroundColor: '#030303'}} />
      )}

      {/* grain + scanline + vignette + tracking band */}
      {!isBlack && (
        <>
          <svg style={{position: 'absolute', inset: 0}} width={L.width} height={L.height}>
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 1000} />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#grain)"
              opacity={0.1 + grain * 0.16}
              style={{mixBlendMode: 'overlay'}}
            />
          </svg>
          <AbsoluteFill
            style={{
              background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) ${L.px(2)}px, transparent ${L.px(2)}px, transparent ${L.px(5)}px)`,
            }}
          />
          <AbsoluteFill
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.85) 100%)',
            }}
          />
          {trackY >= 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${trackY * 100}%`,
                height: L.px(70),
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 40%, rgba(0,0,0,0.6) 60%, rgba(255,255,255,0) 100%)',
                opacity: 0.4 + trackStrength * 0.6,
                mixBlendMode: 'screen',
              }}
            />
          )}
        </>
      )}

      {/* statik penuh 6 frame */}
      {inStatic && (
        <svg style={{position: 'absolute', inset: 0}} width={L.width} height={L.height}>
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
      <Audio src={staticFile('sfx/ripper/tape-click.wav')} volume={0.7} />
      <Sequence durationInFrames={F(B.silence)}>
        <Audio src={staticFile('sfx/ripper/tape-hiss.wav')} loop volume={0.12} />
        <Audio src={staticFile('sfx/ripper/hum-50hz.wav')} loop volume={0.08} />
      </Sequence>
      <Sequence from={F(B.vo5)} durationInFrames={F(B.stop) - F(B.vo5)}>
        <Audio src={staticFile('sfx/ripper/tape-hiss.wav')} loop volume={0.12} />
      </Sequence>
      <Sequence from={F(B.vo6)} durationInFrames={F(B.stop) - F(B.vo6)}>
        <Audio src={staticFile('sfx/ripper/hum-50hz.wav')} loop volume={0.08} />
      </Sequence>

      <Sequence from={F(B.vo1)} durationInFrames={F(VO.vo1)}>
        <Audio src={staticFile('vo/ripper/01-hook.wav')} />
      </Sequence>
      <Sequence from={F(B.vo2)} durationInFrames={F(VO.vo2)}>
        <Audio src={staticFile('vo/ripper/02-setup.wav')} />
      </Sequence>
      <Sequence from={F(B.vo3)} durationInFrames={F(VO.vo3)}>
        <Audio src={staticFile('vo/ripper/03-grafiti.wav')} />
      </Sequence>
      <Sequence from={F(B.w1)} durationInFrames={F(B.silence) - F(B.w1)}>
        <Audio
          src={staticFile('vo/ripper/w1-fromhell-L.wav')}
          loop
          volume={(f) =>
            whisperGain *
            interpolate(f, [0, 90, F(B.silence) - F(B.w1) - 60, F(B.silence) - F(B.w1)], [0.15, 0.4, 0.55, 0.7], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>
      <Sequence from={F(B.vo4)} durationInFrames={F(VO.vo4)}>
        <Audio src={staticFile('vo/ripper/04-surat.wav')} />
      </Sequence>
      <Sequence from={F(B.w2)} durationInFrames={F(B.silence) - F(B.w2)}>
        <Audio
          src={staticFile('vo/ripper/w2-catchme-R.wav')}
          loop
          volume={(f) =>
            whisperGain *
            interpolate(f, [0, 150, F(B.silence) - F(B.w2)], [0, 0.5, 0.7], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      </Sequence>
      <Sequence from={F(B.vo5)} durationInFrames={F(VO.vo5)}>
        <Audio src={staticFile('vo/ripper/05-kelly.wav')} volume={0.9} />
      </Sequence>
      <Sequence from={peakF} durationInFrames={F(VO.w3) + 2}>
        <Audio src={staticFile('vo/ripper/w3-belum.wav')} volume={1} />
        <Audio src={staticFile('sfx/ripper/sub-hit.wav')} volume={0.9} />
      </Sequence>
      <Sequence from={peakF + 4} durationInFrames={8}>
        <Audio src={staticFile('sfx/ripper/static-burst.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={F(B.vo6)} durationInFrames={F(VO.vo6)}>
        <Audio src={staticFile('vo/ripper/06-penutup.wav')} />
      </Sequence>
      <Sequence from={F(B.w4)} durationInFrames={F(VO.w4) + 2}>
        <Audio src={staticFile('vo/ripper/w4-masih.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={F(B.stop)} durationInFrames={F(0.3)}>
        <Audio src={staticFile('sfx/ripper/tape-stop.wav')} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
