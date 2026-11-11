/**
 * Set-set "Nomor Merah" (rumor SMS/telepon nomor merah, Mei 2008), 2.5D. Pola sama dengan tiang.tsx: menerima `frame`
 * lokal dan nilai animasi 0..1 dari pemanggil; kamera dibungkus di luar. Ukuran ditulis dalam "px 1080" lewat L.px().
 * Aturan topik: tanpa nama orang biasa, tanpa nama operator, tanpa wajah, tanpa logo. Bentuk pulau dan benua digambar
 * sendiri (poligon low-poly dari koordinat kasar), bukan tile peta pihak ketiga. Judul kliping ditulis ulang.
 * Adegan ponsel, warnet, ruang periksa, dan lantai adalah render Blender PSX (scripts/blender/merah/).
 */
import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import type {Layout} from '../studio';
import {FONT, NoiseFill, PAL, Paper, Pin, Stamp, Tape, smoothNoise} from './index';
import {clamp01} from './sets';

type S = {L: Layout; frame: number};

export const MR = {
  red: '#c81e14',
  redInk: '#a8231a',
  sea: '#c9cdbd',
  land: '#6f8068',
  landAlt: '#55664f',
  landDim: '#a9ad98',
  manila: '#cdb98a',
  news: '#d6ceb8',
  blueInk: '#24324a',
};

const Desk: React.FC<{frame: number; dark?: number; children?: React.ReactNode}> = ({frame, dark = 0, children}) => {
  const lampF = 0.94 + smoothNoise('mr-lamp', frame, 6) * 0.06;
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0907'}}>
      <div style={{position: 'absolute', inset: '-60%', background: 'linear-gradient(180deg, #2a1f16 0%, #1c140d 100%)'}}>
        <NoiseFill tex="desk" opacity={0.55} blend="multiply" />
        <NoiseFill tex="stain" opacity={0.4} blend="multiply" />
      </div>
      {children}
      <div style={{position: 'absolute', inset: '-60%', pointerEvents: 'none', background: `radial-gradient(ellipse 50% 40% at 47% 50%, rgba(230,174,94,${0.1 * lampF * (1 - dark)}) 0%, rgba(0,0,0,0) 70%)`}} />
      <div style={{position: 'absolute', inset: '-60%', pointerEvents: 'none', background: `radial-gradient(ellipse 52% 46% at 48% 50%, rgba(0,0,0,0) ${46 - dark * 20}%, rgba(0,0,0,${0.82 + dark * 0.12}) 100%)`}} />
    </AbsoluteFill>
  );
};

/* =================== judul (piksel LCD merah) =================== */
export const MerahTitle: React.FC<S & {opacity?: number; glitch?: number}> = ({L, frame, opacity = 1, glitch = 0}) => {
  const p = L.px;
  const w = p(804);
  const h = p(108);
  const jx = glitch > 0 ? (random(`tj${frame}`) - 0.5) * p(26) * glitch : 0;
  return (
    <div style={{position: 'absolute', left: p(60), width: p(900), top: p(408), height: p(170), opacity, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,4,4,0.0) 0%, rgba(6,4,4,0.82) 22%, rgba(6,4,4,0.82) 78%, rgba(6,4,4,0) 100%)'}} />
      <Img src={staticFile('3d/merah/lcd/title.png')} style={{position: 'relative', width: w, height: h, imageRendering: 'pixelated', transform: `translateX(${jx}px)`, filter: `drop-shadow(0 0 ${p(10)}px rgba(232,30,16,0.55))`}} />
    </div>
  );
};

/* =================== secarik label bercap (KONON / KATANYA / dst.) =================== */
export const Slip: React.FC<{L: Layout; text: string; sub?: string; x: number; y: number; w: number; rot?: number; k: number; size?: number}> = ({L, text, sub, x, y, w, rot = -3, k, size = 58}) => {
  const p = L.px;
  const kk = clamp01(k);
  if (kk <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${1 + (1 - kk) * 0.5})`, transformOrigin: '50% 50%', opacity: Math.min(1, kk * 3)}}>
      <div style={{position: 'relative', background: '#e4dcc6', boxShadow: '0 8px 18px rgba(0,0,0,0.7)', padding: `${p(12)}px ${p(22)}px ${p(sub ? 10 : 12)}px`, overflow: 'hidden'}}>
        <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
        <div style={{position: 'relative', display: 'inline-block', border: `${p(5)}px solid ${MR.redInk}`, borderRadius: p(8), padding: `${p(4)}px ${p(16)}px`, fontFamily: FONT.print, fontSize: p(size), letterSpacing: p(6), color: MR.redInk, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{text}</div>
        {sub && <div style={{position: 'relative', marginTop: p(8), fontFamily: FONT.mono, fontSize: p(24), color: PAL.ink, letterSpacing: p(1), lineHeight: 1.25}}>{sub}</div>}
      </div>
      <div style={{position: 'absolute', left: '38%', top: -p(14), width: p(110), height: p(30), background: 'rgba(222,210,170,0.8)', transform: 'rotate(-3deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)'}} />
    </div>
  );
};

/* =================== poligon low-poly =================== */
type Pt = [number, number];
const LowPoly: React.FC<{id: string; pts: Pt[]; base: string; alt: string; stroke?: string}> = ({id, pts, base, alt, stroke = 'rgba(30,36,28,0.7)'}) => {
  const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length;
  const cy = pts.reduce((a, q) => a + q[1], 0) / pts.length;
  const d = pts.map((q) => q.join(',')).join(' ');
  return (
    <g>
      <clipPath id={`cp-${id}`}>
        <polygon points={d} />
      </clipPath>
      <polygon points={d} fill={base} />
      <g clipPath={`url(#cp-${id})`}>
        {pts.map((q, i) => {
          const n = pts[(i + 1) % pts.length];
          return <polygon key={i} points={`${cx},${cy} ${q[0]},${q[1]} ${n[0]},${n[1]}`} fill={alt} opacity={0.15 + random(`${id}-${i}`) * 0.6} />;
        })}
      </g>
      <polygon points={d} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  );
};

/* =================== adegan 2: peta Sumatera–Jawa =================== */
const ID_LAND: Record<string, Array<[number, number]>> = {
  sumatera: [[95.3, 5.55], [96.2, 5.3], [97.5, 5.2], [98.3, 4.4], [98.7, 3.75], [99.9, 2.9], [100.9, 2.2], [101.6, 1.75], [102.5, 1.1], [103.1, 0.7], [103.7, 0.1], [103.8, -0.6], [104.4, -1.05], [104.5, -1.9], [105.3, -2.4], [106.0, -3.0], [105.9, -3.9], [105.85, -4.7], [105.8, -5.8], [105.25, -5.5], [104.6, -5.9], [104.0, -5.0], [103.3, -4.75], [102.3, -3.9], [101.4, -2.9], [100.9, -2.2], [100.35, -0.95], [99.8, 0.0], [99.1, 1.0], [98.75, 1.75], [97.8, 2.3], [97.2, 3.2], [96.1, 4.1], [95.4, 4.9]],
  jawa: [[105.2, -6.8], [106.0, -5.9], [106.85, -6.05], [107.9, -6.2], [108.6, -6.7], [110.4, -6.9], [111.0, -6.4], [111.7, -6.75], [112.7, -7.2], [113.9, -7.7], [114.45, -7.75], [114.6, -8.7], [113.5, -8.35], [112.0, -8.3], [110.0, -7.9], [108.5, -7.75], [106.5, -7.35], [105.5, -6.9]],
  madura: [[112.7, -7.05], [113.9, -6.9], [114.1, -7.1], [113.0, -7.25]],
  bali: [[114.45, -8.15], [115.2, -8.05], [115.7, -8.4], [115.2, -8.8], [114.6, -8.4]],
  bangka: [[105.1, -1.6], [105.9, -1.5], [106.2, -2.0], [106.7, -2.6], [106.5, -3.1], [105.9, -2.9], [105.3, -2.1]],
  belitung: [[107.6, -2.6], [108.2, -2.7], [108.2, -3.2], [107.7, -3.2]],
  bengkalis: [[101.95, 1.55], [102.5, 1.45], [102.45, 1.3], [102.0, 1.42]],
  kepri: [[103.9, 1.15], [104.6, 1.2], [104.65, 0.85], [104.0, 0.85]],
  lingga: [[104.4, 0.0], [104.9, -0.1], [104.7, -0.45], [104.35, -0.3]],
};
const ID_DIM: Record<string, Array<[number, number]>> = {
  semenanjung: [[99.6, 7.2], [100.3, 5.5], [100.6, 4.2], [101.3, 2.9], [102.2, 2.2], [103.4, 1.35], [104.2, 1.45], [103.9, 2.3], [103.4, 3.5], [103.3, 4.4], [102.6, 5.6], [102.2, 6.2], [101.6, 7.2]],
  kalimantan: [[109.6, 2.0], [109.0, 1.3], [109.2, 0.2], [109.9, -1.3], [110.2, -2.9], [111.8, -3.5], [113.3, -3.3], [114.6, -3.9], [116.0, -3.7], [116.6, -2.2], [117.8, 0.8], [117.8, 4.0], [115.0, 5.0], [113.0, 3.2], [111.2, 1.6]],
  lombok: [[115.85, -8.25], [116.7, -8.3], [116.6, -8.9], [115.9, -8.8]],
};
export const MAP_CITIES: Array<{name: string; lon: number; lat: number; side: 'l' | 'r'; dy?: number}> = [
  {name: 'Pekanbaru', lon: 101.45, lat: 0.51, side: 'r', dy: 10},
  {name: 'Duri', lon: 101.2, lat: 1.25, side: 'l', dy: -4},
  {name: 'Bengkalis', lon: 102.1, lat: 1.47, side: 'r', dy: -16},
  {name: 'Lubuk Basung', lon: 100.03, lat: -0.31, side: 'r', dy: 26},
  {name: 'Bengkulu', lon: 102.26, lat: -3.79, side: 'l'},
  {name: 'Jambi', lon: 103.61, lat: -1.61, side: 'r'},
  {name: 'Koba', lon: 106.4, lat: -2.48, side: 'r'},
  {name: 'Jakarta', lon: 106.83, lat: -6.2, side: 'r', dy: -22},
  {name: 'Banyuwangi', lon: 114.37, lat: -8.22, side: 'l', dy: -26},
];
export const mapGeometry = (L: Layout) => {
  const p = L.px;
  const paper = {x: p(30), y: p(420), w: p(1020), h: p(760)};
  const s = p(44.2);
  const proj = (lon: number, lat: number): Pt => [(lon - 94.5) * s, (7 - lat) * s];
  const city = (i: number): Pt => {
    const c = proj(MAP_CITIES[i].lon, MAP_CITIES[i].lat);
    return [paper.x + c[0], paper.y + c[1]];
  };
  return {paper, proj, city};
};

/** cities[i] = 0..1 (titik menyala); hop = indeks pecahan posisi amplop (2.4 = 40% dari kota 2 ke 3); slide = peta masuk */
export const MapScene: React.FC<S & {cities: number[]; hop: number; slide?: number}> = ({L, frame, cities, hop, slide = 1}) => {
  const p = L.px;
  const g = mapGeometry(L);
  const {w, h} = g.paper;
  const P = (q: Array<[number, number]>) => q.map(([lo, la]) => g.proj(lo, la));
  const pts = MAP_CITIES.map((c) => g.proj(c.lon, c.lat));
  const hi = Math.max(0, Math.min(pts.length - 1, hop));
  const a = pts[Math.floor(hi)];
  const b = pts[Math.min(pts.length - 1, Math.floor(hi) + 1)];
  const f = hi - Math.floor(hi);
  const ex = a[0] + (b[0] - a[0]) * f;
  const ey = a[1] + (b[1] - a[1]) * f - Math.sin(f * Math.PI) * p(46);
  const sl = clamp01(slide);
  return (
    <Desk frame={frame}>
      {/* penggaris kayu + pensil (set dressing) */}
      <div style={{position: 'absolute', left: p(120), top: p(300), width: p(820), height: p(54), background: 'linear-gradient(180deg, #b08a52, #8a6a3c)', transform: 'rotate(-2deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.6)'}}>
        {Array.from({length: 40}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: p(14 + i * 20), top: 0, width: 1.5, height: p(i % 5 === 0 ? 24 : 12), background: 'rgba(30,20,10,0.7)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: p(90), top: p(1240), width: p(520), height: p(16), background: 'linear-gradient(180deg, #c8a23a, #8f6f1f)', transform: 'rotate(3deg)', boxShadow: '0 4px 8px rgba(0,0,0,0.6)', borderRadius: p(4)}} />
      <div style={{position: 'absolute', left: g.paper.x, top: g.paper.y, width: w, height: h, transform: `translate(${(1 - sl) * p(-120)}px, ${(1 - sl) * p(900)}px) rotate(${-1.2 + (1 - sl) * 7}deg)`}}>
        <Paper w={w} h={h} color={MR.sea} seed={41}>
          <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
            {/* graticule */}
            {[96, 100, 104, 108, 112, 116].map((lo) => (
              <line key={lo} x1={g.proj(lo, 0)[0]} y1={0} x2={g.proj(lo, 0)[0]} y2={h} stroke="rgba(40,60,70,0.22)" strokeWidth={1} strokeDasharray="6 8" />
            ))}
            {[4, 0, -4, -8].map((la) => (
              <line key={la} x1={0} y1={g.proj(0, la)[1]} x2={w} y2={g.proj(0, la)[1]} stroke={la === 0 ? 'rgba(40,60,70,0.4)' : 'rgba(40,60,70,0.22)'} strokeWidth={1} strokeDasharray="6 8" />
            ))}
            {Object.entries(ID_DIM).map(([k, q]) => (
              <LowPoly key={k} id={`d-${k}`} pts={P(q)} base={MR.landDim} alt="#8f937f" stroke="rgba(30,36,28,0.35)" />
            ))}
            {Object.entries(ID_LAND).map(([k, q]) => (
              <LowPoly key={k} id={`i-${k}`} pts={P(q)} base={MR.land} alt={MR.landAlt} />
            ))}
            {/* jalur sebaran: garis putus merah antar titik yang sudah menyala */}
            {pts.map((q, i) => {
              if (i === 0) return null;
              const k = clamp01(i <= Math.floor(hi) ? 1 : i === Math.floor(hi) + 1 ? f : 0);
              if (k <= 0) return null;
              const o = pts[i - 1];
              return <line key={i} x1={o[0]} y1={o[1]} x2={o[0] + (q[0] - o[0]) * k} y2={o[1] + (q[1] - o[1]) * k} stroke={MR.red} strokeWidth={p(3)} strokeDasharray={`${p(9)} ${p(7)}`} strokeLinecap="round" opacity={0.85} />;
            })}
            {/* titik kota */}
            {pts.map((q, i) => {
              const k = clamp01(cities[i] ?? 0);
              if (k <= 0) return null;
              const ring = (frame / 26 + i * 0.37) % 1;
              return (
                <g key={i}>
                  <circle cx={q[0]} cy={q[1]} r={p(8) + ring * p(22)} fill="none" stroke={MR.red} strokeWidth={p(2)} opacity={(1 - ring) * 0.6 * k} />
                  <circle cx={q[0]} cy={q[1]} r={p(9) * (0.4 + 0.6 * k) * (1 + (1 - k) * 1.2)} fill={MR.red} stroke="#3a0a06" strokeWidth={1.5} />
                </g>
              );
            })}
            <text x={p(26)} y={h - p(24)} fontFamily={FONT.mono} fontSize={p(20)} fill="rgba(30,40,40,0.75)" letterSpacing={p(2)}>
              PETA SEBARAN PESAN BERANTAI · MEI 2008
            </text>
            {/* mata angin */}
            <g transform={`translate(${w - p(70)}, ${p(70)})`} stroke="rgba(30,40,40,0.7)" fill="none" strokeWidth={1.6}>
              <line x1={0} y1={p(30)} x2={0} y2={-p(30)} />
              <line x1={-p(18)} y1={0} x2={p(18)} y2={0} />
              <polygon points={`0,${-p(36)} ${-p(7)},${-p(20)} ${p(7)},${-p(20)}`} fill="rgba(30,40,40,0.7)" />
              <text x={-p(7)} y={-p(42)} fontFamily={FONT.mono} fontSize={p(18)} fill="rgba(30,40,40,0.8)" stroke="none">U</text>
            </g>
          </svg>
          {/* nama kota (mesin tik), muncul bersama titiknya */}
          {MAP_CITIES.map((c, i) => {
            const k = clamp01(cities[i] ?? 0);
            if (k <= 0) return null;
            const q = pts[i];
            const chars = Math.ceil(c.name.length * Math.min(1, k * 1.6));
            return (
              <div key={c.name} style={{position: 'absolute', top: q[1] - p(15) + p(c.dy ?? 0), ...(c.side === 'r' ? {left: q[0] + p(16)} : {right: w - q[0] + p(16)}), fontFamily: FONT.type, fontSize: p(24), color: '#1c1410', background: 'rgba(226,220,198,0.86)', padding: `${p(1)}px ${p(7)}px`, letterSpacing: p(1), whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.35)'}}>
                {c.name.slice(0, chars)}
              </div>
            );
          })}
          {/* amplop SMS melompat antar titik */}
          {hop >= 0 && (
            <div style={{position: 'absolute', left: ex - p(22), top: ey - p(44), width: p(44), height: p(30), background: '#efe8d2', border: `${p(2.5)}px solid #1c1410`, boxShadow: '0 4px 6px rgba(0,0,0,0.45)', transform: `rotate(${Math.sin(f * Math.PI) * -12}deg)`}}>
              <svg width={p(44)} height={p(30)} style={{position: 'absolute', left: -p(2.5), top: -p(2.5)}}>
                <polyline points={`${p(2)},${p(3)} ${p(22)},${p(18)} ${p(42)},${p(3)}`} fill="none" stroke="#1c1410" strokeWidth={p(2.5)} />
              </svg>
            </div>
          )}
        </Paper>
      </div>
    </Desk>
  );
};

/** label tanggal (pita + mesin tik) di luar kamera: "<hari> MEI 2008" */
export const DateTape: React.FC<{L: Layout; day: string; k: number; flip: number}> = ({L, day, k, flip}) => {
  const p = L.px;
  const kk = clamp01(k);
  if (kk <= 0) return null;
  const text = `${day} MEI 2008`;
  const chars = Math.ceil(text.length * kk);
  return (
    <div style={{position: 'absolute', left: p(84), top: p(404), transform: `rotate(-3deg) translateY(${(1 - Math.min(1, kk * 4)) * -p(40)}px)`, opacity: Math.min(1, kk * 4)}}>
      <Tape x={0} y={0} w={p(380)} h={p(74)}>
        <span style={{fontSize: p(44), letterSpacing: p(4), transform: `scaleY(${1 - 0.5 * Math.sin(clamp01(flip) * Math.PI)})`, display: 'inline-block'}}>{text.slice(0, chars)}</span>
      </Tape>
    </div>
  );
};

/* =================== adegan 4: kliping koran =================== */
const Columns: React.FC<{w: number; h: number; seed: string; cols?: number}> = ({w, h, seed, cols = 3}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: cols}, (_, c) =>
      Array.from({length: Math.floor(h / 13)}, (_, r) => {
        const cw = w / cols - 14;
        const x = c * (w / cols) + 7;
        return <line key={`${c}-${r}`} x1={x} y1={r * 13 + 6} x2={x + cw * (0.7 + 0.3 * random(`${seed}${c}${r}`))} y2={r * 13 + 6} stroke="rgba(40,34,28,0.5)" strokeWidth={3.2} />;
      }),
    )}
  </svg>
);

export const clipGeometry = (L: Layout) => {
  const p = L.px;
  return {
    a: {x: p(100), y: p(410), w: p(600), h: p(300)},
    b: {x: p(130), y: p(560), w: p(800), h: p(330)},
    c: {x: p(100), y: p(880), w: p(820), h: p(300)},
  };
};

/** dropA..C = 0..1 kliping jatuh ke meja; hoax = cap di kliping isu; under = garis bawah merah di kliping C */
export const ClipScene: React.FC<S & {dropA: number; dropB: number; dropC: number; hoax: number; under: number}> = ({L, frame, dropA, dropB, dropC, hoax, under}) => {
  const p = L.px;
  const g = clipGeometry(L);
  const fall = (k: number, rot: number, dx: number): React.CSSProperties => {
    const kk = clamp01(k);
    return {transform: `translate(${(1 - kk) * dx}px, ${(1 - kk) * -p(700)}px) rotate(${rot + (1 - kk) * 16}deg) scale(${1 + (1 - kk) * 0.25})`, opacity: Math.min(1, kk * 5)};
  };
  const head: React.CSSProperties = {fontFamily: FONT.print, color: '#16120e', lineHeight: 1.04, letterSpacing: p(1)};
  const small: React.CSSProperties = {fontFamily: FONT.mono, fontSize: p(21), color: 'rgba(30,24,18,0.9)', lineHeight: 1.3};
  const un = clamp01(under);
  return (
    <Desk frame={frame}>
      {/* kliping A: isu (judul ditulis ulang) → dicap HOAKS */}
      <div style={{position: 'absolute', left: g.a.x, top: g.a.y, width: g.a.w, height: g.a.h, ...fall(dropA, -5, p(-200))}}>
        <Paper w={g.a.w} h={g.a.h} color="#cfc6ad" seed={12}>
          <div style={{position: 'absolute', left: p(22), top: p(14), ...small, fontSize: p(18), letterSpacing: p(2)}}>KABAR DAERAH · MEI 2008</div>
          <div style={{position: 'absolute', left: p(22), right: p(22), top: p(44), ...head, fontSize: p(44)}}>ISU “TELEPON MAUT” RESAHKAN WARGA</div>
          <div style={{position: 'absolute', left: p(22), top: p(150), width: g.a.w - p(44), height: p(130)}}>
            <Columns w={g.a.w - p(44)} h={p(130)} seed="ca" />
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: clamp01(hoax), transform: `scale(${1 + (1 - clamp01(hoax)) * 0.5})`}}>
            <Stamp text="HOAKS" x={p(280)} y={p(40)} size={p(42)} rot={-7} color={MR.redInk} />
          </div>
        </Paper>
      </div>
      {/* kliping B: jawaban polisi */}
      <div style={{position: 'absolute', left: g.b.x, top: g.b.y, width: g.b.w, height: g.b.h, ...fall(dropB, 2, p(260))}}>
        <Paper w={g.b.w} h={g.b.h} color={MR.news} seed={22}>
          <div style={{position: 'absolute', left: p(26), top: p(16), ...small, fontSize: p(19), letterSpacing: p(2)}}>JAKARTA · 9 MEI 2008</div>
          <div style={{position: 'absolute', left: p(26), right: p(20), top: p(46), ...head, fontSize: p(82)}}>POLISI: KABAR BOHONG</div>
          <div style={{position: 'absolute', left: p(26), right: p(26), top: p(226), height: 2, background: 'rgba(30,24,18,0.6)'}} />
          <div style={{position: 'absolute', left: p(26), right: p(26), top: p(238), ...small}}>
            “Itu sengaja dibuat untuk membuat masyarakat resah”
            <br />— Kadiv Humas Mabes Polri (Kompas, 9 Mei 2008)
          </div>
        </Paper>
      </div>
      {/* kliping C: tidak ada kematian yang terbukti */}
      <div style={{position: 'absolute', left: g.c.x, top: g.c.y, width: g.c.w, height: g.c.h, ...fall(dropC, -2.5, p(-240))}}>
        <Paper w={g.c.w} h={g.c.h} color="#d9d2bd" seed={32}>
          <div style={{position: 'absolute', left: p(26), right: p(20), top: p(22), ...head, fontSize: p(62)}}>TIDAK ADA KEMATIAN YANG TERBUKTI</div>
          <svg width={g.c.w} height={g.c.h} style={{position: 'absolute', inset: 0}}>
            <path d={`M ${p(30)} ${p(162)} Q ${g.c.w * 0.3} ${p(150)} ${g.c.w * 0.55} ${p(164)} T ${g.c.w - p(60)} ${p(158)}`} fill="none" stroke={MR.red} strokeWidth={p(7)} strokeLinecap="round" strokeDasharray={g.c.w} strokeDashoffset={g.c.w * (1 - un)} opacity={0.85} />
          </svg>
          <div style={{position: 'absolute', left: p(26), right: p(26), top: p(186), ...small}}>
            Polda Riau: “Semuanya hanya bohong.” (detikcom, 14 Mei 2008)
            <br />Tidak ada laporan kematian yang terverifikasi.
          </div>
        </Paper>
      </div>
    </Desk>
  );
};

/* =================== adegan 5b: berkas "pengirim awal" =================== */
export const formGeometry = (L: Layout) => {
  const p = L.px;
  const paper = {x: p(110), y: p(430), w: p(820), h: p(740)};
  const row = (i: number) => ({x: paper.x + p(40), y: paper.y + p([212, 350, 462, 588][i]), w: paper.w - p(80)});
  return {folder: {x: p(60), y: p(390), w: p(940), h: p(830)}, paper, row};
};

/** status = ketikan baris STATUS 0..1; jumlah = baris JUMLAH; iseng = cap; bar = balok hitam menutup nama; note = tulisan tangan */
export const FormScene: React.FC<S & {status: number; jumlah: number; iseng: number; bar: number; note: number; slide?: number}> = ({L, frame, status, jumlah, iseng, bar, note, slide = 1}) => {
  const p = L.px;
  const g = formGeometry(L);
  const {paper} = g;
  const typed = (s: string, k: number) => s.slice(0, Math.ceil(s.length * clamp01(k)));
  const label: React.CSSProperties = {fontFamily: FONT.mono, fontSize: p(28), color: 'rgba(36,28,23,0.85)', letterSpacing: p(2)};
  const value: React.CSSProperties = {fontFamily: FONT.type, fontSize: p(38), color: PAL.ink, letterSpacing: p(1.5)};
  const rowY = (i: number) => g.row(i).y - paper.y;
  const sl = clamp01(slide);
  const st = 'DIAMANKAN POLISI RIAU';
  const src = 'kata humas Ditjen Postel, 13 Mei 2008';
  const nt = 'tidak pernah diumumkan';
  return (
    <Desk frame={frame}>
      <div style={{position: 'absolute', left: g.folder.x, top: g.folder.y, width: g.folder.w, height: g.folder.h, background: MR.manila, borderRadius: p(6), boxShadow: '0 14px 30px rgba(0,0,0,0.7)', transform: 'rotate(1deg)'}}>
        <NoiseFill tex="paper" opacity={0.35} blend="multiply" />
        <NoiseFill tex="stain" opacity={0.35} blend="multiply" />
        <div style={{position: 'absolute', right: p(40), top: -p(46), width: p(330), height: p(52), background: '#c4ae7c', borderRadius: `${p(10)}px ${p(10)}px 0 0`, fontFamily: FONT.mono, fontSize: p(24), color: PAL.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: p(2)}}>RIAU · MEI 2008</div>
      </div>
      <div style={{position: 'absolute', left: paper.x, top: paper.y, width: paper.w, height: paper.h, transform: `translateY(${(1 - sl) * p(60)}px) rotate(${-1.2 + (1 - sl) * 3}deg)`, opacity: Math.min(1, sl * 4)}}>
        <Paper w={paper.w} h={paper.h} color="#e6dfcb" seed={71}>
          <div style={{position: 'absolute', left: p(40), top: p(30), ...label, fontSize: p(24)}}>BERKAS · PESAN BERANTAI “NOMOR MERAH”</div>
          <div style={{position: 'absolute', left: p(40), top: p(74), fontFamily: FONT.type, fontSize: p(60), color: PAL.ink, letterSpacing: p(4)}}>PENGIRIM AWAL</div>
          <div style={{position: 'absolute', left: p(40), right: p(40), top: p(160), height: 3, background: 'rgba(36,28,23,0.7)'}} />
          {/* kotak foto kosong: tidak ada wajah */}
          <div style={{position: 'absolute', right: p(40), top: p(22), width: p(120), height: p(128), border: '2px dashed rgba(36,28,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: FONT.mono, fontSize: p(17), color: 'rgba(36,28,23,0.7)', letterSpacing: p(1)}}>
            <div style={{fontSize: p(50), lineHeight: 1}}>?</div>
            FOTO —
          </div>
          {/* STATUS */}
          <div style={{position: 'absolute', left: p(40), top: rowY(0), ...label}}>STATUS</div>
          <div style={{position: 'absolute', left: p(190), top: rowY(0) - p(8), ...value}}>
            {typed(st, status)}
            {status > 0 && status < 1 ? '▮' : ''}
          </div>
          <div style={{position: 'absolute', left: p(190), top: rowY(0) + p(48), fontFamily: FONT.hand, fontSize: p(22), color: MR.blueInk, whiteSpace: 'nowrap'}}>{typed(src, status * 2 - 1)}</div>
          <div style={{position: 'absolute', left: p(40), right: p(40), top: rowY(0) + p(104), height: 1.5, background: 'rgba(36,28,23,0.45)'}} />
          {/* JUMLAH */}
          <div style={{position: 'absolute', left: p(40), top: rowY(1), ...label}}>JUMLAH</div>
          <div style={{position: 'absolute', left: p(190), top: rowY(1) - p(8), ...value}}>{typed('SATU ORANG', jumlah)}</div>
          <div style={{position: 'absolute', left: p(40), right: p(40), top: rowY(1) + p(64), height: 1.5, background: 'rgba(36,28,23,0.45)'}} />
          {/* MOTIF + cap ISENG */}
          <div style={{position: 'absolute', left: p(40), top: rowY(2), ...label}}>MOTIF</div>
          <div style={{position: 'absolute', left: 0, top: 0, opacity: clamp01(iseng), transform: `scale(${1 + (1 - clamp01(iseng)) * 0.55})`, transformOrigin: `${p(330)}px ${rowY(2) + p(20)}px`}}>
            <Stamp text="ISENG" x={p(200)} y={rowY(2) - p(34)} size={p(58)} rot={-6} color={MR.redInk} />
          </div>
          <div style={{position: 'absolute', left: p(40), right: p(40), top: rowY(2) + p(82), height: 1.5, background: 'rgba(36,28,23,0.45)'}} />
          {/* NAMA + balok hitam */}
          <div style={{position: 'absolute', left: p(40), top: rowY(3), ...label}}>NAMA</div>
          <div style={{position: 'absolute', left: p(190), top: rowY(3) - p(10), ...value, opacity: 0.55}}>—————————————</div>
          <div style={{position: 'absolute', left: p(182), top: rowY(3) - p(14), width: p(470) * clamp01(bar), height: p(58), background: '#0b0a09', transform: 'rotate(-0.6deg)', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)'}} />
          <div style={{position: 'absolute', left: p(190), top: rowY(3) + p(62), fontFamily: FONT.hand, fontSize: p(30), color: MR.redInk, whiteSpace: 'nowrap'}}>{typed(nt, note)}</div>
        </Paper>
        {/* klip kertas */}
        <div style={{position: 'absolute', left: paper.w * 0.08, top: -p(22), width: p(40), height: p(86), borderRadius: p(18), border: `${p(5)}px solid #8d9296`, boxShadow: '0 3px 5px rgba(0,0,0,0.5)'}} />
      </div>
    </Desk>
  );
};

/* =================== adegan 6: catatan pengakuan di atas rekaman lantai =================== */
/** note = catatan masuk; items = 0..3 butir gejala; clip = kliping Jakarta masuk; stamp = cap SUGESTI? */
export const NoteOverlay: React.FC<{L: Layout; note: number; items: number; clip: number; stamp: number}> = ({L, note, items, clip, stamp}) => {
  const p = L.px;
  const nk = clamp01(note);
  const ck = clamp01(clip);
  const list = ['pusing', 'lemas', 'pingsan'];
  return (
    <AbsoluteFill>
      {nk > 0 && (
        <div style={{position: 'absolute', left: p(76), top: p(404), width: p(430), height: p(300), transform: `translate(${(1 - nk) * -p(500)}px, 0) rotate(${-3 + (1 - nk) * -8}deg)`}}>
          <Paper w={p(430)} h={p(300)} color="#e3dbc4" seed={51}>
            <div style={{position: 'absolute', left: p(24), top: p(18), fontFamily: FONT.type, fontSize: p(46), color: MR.redInk, letterSpacing: p(4)}}>MENGAKU:</div>
            {list.map((s, i) => {
              const k = clamp01(items - i);
              return (
                <div key={s} style={{position: 'absolute', left: p(30), top: p(86 + i * 56), fontFamily: FONT.type, fontSize: p(40), color: PAL.ink, letterSpacing: p(2)}}>
                  {k > 0 ? `· ${s.slice(0, Math.ceil(s.length * k))}` : ''}
                </div>
              );
            })}
            <div style={{position: 'absolute', left: p(24), bottom: p(12), fontFamily: FONT.mono, fontSize: p(19), color: 'rgba(36,28,23,0.8)'}}>Antara, 15 Mei 2008</div>
          </Paper>
          <Tape x={p(150)} y={-p(14)} w={p(120)} h={p(30)} rot={-4} />
        </div>
      )}
      {ck > 0 && (
        <div style={{position: 'absolute', left: p(528), top: p(430), width: p(424), height: p(262), transform: `translate(${(1 - ck) * p(520)}px, 0) rotate(${2.5 + (1 - ck) * 9}deg)`}}>
          <Paper w={p(424)} h={p(262)} color={MR.news} seed={52}>
            <div style={{position: 'absolute', left: p(20), top: p(14), fontFamily: FONT.mono, fontSize: p(18), color: 'rgba(30,24,18,0.85)', letterSpacing: p(2)}}>JAKARTA · 14 MEI 2008</div>
            <div style={{position: 'absolute', left: p(20), right: p(16), top: p(44), fontFamily: FONT.print, fontSize: p(37), lineHeight: 1.08, color: '#16120e'}}>
              Seorang pria <span style={{color: MR.redInk}}>mengaku</span>: layar memerah, tangan kejang
            </div>
            <div style={{position: 'absolute', left: p(20), bottom: p(12), fontFamily: FONT.mono, fontSize: p(19), color: 'rgba(36,28,23,0.8)'}}>Kompas, 14 Mei 2008</div>
          </Paper>
        </div>
      )}
      <Slip L={L} text="SUGESTI?" sub="Wagub Bengkulu, 15 Mei 2008" x={p(270)} y={p(706)} w={p(480)} rot={-4} k={stamp} size={62} />
    </AbsoluteFill>
  );
};

/* =================== adegan 7: jejak di peta dunia =================== */
const WORLD: Record<string, Array<[number, number]>> = {
  afrika: [[-6, 35.8], [10, 37], [11, 33.5], [20, 31], [25, 31.7], [32.5, 31.2], [35, 28], [37, 21], [39.5, 15.5], [43, 11.8], [51, 11.8], [48, 5], [41.5, -2], [39, -7], [40.5, -13], [35, -20], [13, -20], [13, -12.5], [12, -5], [9.3, 0.5], [9.5, 4], [6, 4.4], [2.5, 6.3], [-4, 5.2], [-7.5, 4.4], [-13, 8.5], [-16.5, 12.5], [-17.4, 14.7], [-16, 20], [-13, 27.5], [-9.8, 31.5]],
  eropa: [[-9.3, 43], [-8.9, 37], [-5.5, 36], [-0.3, 38.5], [3.2, 42.3], [9, 44.2], [12.5, 41.5], [16, 38], [18.3, 40], [16, 41], [12.5, 44], [14, 45.5], [19.5, 42], [21, 39], [23.5, 38], [26, 40.5], [29, 41], [28.5, 43.5], [31, 46.5], [38, 47], [40, 52], [-4, 52], [-4.5, 48.5], [-1.8, 43.4]],
  asia: [[26, 40.5], [29, 41], [36, 41.8], [41, 41.5], [40, 47], [40, 52], [135, 52], [135, 44], [130, 42.5], [129.3, 35.5], [126.5, 34.5], [126, 38], [122, 40], [118, 39], [122, 37], [119, 35], [121.8, 31], [120, 27], [116, 23], [110, 21.3], [108, 21.5], [106, 19.5], [109, 13], [106.7, 10.5], [105, 8.7], [102.5, 12.2], [100.9, 13.3], [99.3, 9.5], [100.5, 7], [103.4, 1.4], [101.3, 2.9], [100.3, 5.5], [98.3, 8.2], [98.7, 12], [97.6, 16.5], [94.3, 16], [94, 19.5], [91.5, 22.5], [88.5, 21.7], [86.9, 20.7], [80.3, 15.5], [80, 10.5], [77.5, 8.1], [76.3, 10], [73.5, 16], [72.8, 19], [72.6, 21.5], [70, 20.8], [68.8, 23.5], [67, 24.8], [61.5, 25.2], [57, 26.7], [51.5, 27.8], [48.5, 30], [50.8, 25.5], [54, 24.2], [56.4, 26.3], [59.8, 22.5], [55, 17], [52, 16.2], [45, 12.8], [43.3, 12.7], [42.5, 16.5], [39, 21.5], [35, 28], [34.3, 31.3], [36, 36], [30.5, 36.5], [27.3, 37]],
  srilanka: [[80, 9.7], [81.8, 7.5], [80.2, 6], [79.8, 8]],
  sumatera: [[95.3, 5.5], [98.7, 3.7], [103.5, 0.3], [106, -3], [105.8, -5.8], [104, -5], [100.3, -1], [97, 3]],
  jawa: [[105.2, -6.8], [106.8, -6], [112.7, -7.1], [114.5, -7.8], [114.6, -8.7], [108.5, -7.8]],
  kalimantan: [[109, 1.3], [110.2, -2.9], [114.6, -3.9], [116.6, -2.2], [118, 1], [117.5, 4.5], [119, 6.8], [116, 6.8], [113, 3.2]],
  sulawesi: [[119.5, 0.8], [124.5, 1], [121, -0.9], [123, -4.5], [120.2, -5.5], [119.3, -3.4]],
  filipina: [[120.5, 18.3], [122.2, 17], [124, 12.5], [126.3, 7], [124, 6.3], [122, 9], [120, 13.5]],
  taiwan: [[121, 25], [121.8, 22.3], [120.2, 22.8]],
  madagaskar: [[49.2, -12], [50.4, -16], [47.3, -20], [44, -20], [44.3, -16.3]],
  papua: [[131, -1], [135, -3.4], [135, -8], [132.5, -4]],
};
export const WORLD_PINS: Array<{year: string; name: string; lon: number; lat: number; dx: number; dy: number}> = [
  {year: '2004', name: 'NIGERIA', lon: 7.5, lat: 9, dx: -40, dy: -130},
  {year: '2006', name: 'INDIA', lon: 78.5, lat: 21, dx: 30, dy: 70},
  {year: '2007', name: 'PAKISTAN', lon: 69.3, lat: 30, dx: -290, dy: -90},
  {year: '2008', name: 'INDONESIA', lon: 101.5, lat: 0.5, dx: -150, dy: 80},
];
export const worldGeometry = (L: Layout) => {
  const p = L.px;
  const s = p(9.5);
  const paper = {x: p(-200), y: p(520), w: 160 * s, h: 72 * s};
  const proj = (lon: number, lat: number): Pt => [(lon + 25) * s, (52 - lat) * s];
  const pin = (i: number): Pt => {
    const c = proj(WORLD_PINS[i].lon, WORLD_PINS[i].lat);
    return [paper.x + c[0], paper.y + c[1]];
  };
  const inset = {x: p(640), y: p(300), w: p(390), h: p(310)};
  return {paper, proj, pin, inset};
};

/** pins[i] 0..1 (pin + label tahun); string = 0..3 panjang benang merah antar pin; inset = foto layar "RED" masuk */
export const WorldScene: React.FC<S & {pins: number[]; string: number; inset: number}> = ({L, frame, pins, string, inset}) => {
  const p = L.px;
  const g = worldGeometry(L);
  const {w, h} = g.paper;
  const P = (q: Array<[number, number]>) => q.map(([lo, la]) => g.proj(lo, la));
  const pp = WORLD_PINS.map((c) => g.proj(c.lon, c.lat));
  const ik = clamp01(inset);
  return (
    <Desk frame={frame} dark={0.15}>
      {/* catatan tempel di atas peta: daftar gelombang, dicentang saat pin menancap */}
      <div style={{position: 'absolute', left: p(70), top: p(120), width: p(470), height: p(330), transform: 'rotate(-2deg)'}}>
        <Paper w={p(470)} h={p(330)} color="#e3dbc4" seed={81}>
          <div style={{position: 'absolute', left: p(24), top: p(18), fontFamily: FONT.mono, fontSize: p(24), color: PAL.ink, letterSpacing: p(2)}}>PESAN SERUPA SEBELUMNYA</div>
          {WORLD_PINS.map((c, i) => (
            <div key={c.year} style={{position: 'absolute', left: p(26), top: p(70 + i * 60), fontFamily: FONT.type, fontSize: p(36), color: PAL.ink, letterSpacing: p(2), whiteSpace: 'nowrap'}}>
              <span style={{display: 'inline-block', width: p(34), color: MR.redInk}}>{(pins[i] ?? 0) > 0.5 ? '×' : '·'}</span>
              {c.year} {c.name}
            </div>
          ))}
          <div style={{position: 'absolute', left: p(26), bottom: p(10), fontFamily: FONT.mono, fontSize: p(18), color: 'rgba(36,28,23,0.8)'}}>J. Bonhomme, Tracés 21 (2011)</div>
        </Paper>
        <Tape x={p(170)} y={-p(14)} w={p(120)} h={p(30)} rot={3} />
      </div>
      {/* properti meja: penggaris, pensil, tumpukan amplop */}
      <div style={{position: 'absolute', left: p(-120), top: p(1270), width: p(900), height: p(54), background: 'linear-gradient(180deg, #b08a52, #8a6a3c)', transform: 'rotate(2deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.6)'}}>
        {Array.from({length: 44}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: p(14 + i * 20), top: 0, width: 1.5, height: p(i % 5 === 0 ? 24 : 12), background: 'rgba(30,20,10,0.7)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: p(700), top: p(1330), width: p(520), height: p(16), background: 'linear-gradient(180deg, #c8a23a, #8f6f1f)', transform: 'rotate(-6deg)', boxShadow: '0 4px 8px rgba(0,0,0,0.6)', borderRadius: p(4)}} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: p(1040 + i * 26), top: p(150 + i * 34), width: p(360), height: p(230), background: i === 2 ? '#e9e2cf' : '#d9d0b8', boxShadow: '0 8px 16px rgba(0,0,0,0.6)', transform: `rotate(${5 - i * 4}deg)`}}>
          <svg width={p(360)} height={p(230)} style={{position: 'absolute', inset: 0}}>
            <polyline points={`0,0 ${p(180)},${p(120)} ${p(360)},0`} fill="none" stroke="rgba(60,50,40,0.45)" strokeWidth={2} />
          </svg>
        </div>
      ))}
      {/* peta dunia low-poly */}
      <div style={{position: 'absolute', left: g.paper.x, top: g.paper.y, width: w, height: h, transform: 'rotate(-0.6deg)'}}>
        <Paper w={w} h={h} color={MR.sea} seed={83}>
          <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
            {[0, 30, 60, 90, 120].map((lo) => (
              <line key={lo} x1={g.proj(lo, 0)[0]} y1={0} x2={g.proj(lo, 0)[0]} y2={h} stroke="rgba(40,60,70,0.22)" strokeWidth={1} strokeDasharray="6 8" />
            ))}
            {[40, 20, 0].map((la) => (
              <line key={la} x1={0} y1={g.proj(0, la)[1]} x2={w} y2={g.proj(0, la)[1]} stroke={la === 0 ? 'rgba(40,60,70,0.4)' : 'rgba(40,60,70,0.22)'} strokeWidth={1} strokeDasharray="6 8" />
            ))}
            {Object.entries(WORLD).map(([k, q]) => (
              <LowPoly key={k} id={`w-${k}`} pts={P(q)} base={MR.land} alt={MR.landAlt} />
            ))}
            {/* benang merah (garis putus) Nigeria → India → Pakistan → Indonesia */}
            {pp.map((q, i) => {
              if (i === 0) return null;
              const k = clamp01(string - (i - 1));
              if (k <= 0) return null;
              const o = pp[i - 1];
              return (
                <g key={i}>
                  <line x1={o[0] + 3} y1={o[1] + 5} x2={o[0] + (q[0] - o[0]) * k + 3} y2={o[1] + (q[1] - o[1]) * k + 5} stroke="rgba(0,0,0,0.4)" strokeWidth={p(4)} strokeDasharray={`${p(14)} ${p(9)}`} />
                  <line x1={o[0]} y1={o[1]} x2={o[0] + (q[0] - o[0]) * k} y2={o[1] + (q[1] - o[1]) * k} stroke={PAL.string} strokeWidth={p(3.5)} strokeDasharray={`${p(14)} ${p(9)}`} />
                </g>
              );
            })}
          </svg>
          {WORLD_PINS.map((c, i) => {
            const k = clamp01(pins[i] ?? 0);
            if (k <= 0) return null;
            const q = pp[i];
            const text = `${c.year} ${c.name}`;
            return (
              <React.Fragment key={c.year}>
                <div style={{position: 'absolute', left: q[0] + p(c.dx), top: q[1] + p(c.dy), transform: `rotate(${i % 2 ? 2 : -3}deg)`, opacity: Math.min(1, k * 3)}}>
                  <Tape x={0} y={0} w={p(34 + text.length * 25)} h={p(52)}>
                    <span style={{fontSize: p(34), letterSpacing: p(2)}}>{text.slice(0, Math.ceil(text.length * k))}</span>
                  </Tape>
                </div>
                <div style={{transform: `translateY(${(1 - k) * -p(60)}px)`, opacity: Math.min(1, k * 4)}}>
                  <Pin x={q[0]} y={q[1]} r={p(13)} />
                </div>
              </React.Fragment>
            );
          })}
        </Paper>
      </div>
      {/* sisipan: foto layar ponsel monokrom dengan kata RED di samping nomor (2007) */}
      {ik > 0 && (
        <div style={{position: 'absolute', left: g.inset.x, top: g.inset.y, width: g.inset.w, height: g.inset.h, transform: `translate(${(1 - ik) * p(500)}px, ${(1 - ik) * -p(120)}px) rotate(${3 + (1 - ik) * 12}deg)`, background: '#ebe5d6', boxShadow: '0 12px 24px rgba(0,0,0,0.7)', padding: p(14), boxSizing: 'border-box'}}>
          <div style={{position: 'relative', width: '100%', height: g.inset.h - p(74), background: '#16181a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <Img src={staticFile('3d/merah/lcd/red.png')} style={{width: p(336), height: p(224), imageRendering: 'pixelated'}} />
            <AbsoluteFill style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%)'}} />
          </div>
          <div style={{position: 'absolute', left: p(16), bottom: p(12), fontFamily: FONT.mono, fontSize: p(21), color: PAL.ink, letterSpacing: p(1)}}>2007 · layar tanpa warna</div>
          <Pin x={g.inset.w / 2} y={p(6)} r={p(11)} color="#2b5a8a" />
        </div>
      )}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.04 + 0.03 * smoothNoise('wr', frame, 9), background: '#000'}} />
    </Desk>
  );
};

/* =================== kartu sumber (di atas hitam) =================== */
export const SourceCard: React.FC<{L: Layout; opacity?: number; lines: string[]}> = ({L, opacity = 1, lines}) => {
  const p = L.px;
  return (
    <div style={{position: 'absolute', left: p(90), width: p(840), top: p(820), opacity, textAlign: 'center', fontFamily: FONT.mono, color: 'rgba(217,201,166,0.92)', fontSize: p(36), lineHeight: 1.45, letterSpacing: p(1)}}>
      {lines.map((s, i) => (
        <div key={i} style={i === 0 ? {fontSize: p(26), letterSpacing: p(8), color: 'rgba(217,201,166,0.6)', marginBottom: p(10)} : undefined}>{s}</div>
      ))}
    </div>
  );
};
