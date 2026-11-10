/**
 * Set-set ArsipTiang (ARSIP 06), 2.5D. Pola sama dengan angka.tsx: menerima `frame` lokal dan nilai animasi 0..1
 * dari pemanggil; kamera dibungkus <CameraRig> di luar. Ukuran ditulis dalam "px 1080" lewat L.px().
 * Makhluk (fan film Siren Head, © Trevor Henderson) TIDAK digambar di set 2.5D: sketsa saksi ditutup cap.
 * Satu-satunya gambar makhluk adalah render Blender wajah jumpscare (public/3d/tiang/), tafsiran sendiri.
 */
import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import type {Layout} from '../studio';
import {FONT, NoiseFill, PAL, Paper, Stamp, Tape, smoothNoise} from './index';
import {clamp01} from './sets';
import {AK, ShortwaveRadio} from './angka';

type S = {L: Layout; frame: number};

export const TG = {
  ...AK,
  fog: '#5d6b63',
  sodium: '#d9a441',
  rust: '#8a4a22',
  manila: '#cdb98a',
  red: '#b3281c',
};

/* =================== label kaset ARSIP 06 =================== */
export const TiangLabel: React.FC<{L: Layout; x: number; y: number; rot?: number}> = ({L, x, y, rot = -3}) => (
  <div style={{position: 'absolute', left: x, top: y, width: L.px(500), height: L.px(124), transform: `rotate(${rot}deg)`, background: '#ddd2b4', boxShadow: '0 6px 14px rgba(0,0,0,0.75)', padding: `${L.px(10)}px ${L.px(20)}px`, boxSizing: 'border-box'}}>
    <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
    <div style={{position: 'relative', fontFamily: FONT.type, color: PAL.ink, fontSize: L.px(46), letterSpacing: L.px(5)}}>ARSIP 06</div>
    <div style={{position: 'relative', fontFamily: FONT.hand, color: '#24324a', fontSize: L.px(23), marginTop: L.px(4), whiteSpace: 'nowrap'}}>yang berdiri di antara tiang</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: L.px(62), height: 2, background: 'rgba(40,30,20,0.35)'}} />
  </div>
);

/* =================== peta topografi fiktif =================== */
const TopoMap: React.FC<{w: number; h: number; circle: number}> = ({w, h, circle}) => {
  const rings = Array.from({length: 9}, (_, i) => i);
  const poles = Array.from({length: 11}, (_, i) => [w * (0.08 + i * 0.085), h * (0.82 - i * 0.055 + Math.sin(i * 1.3) * 0.02)] as [number, number]);
  const cx = w * 0.66;
  const cy = h * 0.34;
  const r = w * 0.075;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {rings.map((i) => (
        <ellipse key={i} cx={w * 0.62} cy={h * 0.38} rx={w * (0.06 + i * 0.055)} ry={h * (0.05 + i * 0.045)} transform={`rotate(${-14 + i * 3} ${w * 0.62} ${h * 0.38})`} fill="none" stroke="rgba(120,80,40,0.55)" strokeWidth={i % 4 === 0 ? 2.2 : 1.1} />
      ))}
      {rings.slice(0, 5).map((i) => (
        <ellipse key={`b${i}`} cx={w * 0.2} cy={h * 0.18} rx={w * (0.04 + i * 0.04)} ry={h * (0.03 + i * 0.03)} fill="none" stroke="rgba(120,80,40,0.45)" strokeWidth={1} />
      ))}
      {/* jalur tiang: garis putus-putus + titik tiang */}
      <polyline points={poles.map((p) => p.join(',')).join(' ')} fill="none" stroke="rgba(40,40,40,0.75)" strokeWidth={2.2} strokeDasharray="10 7" />
      {poles.map((p, i) => (
        <rect key={i} x={p[0] - 4} y={p[1] - 4} width={8} height={8} fill="#2a2a2a" />
      ))}
      {/* titik tak tercatat + lingkaran merah tulisan tangan */}
      <rect x={cx - 4} y={cy - 4} width={8} height={8} fill="#2a2a2a" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="none" stroke={TG.red} strokeWidth={4.5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - clamp01(circle))} transform={`rotate(-20 ${cx} ${cy})`} />
      <text x={w * 0.04} y={h * 0.06} fontFamily={FONT.mono} fontSize={h * 0.035} fill="rgba(40,30,20,0.8)">LEMBAR 11 · KARANGSUNYI</text>
      <text x={w * 0.62} y={h * 0.95} fontFamily={FONT.mono} fontSize={h * 0.028} fill="rgba(40,30,20,0.7)">— — jaringan 20 kV</text>
    </svg>
  );
};

/* =================== kalkir: diagram skala (tanpa angka tinggi) =================== */
const ScaleTracing: React.FC<{w: number; h: number}> = ({w, h}) => {
  const base = h * 0.9;
  return (
    <div style={{position: 'absolute', inset: 0, background: 'rgba(232,236,228,0.62)', boxShadow: '0 6px 16px rgba(0,0,0,0.45)'}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <line x1={w * 0.08} y1={base} x2={w * 0.92} y2={base} stroke="#2a3346" strokeWidth={2} />
        {/* manusia 1,7 m */}
        <g transform={`translate(${w * 0.24}, ${base})`} fill="#2a3346">
          <circle cx={0} cy={-h * 0.155} r={h * 0.022} />
          <rect x={-h * 0.022} y={-h * 0.13} width={h * 0.044} height={h * 0.07} />
          <rect x={-h * 0.02} y={-h * 0.062} width={h * 0.016} height={h * 0.062} />
          <rect x={h * 0.004} y={-h * 0.062} width={h * 0.016} height={h * 0.062} />
        </g>
        <text x={w * 0.24} y={base + h * 0.06} textAnchor="middle" fontFamily={FONT.hand} fontSize={h * 0.035} fill="#2a3346">1,7 m</text>
        {/* tiang telepon tua: garis tipis menembus tepi atas kertas */}
        <line x1={w * 0.66} y1={base} x2={w * 0.665} y2={-h * 0.05} stroke="#2a3346" strokeWidth={3} />
        <line x1={w * 0.61} y1={h * 0.16} x2={w * 0.72} y2={h * 0.16} stroke="#2a3346" strokeWidth={2} strokeDasharray="5 5" />
        <text x={w * 0.78} y={h * 0.32} fontFamily={FONT.hand} fontSize={h * 0.12} fill={TG.red}>?</text>
        <text x={w * 0.5} y={h * 0.06} textAnchor="middle" fontFamily={FONT.mono} fontSize={h * 0.034} fill="#2a3346">SKALA · SAKSI 2</text>
      </svg>
    </div>
  );
};

/* =================== meja arsip (bagian 2 dan 5) =================== */
export const tiangDeskGeometry = (L: Layout) => {
  const p = L.px;
  return {
    map: {x: p(90), y: p(330), w: p(900), h: p(640)},
    circle: {x: p(90) + p(900) * 0.66, y: p(330) + p(640) * 0.34},
    trace: {x: p(120), y: p(372), w: p(430), h: p(372)},
    folder: {x: p(110), y: p(760), w: p(860), h: p(800)},
    form: {x: p(150), y: p(830), w: p(420), h: p(300)},
    sketch: {x: p(590), y: p(800), w: p(340), h: p(420)},
    sample: {x: p(170), y: p(1160), w: p(330), h: p(300)},
    bag: {x: p(230), y: p(820), w: p(620), h: p(480)},
    radio: {x: p(590), y: p(470), w: p(380)},
  };
};

const SampleB: React.FC<{L: Layout; h: number}> = ({L, h}) => (
  <div style={{position: 'absolute', inset: 0, background: '#eae4d4', boxShadow: '0 8px 18px rgba(0,0,0,0.6)', padding: L.px(14), boxSizing: 'border-box'}}>
    <div style={{position: 'relative', width: '100%', height: h - L.px(74), overflow: 'hidden', background: '#111'}}>
      <Img src={staticFile('3d/tiang/tex/fleshrust.png')} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', filter: 'contrast(1.15) saturate(0.8) brightness(0.85)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 40%, rgba(255,240,210,0.15) 0%, rgba(0,0,0,0.55) 90%)'}} />
    </div>
    <div style={{position: 'absolute', left: L.px(16), bottom: L.px(14), fontFamily: FONT.mono, fontSize: L.px(26), color: PAL.ink, letterSpacing: L.px(2)}}>SAMPEL B</div>
    <div style={{position: 'absolute', right: L.px(16), bottom: L.px(16), fontFamily: FONT.hand, fontSize: L.px(18), color: '#2b3a5a'}}>dari kaki tiang</div>
  </div>
);

const EvidenceBag: React.FC<{L: Layout; w: number; h: number; frame: number}> = ({L, w, h, frame}) => {
  const p = L.px;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* camcorder di dalam kantong */}
      <div style={{position: 'absolute', left: w * 0.16, top: h * 0.2, width: w * 0.62, height: h * 0.42, borderRadius: p(18), background: 'linear-gradient(180deg, #2a2a2c 0%, #121214 100%)', boxShadow: '0 10px 20px rgba(0,0,0,0.8)', transform: 'rotate(-7deg)'}}>
        <div style={{position: 'absolute', right: -w * 0.1, top: h * 0.08, width: w * 0.16, height: h * 0.26, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #3a4a5a 0%, #0a0c10 60%)', border: `${p(6)}px solid #1b1b1d`}} />
        <div style={{position: 'absolute', left: w * 0.05, top: h * 0.06, width: w * 0.22, height: h * 0.16, background: '#0b0d0c', border: `${p(3)}px solid #333`}} />
        <div style={{position: 'absolute', left: w * 0.32, top: h * 0.07, fontFamily: FONT.mono, fontSize: p(20), color: 'rgba(200,200,200,0.55)', letterSpacing: p(2)}}>VIDEO 8 · HANDYCAM-X</div>
        <div style={{position: 'absolute', left: w * 0.06, bottom: h * 0.05, width: w * 0.5, height: h * 0.03, background: 'rgba(160,140,110,0.3)'}} />
        {/* lumpur kering */}
        <NoiseFill tex="stain" opacity={0.6} blend="multiply" />
      </div>
      {/* plastik: kilap + kerut */}
      <div style={{position: 'absolute', inset: 0, borderRadius: p(10), background: 'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.14) 52%, rgba(255,255,255,0.02) 70%)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 12px 26px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: p(34), background: 'rgba(200,40,30,0.55)', borderRadius: `${p(10)}px ${p(10)}px 0 0`}} />
      {/* label barang bukti */}
      <div style={{position: 'absolute', left: w * 0.08, bottom: h * 0.07, width: w * 0.62, height: h * 0.22, background: '#efe9d8', boxShadow: '0 2px 4px rgba(0,0,0,0.4)', padding: p(10), boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONT.mono, fontSize: p(26), color: PAL.ink, letterSpacing: p(2)}}>BARANG BUKTI · 06-C</div>
        <div style={{fontFamily: FONT.hand, fontSize: p(20), color: '#2b3a5a', marginTop: p(6)}}>ditemukan di jalan setapak, 28.06</div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: 0.05 + 0.03 * smoothNoise('bag', frame, 9), background: '#fff'}} />
    </div>
  );
};

export const TiangDeskScene: React.FC<
  S & {
    open?: number;
    trace?: number;
    sample?: number;
    form?: number;
    stamp?: number;
    circle?: number;
    dark?: number;
    evidence?: number;
    close?: number;
    radio?: boolean;
    radioGlow?: number;
  }
> = ({L, frame, open = 1, trace = 1, sample = 1, form = 1, stamp = 1, circle = 1, dark = 0, evidence = 0, close = 0, radio = false, radioGlow = 0}) => {
  const p = L.px;
  const g = tiangDeskGeometry(L);
  const lampF = 0.94 + smoothNoise('desklamp', frame, 6) * 0.06;
  const formText = 'tidak ada mata';
  const formChars = Math.round(formText.length * clamp01(form));
  const coverOut = clamp01(open) * (1 - clamp01(close));
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0907'}}>
      {/* meja kayu */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a1f16 0%, #1c140d 100%)'}}>
        <NoiseFill tex="desk" opacity={0.55} blend="multiply" />
        <NoiseFill tex="stain" opacity={0.4} blend="multiply" />
      </AbsoluteFill>
      {/* peta topografi di bawah map */}
      <Paper x={g.map.x} y={g.map.y} w={g.map.w} h={g.map.h} rot={-2} color="#d8cfb4" seed={61}>
        <TopoMap w={g.map.w} h={g.map.h} circle={circle} />
        <div style={{position: 'absolute', left: g.map.w * 0.7, top: g.map.h * 0.44, fontFamily: FONT.hand, fontSize: p(24), color: TG.red, opacity: clamp01(circle * 2 - 1)}}>tidak tercatat</div>
      </Paper>
      {/* kalkir skala */}
      <div style={{position: 'absolute', left: g.trace.x + (1 - clamp01(trace)) * p(700), top: g.trace.y, width: g.trace.w, height: g.trace.h, transform: `rotate(${3 - clamp01(trace) * 1.5}deg)`, opacity: clamp01(trace * 3)}}>
        <ScaleTracing w={g.trace.w} h={g.trace.h} />
        <Tape x={g.trace.w * 0.35} y={-p(14)} w={p(120)} h={p(32)} rot={-4} />
      </div>
      {/* map terbuka (alas manila) */}
      <div style={{position: 'absolute', left: g.folder.x, top: g.folder.y, width: g.folder.w, height: g.folder.h, background: TG.manila, borderRadius: p(6), boxShadow: '0 14px 30px rgba(0,0,0,0.7)', transform: 'rotate(1deg)'}}>
        <NoiseFill tex="paper" opacity={0.35} blend="multiply" />
        <NoiseFill tex="stain" opacity={0.35} blend="multiply" />
      </div>
      {/* formulir ciri */}
      <Paper x={g.form.x} y={g.form.y} w={g.form.w} h={g.form.h} rot={-2.5} color="#e6dfcb" seed={71}>
        <div style={{position: 'absolute', left: p(20), top: p(16), fontFamily: FONT.mono, fontSize: p(20), color: PAL.ink, letterSpacing: p(2)}}>FORMULIR KETERANGAN SAKSI</div>
        {['TINGGI', 'WARNA', 'CIRI WAJAH', 'SUARA'].map((k, i) => (
          <div key={k} style={{position: 'absolute', left: p(20), right: p(20), top: p(66 + i * 54), height: p(42), borderBottom: '1.5px solid rgba(40,30,20,0.5)', fontFamily: FONT.mono, fontSize: p(22), color: PAL.ink}}>
            {k}:
            {i === 0 && <span style={{fontFamily: FONT.hand, fontSize: p(22), color: '#2b3a5a', marginLeft: p(16)}}>setinggi tiang</span>}
            {i === 1 && <span style={{fontFamily: FONT.hand, fontSize: p(22), color: '#2b3a5a', marginLeft: p(16)}}>kayu? karat?</span>}
            {i === 2 && <span style={{fontFamily: FONT.hand, fontSize: p(25), color: '#2b3a5a', marginLeft: p(16)}}>{formText.slice(0, formChars)}</span>}
            {i === 3 && <span style={{fontFamily: FONT.hand, fontSize: p(22), color: '#2b3a5a', marginLeft: p(16)}}>seperti radio</span>}
          </div>
        ))}
      </Paper>
      {/* sketsa saksi, ditutup kertas bercap */}
      <Paper x={g.sketch.x} y={g.sketch.y} w={g.sketch.w} h={g.sketch.h} rot={2} color="#ece6d6" seed={73}>
        <div style={{position: 'absolute', left: 0, right: 0, top: p(14), textAlign: 'center', fontFamily: FONT.mono, fontSize: p(19), color: PAL.ink, letterSpacing: p(2)}}>SKETSA SAKSI · 06-A</div>
        {/* coretan pensil tak terbaca yang menyembul dari tepi kertas penutup */}
        <svg width={g.sketch.w} height={g.sketch.h} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 14}, (_, i) => (
            <line key={i} x1={g.sketch.w * (0.1 + random(`sk${i}`) * 0.8)} y1={g.sketch.h * 0.88} x2={g.sketch.w * (0.1 + random(`sk2${i}`) * 0.8)} y2={g.sketch.h * 0.97} stroke="rgba(50,50,60,0.55)" strokeWidth={1.4} />
          ))}
        </svg>
        <div style={{position: 'absolute', left: p(18), top: p(52), width: g.sketch.w - p(36), height: g.sketch.h - p(110), background: '#d9d1bc', boxShadow: '0 3px 8px rgba(0,0,0,0.45)', transform: 'rotate(-1.5deg)'}}>
          <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
          <div style={{opacity: clamp01(stamp), transform: `scale(${1 + (1 - clamp01(stamp)) * 0.45})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0}}>
            <Stamp text="TIDAK" x={p(46)} y={p(84)} size={p(40)} rot={-10} />
            <Stamp text="DITAMPILKAN" x={p(4)} y={p(160)} size={p(30)} rot={-10} />
          </div>
        </div>
        <Tape x={g.sketch.w * 0.32} y={p(36)} w={p(110)} h={p(30)} rot={5} />
      </Paper>
      {/* foto sampel B dijepit klip */}
      <div style={{position: 'absolute', left: g.sample.x, top: g.sample.y - (1 - clamp01(sample)) * p(60), width: g.sample.w, height: g.sample.h, transform: `rotate(${-4 + (1 - clamp01(sample)) * 8}deg)`, opacity: clamp01(sample * 2.5)}}>
        <SampleB L={L} h={g.sample.h} />
        <div style={{position: 'absolute', left: g.sample.w * 0.42, top: -p(22), width: p(54), height: p(44), borderRadius: p(6), background: 'linear-gradient(180deg, #9aa0a4, #4b5054)', boxShadow: '0 3px 5px rgba(0,0,0,0.6)'}} />
      </div>
      {/* sampul map: tertutup → terbuka (bagian 2); tertutup lagi (bagian 5) */}
      <div style={{position: 'absolute', left: g.folder.x, top: g.folder.y, width: g.folder.w, height: g.folder.h, transform: `translate(${-coverOut * p(980)}px, ${-coverOut * p(120)}px) rotate(${1 - coverOut * 14}deg)`, opacity: coverOut > 0.98 ? 0 : 1}}>
        <div style={{position: 'absolute', left: g.folder.w * 0.56, top: -p(48), width: g.folder.w * 0.36, height: p(56), background: '#c4ae7c', borderRadius: `${p(10)}px ${p(10)}px 0 0`, fontFamily: FONT.mono, fontSize: p(22), color: PAL.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: p(2)}}>BUKIT KARANGSUNYI</div>
        <div style={{position: 'absolute', inset: 0, background: '#c9b483', borderRadius: p(6), boxShadow: '0 16px 30px rgba(0,0,0,0.75)'}}>
          <NoiseFill tex="paper" opacity={0.35} blend="multiply" />
          <NoiseFill tex="stain" opacity={0.45} blend="multiply" />
          <div style={{position: 'absolute', left: p(60), top: p(90), fontFamily: FONT.type, fontSize: p(66), color: PAL.ink, letterSpacing: p(6)}}>BERKAS 06</div>
          <div style={{position: 'absolute', left: p(60), right: p(60), top: p(186), fontFamily: FONT.type, fontSize: p(36), lineHeight: 1.3, color: PAL.ink, letterSpacing: p(2)}}>YANG BERDIRI DI ANTARA TIANG</div>
          <div style={{position: 'absolute', left: p(60), top: p(330), fontFamily: FONT.mono, fontSize: p(26), color: 'rgba(36,28,23,0.8)'}}>MASUK BERKAS: 27.06.2022</div>
          <Stamp text="TERBUKA" x={p(440)} y={p(470)} size={p(44)} rot={-8} />
        </div>
      </div>
      {/* bagian 5: kantong barang bukti + radio ARSIP 05 */}
      {evidence > 0 && (
        <div style={{position: 'absolute', left: g.bag.x, top: g.bag.y + (1 - clamp01(evidence)) * p(80), width: g.bag.w, height: g.bag.h, transform: 'rotate(-3deg)', opacity: clamp01(evidence * 2)}}>
          <EvidenceBag L={L} w={g.bag.w} h={g.bag.h} frame={frame} />
        </div>
      )}
      {radio && <ShortwaveRadio L={L} frame={frame} w={g.radio.w} x={g.radio.x} y={g.radio.y} glow={radioGlow} mhz={4.625} readout={radioGlow > 0.2 ? '4625' : ''} rot={4} />}
      {/* lampu meja: pendar hangat, lebih gelap di bagian 5 */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 45% 52%, rgba(230,174,94,${0.1 * lampF * (1 - dark)}) 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 75% at 48% 52%, rgba(0,0,0,0) ${45 - dark * 25}%, rgba(0,0,0,${0.8 + dark * 0.15}) 100%)`}} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: dark * 0.45}} />
    </AbsoluteFill>
  );
};

/* =================== HT di bangku pos jaga (bagian 3) =================== */
export const htGeometry = (L: Layout) => {
  const p = L.px;
  return {x: p(330), y: p(500), w: p(400), h: p(900), grille: {x: p(330) + p(400) * 0.12, y: p(500) + p(900) * 0.36, w: p(400) * 0.76, h: p(900) * 0.36}, lcd: {x: p(330) + p(400) * 0.14, y: p(500) + p(900) * 0.12}};
};

export const HTScene: React.FC<S & {led?: number; lcd?: string; speak?: number; redBlink?: number}> = ({L, frame, led = 0, lcd = '', speak = 0, redBlink = 0}) => {
  const p = L.px;
  const g = htGeometry(L);
  const jit = speak > 0 ? (random(`htj${frame}`) - 0.5) * p(2) * speak : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#070908'}}>
      {/* dinding papan pos jaga */}
      <AbsoluteFill>
        <Img src={staticFile('3d/tiang/tex/planks.png')} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', filter: 'brightness(0.45) saturate(0.7)', transform: 'rotate(90deg) scale(1.8)'}} />
      </AbsoluteFill>
      {/* jendela: kabut abu-hijau + lampu merah antena di kejauhan */}
      <div style={{position: 'absolute', left: p(80), top: p(330), width: p(420), height: p(330), background: 'linear-gradient(180deg, #2a3330 0%, #4d5a55 70%, #3c4743 100%)', border: `${p(14)}px solid #1a130d`, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7)'}}>
        <NoiseFill tex="fog1" opacity={0.5} blend="screen" />
        <div style={{position: 'absolute', left: '62%', top: '18%', width: p(3), height: '82%', background: 'rgba(20,25,24,0.7)'}} />
        <div style={{position: 'absolute', left: `calc(62% - ${p(5)}px)`, top: '14%', width: p(12), height: p(12), borderRadius: '50%', background: '#ff2614', opacity: 0.25 + 0.75 * redBlink, boxShadow: `0 0 ${p(18) * redBlink}px #ff2614`}} />
        <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: p(10), background: '#1a130d'}} />
      </div>
      {/* bangku */}
      <div style={{position: 'absolute', left: -p(40), right: -p(40), top: p(1380), bottom: 0, background: 'linear-gradient(180deg, #3a2a1c 0%, #1a120b 100%)', boxShadow: `0 -${p(6)}px ${p(16)}px rgba(0,0,0,0.6)`}}>
        <NoiseFill tex="wood" opacity={0.5} blend="multiply" />
      </div>
      {/* HT */}
      <div style={{position: 'absolute', left: g.x + jit, top: g.y, width: g.w, height: g.h}}>
        {/* antena karet */}
        <div style={{position: 'absolute', left: g.w * 0.66, top: -p(250), width: p(34), height: p(270), borderRadius: p(17), background: 'linear-gradient(90deg, #0b0b0c, #2a2a2d, #0b0b0c)'}} />
        {/* kenop */}
        <div style={{position: 'absolute', left: g.w * 0.16, top: -p(56), width: p(70), height: p(70), borderRadius: p(10), background: 'linear-gradient(90deg, #111, #333, #111)'}} />
        {/* LED */}
        <div style={{position: 'absolute', left: g.w * 0.42, top: -p(26), width: p(26), height: p(26), borderRadius: '50%', background: led > 0.5 ? AK.phosphor : '#1f2a22', boxShadow: led > 0.5 ? `0 0 ${p(22)}px ${AK.phosphor}, 0 0 ${p(60)}px rgba(123,216,143,0.5)` : 'none'}} />
        {/* badan */}
        <div style={{position: 'absolute', inset: 0, borderRadius: p(34), background: 'linear-gradient(90deg, #0d0e0f 0%, #26282b 45%, #151618 100%)', boxShadow: `0 ${p(30)}px ${p(50)}px rgba(0,0,0,0.85), inset 0 ${p(3)}px 0 rgba(255,255,255,0.1)`}}>
          <NoiseFill tex="doorgrit" opacity={0.2} blend="overlay" tileSize={256} />
        </div>
        {/* LCD */}
        <div style={{position: 'absolute', left: g.w * 0.14, top: g.h * 0.12, width: g.w * 0.72, height: g.h * 0.15, borderRadius: p(8), background: led > 0.5 ? '#0f1d14' : '#0b100d', boxShadow: `inset 0 0 ${p(14)}px rgba(0,0,0,0.95)${led > 0.5 ? `, 0 0 ${p(30)}px rgba(123,216,143,0.25)` : ''}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: FONT.mono, fontSize: p(56), letterSpacing: p(4), color: AK.phosphor, textShadow: `0 0 ${p(10)}px rgba(123,216,143,0.8)`, opacity: led > 0.5 ? 1 : 0.08}}>{lcd || '---.---'}</div>
          <div style={{fontFamily: FONT.mono, fontSize: p(20), letterSpacing: p(3), color: AK.phosphor, opacity: led > 0.5 ? 0.7 : 0.05}}>CH 07 · RX ▮▮▮▯</div>
        </div>
        {/* kisi speaker */}
        <div style={{position: 'absolute', left: g.w * 0.12, top: g.h * 0.36, width: g.w * 0.76, height: g.h * 0.36, borderRadius: p(16), background: '#08090a', boxShadow: 'inset 0 0 14px rgba(0,0,0,1)', overflow: 'hidden'}}>
          <svg width={g.w * 0.76} height={g.h * 0.36} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 13}, (_, r) =>
              Array.from({length: 9}, (_, c) => <circle key={`${r}-${c}`} cx={(c + 0.5 + (r % 2) * 0.5) * (g.w * 0.76) / 9.5} cy={(r + 0.6) * (g.h * 0.36) / 13.4} r={p(7.5)} fill="#2b2d30" />),
            )}
          </svg>
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(123,216,143,${0.12 * speak}) 0%, rgba(0,0,0,0) 65%)`}} />
        </div>
        {/* tombol PTT + label generik */}
        <div style={{position: 'absolute', left: -p(16), top: g.h * 0.24, width: p(20), height: g.h * 0.22, borderRadius: p(6), background: '#1a1b1d'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: g.h * 0.77, textAlign: 'center', fontFamily: FONT.mono, fontSize: p(30), letterSpacing: p(6), color: 'rgba(200,200,190,0.55)'}}>HT-4</div>
        <div style={{position: 'absolute', left: g.w * 0.2, right: g.w * 0.2, top: g.h * 0.86, height: p(40), borderRadius: p(8), background: '#111214'}} />
      </div>
      {/* pendar hijau LED ke papan */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 35% at 52% 34%, rgba(123,216,143,${0.1 * led}) 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

/* =================== OSD camcorder + artefak pita (bagian 4) =================== */
export const CamcorderOSD: React.FC<S & {sec: number; glitch?: number; rec?: boolean}> = ({L, frame, sec, glitch = 0, rec = true}) => {
  const p = L.px;
  const s0 = 7 + Math.floor(sec);
  const tc = `23:41:${String(s0 % 60).padStart(2, '0')}`;
  const blink = Math.floor(frame / 15) % 2 === 0;
  const osd: React.CSSProperties = {position: 'absolute', fontFamily: FONT.mono, fontSize: p(40), color: '#f3f3ee', letterSpacing: p(3), textShadow: `${p(2)}px ${p(2)}px 0 rgba(0,0,0,0.85)`};
  const lines = Array.from({length: 3}, (_, i) => ({y: (random(`tr${Math.floor(frame / 3)}-${i}`) * 0.9 + 0.05) * L.height, h: p(4 + random(`th${frame}-${i}`) * 10)}));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* chroma bleed tipis + garis pindai */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)'}} />
      {/* tracking line */}
      {lines.map((l, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: l.y, height: l.h, background: 'rgba(230,230,230,0.12)', opacity: 0.4 + glitch * 0.6, filter: 'blur(1px)'}} />
      ))}
      {/* head-switching noise di bawah */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: p(26), overflow: 'hidden', opacity: 0.85}}>
        <NoiseFill tex={frame % 2 ? 'grain' : 'grain2'} opacity={1} blend="normal" tileSize={p(256)} offset={[frame * 41, 0]} />
        <AbsoluteFill style={{transform: `translateX(${p(30)}px)`, background: 'rgba(0,0,0,0.4)'}} />
      </div>
      {rec && (
        <div style={{...osd, left: p(90), top: p(410)}}>
          <span style={{color: '#ff3b30', opacity: blink ? 1 : 0}}>●</span> REC
        </div>
      )}
      <div style={{...osd, right: p(150), top: p(410)}}>SP</div>
      {/* baterai */}
      <div style={{position: 'absolute', right: p(150), top: p(470), width: p(70), height: p(32), border: `${p(4)}px solid #f3f3ee`, boxSizing: 'border-box', padding: p(3), display: 'flex', gap: p(3)}}>
        <div style={{flex: 1, background: '#f3f3ee'}} />
        <div style={{flex: 1, background: blink ? '#f3f3ee' : 'transparent'}} />
        <div style={{flex: 1}} />
      </div>
      <div style={{...osd, left: p(90), top: p(1130)}}>27.06.2022</div>
      <div style={{...osd, left: p(90), top: p(1185)}}>{tc}</div>
    </AbsoluteFill>
  );
};

/** Glitch pita: potongan horizontal dari gambar yang sama digeser + split warna. `src` = PNG di public/. */
export const TapeGlitchImg: React.FC<{src: string; W: number; H: number; frame: number; amount: number; seed?: string; style?: React.CSSProperties}> = ({src, W, H, frame, amount, seed = 'g', style}) => {
  const n = 7;
  return (
    <AbsoluteFill style={style}>
      {Array.from({length: n}, (_, i) => {
        const y0 = (i / n) * 100;
        const dx = (random(`${seed}${frame}-${i}`) - 0.5) * W * 0.08 * amount;
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(${y0}% 0 ${100 - y0 - 100 / n}% 0)`, transform: `translateX(${dx}px)`}}>
            <Img src={staticFile(src)} style={{width: W, height: H, imageRendering: 'pixelated'}} />
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{transform: `translateX(${W * 0.012 * amount}px)`, mixBlendMode: 'screen', opacity: 0.35 * amount}}>
        <Img src={staticFile(src)} style={{width: W, height: H, imageRendering: 'pixelated', filter: 'sepia(1) saturate(6) hue-rotate(-50deg)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =================== kartu kredit (bagian 6) =================== */
export const CreditCard: React.FC<{L: Layout; opacity?: number}> = ({L, opacity = 1}) => {
  const p = L.px;
  const body: React.CSSProperties = {fontFamily: FONT.mono, fontSize: p(37), lineHeight: 1.32, color: '#e9e4d6', margin: 0};
  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity}}>
      <div style={{position: 'absolute', left: p(90), right: p(150), top: p(450), bottom: p(400), display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: p(10)}}>
        <div style={{fontFamily: FONT.type, fontSize: p(104), letterSpacing: p(8), color: '#f2ede0', lineHeight: 1.05}}>SIREN HEAD</div>
        <div style={{...body, fontSize: p(38), color: '#bdb6a6'}}>karakter fiksi ciptaan</div>
        <div style={{fontFamily: FONT.type, fontSize: p(68), letterSpacing: p(4), color: '#f2ede0', lineHeight: 1.1}}>TREVOR HENDERSON</div>
        <div style={{...body, fontSize: p(32), color: '#bdb6a6'}}>(pertama diunggah Agustus 2018)</div>
        <div style={{height: p(44)}} />
        <p style={body}>Fan film non-komersial.</p>
        <p style={body}>Tidak berafiliasi dengan Trevor Henderson maupun Warner Bros.</p>
        <p style={body}>Kasus, tempat, dan nama dalam video ini rekaan.</p>
        <p style={body}>Cerita, visual, dan suara dibuat sendiri.</p>
        <p style={body}>Narasi: suara sintetis.</p>
      </div>
    </AbsoluteFill>
  );
};
