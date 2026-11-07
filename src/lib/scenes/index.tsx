/**
 * Scene kit 2D/2.5D untuk video bernarasi (dipakai RipperTape v2 dan naskah berikutnya).
 * Semua tekstur prosedural (SVG feTurbulence), semua gerak dari frame, tanpa aset jaringan.
 *
 *  - NoiseFill     : lapisan noise/tekstur deterministik (kertas, gabus, kayu, kabut)
 *  - smoothNoise   : noise halus per frame untuk handheld, kedip lampu, goyang lilin
 *  - CameraRig     : pan/zoom/rotasi + handheld di atas seluruh set
 *  - FilmGrade     : grain per frame, vignette, split-tone, debu, kedip
 *  - Paper, Pin, RedString, Stamp, Tape : properti set
 */
import React from 'react';
import {AbsoluteFill, random} from 'remotion';

/* ---------- warna rumah (analog horror arsip) ---------- */
export const PAL = {
  shadow: '#07090B',
  ink: '#241C17',
  inkRed: '#8E2A1F',
  string: '#B3301F',
  paper: '#D9C9A6',
  paperDark: '#B9A57E',
  cork: '#8B6A45',
  wood: '#3B2A1E',
  lamp: '#E6AE5E',
  chalk: '#ECE7DA',
  fog: '#6E7D7D',
  brick: '#5A3A30',
};

export const FONT = {
  type: '"Special Elite", "Courier Prime", monospace',
  print: '"IM Fell English", "EB Garamond", Georgia, serif',
  hand: '"Homemade Apple", "Comic Sans MS", cursive',
  mono: '"Courier Prime", "Courier New", monospace',
};

/* ---------- noise ---------- */
export const smoothNoise = (seed: string, frame: number, period = 12) => {
  const i = Math.floor(frame / period);
  const a = random(`${seed}-${i}`);
  const b = random(`${seed}-${i + 1}`);
  const t = (frame - i * period) / period;
  const e = t * t * (3 - 2 * t);
  return a + (b - a) * e; // 0..1
};

export const NoiseFill: React.FC<{
  id: string;
  baseFrequency: number | string;
  octaves?: number;
  seed?: number;
  opacity?: number;
  blend?: React.CSSProperties['mixBlendMode'];
  contrast?: number;
  style?: React.CSSProperties;
}> = ({id, baseFrequency, octaves = 3, seed = 1, opacity = 0.25, blend = 'multiply', contrast = 1, style}) => (
  <svg
    style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: blend, opacity, ...style}}
    preserveAspectRatio="none"
  >
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={String(baseFrequency)} numOctaves={octaves} seed={seed} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
        <feFuncG type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
        <feFuncB type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
      </feComponentTransfer>
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

/* ---------- kamera ---------- */
export const CameraRig: React.FC<{
  frame: number;
  zoom?: number;
  x?: number;
  y?: number;
  rot?: number;
  handheld?: number; // px amplitudo
  origin?: string;
  children: React.ReactNode;
}> = ({frame, zoom = 1, x = 0, y = 0, rot = 0, handheld = 0, origin = '50% 50%', children}) => {
  const hx = (smoothNoise('hh-x', frame, 14) - 0.5) * 2 * handheld;
  const hy = (smoothNoise('hh-y', frame, 11) - 0.5) * 2 * handheld;
  const hr = (smoothNoise('hh-r', frame, 20) - 0.5) * 0.3 * (handheld > 0 ? 1 : 0);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x + hx}px, ${y + hy}px) rotate(${rot + hr}deg) scale(${zoom})`,
        transformOrigin: origin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------- grade ---------- */
export const FilmGrade: React.FC<{
  frame: number;
  width: number;
  height: number;
  grain?: number; // 0..1
  vignette?: number; // 0..1
  flicker?: number; // 0..1
  dust?: boolean;
  warm?: number; // split tone 0..1
}> = ({frame, width, height, grain = 0.5, vignette = 0.7, flicker = 0.4, dust = true, warm = 0.5}) => {
  const fl = (smoothNoise('flk', frame, 3) - 0.5) * 0.12 * flicker;
  const specks = dust
    ? Array.from({length: 6}, (_, i) => {
        const g = Math.floor(frame / 2);
        const r = random(`dust-${g}-${i}`);
        if (r > 0.35) return null;
        return {
          x: random(`dx-${g}-${i}`) * width,
          y: random(`dy-${g}-${i}`) * height,
          l: 6 + random(`dl-${g}-${i}`) * 30,
          a: random(`da-${g}-${i}`) * 360,
        };
      })
    : [];
  return (
    <>
      {/* split tone: bayangan teal, highlight amber */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(20,40,45,0.35) 0%, rgba(20,40,45,0.2) 100%)',
          mixBlendMode: 'multiply',
          opacity: warm,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 40% 30%, rgba(230,174,94,0.18) 0%, rgba(0,0,0,0) 60%)',
          mixBlendMode: 'screen',
          opacity: warm,
        }}
      />
      {/* grain per frame */}
      <NoiseFill id={`grain-${frame % 7}`} baseFrequency={0.95} octaves={2} seed={frame % 997} opacity={0.08 + grain * 0.14} blend="overlay" contrast={1.6} />
      {/* debu */}
      {specks.map((s, i) =>
        s ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: 1.5,
              height: s.l,
              background: 'rgba(255,255,255,0.35)',
              transform: `rotate(${s.a}deg)`,
            }}
          />
        ) : null,
      )}
      {/* vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) ${40 - vignette * 10}%, rgba(0,0,0,${0.45 * vignette}) 80%, rgba(0,0,0,${0.9 * vignette}) 100%)`,
        }}
      />
      {/* kedip */}
      <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(0, 0.03 + fl)}} />
    </>
  );
};

/* ---------- properti ---------- */
export const Paper: React.FC<{
  w: number;
  h: number;
  x?: number;
  y?: number;
  rot?: number;
  color?: string;
  seed?: number;
  shadow?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({w, h, x = 0, y = 0, rot = 0, color = PAL.paper, seed = 2, shadow = 1, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `rotate(${rot}deg)`,
      transformOrigin: '50% 50%',
      background: color,
      boxShadow: `0 ${6 * shadow}px ${18 * shadow}px rgba(0,0,0,0.55), inset 0 0 ${w * 0.08}px rgba(60,40,20,0.35)`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <NoiseFill id={`paper-${seed}`} baseFrequency={0.7} octaves={3} seed={seed} opacity={0.22} blend="multiply" contrast={1.2} />
    <NoiseFill id={`stain-${seed}`} baseFrequency={0.012} octaves={2} seed={seed + 50} opacity={0.35} blend="multiply" contrast={1.1} />
    <div style={{position: 'absolute', inset: 0}}>{children}</div>
  </div>
);

export const Pin: React.FC<{x: number; y: number; r?: number; color?: string}> = ({x, y, r = 9, color = '#C8302A'}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, #fff5 0%, ${color} 35%, #4a0f0a 100%)`,
      boxShadow: '0 3px 5px rgba(0,0,0,0.6)',
    }}
  />
);

export const RedString: React.FC<{
  points: Array<[number, number]>;
  width: number;
  height: number;
  sag?: number;
  stroke?: number;
  color?: string;
}> = ({points, width, height, sag = 18, stroke = 2.5, color = PAL.string}) => {
  const d = points
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const q = points[i - 1];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2 + sag;
      return `Q ${mx} ${my} ${p[0]} ${p[1]}`;
    })
    .join(' ');
  return (
    <svg style={{position: 'absolute', inset: 0}} width={width} height={height}>
      <path d={d} stroke="rgba(0,0,0,0.5)" strokeWidth={stroke + 1.5} fill="none" transform="translate(2,4)" />
      <path d={d} stroke={color} strokeWidth={stroke} fill="none" />
    </svg>
  );
};

export const Stamp: React.FC<{text: string; x: number; y: number; size: number; rot?: number; color?: string}> = ({
  text,
  x,
  y,
  size,
  rot = -12,
  color = PAL.inkRed,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      padding: `${size * 0.25}px ${size * 0.5}px`,
      border: `${size * 0.12}px solid ${color}`,
      borderRadius: size * 0.2,
      color,
      fontFamily: FONT.print,
      fontSize: size,
      letterSpacing: size * 0.12,
      textTransform: 'uppercase',
      transform: `rotate(${rot}deg)`,
      opacity: 0.78,
      mixBlendMode: 'multiply',
      filter: 'blur(0.4px)',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

export const Tape: React.FC<{x: number; y: number; w: number; h: number; rot?: number; children?: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  rot = 0,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `rotate(${rot}deg)`,
      background: 'rgba(222,210,170,0.78)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.type,
      color: PAL.ink,
      fontSize: h * 0.5,
      letterSpacing: h * 0.08,
    }}
  >
    {children}
  </div>
);
