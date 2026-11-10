/**
 * Set-set WajahDiLukisan (2.5D). Pola sama dengan sets.tsx: menerima `frame` lokal dan nilai
 * animasi 0..1 dari pemanggil; kamera dibungkus <CameraRig> di luar.
 * Wajah dari public/faces/wajah/web (CC0/PD, kredit di public/faces/wajah/CREDITS.md).
 * Badan, kostum, siluet, ruangan, dan properti digambar sendiri di sini.
 */
import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import type {Layout} from '../studio';
import {FONT, NoiseFill, PAL, Paper, Stamp, Tape, smoothNoise} from './index';
import {clamp01} from './sets';

type S = {L: Layout; frame: number};

/* ---------- wajah ---------- */
export const FACES = {
  f1: {src: 'faces/wajah/web/f1.jpg', w: 1244, h: 1600},
  f1gray: {src: 'faces/wajah/web/f1-gray.jpg', w: 1244, h: 1600},
  f2: {src: 'faces/wajah/web/f2.jpg', w: 780, h: 900},
  f3: {src: 'faces/wajah/web/f3.jpg', w: 834, h: 900},
  f4gray: {src: 'faces/wajah/web/f4-gray.jpg', w: 932, h: 1200},
  f5: {src: 'faces/wajah/web/f5.jpg', w: 926, h: 1200},
  f6: {src: 'faces/wajah/web/f6.jpg', w: 696, h: 1100},
  f7: {src: 'faces/wajah/web/f7.jpg', w: 732, h: 900},
} as const;
type FaceKey = keyof typeof FACES;

/** Potong wajah dengan rect ternormalisasi [x, y, w, h] dari gambar sumber. Tinggi mengikuti proporsi rect. */
export const FaceCrop: React.FC<{
  face: FaceKey;
  rect?: [number, number, number, number];
  width: number;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({face, rect = [0, 0, 1, 1], width, style, imgStyle, children}) => {
  const f = FACES[face];
  const imgW = width / rect[2];
  const imgH = imgW * (f.h / f.w);
  const height = (rect[3] * f.h * width) / (rect[2] * f.w);
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', ...style}}>
      <Img src={staticFile(f.src)} style={{position: 'absolute', left: -rect[0] * imgW, top: -rect[1] * imgH, width: imgW, height: imgH, maxWidth: 'none', ...imgStyle}} />
      {children}
    </div>
  );
};

/* ---------- bingkai emas ---------- */
const GoldFrame: React.FC<{w: number; h: number; t: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, t, children, style}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      padding: t,
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #5c4318 0%, #c9a24e 18%, #7a5a22 34%, #e0c06a 50%, #6d4f1c 66%, #b8913f 82%, #4a3412 100%)',
      boxShadow: `0 ${t * 0.6}px ${t * 1.6}px rgba(0,0,0,0.85), inset 0 0 ${t * 0.5}px rgba(0,0,0,0.7)`,
      ...style,
    }}
  >
    {/* lis dalam */}
    <div style={{position: 'absolute', inset: t * 0.72, border: `${t * 0.1}px solid rgba(60,40,10,0.8)`, boxShadow: `inset 0 0 ${t * 0.3}px rgba(0,0,0,0.9)`}} />
    {/* ornamen titik-titik */}
    <div
      style={{
        position: 'absolute',
        inset: t * 0.22,
        border: `${t * 0.12}px dotted rgba(255,226,140,0.55)`,
      }}
    />
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0c0a08'}}>{children}</div>
  </div>
);

/* ---------- retak cat ---------- */
const Craquelure: React.FC<{w: number; h: number; seed: string; opacity?: number}> = ({w, h, seed, opacity = 0.35}) => {
  const paths = Array.from({length: 70}, (_, i) => {
    let x = random(`${seed}-x-${i}`) * w;
    let y = random(`${seed}-y-${i}`) * h;
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const segs = 3 + Math.floor(random(`${seed}-n-${i}`) * 4);
    for (let s = 0; s < segs; s++) {
      x += (random(`${seed}-dx-${i}-${s}`) - 0.5) * w * 0.12;
      y += (random(`${seed}-dy-${i}-${s}`) - 0.5) * h * 0.08;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  });
  return (
    <svg style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity}} width={w} height={h}>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="#1a120a" strokeWidth={0.8} fill="none" />
      ))}
    </svg>
  );
};

/* ---------- lukisan rekonstruksi "1562" ---------- */
/**
 * Lukisan rekonstruksi: dasar lukisan F1 (CC0, Lombardia ±1540), ditambah properti buatan sendiri
 * di langkan bawah (sarung tangan duel baja + gagang rapier), pernis, retak, dan bayangan wajah.
 * Mata F1 di (0.478, 0.221) gambar; bayangan menutupi mata saat faceLight = 0.
 */
export const NoblemanCanvas: React.FC<{w: number; faceLight?: number}> = ({w, faceLight = 0}) => {
  const h = w * 1.3;
  const shade = 1 - clamp01(faceLight);
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#0b0906'}}>
      <FaceCrop face="f1" rect={[0, 0, 1, 0.99]} width={w} style={{position: 'absolute', left: 0, top: 0}} />
      {/* langkan + sarung tangan duel + gagang rapier (buatan sendiri, dibuat redup agar menyatu) */}
      <svg style={{position: 'absolute', inset: 0}} width={w} height={h} viewBox="0 0 600 780" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nb-steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9a9a92" />
            <stop offset="0.45" stopColor="#55564f" />
            <stop offset="1" stopColor="#1d1d1a" />
          </linearGradient>
          <linearGradient id="nb-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9a95a" />
            <stop offset="0.5" stopColor="#7d5f22" />
            <stop offset="1" stopColor="#3b2b0c" />
          </linearGradient>
          <linearGradient id="nb-ledge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3d2a15" />
            <stop offset="0.12" stopColor="#5a3f20" />
            <stop offset="0.2" stopColor="#24180c" />
            <stop offset="1" stopColor="#0d0805" />
          </linearGradient>
        </defs>
        <rect x="0" y="690" width="600" height="90" fill="url(#nb-ledge)" />
        {/* gagang rapier di kiri, menyandar ke langkan */}
        <g transform="translate(92 640) rotate(-18)" opacity="0.92">
          <rect x="-3.5" y="12" width="7" height="140" fill="url(#nb-steel)" />
          <path d="M-36 6 L36 6" stroke="url(#nb-gold)" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M-30 6 Q-38 -40 0 -48 Q38 -40 30 6" stroke="url(#nb-gold)" strokeWidth="3.5" fill="none" />
          <path d="M-20 6 Q-24 30 0 36 Q24 30 20 6" stroke="url(#nb-gold)" strokeWidth="3" fill="none" />
          <rect x="-3.5" y="-50" width="7" height="56" fill="#2e2012" />
          <circle cx="0" cy="-56" r="8.5" fill="url(#nb-gold)" />
        </g>
      </svg>
      {/* bayangan yang menutupi mata (hanya janggut terlihat) */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 24% 13% at 48% 21%, rgba(5,4,3,0.97) 0%, rgba(5,4,3,0.9) 55%, rgba(5,4,3,0) 100%)',
          opacity: shade,
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,4,3,0.75) 0%, rgba(5,4,3,0.35) 14%, rgba(5,4,3,0) 24%)', opacity: shade}} />
      {/* pernis menguning + retak */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, rgba(190,150,60,0.12) 0%, rgba(70,45,10,0.4) 100%)', mixBlendMode: 'multiply'}} />
      <NoiseFill tex="paper" opacity={0.16} blend="overlay" tileSize={256} />
      <Craquelure w={w} h={h} seed="noble" opacity={0.3} />
    </div>
  );
};

/* ---------- kartu label museum ---------- */
/** `lines` = jumlah baris yang sudah diketik (pecahan = baris sedang diketik). Urutan: judul 1, judul 2, tahun, pelukis, subjek. */
export const MuseumLabel: React.FC<{L: Layout; x: number; y: number; w: number; painter?: string; subject?: string; lines?: number}> = ({
  L,
  x,
  y,
  w,
  painter = '————',
  subject = '————',
  lines = 99,
}) => {
  const fs = L.px(22);
  const line = (txt: string, i: number, style?: React.CSSProperties) => (
    <div style={{height: fs * 1.45, whiteSpace: 'nowrap', clipPath: `inset(-20% ${100 - clamp01(lines - i) * 100}% -20% 0)`, ...style}}>{txt}</div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        padding: `${L.px(14)}px ${L.px(20)}px`,
        background: '#e9e3d6',
        boxShadow: `0 ${L.px(6)}px ${L.px(18)}px rgba(0,0,0,0.7)`,
        fontFamily: FONT.mono,
        fontSize: fs,
        color: '#1d1a16',
        boxSizing: 'border-box',
      }}
    >
      {line('Potret Bangsawan dengan', 0, {fontFamily: FONT.print, fontSize: fs * 1.15})}
      {line('Sarung Tangan Duel', 1, {fontFamily: FONT.print, fontSize: fs * 1.15, marginBottom: fs * 0.3})}
      {line('Italia, 1562 · cat minyak', 2)}
      {line(`Pelukis: ${painter}`, 3)}
      {line(`Subjek:  ${subject}`, 4, subject === '?' ? {color: PAL.inkRed, fontWeight: 700} : undefined)}
    </div>
  );
};

/* ---------- pasangan 3D (PSX, Blender) ---------- */
/**
 * Pasangan galeri: render Blender dari motion-starters/reverse/WajahDiLukisan/couple_scene.py,
 * PNG transparan 320×320 "on twos" (hanya frame ganjil f_0001, f_0003, …) di public/3d/wajah/couple.
 * `n` = nomor frame render (1-based); dibulatkan ke frame ganjil.
 */
export const COUPLE_FRAMES = 397;
export const CoupleBillboard: React.FC<{n: number; size: number}> = ({n, size}) => {
  const k = Math.max(1, Math.min(COUPLE_FRAMES, n % 2 === 0 ? n - 1 : n));
  return <Img src={staticFile(`3d/wajah/couple/f_${String(k).padStart(4, '0')}.png`)} style={{width: size, height: size, imageRendering: 'pixelated'}} />;
};

/** Pria era 1820-an (mantel berekor, rambut ikal), menghadap kanan, sedang melangkah. */
export const Walker1820: React.FC<{w: number; flip?: boolean; color?: string; rim?: string; step?: number}> = ({w, flip, color = '#06080a', rim = 'rgba(205,220,230,0.6)', step = 0.5}) => {
  const s = (step - 0.5) * 36;
  return (
    <svg width={w} height={w * 2.6} viewBox="0 0 200 520" style={{transform: flip ? 'scaleX(-1)' : undefined}}>
      {/* rambut ikal + kepala dengan hidung ke kanan */}
      <path d="M74 44 Q66 16 82 10 Q90 0 106 4 Q124 2 130 18 Q140 30 134 46 L140 58 L132 62 Q134 74 124 84 L118 96 L92 96 Q78 82 76 66 Q66 56 74 44 Z" fill={color} />
      {/* kerah tinggi + mantel berekor */}
      <path d="M66 104 Q100 92 136 104 Q146 112 146 132 L148 236 L156 360 L128 362 L120 262 L84 262 L66 380 L44 372 L56 236 L58 132 Q58 112 66 104 Z" fill={color} />
      {/* lengan berayun */}
      <path d={`M128 112 Q150 140 ${150 + s * 0.6} 200 L${146 + s * 0.8} 262 L${132 + s * 0.8} 264 L${132 + s * 0.4} 200 L118 140 Z`} fill={color} />
      {/* kaki celana + sepatu, melangkah */}
      <path d={`M86 252 L112 252 L${100 - s} 496 L${74 - s} 500 Z`} fill={color} />
      <path d={`M${74 - s} 494 L${108 - s} 496 L${108 - s} 508 L${70 - s} 508 Z`} fill={color} />
      <path d={`M100 252 L126 252 L${128 + s} 496 L${104 + s} 496 Z`} fill={color} />
      <path d={`M${104 + s} 492 L${140 + s} 496 L${140 + s} 508 L${102 + s} 508 Z`} fill={color} />
      {/* cahaya bulan di tepi */}
      <path d="M130 18 Q140 30 134 46 L140 58" stroke={rim} strokeWidth="3" fill="none" />
      <path d="M136 104 Q146 112 146 132 L148 236 L156 360" stroke={rim} strokeWidth="3.5" fill="none" />
    </svg>
  );
};

/* =================== 1. galeri malam (CSS 3D) =================== */
export const GalleryScene: React.FC<S & {dolly?: number; coupleFrame?: number; spot?: number}> = ({L, frame, dolly = 0, coupleFrame = 300, spot = 1}) => {
  const W = L.width;
  const H = L.height;
  const hw = L.px(470); // setengah lebar lorong
  const wallH = L.px(1500);
  const eye = L.px(760); // tinggi mata dari lantai
  const depth = L.px(3600);
  const persp = L.px(1000);
  const hum = 0.88 + smoothNoise('spot', frame, 5) * 0.12;
  const wall = (children: React.ReactNode, style: React.CSSProperties) => (
    <div style={{position: 'absolute', height: wallH, background: 'linear-gradient(180deg, #1b1714 0%, #24201b 60%, #120f0d 100%)', overflow: 'hidden', ...style}}>
      <NoiseFill tex="paper" opacity={0.25} blend="multiply" tileSize={384} />
      {/* lis bawah */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: L.px(70), background: '#0d0b09', borderTop: `${L.px(4)}px solid #2c251d`}} />
      {children}
    </div>
  );
  const sideFrame = (face: FaceKey, at: number, size: number) => (
    <div style={{position: 'absolute', left: at, top: L.px(420)}}>
      <GoldFrame w={size} h={size * 1.2} t={L.px(26)}>
        <Img src={staticFile(FACES[face].src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'rgba(10,8,6,0.35)'}} />
      </GoldFrame>
    </div>
  );
  const mainW = L.px(560);
  return (
    <AbsoluteFill style={{backgroundColor: '#050404', perspective: persp, perspectiveOrigin: '50% 42%'}}>
      <div style={{position: 'absolute', left: W / 2, top: H * 0.42, transformStyle: 'preserve-3d', transform: `translateZ(${L.px(600) + dolly * L.px(900)}px)`}}>
        {/* dinding belakang + lukisan utama */}
        <div style={{position: 'absolute', left: -hw, top: -eye, width: hw * 2, height: wallH, transform: `translateZ(${-depth}px)`, background: '#1d1915'}}>
          <NoiseFill tex="paper" opacity={0.25} blend="multiply" />
          <div style={{position: 'absolute', left: hw - mainW / 2, top: L.px(300), filter: `brightness(${0.55 + 0.45 * spot * hum})`}}>
            <GoldFrame w={mainW} h={mainW * 1.3 + L.px(60)} t={L.px(30)}>
              <NoblemanCanvas w={mainW - L.px(60)} faceLight={0} />
            </GoldFrame>
          </div>
          {/* kolam cahaya sorot di dinding */}
          <div style={{position: 'absolute', left: hw - L.px(520), top: L.px(150), width: L.px(1040), height: L.px(1100), background: `radial-gradient(ellipse 45% 50% at 50% 40%, rgba(255,226,170,${0.42 * spot * hum}) 0%, rgba(255,210,150,${0.12 * spot * hum}) 45%, rgba(0,0,0,0) 72%)`, mixBlendMode: 'screen'}} />
        </div>
        {/* dinding kiri */}
        {wall(
          <>
            {sideFrame('f2', L.px(950), L.px(330))}
            {sideFrame('f3', L.px(1700), L.px(300))}
          </>,
          {left: -hw, top: -eye, width: depth, transformOrigin: 'left center', transform: 'rotateY(90deg)'},
        )}
        {/* dinding kanan */}
        {wall(<>{sideFrame('f7', L.px(1250), L.px(300))}</>, {left: hw - depth, top: -eye, width: depth, transformOrigin: 'right center', transform: 'rotateY(-90deg)'})}
        {/* lantai parket */}
        <div
          style={{
            position: 'absolute',
            left: -hw,
            top: wallH - eye - depth,
            width: hw * 2,
            height: depth,
            transformOrigin: 'bottom center',
            transform: 'rotateX(90deg)',
            background: `repeating-linear-gradient(90deg, #2a1d13 0, #3a2819 ${L.px(36)}px, #2f2116 ${L.px(70)}px, #1c130c ${L.px(74)}px)`,
          }}
        >
          <NoiseFill tex="wood" opacity={0.5} blend="multiply" />
          {/* pantulan lampu sorot di lantai */}
          <div style={{position: 'absolute', left: '20%', right: '20%', top: 0, height: '35%', background: `radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,220,160,${0.28 * spot * hum}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
        </div>
        {/* kerucut cahaya dari lampu sorot langit-langit ke lukisan */}
        <div
          style={{
            position: 'absolute',
            left: -hw,
            top: -eye,
            width: hw * 2,
            height: L.px(700),
            transform: `translateZ(${-depth + L.px(260)}px)`,
            // tanpa mix-blend-mode: blend mode di anak preserve-3d meratakan seluruh ruangan 3D
            background: `linear-gradient(180deg, rgba(255,226,170,${0.14 * spot * hum}) 0%, rgba(255,226,170,0) 100%)`,
            clipPath: 'polygon(46% 0, 54% 0, 92% 100%, 8% 100%)',
          }}
        />
        {/* pasangan 3D (billboard): telapak di lantai = 89% tinggi gambar render */}
        <div style={{position: 'absolute', left: L.px(50) - L.px(420), top: wallH - eye - L.px(840) * 0.89, transform: `translateZ(${-depth * 0.8}px)`}}>
          <CoupleBillboard n={coupleFrame} size={L.px(840)} />
        </div>
      </div>
      {/* gelap di ujung atas/bawah supaya tepi 3D tidak terlihat */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.85) 100%)'}} />
      {/* tiket di lantai, dekat kamera */}
      {/* tiket: di lantai, dalam safe zone (di atas zona caption) */}
      <Paper w={L.px(360)} h={L.px(150)} x={L.px(540)} y={L.px(1060)} rot={-14} color="#ddd3bf" seed={4}>
        <div style={{padding: L.px(16), fontFamily: FONT.mono, color: '#2a221b', fontSize: L.px(20), lineHeight: 1.35}}>
          <div style={{fontFamily: FONT.print, fontSize: L.px(24)}}>MUSEUM SENI · PHILADELPHIA</div>
          <div>DEWASA · 1 ORANG</div>
          <div>11.11.2012 · 16:42</div>
        </div>
        <div style={{position: 'absolute', right: L.px(14), top: 0, bottom: 0, width: L.px(2), borderRight: `${L.px(2)}px dashed rgba(40,30,20,0.5)`}} />
      </Paper>
      <Tape x={L.px(70)} y={L.pick({portrait: L.px(400), landscape: L.safe, square: L.safe})} w={L.px(250)} h={L.px(44)} rot={-1}>
        ARSIP 04
      </Tape>
    </AbsoluteFill>
  );
};

/* =================== 2/6. lukisan dari dekat =================== */
/** Geometri lukisan di PaintingScene (dipakai juga untuk origin kamera ke wajah). */
/**
 * Portrait mengikuti safe zone Shorts: bingkai y 300–1050 (wajah di y ±490), label y ±1070–1260
 * (di atas zona caption 1265–1480), semua teks di x 60–960.
 */
export const paintingGeometry = (L: Layout) => {
  const t = L.px(40);
  const fh = L.pick({portrait: L.px(750), landscape: L.height * 0.8, square: L.height * 0.62});
  const cw = (fh - t * 2) / 1.3;
  const fw = cw + t * 2;
  const fx = (L.width - fw) / 2;
  const fy = L.pick({portrait: L.px(300), landscape: L.height * 0.06, square: L.height * 0.05});
  return {fw, t, cw, fh, fx, fy, faceX: fx + t + cw * 0.478, faceY: fy + t + cw * 1.3 * 0.221, labelY: fy + fh + L.px(20)};
};

export const PaintingScene: React.FC<
  S & {faceLight?: number; labelLines?: number; painter?: string; subject?: string; spot?: number; exit?: boolean; subjectBlink?: number}
> = ({L, frame, faceLight = 0, labelLines = 99, painter, subject, spot = 1, exit, subjectBlink = 1}) => {
  const H = L.height;
  const {fw, t, cw, fh, fx, fy, labelY} = paintingGeometry(L);
  const hum = 0.86 + smoothNoise('spot2', frame, 5) * 0.14;
  const lit = spot * hum;
  return (
    <AbsoluteFill style={{backgroundColor: '#100d0b'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #1f1a15 0%, #17130f 100%)'}} />
      {/* dinding diperpanjang di luar bingkai supaya kamera yang digeser tidak memperlihatkan tepi set */}
      <div style={{position: 'absolute', left: -L.width * 0.3, right: -L.width * 0.3, top: H, height: H * 0.7, background: '#040303'}} />
      <div style={{position: 'absolute', left: -L.width * 0.3, right: -L.width * 0.3, bottom: H, height: H * 0.5, background: '#040303'}} />
      <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
      <div style={{position: 'absolute', left: fx, top: fy, filter: `brightness(${0.45 + 0.55 * lit})`}}>
        <GoldFrame w={fw} h={fh} t={t}>
          <NoblemanCanvas w={cw} faceLight={faceLight} />
          {/* pantulan kaca pelindung */}
          <div style={{position: 'absolute', left: '-30%', top: 0, width: '35%', height: '100%', transform: `translateX(${(smoothNoise('glass', frame, 40) * 0.4 + 0.2) * cw}px) skewX(-18deg)`, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,250,235,0.07) 50%, rgba(255,255,255,0) 100%)'}} />
        </GoldFrame>
      </div>
      <div style={{opacity: subjectBlink}}>
        <MuseumLabel L={L} x={fx} y={labelY} w={L.px(500)} painter={painter} subject={subject} lines={labelLines} />
      </div>
      {/* lampu sorot dari atas */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 42% at 50% 22%, rgba(255,222,165,${0.32 * lit}) 0%, rgba(255,210,150,${0.1 * lit}) 50%, rgba(0,0,0,0) 75%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 35%, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.55 + 0.35 * (1 - spot)}) 100%)`}} />
      {exit && (
        <>
          <div style={{position: 'absolute', right: L.px(130), top: L.px(1150), padding: `${L.px(6)}px ${L.px(18)}px`, background: '#0f3d22', color: '#9dffbe', fontFamily: FONT.mono, fontWeight: 700, fontSize: L.px(34), letterSpacing: L.px(6), boxShadow: `0 0 ${L.px(40)}px ${L.px(10)}px rgba(60,255,140,0.35)`}}>EXIT</div>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 80% 61%, rgba(60,255,140,0.16) 0%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen'}} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* =================== 3a. meja tulis 1822 =================== */
export const DICT_ENTRY = 'So heißen Leute, die sich selbst sehen.';

/** Titik-titik penting meja 1822 (untuk origin kamera). */
export const deskGeometry = (L: Layout) => {
  const pageW = L.px(440); // buku x 100–980: teks halaman kanan tetap ≤ 960 (safe zone)
  const pageH = L.px(640);
  const bx = L.width / 2 - pageW;
  const by = L.height * L.pick({portrait: 0.2, landscape: 0.12, square: 0.12});
  return {
    pageW,
    pageH,
    bx,
    by,
    entry: [L.width / 2 + pageW * 0.4, by + pageH * 0.24] as [number, number],
    date: [L.width * 0.1 + L.px(470), by + pageH + L.px(90)] as [number, number],
    mini: [L.width * 0.64 + L.px(125), by + pageH + L.px(410)] as [number, number],
  };
};

export const Desk1822Scene: React.FC<S & {candle?: number; dateIn?: number; entryGlow?: number}> = ({L, frame, candle = 0.6, dateIn = 1, entryGlow = 0}) => {
  const W = L.width;
  const H = L.height;
  const cf = 1 - candle * 0.45 + smoothNoise('cand3', frame, 3) * candle * 0.55;
  const {pageW, pageH, bx, by} = deskGeometry(L);
  const fs = L.px(24);
  return (
    <AbsoluteFill style={{backgroundColor: '#140e09'}}>
      <NoiseFill tex="desk" opacity={0.55} blend="multiply" />
      {/* surat di bawah buku */}
      <Paper w={L.px(620)} h={L.px(520)} x={W * 0.1} y={by + pageH + L.px(30)} rot={-5} color="#d6c6a2" seed={21} shadow={1.4}>
        <div style={{position: 'absolute', left: L.px(46), top: L.px(46), right: L.px(30), fontFamily: FONT.hand, color: '#2e2620', fontSize: L.px(25), lineHeight: 1.8, transform: 'rotate(-1deg)'}}>
          <div style={{textAlign: 'right', clipPath: `inset(-20% ${100 - clamp01(dateIn) * 100}% -20% 0)`}}>Pisa — Aug. 15th 1822</div>
          <div>I said in a letter to Peacock,</div>
          <div>my dear Mrs Gisborne, that</div>
          <div>I would send you some account</div>
          <div>of the last miserable months…</div>
        </div>
      </Paper>
      {/* buku kamus terbuka */}
      <div style={{position: 'absolute', left: bx, top: by, width: pageW * 2, height: pageH, transform: 'rotate(2deg)', boxShadow: `0 ${L.px(20)}px ${L.px(50)}px rgba(0,0,0,0.85)`}}>
        {[0, 1].map((p) => (
          <div key={p} style={{position: 'absolute', left: p * pageW, top: 0, width: pageW, height: pageH, background: p ? 'linear-gradient(90deg, #b9a47c 0%, #d8c8a4 8%, #ddcfae 100%)' : 'linear-gradient(270deg, #b9a47c 0%, #d8c8a4 8%, #ddcfae 100%)', overflow: 'hidden'}}>
            <NoiseFill tex="paper" opacity={0.3} blend="multiply" offset={[p * 200, 40]} />
            <NoiseFill tex="stain" opacity={0.3} blend="multiply" />
            <div style={{position: 'absolute', left: L.px(40), right: L.px(36), top: L.px(44), fontFamily: FONT.print, color: '#2b231c', fontSize: fs * 0.82, lineHeight: 1.5}}>
              {p === 0 ? (
                Array.from({length: 17}, (_, i) => (
                  <div key={i} style={{height: fs * 1.2, display: 'flex', gap: L.px(8), alignItems: 'center'}}>
                    <div style={{width: L.px(60 + random(`dw-${i}`) * 50), height: L.px(7), background: 'rgba(43,35,28,0.75)'}} />
                    <div style={{flex: 1, height: L.px(4), background: 'rgba(43,35,28,0.35)'}} />
                  </div>
                ))
              ) : (
                <>
                  <div style={{fontSize: fs * 0.8, letterSpacing: L.px(2), opacity: 0.7, textAlign: 'center', marginBottom: fs * 0.6}}>DOPPEL — DOPPELT</div>
                  <div style={{fontSize: fs * 1.9, lineHeight: 1.1, marginBottom: fs * 0.4, textShadow: `0 0 ${L.px(14) * entryGlow}px rgba(255,190,90,${0.8 * entryGlow})`, color: entryGlow > 0 ? `rgb(${43 + 70 * entryGlow},${35 + 10 * entryGlow},${28})` : undefined}}>Doppelgänger,</div>
                  <div style={{fontStyle: 'italic', marginBottom: fs * 0.3}}>m. — (Jean Paul, 1796)</div>
                  <div style={{fontSize: fs * 1.05, marginBottom: fs * 0.8}}>„{DICT_ENTRY}"</div>
                  {Array.from({length: 9}, (_, i) => (
                    <div key={i} style={{height: fs * 1.15, display: 'flex', alignItems: 'center'}}>
                      <div style={{width: `${70 + random(`dl-${i}`) * 30}%`, height: L.px(4), background: 'rgba(43,35,28,0.35)'}} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
        <div style={{position: 'absolute', left: pageW - L.px(14), top: 0, width: L.px(28), height: pageH, background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(40,25,10,0.55) 50%, rgba(0,0,0,0) 100%)'}} />
      </div>
      {/* miniatur Shelley berbingkai oval */}
      <div style={{position: 'absolute', left: W * 0.64, top: by + pageH + L.px(250), width: L.px(250), height: L.px(320), borderRadius: '50%', padding: L.px(14), boxSizing: 'border-box', background: 'linear-gradient(135deg, #6b4d1d, #d9b866, #5a3f14)', boxShadow: `0 ${L.px(12)}px ${L.px(30)}px rgba(0,0,0,0.85)`, transform: 'rotate(8deg)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden'}}>
          <FaceCrop face="f7" rect={[0.18, 0.04, 0.64, 0.66]} width={L.px(222)} />
        </div>
      </div>
      {/* pena bulu */}
      {/* pena bulu + botol tinta di bawah surat */}
      <svg style={{position: 'absolute', left: W * 0.06, top: by + pageH + L.px(560)}} width={L.px(460)} height={L.px(170)} viewBox="0 0 460 170">
        <ellipse cx="60" cy="120" rx="44" ry="18" fill="#0b0806" />
        <path d="M24 120 L24 70 Q24 54 60 54 Q96 54 96 70 L96 120 Z" fill="#141a1c" />
        <path d="M30 70 Q60 62 90 70" stroke="rgba(200,210,215,0.35)" strokeWidth="3" fill="none" />
        <path d="M62 60 Q240 40 450 6" stroke="#cbbf9f" strokeWidth="3" fill="none" />
        <path d="M250 38 Q350 2 450 6 Q370 34 262 52 Z" fill="#c4b898" opacity="0.85" />
      </svg>
      {/* lilin di kandil kuningan */}
      <div style={{position: 'absolute', right: L.safe * 0.7, bottom: H * 0.05, width: L.px(170), height: L.px(40), borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 35%, #e0bf6a, #7a5a1e 70%, #3a2a0c)'}} />
      <div style={{position: 'absolute', right: L.safe * 0.7 + L.px(50), bottom: H * 0.05 + L.px(20), width: L.px(70), height: L.px(260), background: 'linear-gradient(90deg, #b9a77f, #f1e6c8 45%, #c8b68e)', borderRadius: `${L.px(10)}px ${L.px(10)}px ${L.px(4)}px ${L.px(4)}px`}}>
        <div style={{position: 'absolute', left: L.px(8), top: L.px(4), width: L.px(12), height: L.px(70), borderRadius: L.px(6), background: '#f6efd9'}} />
        <div style={{position: 'absolute', left: '50%', top: -L.px(16), width: L.px(3), height: L.px(18), marginLeft: -L.px(1.5), background: '#2a1d10'}} />
        <div style={{position: 'absolute', left: '50%', top: -L.px(84), width: L.px(30), height: L.px(74), marginLeft: -L.px(15), borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%', background: 'radial-gradient(ellipse at 50% 72%, #fffbe8 0%, #ffd27a 40%, rgba(255,150,50,0.6) 62%, rgba(255,140,40,0) 78%)', transform: `scale(${0.9 + cf * 0.15}) skewX(${(smoothNoise('fl3', frame, 4) - 0.5) * 10}deg)`, transformOrigin: '50% 100%'}} />
      </div>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 55% at 88% 82%, rgba(255,190,100,${0.6 * cf}) 0%, rgba(230,150,70,${0.18 * cf}) 40%, rgba(0,0,0,0) 72%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 85% at 80% 75%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 100%)'}} />
    </AbsoluteFill>
  );
};

/* =================== 3b. teras laut malam =================== */
export const TerraceScene: React.FC<S & {meet?: number; double?: boolean}> = ({L, frame, meet = 0.5, double = true}) => {
  const W = L.width;
  const H = L.height;
  const horizon = H * L.pick({portrait: 0.46, landscape: 0.48, square: 0.46});
  const moonX = W * 0.68;
  const moonY = H * 0.17;
  const shimmer = (i: number) => smoothNoise(`sh-${i}`, frame, 6);
  const figW = L.px(220);
  const floorY = H * 0.8;
  // kedua sosok tetap di x 60–960 (safe zone) di sepanjang meet 0..1
  const gap = W * (0.22 - meet * 0.12);
  return (
    <AbsoluteFill style={{backgroundColor: '#05090c'}}>
      {/* langit */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, #050a10 0%, #0d1b24 ${(horizon / H) * 100}%, #071016 100%)`}} />
      <div style={{position: 'absolute', left: moonX - L.px(60), top: moonY - L.px(60), width: L.px(120), height: L.px(120), borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%, #f4f1e6 0%, #d7d6cc 60%, #b9bdb8 100%)', boxShadow: `0 0 ${L.px(120)}px ${L.px(40)}px rgba(190,215,225,0.25)`}} />
      {/* awan: hanya di langit, tepi atas/bawah memudar, hanyut lewat posisi latar (tanpa tepi keras) */}
      {[0, 1].map((i) => (
        <NoiseFill
          key={i}
          tex={(['fog0', 'fog2'] as const)[i]}
          opacity={0.32 - i * 0.1}
          blend="screen"
          offset={[frame * (0.3 + i * 0.25), 0]}
          style={{
            top: 0,
            height: horizon,
            backgroundSize: '160% 100%',
            backgroundRepeat: 'repeat-x',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 70%, transparent 100%)',
            maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 70%, transparent 100%)',
          }}
        />
      ))}
      {/* laut */}
      <div style={{position: 'absolute', left: 0, right: 0, top: horizon, bottom: 0, background: 'linear-gradient(180deg, #0f2029 0%, #08131a 50%, #040a0e 100%)'}} />
      {Array.from({length: 22}, (_, i) => {
        const y = horizon + L.px(10) + Math.pow(i / 22, 1.6) * (floorY - horizon - L.px(60));
        const wdt = L.px(30) + (i / 22) * L.px(300) * (0.6 + shimmer(i) * 0.6);
        return <div key={i} style={{position: 'absolute', left: moonX - wdt / 2 + (shimmer(i + 40) - 0.5) * L.px(40), top: y, width: wdt, height: L.px(2 + i * 0.25), background: `rgba(220,230,225,${0.55 - i * 0.018})`, borderRadius: L.px(4), filter: 'blur(0.6px)'}} />;
      })}
      {/* kabut rendah */}
      <NoiseFill
        tex="fog1"
        opacity={0.22}
        blend="screen"
        offset={[frame * 0.5, 0]}
        style={{
          top: floorY - H * 0.2,
          height: H * 0.25,
          backgroundSize: '160% 100%',
          backgroundRepeat: 'repeat-x',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 40%, #000 60%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 40%, #000 60%, transparent 100%)',
        }}
      />
      {/* lantai teras batu */}
      <svg style={{position: 'absolute', left: 0, top: floorY - L.px(40), width: W, height: H - floorY + L.px(40)}} viewBox="0 0 1080 420" preserveAspectRatio="none">
        <rect x="0" y="40" width="1080" height="380" fill="#15181a" />
        {Array.from({length: 7}, (_, r) => (
          <line key={r} x1="0" y1={40 + r * r * 9} x2="1080" y2={40 + r * r * 9} stroke="#0a0c0d" strokeWidth="3" />
        ))}
        {Array.from({length: 12}, (_, c) => (
          <line key={c} x1={c * 90} y1="40" x2={(c * 90 - 540) * 2.4 + 540} y2="420" stroke="#0a0c0d" strokeWidth="3" />
        ))}
      </svg>
      {/* pagar langkan */}
      <div style={{position: 'absolute', left: 0, right: 0, top: floorY - L.px(250), height: L.px(30), background: 'linear-gradient(180deg, #4a4c4b, #22252a)'}} />
      {Array.from({length: 14}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: i * (W / 13) - L.px(20), top: floorY - L.px(222), width: L.px(40), height: L.px(190), background: 'linear-gradient(90deg, #1b1e21, #3c3f41 45%, #1a1c1f)', borderRadius: `${L.px(16)}px ${L.px(16)}px ${L.px(6)}px ${L.px(6)}px`}} />
      ))}
      {/* dua sosok yang sama */}
      <div style={{position: 'absolute', left: W / 2 - gap - figW, top: floorY - figW * 2.6 + L.px(40)}}>
        <Walker1820 w={figW} step={smoothNoise('stepA', frame, 15)} />
      </div>
      {double && (
        <div style={{position: 'absolute', left: W / 2 + gap, top: floorY - figW * 2.6 + L.px(40)}}>
          <Walker1820 w={figW} flip step={smoothNoise('stepA', frame, 15)} />
        </div>
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 62% 30%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)'}} />
      <Tape x={L.px(70)} y={L.pick({portrait: L.px(400), landscape: L.safe, square: L.safe})} w={L.px(370)} h={L.px(44)} rot={1}>
        LERICI · JUNI 1822
      </Tape>
    </AbsoluteFill>
  );
};

/* =================== 4. lab: lightbox =================== */
/** Crop wajah dengan mata di 40% tinggi dan jarak mata 30% lebar; titik landmark per foto. */
const LAB_FACES: Record<'f1gray' | 'f4gray', {rect: [number, number, number, number]; nose: number; mouth: number}> = {
  f1gray: {rect: [0.354, 0.124, 0.249, 0.242], nose: 0.51, mouth: 0.68},
  f4gray: {rect: [0.37, 0.1105, 0.415, 0.403], nose: 0.544, mouth: 0.66},
};

const LabPrint: React.FC<{L: Layout; face: 'f1gray' | 'f4gray'; x: number; y: number; w: number; rot: number; marks?: number}> = ({L, face, x, y, w, rot, marks = 1}) => {
  const f = LAB_FACES[face];
  const b = L.px(18);
  const pts: Array<[number, number]> = [
    [0.35, 0.4],
    [0.65, 0.4],
    [0.5, f.nose],
    [0.4, f.mouth],
    [0.6, f.mouth],
  ];
  const h = w * 1.25;
  return (
    <div style={{position: 'absolute', left: x, top: y, padding: b, paddingBottom: b * 3, background: '#f1efe9', transform: `rotate(${rot}deg)`, boxShadow: `0 ${L.px(10)}px ${L.px(24)}px rgba(20,40,50,0.45)`}}>
      <FaceCrop face={face} rect={f.rect} width={w}>
        <svg style={{position: 'absolute', inset: 0, opacity: marks}} width={w} height={h}>
          {[
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 3],
            [2, 4],
            [3, 4],
          ].map(([a, c], i) => (
            <line key={i} x1={pts[a][0] * w} y1={pts[a][1] * h} x2={pts[c][0] * w} y2={pts[c][1] * h} stroke="#d2342a" strokeWidth={L.px(2)} opacity={0.75} />
          ))}
          {pts.map((p, i) => (
            <circle key={i} cx={p[0] * w} cy={p[1] * h} r={L.px(6)} fill="none" stroke="#ff4a3d" strokeWidth={L.px(2.5)} />
          ))}
        </svg>
      </FaceCrop>
      <div style={{position: 'absolute', left: b, bottom: b * 0.8, fontFamily: FONT.mono, fontSize: L.px(20), color: '#333'}}>{face === 'f1gray' ? 'SUBJEK A' : 'SUBJEK B'}</div>
    </div>
  );
};

const GelStrip: React.FC<{L: Layout; x: number; y: number; w: number; h: number; bands: number[]; hi?: number[]; glow?: number; rot?: number; tint: string}> = ({L, x, y, w, h, bands, hi = [], glow = 0, rot = 0, tint}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, background: tint, border: `${L.px(2)}px solid rgba(40,70,80,0.4)`}}>
    {bands.map((b, i) => {
      const isHi = hi.includes(i);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            top: `${b * 100}%`,
            height: L.px(9),
            borderRadius: L.px(4),
            background: isHi ? `rgba(220,40,30,${0.45 + glow * 0.55})` : 'rgba(25,45,55,0.7)',
            boxShadow: isHi ? `0 0 ${L.px(18) * glow}px ${L.px(6) * glow}px rgba(255,60,40,0.6)` : undefined,
          }}
        />
      );
    })}
  </div>
);

/** Posisi lab dalam px 1080 (safe zone Shorts); dipakai juga untuk titik fokus kamera. */
export const labGeometry = (L: Layout) => {
  const P = L.px;
  const stripX = P(120);
  const stripY = P(1065);
  const stripW = P(110);
  const stripH = P(470);
  return {stripX, stripY, stripW, stripH, strips: [stripX + stripW * 0.9, stripY + stripH * 0.45] as [number, number], note: [P(690), P(1100)] as [number, number], prints: [L.width / 2, P(800)] as [number, number]};
};

const BANDS_A = [0.06, 0.13, 0.19, 0.31, 0.38, 0.47, 0.55, 0.63, 0.72, 0.81, 0.9];
const BANDS_B = [0.06, 0.16, 0.19, 0.27, 0.38, 0.5, 0.55, 0.66, 0.72, 0.84, 0.9];
const MATCH_A = [0, 2, 4, 6, 8, 10];
const MATCH_B = [0, 2, 4, 6, 8, 10];

export const LabScene: React.FC<S & {stamp?: number; glow?: number; light?: number; merge?: number; note?: number; marks?: number}> = ({
  L,
  frame,
  stamp = 1,
  glow = 1,
  light = 1,
  merge = 1,
  note = 1,
  marks = 1,
}) => {
  const buzz = 0.94 + smoothNoise('lb', frame, 3) * 0.06;
  const G = labGeometry(L);
  const P = L.px;
  return (
    <AbsoluteFill style={{backgroundColor: '#0b1215'}}>
      {/* permukaan lightbox */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(225,240,245,${0.95 * light * buzz}) 0%, rgba(190,215,224,${0.85 * light * buzz}) 55%, rgba(80,105,115,${light}) 100%)`}} />
      <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(0deg, rgba(60,90,100,0.18) 0, rgba(60,90,100,0.18) ${P(2)}px, transparent ${P(2)}px, transparent ${P(90)}px), repeating-linear-gradient(90deg, rgba(60,90,100,0.18) 0, rgba(60,90,100,0.18) ${P(2)}px, transparent ${P(2)}px, transparent ${P(90)}px)`}} />
      {/* Tata letak mengikuti safe zone Shorts (x 60–960, y 380–1540; caption y 1265–1480). */}
      {/* lembar F5: satu wajah sembilan kali (kanan atas, di bawah foto B) */}
      <div style={{position: 'absolute', left: P(650), top: P(385), padding: P(12), background: '#f1efe9', transform: 'rotate(6deg)', boxShadow: `0 ${P(8)}px ${P(20)}px rgba(20,40,50,0.4)`}}>
        <FaceCrop face="f5" rect={[0.04, 0.03, 0.92, 0.94]} width={P(270)} imgStyle={{filter: 'grayscale(1) contrast(1.1)'}} />
      </div>
      {/* map berkas */}
      <div style={{position: 'absolute', left: P(70), top: P(395), width: P(560), height: P(150), background: '#c9b48a', transform: 'rotate(-2deg)', boxShadow: `0 ${P(8)}px ${P(20)}px rgba(20,40,50,0.45)`}}>
        <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
        <div style={{position: 'absolute', left: P(26), top: P(22), fontFamily: FONT.type, fontSize: P(30), color: '#2a221b', lineHeight: 1.4}}>
          <div>BERKAS 2022 · BARCELONA</div>
          <div style={{fontSize: P(24)}}>32 pasang · pengenal wajah ×3</div>
        </div>
      </div>
      {/* dua foto subjek dengan landmark */}
      <LabPrint L={L} face="f1gray" x={P(80)} y={P(575)} w={P(300)} rot={-3} marks={marks} />
      <LabPrint L={L} face="f4gray" x={P(590)} y={P(585)} w={P(300)} rot={2.5} marks={marks} />
      <div style={{position: 'absolute', left: P(470), top: P(720), fontFamily: FONT.print, fontSize: P(80), color: '#c2342a'}}>≈</div>
      {/* pita DNA */}
      <GelStrip L={L} x={G.stripX} y={G.stripY} w={G.stripW} h={G.stripH} bands={BANDS_A} hi={MATCH_A} glow={glow} rot={-2} tint="rgba(170,205,215,0.55)" />
      <GelStrip L={L} x={G.stripX + G.stripW * (2.2 - 1.48 * clamp01(merge))} y={G.stripY + P(12)} w={G.stripW} h={G.stripH} bands={BANDS_B} hi={MATCH_B} glow={glow} rot={1} tint="rgba(150,190,205,0.45)" />
      <div style={{position: 'absolute', left: G.stripX, top: G.stripY - P(40), fontFamily: FONT.mono, fontSize: P(28), fontWeight: 700, color: '#1f3740', width: G.stripW * 1.8, display: 'flex', justifyContent: 'space-around'}}>
        <span>A</span>
        <span>B</span>
      </div>
      {/* catatan pensil */}
      <div style={{position: 'absolute', left: G.note[0] - P(170), top: G.note[1] - P(35), fontFamily: FONT.hand, fontSize: P(46), color: '#3a3f42', transform: 'rotate(-6deg)', clipPath: `inset(-30% ${100 - clamp01(note / 0.7) * 100}% -30% 0)`}}>kebetulan?</div>
      <svg style={{position: 'absolute', left: G.note[0] - P(200), top: G.note[1] - P(75)}} width={P(400)} height={P(150)} viewBox="0 0 420 170">
        <ellipse cx="200" cy="85" rx="190" ry="70" fill="none" stroke="#3a3f42" strokeWidth="3" opacity="0.6" transform="rotate(-5 200 85)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01((note - 0.7) / 0.3)} />
      </svg>
      {/* cap */}
      <div style={{opacity: clamp01(stamp), transform: `scale(${1.25 - 0.25 * clamp01(stamp)})`, transformOrigin: `${P(700)}px ${P(1210)}px`}}>
        <Stamp text="Tidak berkerabat" x={P(425)} y={P(1165)} size={P(38)} rot={-8} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0) 45%, rgba(5,15,20,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

export {PAL};
