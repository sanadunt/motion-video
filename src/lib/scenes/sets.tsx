/**
 * Set-set RipperTape v2 (2D/2.5D). Semua menerima `frame` (lokal) dan nilai animasi
 * yang sudah dihitung pemanggil (0..1 atau detik), supaya still storyboard dan video
 * memakai komponen yang sama. Kamera tidak di sini: bungkus dengan <CameraRig>.
 */
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {Layout} from '../studio';
import {FONT, NoiseFill, PAL, Paper, Pin, RedString, Stamp, Tape, smoothNoise} from './index';

type S = {L: Layout; frame: number};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ---------- lampu meja ---------- */
export const LampLight: React.FC<{frame: number; cx: number; cy: number; strength?: number; radius?: number}> = ({
  frame,
  cx,
  cy,
  strength = 1,
  radius = 0.9,
}) => {
  const fl = 0.85 + smoothNoise('lamp', frame, 4) * 0.15;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${radius * 100}% ${radius * 70}% at ${cx * 100}% ${cy * 100}%, rgba(230,174,94,${0.55 * strength * fl}) 0%, rgba(230,174,94,${0.18 * strength * fl}) 35%, rgba(0,0,0,0) 70%)`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${radius * 110}% ${radius * 90}% at ${cx * 100}% ${cy * 100}%, rgba(0,0,0,0) 30%, rgba(0,0,0,${0.55 + 0.4 * (1 - Math.min(1, strength))}) 100%)`,
        }}
      />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp01(1 - strength) * 0.92}} />
      <NoiseFill tex="lampdust"
        opacity={0.12 * strength}
        blend="screen"
        style={{
          maskImage: `radial-gradient(circle at ${cx * 100}% ${cy * 100}%, #000 0%, transparent 60%)`,
          WebkitMaskImage: `radial-gradient(circle at ${cx * 100}% ${cy * 100}%, #000 0%, transparent 60%)`,
        }}
      />
    </>
  );
};

/* ---------- kartu korban ---------- */
const VictimCard: React.FC<{L: Layout; x: number; y: number; rot: number; name: string; date: string; place: string; seed: number; blur?: number}> = ({
  L,
  x,
  y,
  rot,
  name,
  date,
  place,
  seed,
  blur = 0,
}) => {
  const w = L.px(340);
  const h = L.px(150);
  return (
    <>
      <Paper w={w} h={h} x={x} y={y} rot={rot} seed={seed} style={{filter: blur ? `blur(${blur}px)` : undefined}}>
        <div style={{position: 'absolute', left: L.px(104), top: L.px(16), right: L.px(12), fontFamily: FONT.type, color: PAL.ink}}>
          <div style={{fontSize: L.px(14), letterSpacing: L.px(2), opacity: 0.6}}>{date}</div>
          <div style={{fontSize: L.px(23), marginTop: L.px(6), lineHeight: 1.1}}>{name}</div>
          <div style={{fontSize: L.px(14), marginTop: L.px(8), opacity: 0.7}}>{place}</div>
        </div>
        <svg style={{position: 'absolute', left: L.px(16), top: L.px(16)}} width={L.px(74)} height={L.px(104)} viewBox="0 0 70 84" preserveAspectRatio="none">
          <rect width="70" height="84" fill="#2a2420" opacity="0.85" />
          <g stroke="#d9c9a6" strokeWidth="0.8" opacity="0.5">
            {Array.from({length: 20}, (_, i) => (
              <line key={i} x1="0" y1={i * 4.2} x2="70" y2={i * 4.2 + 6} />
            ))}
          </g>
          <ellipse cx="35" cy="34" rx="14" ry="17" fill="#d9c9a6" opacity="0.35" />
          <path d="M12 84 C14 60 24 54 35 54 C46 54 56 60 58 84 Z" fill="#d9c9a6" opacity="0.25" />
        </svg>
      </Paper>
      <Pin x={x + w / 2} y={y + L.px(6)} r={L.px(8)} color={['#C8302A', '#2F5C8F', '#C8302A', '#2a2a2a', '#C8302A'][seed % 5]} />
    </>
  );
};

const MapCard: React.FC<{x: number; y: number; w: number; h: number; rot?: number; marks?: Array<[number, number]>}> = ({x, y, w, h, rot = 0, marks = []}) => (
  <Paper w={w} h={h} x={x} y={y} rot={rot} seed={7} color={PAL.paperDark}>
    <svg width={w} height={h} viewBox="0 0 300 220" style={{position: 'absolute', inset: 0}}>
      <g stroke="#3a2d22" strokeWidth="1.4" fill="none" opacity="0.8">
        <path d="M0 60 C60 50 120 70 180 55 S260 40 300 48" />
        <path d="M0 120 C70 110 140 130 200 118 S270 100 300 110" />
        <path d="M0 175 C60 170 110 185 170 176 S250 160 300 170" />
        <path d="M40 0 C45 60 35 120 50 220" />
        <path d="M120 0 C118 70 130 140 122 220" />
        <path d="M200 0 C210 60 195 150 205 220" />
        <path d="M250 20 C260 90 240 160 262 220" />
        <path d="M70 60 L120 120" />
        <path d="M200 55 L250 118" />
      </g>
      <text x="150" y="26" textAnchor="middle" fontFamily="IM Fell English, serif" fontSize="15" fill="#3a2d22" opacity="0.85">
        WHITECHAPEL · 1888
      </text>
      <text x="62" y="100" fontFamily="Special Elite, monospace" fontSize="8" fill="#3a2d22" opacity="0.7">BUCK&apos;S ROW</text>
      <text x="130" y="150" fontFamily="Special Elite, monospace" fontSize="8" fill="#3a2d22" opacity="0.7">HANBURY ST</text>
      <text x="210" y="95" fontFamily="Special Elite, monospace" fontSize="8" fill="#3a2d22" opacity="0.7">GOULSTON ST</text>
      <text x="150" y="200" fontFamily="Special Elite, monospace" fontSize="8" fill="#3a2d22" opacity="0.7">MILLER&apos;S CT</text>
      {marks.map((m, i) => (
        <g key={i}>
          <circle cx={m[0]} cy={m[1]} r="7" fill="none" stroke="#8E2A1F" strokeWidth="1.6" />
          <line x1={m[0] - 5} y1={m[1] - 5} x2={m[0] + 5} y2={m[1] + 5} stroke="#8E2A1F" strokeWidth="1.6" />
          <line x1={m[0] + 5} y1={m[1] - 5} x2={m[0] - 5} y2={m[1] + 5} stroke="#8E2A1F" strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  </Paper>
);

/* =================== papan bukti =================== */
export const boardGeometry = (L: Layout) => {
  const bx = L.safe * 0.5;
  const by = L.height * L.pick({portrait: 0.1, landscape: 0.08, square: 0.08});
  const bw = L.width - bx * 2;
  const bh = L.height * L.pick({portrait: 0.72, landscape: 0.84, square: 0.8});
  const envelope = {x: bx + bw * 0.62, y: by + bh * 0.37, w: L.px(230), h: L.px(140)};
  const question = {x: bx + bw / 2 - L.px(130), y: by + bh * 0.4, w: L.px(260), h: L.px(170)};
  return {bx, by, bw, bh, envelope, question};
};

export const BoardScene: React.FC<
  S & {
    closing?: boolean;
    lamp?: number; // 0..1
    qPop?: number; // 0 belum, 0..1 muncul (pop), 1 diam
    cardBlur?: number;
  }
> = ({L, frame, closing, lamp = 1, qPop = 1, cardBlur}) => {
  const {bx, by, bw, bh, envelope, question} = boardGeometry(L);
  const u = L.u;
  const cards = [
    {name: 'MARY ANN NICHOLS', date: '31 AUG 1888', place: "BUCK'S ROW", x: 0.06, y: 0.05, rot: -3},
    {name: 'ANNIE CHAPMAN', date: '8 SEP 1888', place: 'HANBURY STREET', x: 0.56, y: 0.09, rot: 2.5},
    {name: 'ELIZABETH STRIDE', date: '30 SEP 1888', place: 'DUTFIELD YARD', x: 0.04, y: 0.62, rot: 1.5},
    {name: 'CATHERINE EDDOWES', date: '30 SEP 1888', place: 'MITRE SQUARE', x: 0.57, y: 0.6, rot: -2},
    {name: 'MARY JANE KELLY', date: '9 NOV 1888', place: "MILLER'S COURT", x: 0.31, y: 0.78, rot: 1},
  ];
  const mapW = L.px(420);
  const mapH = L.px(300);
  const mapX = bx + bw / 2 - mapW / 2;
  const mapY = by + bh * 0.33;
  const pts: Array<[number, number]> = cards.map((c) => [bx + bw * c.x + L.px(170), by + bh * c.y + L.px(6)]);
  const mapMarks: Array<[number, number]> = [
    [62, 60],
    [150, 120],
    [92, 175],
    [220, 95],
    [150, 190],
  ];
  const mapPts: Array<[number, number]> = mapMarks.map((m) => [mapX + (m[0] / 300) * mapW, mapY + (m[1] / 220) * mapH]);
  const lampCx = L.pick({portrait: 0.2, landscape: 0.15, square: 0.2});
  const blur = cardBlur ?? (closing ? L.px(1.5) : 0);
  const qs = qPop >= 1 ? 1 : 1.45 - 0.45 * qPop; // pop: 1.45 → 1
  return (
    <AbsoluteFill style={{backgroundColor: PAL.wood}}>
      <NoiseFill tex="wood" opacity={0.5} blend="multiply" />
      <div
        style={{
          position: 'absolute',
          left: bx,
          top: by,
          width: bw,
          height: bh,
          background: PAL.cork,
          boxShadow: `inset 0 0 ${L.px(40)}px rgba(0,0,0,0.6), 0 ${L.px(10)}px ${L.px(30)}px rgba(0,0,0,0.7)`,
          border: `${L.px(14)}px solid #2a1c12`,
          overflow: 'hidden',
        }}
      >
        <NoiseFill tex="cork" opacity={0.55} blend="multiply" />
        <NoiseFill tex="cork2" opacity={0.3} blend="multiply" />
      </div>
      <RedString points={[pts[0], mapPts[0]]} width={L.width} height={L.height} sag={L.px(14)} stroke={L.px(2.5)} />
      <RedString points={[pts[1], mapPts[1]]} width={L.width} height={L.height} sag={L.px(10)} stroke={L.px(2.5)} />
      <RedString points={[pts[2], mapPts[2]]} width={L.width} height={L.height} sag={L.px(-12)} stroke={L.px(2.5)} />
      <RedString points={[pts[3], mapPts[3]]} width={L.width} height={L.height} sag={L.px(-10)} stroke={L.px(2.5)} />
      <RedString points={[pts[4], mapPts[4]]} width={L.width} height={L.height} sag={L.px(-16)} stroke={L.px(2.5)} />
      {closing && qPop > 0 && (
        <RedString
          points={[
            [question.x + L.px(130), question.y + L.px(6)],
            [question.x + L.px(260), L.height + L.px(40)],
          ]}
          width={L.width}
          height={L.height}
          sag={L.px(30)}
          stroke={L.px(2.5)}
        />
      )}
      <MapCard x={mapX} y={mapY} w={mapW} h={mapH} rot={-1} marks={mapMarks} />
      {cards.map((c, i) => (
        <VictimCard key={c.name} L={L} x={bx + bw * c.x} y={by + bh * c.y} rot={c.rot} name={c.name} date={c.date} place={c.place} seed={i + 1} blur={blur} />
      ))}
      {mapPts.map((p, i) => (
        <Pin key={i} x={p[0]} y={p[1]} r={L.px(6)} color="#2a2a2a" />
      ))}
      {!closing && (
        <Paper w={envelope.w} h={envelope.h} x={envelope.x} y={envelope.y} rot={-7} seed={21} color="#7a2a22" shadow={1.4}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.25) 100%)'}} />
          <svg width="100%" height="100%" viewBox="0 0 230 140" style={{position: 'absolute', inset: 0}}>
            <path d="M0 0 L115 78 L230 0" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
          </svg>
          <div style={{position: 'absolute', left: 14 * u, bottom: 12 * u, fontFamily: FONT.hand, color: '#f0d9c8', fontSize: L.px(22), transform: 'rotate(-3deg)'}}>
            Dear Boss
          </div>
        </Paper>
      )}
      {closing && qPop > 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${qs})`, transformOrigin: `${question.x + question.w / 2}px ${question.y + L.px(6)}px`}}>
          <Paper w={question.w} h={question.h} x={question.x} y={question.y} rot={-1.5} seed={33} shadow={1.6 * qs}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.hand, color: PAL.inkRed, fontSize: L.px(110), opacity: 0.9}}>
              ?
            </div>
          </Paper>
          <Pin x={question.x + L.px(130)} y={question.y + L.px(6)} r={L.px(8)} />
        </div>
      )}
      <Tape x={bx + L.px(30)} y={by - L.px(22)} w={L.px(220)} h={L.px(44)} rot={-2}>
        ARSIP 03
      </Tape>
      <LampLight frame={frame} cx={lampCx} cy={0.12} strength={lamp * (closing ? 0.9 : 1)} radius={closing ? 0.7 : 0.95} />
    </AbsoluteFill>
  );
};

/* =================== berkas polisi =================== */
export type Sheet = {
  date: string;
  time: string;
  place: string;
  name: string;
  age: string;
  foundBy: string;
  note: string;
  stamp: string;
  seed: number;
  rot: number;
  /** detik mulai ketik per baris: Date, Time, Place, Name, Age, FoundBy, Injuries, Suspect, catatan */
  starts?: number[];
};

const DEFAULT_STARTS = [0.15, 0.3, 0.45, 0.6, 1.4, 1.8, 2.4, 2.7, 3.0];

export const SHEETS: Sheet[] = [
  {date: '31st August, 1888', time: '3.40 a.m.', place: "Buck's Row, Whitechapel", name: 'NICHOLS, Mary Ann', age: '43 years', foundBy: 'Chas. Cross, carman', note: 'No witness. No weapon found.', stamp: 'Received · H Div', seed: 4, rot: -1.8, starts: [1.3, 8.5, 13.6, 16.6, 17.6, 18.4, 19.4, 19.8, 20.4]},
  {date: '8th September, 1888', time: '6.00 a.m.', place: '29 Hanbury Street', name: 'CHAPMAN, Annie', age: '47 years', foundBy: 'John Davis, lodger', note: 'Same hand as Buck’s Row?', stamp: 'Received · H Div', seed: 5, rot: 1.2},
  {date: '30th September, 1888', time: '1.00 a.m.', place: "Dutfield's Yard, Berner St", name: 'STRIDE, Elizabeth', age: '44 years', foundBy: 'Louis Diemschutz', note: 'Interrupted? Second body within the hour.', stamp: 'Urgent · H Div', seed: 6, rot: -0.8},
  {date: '30th September, 1888', time: '1.45 a.m.', place: 'Mitre Square, City', name: 'EDDOWES, Catherine', age: '46 years', foundBy: 'P.C. Watkins 881', note: 'Apron piece missing. See Goulston St.', stamp: 'City Police', seed: 7, rot: 1.6},
];

export const FileScene: React.FC<
  S & {
    /** indeks lembar aktif (0..3) */
    active: number;
    /** detik sejak lembar aktif mulai; baris diketik mengikuti ini */
    t: number;
    lamp?: number;
  }
> = ({L, frame, active, t, lamp = 1}) => {
  const w = L.width * L.pick({portrait: 1.08, landscape: 0.56, square: 1.04});
  const h = w * 1.35;
  const x = (L.width - w) / 2 + L.px(10);
  const y = L.pick({portrait: -L.px(60), landscape: -L.px(40), square: -L.px(80)});
  const fs = L.px(26);
  const cps = 22; // karakter per detik mesin tik
  const typedAt = (text: string, start: number, tt: number) => {
    const n = Math.max(0, Math.floor((tt - start) * cps));
    return text.slice(0, Math.min(text.length, n));
  };
  const renderSheet = (s: Sheet, i: number, tt: number, isActive: boolean) => {
    const slide = i === 0 ? 1 : clamp01(tt / 0.45);
    const e = 1 - Math.pow(1 - slide, 3);
    const dy = (1 - e) * L.height * 0.9;
    const st = s.starts ?? DEFAULT_STARTS;
    const rows: Array<[string, string, number, boolean?]> = [
      ['Date', s.date, st[0]],
      ['Time', s.time, st[1]],
      ['Place', s.place, st[2]],
      ['Name', s.name, st[3]],
      ['Age', s.age, st[4]],
      ['Found by', s.foundBy, st[5]],
      ['Injuries', '', st[6], true],
      ['Suspect', '', st[7], true],
    ];
    const noteOn = tt > st[8];
    return (
      <div key={s.name} style={{position: 'absolute', inset: 0, transform: `translateY(${dy}px)`}}>
        <Paper w={w} h={h} x={x} y={y} rot={s.rot} seed={s.seed} shadow={2}>
          <div style={{position: 'absolute', left: L.px(70), right: L.px(70), top: L.px(90), color: PAL.ink}}>
            <div style={{fontFamily: FONT.print, fontSize: L.px(40), letterSpacing: L.px(5), textAlign: 'center'}}>METROPOLITAN POLICE</div>
            <div style={{fontFamily: FONT.print, fontSize: L.px(22), letterSpacing: L.px(4), textAlign: 'center', marginTop: L.px(6), opacity: 0.8}}>
              H DIVISION · WHITECHAPEL
            </div>
            <div style={{height: L.px(2), background: PAL.ink, opacity: 0.6, margin: `${L.px(22)}px 0`}} />
            <div style={{fontFamily: FONT.print, fontSize: L.px(20), opacity: 0.7, marginBottom: L.px(24)}}>Report of Murder — Form 46 / A · No. {i + 1}</div>
            {rows.map(([label, value, start, redact], k) => {
              const shown = isActive ? typedAt(value, start, tt) : value;
              const redactOn = isActive ? tt > start : true;
              return (
                <div key={label} style={{display: 'flex', gap: L.px(18), marginTop: k === 0 ? 0 : L.px(16), fontSize: fs, alignItems: 'baseline'}}>
                  <div style={{fontFamily: FONT.print, width: L.px(170), opacity: 0.75}}>{label}</div>
                  {redact ? (
                    <div style={{height: fs * 1.05, width: L.px(380), background: '#171311', opacity: redactOn ? 0.92 : 0, transform: 'rotate(-0.4deg)'}} />
                  ) : (
                    <div style={{fontFamily: FONT.type, borderBottom: `1px dotted rgba(36,28,23,0.5)`, flex: 1, minHeight: fs * 1.2}}>{shown}</div>
                  )}
                </div>
              );
            })}
            <div style={{marginTop: L.px(36), fontFamily: FONT.hand, fontSize: L.px(26), color: '#3b2a22', transform: 'rotate(-1deg)', lineHeight: 1.5, opacity: isActive ? (noteOn ? 1 : 0) : 1}}>
              {s.note}
            </div>
          </div>
          {(!isActive || tt > 0.9) && <Stamp text={s.stamp} x={L.px(520)} y={L.px(150)} size={L.px(28)} rot={-14 + s.seed} />}
          {i === 0 && (
            <div style={{position: 'absolute', left: L.px(120), top: L.px(880), width: L.px(220), height: L.px(220), borderRadius: '50%', border: `${L.px(12)}px solid rgba(90,60,30,0.28)`, filter: 'blur(1px)'}} />
          )}
          <svg style={{position: 'absolute', right: L.px(110), bottom: L.px(140)}} width={L.px(90)} height={L.px(70)} viewBox="0 0 90 70">
            <path d="M20 40 C10 20 40 5 50 25 C60 10 85 20 75 42 C85 55 60 70 45 58 C30 70 10 60 20 40 Z" fill="#241c17" opacity={0.3 + 0.5 * (s.seed % 2)} />
            <circle cx="78" cy="18" r="3" fill="#241c17" opacity="0.7" />
          </svg>
          <svg style={{position: 'absolute', left: L.px(40), top: L.px(30)}} width={L.px(36)} height={L.px(110)} viewBox="0 0 36 110">
            <path d="M8 20 L8 95 A10 10 0 0 0 28 95 L28 12 A6 6 0 0 0 16 12 L16 88" fill="none" stroke="#7d7d7d" strokeWidth="3" />
          </svg>
        </Paper>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{backgroundColor: '#1b1410'}}>
      <NoiseFill tex="desk" opacity={0.5} blend="multiply" />
      {SHEETS.slice(0, active + 1).map((s, i) => renderSheet(s, i, i === active ? t : 99, i === active))}
      <LampLight frame={frame} cx={0.78} cy={0.08} strength={lamp} radius={1.0} />
    </AbsoluteFill>
  );
};

/* =================== jalan berkabut =================== */
export const StreetScene: React.FC<S & {dolly?: number}> = ({L, frame, dolly = 0}) => {
  const W = L.width;
  const H = L.height;
  const lampX = W * 0.62 + dolly * 0.6;
  const lampY = H * L.pick({portrait: 0.42, landscape: 0.36, square: 0.4});
  const gl = 0.8 + smoothNoise('gas', frame, 3) * 0.2;
  const fogDrift = (smoothNoise('fog', frame, 40) - 0.5) * L.px(60) + frame * L.px(0.4);
  const rain = Array.from({length: 90}, (_, i) => ({
    x: random(`rx-${i}`) * W,
    y: ((random(`ry-${i}`) * H + frame * L.px(22)) % (H + L.px(80))) - L.px(40),
    l: L.px(26 + random(`rl-${i}`) * 40),
  }));
  const bldg = (seed: number, color: string, yTop: number, hMin: number, hMax: number, count: number, par: number) =>
    Array.from({length: count}, (_, i) => {
      const bw = W / count;
      const bh = H * (hMin + random(`b-${seed}-${i}`) * (hMax - hMin));
      return (
        <g key={i} transform={`translate(${dolly * par},0)`}>
          <rect x={i * bw - bw} y={yTop - bh} width={bw + 1} height={bh + 2} fill={color} />
          <rect x={i * bw} y={yTop - bh} width={bw + 1} height={bh + 2} fill={color} />
          {Array.from({length: 6}, (_, k) => {
            const lit = random(`w-${seed}-${i}-${k}`) > 0.72;
            return (
              <rect
                key={k}
                x={i * bw + bw * (0.15 + (k % 2) * 0.45)}
                y={yTop - bh + bh * (0.15 + Math.floor(k / 2) * 0.26)}
                width={bw * 0.22}
                height={bh * 0.14}
                fill={lit ? `rgba(230,174,94,${0.25 * gl})` : 'rgba(0,0,0,0.5)'}
              />
            );
          })}
        </g>
      );
    });
  const figX = W * 0.3 + dolly * 0.35;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0a1216 0%, #142026 55%, #1c2626 100%)'}}>
      <svg style={{position: 'absolute', inset: 0}} width={W} height={H}>
        {bldg(1, '#121b1f', H * 0.66, 0.22, 0.4, 7, 0.25)}
        {bldg(2, '#0b1114', H * 0.7, 0.26, 0.52, 4, 0.45)}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.68, bottom: 0, background: 'linear-gradient(180deg, #1a2224 0%, #0c1213 100%)'}} />
      <NoiseFill tex="cobble" opacity={0.5} blend="multiply" style={{top: H * 0.68, height: H * 0.32, transform: `translateX(${dolly * 0.9}px)`}} />
      <div style={{position: 'absolute', left: lampX - L.px(120), top: H * 0.68, width: L.px(240), height: H * 0.32, background: `linear-gradient(180deg, rgba(230,174,94,${0.35 * gl}) 0%, rgba(230,174,94,0) 90%)`, filter: `blur(${L.px(10)}px)`, mixBlendMode: 'screen'}} />
      <svg style={{position: 'absolute', inset: 0}} width={W} height={H}>
        <rect x={lampX - L.px(7)} y={lampY} width={L.px(14)} height={H * 0.72 - lampY} fill="#05080a" />
        <rect x={lampX - L.px(30)} y={lampY - L.px(70)} width={L.px(60)} height={L.px(80)} fill="#05080a" />
        <polygon points={`${lampX - L.px(40)},${lampY - L.px(70)} ${lampX + L.px(40)},${lampY - L.px(70)} ${lampX},${lampY - L.px(110)}`} fill="#05080a" />
        <rect x={lampX - L.px(18)} y={lampY - L.px(60)} width={L.px(36)} height={L.px(56)} fill={`rgba(255,214,140,${0.95 * gl})`} />
        <path
          d={`M${figX} ${H * 0.7} l${L.px(-16)} 0 l${L.px(4)} ${L.px(-90)} c0 ${L.px(-22)} ${L.px(8)} ${L.px(-30)} ${L.px(14)} ${L.px(-30)} c${L.px(8)} 0 ${L.px(14)} ${L.px(8)} ${L.px(14)} ${L.px(30)} l${L.px(4)} ${L.px(90)} z`}
          fill="#04060a"
        />
        <ellipse cx={figX - L.px(4)} cy={H * 0.7 - L.px(126)} rx={L.px(12)} ry={L.px(9)} fill="#04060a" />
      </svg>
      <div style={{position: 'absolute', left: lampX - L.px(400), top: lampY - L.px(430), width: L.px(800), height: L.px(800), borderRadius: '50%', background: `radial-gradient(circle, rgba(255,205,120,${0.55 * gl}) 0%, rgba(230,174,94,${0.18 * gl}) 30%, rgba(0,0,0,0) 65%)`, mixBlendMode: 'screen'}} />
      {[0, 1, 2].map((i) => (
        <AbsoluteFill key={i} style={{transform: `translateX(${fogDrift * (i + 1) * (i % 2 ? -1 : 1) * 0.3}px)`}}>
          <NoiseFill tex={(['fog0', 'fog1', 'fog2'] as const)[i]} opacity={0.32 - i * 0.06} blend="screen" style={{top: H * (0.25 + i * 0.12), height: H * 0.6}} />
        </AbsoluteFill>
      ))}
      <svg style={{position: 'absolute', inset: 0}} width={W} height={H}>
        {rain.map((r, i) => (
          <line key={i} x1={r.x} y1={r.y} x2={r.x - L.px(3)} y2={r.y + r.l} stroke="rgba(210,225,230,0.22)" strokeWidth={L.px(1.2)} />
        ))}
      </svg>
      <Tape x={L.safe} y={L.height - L.safe - L.px(60)} w={L.px(330)} h={L.px(46)} rot={-1.5}>
        GOULSTON ST · 01.30
      </Tape>
    </AbsoluteFill>
  );
};

/* =================== dinding kapur =================== */
export const CHALK_TEXT = ['The Juwes are', 'the men that', 'will not be blamed', 'for nothing'];

export const WallScene: React.FC<S & {chalkChars?: number; erase?: number; hand?: number}> = ({L, frame, chalkChars = 999, erase = 0, hand = 0}) => {
  const bh = L.px(64);
  const bw = L.px(150);
  const fl = 0.85 + smoothNoise('lantern', frame, 4) * 0.15;
  let left = chalkChars;
  const lines = CHALK_TEXT.map((ln) => {
    const s = ln.slice(0, Math.max(0, Math.min(ln.length, left)));
    left -= ln.length;
    return s;
  });
  const handX = L.width * (0.15 + hand * 0.8);
  return (
    <AbsoluteFill style={{backgroundColor: '#3d2a24'}}>
      <svg style={{position: 'absolute', inset: 0}} width={L.width} height={L.height}>
        <rect width="100%" height="100%" fill="#241915" />
        {Array.from({length: Math.ceil(L.height / bh) + 1}, (_, r) =>
          Array.from({length: Math.ceil(L.width / bw) + 2}, (_, c) => {
            const off = r % 2 ? -bw / 2 : 0;
            const t = random(`brick-${r}-${c}`);
            const col = `hsl(${8 + t * 10}, ${28 + t * 14}%, ${16 + t * 12}%)`;
            return <rect key={`${r}-${c}`} x={c * bw + off + L.px(4)} y={r * bh + L.px(4)} width={bw - L.px(8)} height={bh - L.px(8)} rx={L.px(2)} fill={col} />;
          }),
        )}
      </svg>
      <NoiseFill tex="brick" opacity={0.6} blend="multiply" />
      <NoiseFill tex="brick2" opacity={0.25} blend="overlay" />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 85% 95%, rgba(230,174,94,${0.5 * fl}) 0%, rgba(230,174,94,0.12) 35%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 85% 95%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.85) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          left: L.safe * 1.2,
          top: L.height * L.pick({portrait: 0.3, landscape: 0.22, square: 0.26}),
          width: L.contentWidth * 0.9,
          fontFamily: FONT.hand,
          fontSize: L.px(L.pick({portrait: 54, landscape: 50, square: 50})),
          lineHeight: 1.55,
          color: PAL.chalk,
          opacity: 0.88 * (1 - erase * 0.86),
          transform: 'rotate(-2deg)',
          textShadow: `0 0 ${L.px(3)}px rgba(255,255,255,0.5), ${L.px(1)}px ${L.px(1)}px 0 rgba(0,0,0,0.3)`,
          filter: `blur(${0.3 + erase * L.px(14)}px)`,
          whiteSpace: 'pre',
        }}
      >
        {lines.map((ln, i) => (
          <div key={i}>{ln || ' '}</div>
        ))}
      </div>
      <NoiseFill tex="chalkgrit" opacity={0.35} blend="multiply" style={{top: L.height * 0.26, height: L.height * 0.4}} />
      {/* bayangan tangan/lengan yang menghapus */}
      {hand > 0 && hand < 1 && (
        <div
          style={{
            position: 'absolute',
            left: handX - L.px(140),
            top: L.height * 0.22,
            width: L.px(280),
            height: L.height * 0.5,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 70%)',
            filter: `blur(${L.px(18)}px)`,
          }}
        />
      )}
      <svg style={{position: 'absolute', left: 0, bottom: 0}} width={L.width} height={L.height * 0.22} viewBox="0 0 1080 420" preserveAspectRatio="none">
        <path d="M0 420 L0 330 C120 300 200 340 330 290 C420 255 470 300 540 270 C640 230 700 300 820 260 C900 235 980 290 1080 250 L1080 420 Z" fill="#101013" />
        <path d="M120 420 C150 300 300 250 420 300 C500 335 560 280 640 320 C720 360 760 420 760 420 Z" fill="#cfc5b2" opacity="0.95" />
        <path d="M180 410 C230 330 330 300 420 330 C480 350 540 320 600 350 C660 380 700 410 700 410" fill="none" stroke="#8d8577" strokeWidth="4" opacity="0.8" />
        <path d="M260 395 C300 345 380 335 440 360" fill="none" stroke="#9a9184" strokeWidth="3" opacity="0.7" />
        <path d="M400 330 C430 300 500 305 540 340 C520 360 470 365 430 350 Z" fill="#6e2a22" opacity="0.8" />
        <path d="M450 335 C470 318 505 320 525 340" fill="none" stroke="#4a1510" strokeWidth="5" opacity="0.8" />
      </svg>
    </AbsoluteFill>
  );
};

/* =================== surat =================== */
export const LETTER_LINES = [
  'Mr Lusk',
  'Sor',
  'I send you half the',
  'Kidne I took from one',
  'women prasarved it',
  'for you tother piece',
  'I fried and ate it was',
  'very nise. I may send',
  'you the bloody knif',
  'that took it out if',
  'you only wate a whil',
  'longer',
  '      signed',
  '      Catch me when',
  '      you can',
  '      Mishter Lusk',
];

export const LetterScene: React.FC<
  S & {
    paperIn?: number; // 0..1 kertas masuk
    /** jumlah baris yang sudah ditulis (boleh pecahan: 3.4 = baris ke-4 sedang ditulis 40%) */
    written?: number;
    header?: number; // 0..1 "From hell" muncul
    candle?: number; // intensitas goyang 0..1
    boxOnly?: boolean;
    stain?: number; // 0..1 noda di paket membesar
  }
> = ({L, frame, paperIn = 1, written = 99, header = 1, candle = 0.5, boxOnly, stain = 0.3}) => {
  const w = L.width * L.pick({portrait: 0.9, landscape: 0.42, square: 0.86});
  const h = w * 1.3;
  const x = (L.width - w) / 2;
  const y = L.height * L.pick({portrait: 0.14, landscape: 0.06, square: 0.08});
  const cf = 1 - candle * 0.5 + smoothNoise('candle', frame, 3) * candle * 0.6;
  const fs = L.px(L.pick({portrait: 40, landscape: 36, square: 36}));
  const e = 1 - Math.pow(1 - clamp01(paperIn), 3);
  const py = y + (1 - e) * L.height * 0.8;
  return (
    <AbsoluteFill style={{backgroundColor: '#15100c'}}>
      <NoiseFill tex="desk" opacity={0.5} blend="multiply" />
      {/* paket kertas cokelat bertali (kotak kecil ke Lusk) */}
      {(() => {
        const pw = L.px(boxOnly ? 620 : 260);
        const ph = pw * 0.68;
        const px = boxOnly ? L.width * 0.5 - pw / 2 : L.safe * 0.6;
        const pyy = boxOnly ? L.height * L.pick({portrait: 0.4, landscape: 0.3, square: 0.36}) : L.height * 0.04;
        const tw = L.px(boxOnly ? 7 : 3);
        return (
          <div style={{position: 'absolute', left: px, top: pyy, width: pw, height: ph, transform: 'rotate(3deg)', background: 'linear-gradient(160deg, #6e4e33 0%, #4f3622 55%, #3a2717 100%)', boxShadow: `0 ${L.px(18)}px ${L.px(40)}px rgba(0,0,0,0.85), inset 0 0 ${L.px(30)}px rgba(0,0,0,0.5)`}}>
            <NoiseFill tex="parcel" opacity={0.35} blend="multiply" />
            <NoiseFill tex="parcel2" opacity={0.4} blend="multiply" />
            {/* lipatan kertas */}
            <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: L.px(2), background: 'rgba(0,0,0,0.35)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: L.px(2), background: 'rgba(0,0,0,0.3)'}} />
            {/* tali goni menyilang */}
            <div style={{position: 'absolute', left: '36%', top: 0, bottom: 0, width: tw, background: '#b9a27a', boxShadow: `0 0 ${L.px(4)}px rgba(0,0,0,0.6)`}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: '42%', height: tw, background: '#b9a27a', boxShadow: `0 0 ${L.px(4)}px rgba(0,0,0,0.6)`}} />
            <div style={{position: 'absolute', left: '34%', top: '38%', width: tw * 3, height: tw * 3, borderRadius: '50%', background: '#a08b64', boxShadow: `0 ${L.px(2)}px ${L.px(4)}px rgba(0,0,0,0.7)`}} />
            {/* label alamat */}
            <div style={{position: 'absolute', left: '48%', top: '56%', width: '44%', padding: L.px(boxOnly ? 14 : 6), background: '#d9c9a6', transform: 'rotate(-2deg)', boxShadow: `0 ${L.px(3)}px ${L.px(8)}px rgba(0,0,0,0.6)`, fontFamily: FONT.hand, color: '#3b2a22', fontSize: L.px(boxOnly ? 26 : 11), lineHeight: 1.3}}>
              Mr Lusk
              <br />
              Alderney Road
              <br />
              Mile End
            </div>
            {/* noda gelap merembes di sudut */}
            <div style={{position: 'absolute', left: '4%', bottom: '6%', width: `${18 + stain * 42}%`, height: `${20 + stain * 44}%`, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(60,18,12,${0.55 + stain * 0.35}) 0%, rgba(60,18,12,0) 70%)`, filter: `blur(${L.px(6)}px)`}} />
          </div>
        );
      })()}
      {!boxOnly && paperIn > 0 && (
        <Paper w={w} h={h} x={x} y={py} rot={2.2} seed={9} color="#cfb98f" shadow={2}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 50%, rgba(80,50,20,0.45) 100%)'}} />
          <div style={{position: 'absolute', left: L.px(70), top: L.px(80), right: L.px(50), fontFamily: FONT.hand, fontSize: fs, lineHeight: 1.65, color: '#5a1f17', transform: 'rotate(-1.5deg)'}}>
            <div style={{fontSize: fs * 1.25, marginBottom: fs * 0.6, height: fs * 1.6, clipPath: `inset(-20% ${100 - clamp01(header) * 100}% -20% 0)`}}>From hell</div>
            {LETTER_LINES.map((ln, i) => {
              const p = clamp01(written - i);
              return (
                <div key={i} style={{height: fs * 1.65, whiteSpace: 'pre', clipPath: `inset(-20% ${100 - p * 100}% -20% 0)`}}>
                  {ln}
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', right: L.px(60), top: L.px(140), width: L.px(80), height: L.px(60), borderRadius: '50%', background: 'rgba(110,30,22,0.45)', filter: `blur(${L.px(8)}px)`, opacity: clamp01(header)}} />
        </Paper>
      )}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 65% 55% at 88% 88%, rgba(255,190,100,${0.65 * cf}) 0%, rgba(230,150,70,${0.2 * cf}) 35%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 85% at 88% 88%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.8) 100%)'}} />
    </AbsoluteFill>
  );
};

/* =================== pintu =================== */
export const DoorScene: React.FC<S & {crack?: number; feet?: number; leakBoost?: number}> = ({L, frame, crack = 0, feet = 0, leakBoost = 0}) => {
  const W = L.width;
  const H = L.height;
  const plank = L.px(150);
  const kx = W * 0.5;
  const ky = H * L.pick({portrait: 0.5, landscape: 0.52, square: 0.5});
  const leak = 0.75 + smoothNoise('leak', frame, 5) * 0.25 + leakBoost;
  const crackW = crack * L.px(230);
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0705'}}>
      {/* celah: cahaya pucat dari ruangan di balik pintu + siluet tipis */}
      {crack > 0 && (
        <div style={{position: 'absolute', left: L.px(70), top: L.px(90), bottom: 0, width: crackW + L.px(10), background: 'linear-gradient(90deg, rgba(255,244,220,1) 0%, rgba(240,220,180,0.95) 70%, rgba(120,90,60,0.9) 100%)', boxShadow: `0 0 ${L.px(80)}px ${L.px(20)}px rgba(255,225,170,0.8)`}}>
          <div style={{position: 'absolute', left: crackW * 0.3, top: '26%', width: crackW * 0.35, height: '60%', background: 'linear-gradient(180deg, rgba(25,12,8,0.95) 0%, rgba(25,12,8,0.98) 100%)', filter: `blur(${L.px(2)}px)`}} />
        </div>
      )}
      {/* daun pintu: bergeser saat terbuka */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${crackW}px)`, boxShadow: crack > 0 ? `-${L.px(20)}px 0 ${L.px(40)}px rgba(0,0,0,0.8)` : undefined}}>
        <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(90deg, #2b1c12 0, #3a2819 ${plank * 0.08}px, #2e2014 ${plank * 0.5}px, #382616 ${plank * 0.92}px, #0e0905 ${plank}px)`}} />
        <NoiseFill tex="doorwood" opacity={0.55} blend="multiply" />
        <NoiseFill tex="doorgrit" opacity={0.2} blend="overlay" />
        <svg style={{position: 'absolute', left: kx - L.px(105), top: ky - L.px(165)}} width={L.px(210)} height={L.px(330)} viewBox="0 0 140 220">
          <rect x="6" y="6" width="128" height="208" rx="10" fill="#3d3220" stroke="#6b5a3a" strokeWidth="3" />
          <circle cx="70" cy="80" r="22" fill="#0a0806" />
          <rect x="60" y="92" width="20" height="46" fill="#0a0806" />
          <circle cx="26" cy="26" r="5" fill="#1a1510" />
          <circle cx="114" cy="26" r="5" fill="#1a1510" />
          <circle cx="26" cy="194" r="5" fill="#1a1510" />
          <circle cx="114" cy="194" r="5" fill="#1a1510" />
          <ellipse cx="70" cy="178" rx="26" ry="10" fill="#4a3c26" />
        </svg>
        <div style={{position: 'absolute', left: kx - L.px(70), top: ky - L.px(60), width: L.px(140), height: L.px(140), borderRadius: '50%', background: `radial-gradient(circle, rgba(255,235,180,${Math.min(1, leak)}) 0%, rgba(255,200,120,${0.45 * leak}) 35%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen', filter: `blur(${L.px(5)}px)`}} />
        <div style={{position: 'absolute', left: kx - L.px(420), top: ky - L.px(30), width: L.px(840), height: L.px(1100), background: `radial-gradient(ellipse 50% 55% at 50% 0%, rgba(255,210,140,${0.3 * leak}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      </div>
      {/* bingkai pintu (diam) */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: L.px(70), background: 'linear-gradient(90deg, #0a0705 0%, #1a110b 60%, #06040300 100%)'}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: L.px(70), background: 'linear-gradient(270deg, #0a0705 0%, #1a110b 60%, #06040300 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: L.px(90), background: 'linear-gradient(180deg, #0a0705 0%, #1a110b 60%, #06040300 100%)'}} />
      {/* cahaya dari bawah pintu + dua celah gelap: kaki */}
      <div style={{position: 'absolute', left: L.px(70), right: L.px(70), bottom: 0, height: L.px(34), background: `rgba(255,222,165,${Math.min(1, 0.95 * leak)})`, boxShadow: `0 0 ${L.px(120)}px ${L.px(40)}px rgba(255,200,120,${0.55 * leak})`}} />
      <div style={{position: 'absolute', left: W * 0.5 - L.px(120) + feet, bottom: 0, width: L.px(70), height: L.px(34), background: 'rgba(15,8,4,0.95)', filter: `blur(${L.px(3)}px)`}} />
      <div style={{position: 'absolute', left: W * 0.5 + L.px(40) + feet, bottom: 0, width: L.px(70), height: L.px(34), background: 'rgba(15,8,4,0.95)', filter: `blur(${L.px(3)}px)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 55%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.7) 100%)'}} />
      <Tape x={L.safe} y={L.safe} w={L.px(300)} h={L.px(44)} rot={1}>
        MILLER&apos;S COURT · 13
      </Tape>
    </AbsoluteFill>
  );
};
