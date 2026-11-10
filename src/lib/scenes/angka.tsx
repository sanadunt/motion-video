/**
 * Set-set SiaranAngka (ARSIP 05), 2.5D. Pola sama dengan wajah.tsx: menerima `frame` lokal dan nilai
 * animasi 0..1 dari pemanggil; kamera dibungkus <CameraRig> di luar.
 * ATURAN HAK CIPTA: makhluk Siren Head (Trevor Henderson) TIDAK pernah digambar, dimodelkan, atau disiluetkan.
 * Tidak ada tiang yang hidup dan tidak ada corong/megafon di kepala apa pun. Gambar unggahan 2018 ditutup cap.
 */
import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import type {Layout} from '../studio';
import {FONT, NoiseFill, PAL, Paper, Stamp, Tape, smoothNoise} from './index';
import {clamp01} from './sets';

type S = {L: Layout; frame: number};

export const AK = {
  amber: '#E8A33D',
  phosphor: '#7BD88F',
  snow: '#9FB4C7',
  chalk: '#E9E4D6',
  board: '#1D2A26',
  night: '#0A1014',
};

/* =================== radio gelombang pendek (properti bersama) =================== */
/** Posisi jarum 0..1 pada skala 3–8 MHz. 4,625 MHz = 0,325. */
export const dialPos = (mhz: number) => clamp01((mhz - 3) / 5);

export const ShortwaveRadio: React.FC<{
  L: Layout;
  frame: number;
  w: number;
  x: number;
  y: number;
  /** 0..1 terang skala (0 = mati) */
  glow?: number;
  /** MHz yang ditunjuk jarum */
  mhz?: number;
  /** label frekuensi digital di jendela kecil (kosong = mati) */
  readout?: string;
  rot?: number;
}> = ({frame, w, x, y, glow = 1, mhz = 4.625, readout = "", rot = 0}) => {
  const h = w * 0.56;
  const fl = 0.92 + smoothNoise('rad-fl', frame, 5) * 0.08;
  const g = glow * fl;
  const dialW = w * 0.62;
  const dialH = h * 0.3;
  const ticks = Array.from({length: 26}, (_, i) => i / 25);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`}}>
      {/* pendar ke meja/dinding */}
      <div style={{position: 'absolute', left: -w * 0.5, top: -h * 0.6, width: w * 2, height: h * 2.2, background: `radial-gradient(ellipse at 50% 45%, rgba(232,163,61,${0.32 * g}) 0%, rgba(232,163,61,${0.1 * g}) 35%, rgba(0,0,0,0) 65%)`}} />
      {/* badan */}
      <div style={{position: 'absolute', inset: 0, borderRadius: w * 0.03, background: 'linear-gradient(180deg, #2b2724 0%, #171513 100%)', boxShadow: `0 ${w * 0.04}px ${w * 0.08}px rgba(0,0,0,0.85), inset 0 ${w * 0.006}px 0 rgba(255,255,255,0.12)`}}>
        <NoiseFill tex="doorgrit" opacity={0.25} blend="overlay" tileSize={256} />
      </div>
      {/* gagang */}
      <div style={{position: 'absolute', left: w * 0.12, top: -h * 0.16, width: w * 0.76, height: h * 0.2, border: `${w * 0.025}px solid #1a1816`, borderBottom: 'none', borderRadius: `${w * 0.04}px ${w * 0.04}px 0 0`}} />
      {/* antena teleskop */}
      <div style={{position: 'absolute', right: w * 0.06, top: -h * 1.1, width: w * 0.012, height: h * 1.12, background: 'linear-gradient(90deg, #6d6f70, #d4d6d6, #5d5f60)', transform: 'rotate(18deg)', transformOrigin: '50% 100%'}} />
      {/* kisi speaker */}
      <div style={{position: 'absolute', left: w * 0.05, top: h * 0.12, width: w * 0.26, height: h * 0.76, borderRadius: w * 0.02, background: 'repeating-linear-gradient(0deg, #0d0c0b 0px, #0d0c0b 3px, #2c2926 3px, #2c2926 6px)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9)'}} />
      {/* jendela skala */}
      <div style={{position: 'absolute', left: w * 0.34, top: h * 0.12, width: dialW, height: dialH, borderRadius: w * 0.012, overflow: 'hidden', background: `linear-gradient(180deg, rgba(${Math.round(70 + 160 * g)},${Math.round(45 + 110 * g)},${Math.round(18 + 40 * g)},1) 0%, rgba(${Math.round(40 + 120 * g)},${Math.round(25 + 80 * g)},10,1) 100%)`, boxShadow: `inset 0 0 ${w * 0.02}px rgba(0,0,0,0.8), 0 0 ${w * 0.05 * g}px rgba(232,163,61,${0.6 * g})`}}>
        {ticks.map((t, i) => (
          <div key={i} style={{position: 'absolute', left: `${4 + t * 92}%`, top: '18%', width: 1.5, height: i % 5 === 0 ? '30%' : '16%', background: 'rgba(30,18,6,0.85)'}} />
        ))}
        {[3, 4, 5, 6, 7, 8].map((m, i) => (
          <div key={m} style={{position: 'absolute', left: `${4 + (i / 5) * 92}%`, top: '50%', transform: 'translateX(-50%)', fontFamily: FONT.mono, fontSize: dialH * 0.26, color: 'rgba(30,18,6,0.9)'}}>{m}</div>
        ))}
        <div style={{position: 'absolute', right: '3%', top: '6%', fontFamily: FONT.mono, fontSize: dialH * 0.16, color: 'rgba(30,18,6,0.8)'}}>MHz · SW</div>
        {/* jarum */}
        <div style={{position: 'absolute', left: `${4 + dialPos(mhz) * 92}%`, top: '4%', width: Math.max(2, w * 0.006), height: '92%', background: '#b3281c', boxShadow: '0 0 3px rgba(179,40,28,0.8)'}} />
      </div>
      {/* layar digital kecil */}
      <div style={{position: 'absolute', left: w * 0.34, top: h * 0.5, width: w * 0.3, height: h * 0.17, borderRadius: w * 0.008, background: '#0b0f0c', boxShadow: 'inset 0 0 6px rgba(0,0,0,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: h * 0.11, letterSpacing: h * 0.01, color: AK.amber, textShadow: `0 0 ${h * 0.04}px rgba(232,163,61,0.9)`, opacity: readout ? 0.35 + 0.65 * g : 0}}>{readout}</div>
      {/* kenop */}
      {[0.78, 0.92].map((k, i) => (
        <div key={k} style={{position: 'absolute', left: w * k - h * 0.11, top: h * 0.5, width: h * 0.22, height: h * 0.22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #6a6560, #1c1a18 70%)', boxShadow: '0 3px 6px rgba(0,0,0,0.8)', transform: `rotate(${i === 0 ? dialPos(mhz) * 300 : 40}deg)`}}>
          <div style={{position: 'absolute', left: '47%', top: '6%', width: '6%', height: '30%', background: '#d9d4c8'}} />
        </div>
      ))}
      {/* tombol band */}
      {Array.from({length: 4}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: w * (0.35 + i * 0.07), top: h * 0.76, width: w * 0.05, height: h * 0.1, borderRadius: 2, background: i === 2 ? '#cfc8b8' : '#5b5751', boxShadow: '0 2px 3px rgba(0,0,0,0.7)'}} />
      ))}
      {/* merek generik (bukan merek nyata) */}
      <div style={{position: 'absolute', left: w * 0.05, bottom: h * 0.02, fontFamily: FONT.mono, fontSize: h * 0.07, letterSpacing: h * 0.02, color: 'rgba(210,200,180,0.5)'}}>WORLD BAND 12</div>
    </div>
  );
};

/* =================== label kaset ARSIP =================== */
export const ArsipLabel: React.FC<{L: Layout; x: number; y: number; text?: string; sub?: string; rot?: number}> = ({L, x, y, text = 'ARSIP 05', sub = 'SIARAN ANGKA', rot = -3}) => (
  <div style={{position: 'absolute', left: x, top: y, width: L.px(330), height: L.px(108), transform: `rotate(${rot}deg)`, background: '#ddd2b4', boxShadow: '0 6px 14px rgba(0,0,0,0.7)', padding: `${L.px(10)}px ${L.px(18)}px`, boxSizing: 'border-box'}}>
    <NoiseFill tex="paper" opacity={0.3} blend="multiply" />
    <div style={{position: 'relative', fontFamily: FONT.type, color: PAL.ink, fontSize: L.px(40), letterSpacing: L.px(4)}}>{text}</div>
    <div style={{position: 'relative', fontFamily: FONT.hand, color: '#24324a', fontSize: L.px(24), marginTop: L.px(2)}}>{sub}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: L.px(54), height: 2, background: 'rgba(40,30,20,0.35)'}} />
  </div>
);

/* =================== 1 & 5. kelas kosong malam =================== */
export const classroomGeometry = (L: Layout) => {
  const W = L.width;
  const H = L.height;
  return {
    board: {x: W * 0.08, y: H * 0.205, w: W * 0.84, h: H * 0.2},
    radio: {x: W * 0.56, y: H * 0.437, w: L.px(300)},
    note: {x: L.px(150), y: H * 0.552, w: L.px(700), h: L.px(300)},
  };
};

export const ClassroomScene: React.FC<
  S & {
    /** 0..1 angka kapur di papan */
    chalk?: number;
    /** teks kapur */
    chalkText?: string;
    /** 0..1 kertas lipat terbuka */
    noteOpen?: number;
    /** isi tulisan di kertas */
    noteText?: string[];
    /** 0..1 skala radio menyala */
    radioGlow?: number;
    /** 0..1 gelap (adegan penutup) */
    dark?: number;
    label?: boolean;
    /** 0..1 bekas angka yang belum terhapus (sebelum ditulis ulang) */
    ghost?: number;
  }
> = ({L, frame, ghost = 0, chalk = 1, chalkText = '4  6  2  5', noteOpen = 1, noteText = ['kamu pernah dengar', 'siren head ?'], radioGlow = 0.55, dark = 0, label = false}) => {
  const W = L.width;
  const H = L.height;
  const {board, radio, note} = classroomGeometry(L);
  const street = 0.85 + smoothNoise('street', frame, 9) * 0.15;
  const chalkChars = Math.round(chalkText.length * clamp01(chalk));
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0f12'}}>
      {/* dinding belakang */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #1a2226 0%, #151b1e 55%, #0e1214 100%)'}} />
      <NoiseFill tex="stain" opacity={0.5} blend="multiply" />
      {/* jendela dengan pohon gelap di luar (kiri atas, di luar zona teks) */}
      <div style={{position: 'absolute', left: -L.px(40), top: H * 0.03, width: W * 0.36, height: H * 0.155, background: 'linear-gradient(180deg, #23343f 0%, #142028 100%)', border: `${L.px(14)}px solid #2b2a26`, boxSizing: 'border-box', overflow: 'hidden'}}>
        {Array.from({length: 7}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: `${i * 16 - 8 + random(`tr-${i}`) * 6}%`, bottom: 0, width: `${18 + random(`tw-${i}`) * 12}%`, height: `${55 + random(`th-${i}`) * 45}%`, background: '#05090b', borderRadius: '45% 45% 0 0', transform: `translateX(${(smoothNoise(`sway-${i}`, frame, 40) - 0.5) * L.px(6)}px)`}} />
        ))}
        <div style={{position: 'absolute', left: '50%', top: 0, width: L.px(10), height: '100%', background: '#2b2a26'}} />
      </div>
      {/* jam dinding */}
      <div style={{position: 'absolute', right: W * 0.12, top: H * 0.07, width: L.px(120), height: L.px(120), borderRadius: '50%', background: '#cfc8b6', border: `${L.px(8)}px solid #2a2a28`, boxShadow: '0 6px 12px rgba(0,0,0,0.7)', opacity: 0.75}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: L.px(4), height: L.px(40), background: '#111', transform: 'translate(-50%, -100%) rotate(60deg)', transformOrigin: '50% 100%'}} />
        <div style={{position: 'absolute', left: '50%', top: '50%', width: L.px(4), height: L.px(28), background: '#111', transform: 'translate(-50%, -100%) rotate(-30deg)', transformOrigin: '50% 100%'}} />
      </div>
      {/* papan tulis */}
      <div style={{position: 'absolute', left: board.x, top: board.y, width: board.w, height: board.h, background: `linear-gradient(180deg, #24342f 0%, ${AK.board} 100%)`, border: `${L.px(18)}px solid #4a3a2a`, boxSizing: 'border-box', boxShadow: `0 ${L.px(14)}px ${L.px(30)}px rgba(0,0,0,0.8)`, overflow: 'hidden'}}>
        <NoiseFill tex="chalkgrit" opacity={0.18} blend="screen" tileSize={256} />
        {/* bekas hapusan */}
        <div style={{position: 'absolute', left: '8%', top: '15%', width: '60%', height: '40%', background: 'radial-gradient(ellipse, rgba(220,220,210,0.13) 0%, rgba(0,0,0,0) 70%)'}} />
        <div style={{position: 'absolute', right: L.px(30), top: L.px(18), fontFamily: FONT.hand, color: 'rgba(233,228,214,0.28)', fontSize: L.px(26)}}>PR Matematika · hal. 46</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: '30%', textAlign: 'center', fontFamily: FONT.hand, fontSize: L.px(118), color: AK.chalk, letterSpacing: L.px(6), opacity: 0.2 * ghost, filter: 'blur(3px)'}}>{chalkText}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: '30%', textAlign: 'center', fontFamily: FONT.hand, fontSize: L.px(118), color: AK.chalk, letterSpacing: L.px(6), opacity: 0.92, textShadow: '0 0 2px rgba(233,228,214,0.6)'}}>
          {chalkText.slice(0, chalkChars)}
        </div>
        {/* baki kapur */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: L.px(10), background: '#3a2d20'}} />
      </div>
      {/* meja guru + radio */}
      <div style={{position: 'absolute', left: W * 0.42, top: H * 0.525, width: W * 0.62, height: H * 0.05, background: 'linear-gradient(180deg, #4a3624 0%, #2d2016 100%)', boxShadow: `0 ${L.px(16)}px ${L.px(30)}px rgba(0,0,0,0.8)`}}>
        <NoiseFill tex="wood" opacity={0.4} blend="multiply" />
      </div>
      <div style={{position: 'absolute', left: W * 0.46, top: H * 0.575, width: W * 0.54, height: H * 0.1, background: '#20170f'}} />
      <ShortwaveRadio L={L} frame={frame} w={radio.w} x={radio.x} y={radio.y} glow={radioGlow} mhz={4.625} readout={radioGlow > 0.5 ? '4625' : ''} />
      {/* baris bangku (siluet) */}
      {[0, 1].map((r) => (
        <div key={r} style={{position: 'absolute', left: 0, right: 0, top: H * (0.555 + r * 0.045)}}>
          {Array.from({length: 3}, (_, c) => (
            <div key={c} style={{position: 'absolute', left: W * (0.02 + c * 0.17 + r * 0.03), width: W * 0.13 * (1 + r * 0.15), height: H * 0.012, background: '#1a130d', boxShadow: '0 4px 8px rgba(0,0,0,0.8)'}}>
              <div style={{position: 'absolute', left: '8%', top: '100%', width: L.px(6), height: H * 0.03, background: '#0d0a07'}} />
              <div style={{position: 'absolute', right: '8%', top: '100%', width: L.px(6), height: H * 0.03, background: '#0d0a07'}} />
            </div>
          ))}
        </div>
      ))}
      {/* bangku depan (latar dekat) */}
      <div style={{position: 'absolute', left: -W * 0.05, top: H * 0.65, width: W * 1.1, height: H * 0.4, background: 'linear-gradient(180deg, #5a4128 0%, #3a2918 40%, #1c140c 100%)', transform: `perspective(${L.px(900)}px) rotateX(38deg)`, transformOrigin: '50% 0%'}}>
        <NoiseFill tex="desk" opacity={0.55} blend="multiply" />
        <div style={{position: 'absolute', left: '62%', top: '20%', fontFamily: FONT.hand, fontSize: L.px(30), color: 'rgba(20,12,6,0.55)', transform: 'rotate(-8deg)'}}>Rina + Dimas</div>
      </div>
      {/* tas tertinggal */}
      <div style={{position: 'absolute', right: -L.px(20), top: H * 0.83, width: L.px(260), height: L.px(220), borderRadius: `${L.px(40)}px ${L.px(40)}px ${L.px(18)}px ${L.px(18)}px`, background: 'linear-gradient(160deg, #3d2f52 0%, #1e1730 100%)', boxShadow: '0 10px 24px rgba(0,0,0,0.8)', transform: 'rotate(-6deg)'}} />
      {/* kertas lipat */}
      <div style={{position: 'absolute', left: note.x, top: note.y, width: note.w, height: note.h, transform: `rotate(${-4 + (1 - noteOpen) * 10}deg) scale(${0.42 + 0.58 * noteOpen}, ${0.45 + 0.55 * noteOpen})`, transformOrigin: '40% 60%', filter: `brightness(${0.75 + 0.25 * noteOpen})`}}>
        <Paper w={note.w} h={note.h} color="#ece6d6" seed={41} shadow={1.2}>
          {/* garis buku tulis */}
          {Array.from({length: 6}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: L.px(54 + i * 46), height: 1.5, background: 'rgba(80,110,160,0.35)'}} />
          ))}
          <div style={{position: 'absolute', left: L.px(60), top: 0, bottom: 0, width: 1.5, background: 'rgba(190,60,60,0.4)'}} />
          {/* lipatan */}
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(0,0,0,0.12)', boxShadow: '0 1px 0 rgba(255,255,255,0.3)'}} />
          <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(0,0,0,0.1)'}} />
          <div style={{position: 'absolute', left: L.px(90), top: L.px(40), right: L.px(30), fontFamily: FONT.hand, color: '#1f3d78', fontSize: L.px(40), lineHeight: 1.45, transform: 'rotate(-1.5deg)', opacity: clamp01(noteOpen * 1.6 - 0.4), textAlign: noteText[0] === '' ? 'center' : 'left'}}>
            {noteText.map((t, i) => (
              <div key={i} style={{fontSize: i === noteText.length - 1 && noteText.length > 1 ? L.px(50) : undefined}}>{t}</div>
            ))}
          </div>
        </Paper>
      </div>
      {label ? <ArsipLabel L={L} x={L.px(90)} y={H * 0.205 + L.px(6)} /> : null}
      {/* cahaya: bulan dari jendela + lampu jalan + radio */}
      <AbsoluteFill style={{background: `linear-gradient(160deg, rgba(120,160,190,${0.16 * street}) 0%, rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 30% at 70% 52%, rgba(232,163,61,${0.22 * radioGlow}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{backgroundColor: '#000', opacity: dark * 0.6}} />
      {dark > 0 ? <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 22% at 70% 51%, rgba(232,163,61,${0.3 * radioGlow * dark}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} /> : null}
    </AbsoluteFill>
  );
};

/* =================== 2. meja arsip internet =================== */
export const archiveGeometry = (L: Layout) => {
  const W = L.width;
  const H = L.height;
  const mw = L.px(820);
  return {mon: {x: (W - mw) / 2, y: H * 0.2, w: mw, h: mw * 0.86}, knob: {x: W * 0.78, y: H * 0.71}};
};

export const ArchiveDeskScene: React.FC<S & {dateIn?: number; stamp?: number; scan?: number}> = ({L, frame, dateIn = 1, stamp = 1, scan = 1}) => {
  const W = L.width;
  const H = L.height;
  const {mon} = archiveGeometry(L);
  const sx = mon.w * 0.1;
  const sy = mon.h * 0.09;
  const sw = mon.w * 0.8;
  const sh = mon.h * 0.74;
  const flick = 0.93 + smoothNoise('crt', frame, 2) * 0.07;
  const date = '19 · 08 · 2018';
  const dateChars = Math.round(date.length * clamp01(dateIn));
  return (
    <AbsoluteFill style={{backgroundColor: '#090b0d'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #121619 0%, #0b0d0f 60%, #060708 100%)'}} />
      <NoiseFill tex="stain" opacity={0.4} blend="multiply" />
      {/* meja */}
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.62, bottom: 0, background: 'linear-gradient(180deg, #2b2119 0%, #15100b 100%)'}}>
        <NoiseFill tex="desk" opacity={0.5} blend="multiply" />
      </div>
      {/* monitor CRT */}
      <div style={{position: 'absolute', left: mon.x, top: mon.y, width: mon.w, height: mon.h, borderRadius: L.px(28), background: 'linear-gradient(180deg, #cdc5b0 0%, #a99f88 100%)', boxShadow: `0 ${L.px(30)}px ${L.px(60)}px rgba(0,0,0,0.9), inset 0 -${L.px(10)}px ${L.px(20)}px rgba(0,0,0,0.25)`}}>
        <NoiseFill tex="paper" opacity={0.2} blend="multiply" />
        <div style={{position: 'absolute', left: sx, top: sy, width: sw, height: sh, borderRadius: L.px(30), overflow: 'hidden', background: '#d9dde0', boxShadow: `inset 0 0 ${L.px(40)}px rgba(0,0,0,0.75)`, filter: `brightness(${flick})`}}>
          {/* UI unggahan fiktif (bukan tampilan platform nyata) */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: sh * 0.11, background: '#c3c9cd', borderBottom: '1px solid #9aa2a8'}} />
          <div style={{position: 'absolute', left: sw * 0.05, top: sh * 0.025, width: sh * 0.06, height: sh * 0.06, borderRadius: '50%', background: '#8e979d'}} />
          <div style={{position: 'absolute', left: sw * 0.14, top: sh * 0.035, width: sw * 0.3, height: sh * 0.025, background: '#8e979d'}} />
          <div style={{position: 'absolute', right: sw * 0.05, top: sh * 0.03, fontFamily: FONT.mono, fontSize: sh * 0.045, color: '#2c3338'}}>{date.slice(0, dateChars)}</div>
          {/* area gambar: ditutup kertas bercap */}
          <div style={{position: 'absolute', left: sw * 0.05, top: sh * 0.14, width: sw * 0.9, height: sh * 0.56, background: '#5d6a62', overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #8a9aa4 0%, #6b7a70 55%, #4a5a44 100%)', filter: 'blur(6px)', opacity: 0.8}} />
          </div>
          <div style={{position: 'absolute', left: sw * 0.09, top: sh * 0.18, width: sw * 0.82, height: sh * 0.48, transform: 'rotate(-1.5deg)'}}>
            <Paper w={sw * 0.82} h={sh * 0.48} color="#e2dac4" seed={57} shadow={0.8}>
              <div style={{position: 'absolute', left: 0, right: 0, top: '22%', textAlign: 'center', fontFamily: FONT.type, fontSize: sh * 0.042, color: PAL.ink, letterSpacing: sh * 0.006}}>GAMBAR ASLI</div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: '14%', textAlign: 'center', fontFamily: FONT.hand, fontSize: sh * 0.04, color: '#2b3a5a'}}>© pembuatnya</div>
              <div style={{opacity: clamp01(stamp), transform: `scale(${1 + (1 - clamp01(stamp)) * 0.4})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0}}>
                <Stamp text="TIDAK DITAMPILKAN" x={sw * 0.08} y={sh * 0.17} size={sh * 0.058} rot={-7} />
              </div>
            </Paper>
            <Tape x={-sw * 0.03} y={-sh * 0.02} w={sw * 0.16} h={sh * 0.05} rot={-28} />
            <Tape x={sw * 0.7} y={sh * 0.42} w={sw * 0.16} h={sh * 0.05} rot={-25} />
          </div>
          {/* angka suka + baris caption disamarkan */}
          <div style={{position: 'absolute', left: sw * 0.05, top: sh * 0.74, fontFamily: FONT.mono, fontSize: sh * 0.05, color: '#3a4146'}}>♥ 1.3rb · ⟲ 260</div>
          {[0.84, 0.9].map((t, i) => (
            <div key={t} style={{position: 'absolute', left: sw * 0.05, top: sh * t, width: sw * (i ? 0.55 : 0.82), height: sh * 0.025, background: '#9aa2a8'}} />
          ))}
          {/* garis pindai + kilap kaca */}
          <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: `${((frame * 1.3) % 120) - 10}%`, height: '8%', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)', opacity: scan}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)'}} />
        </div>
        {/* label dan lampu power */}
        <div style={{position: 'absolute', right: mon.w * 0.08, bottom: mon.h * 0.045, width: L.px(14), height: L.px(14), borderRadius: '50%', background: '#7ae07a', boxShadow: '0 0 10px #7ae07a'}} />
      </div>
      {/* papan ketik */}
      <div style={{position: 'absolute', left: W * 0.12, top: H * 0.665, width: W * 0.76, height: H * 0.09, borderRadius: L.px(14), background: 'linear-gradient(180deg, #c2b9a3 0%, #8d846f 100%)', transform: `perspective(${L.px(700)}px) rotateX(42deg)`, transformOrigin: '50% 0%', boxShadow: '0 20px 40px rgba(0,0,0,0.8)'}}>
        {Array.from({length: 4}, (_, r) => (
          <div key={r} style={{display: 'flex', gap: L.px(6), padding: `${L.px(6)}px ${L.px(20 + r * 10)}px`}}>
            {Array.from({length: 13 - r}, (_, c) => (
              <div key={c} style={{flex: 1, height: L.px(26), borderRadius: 4, background: '#e2dccd', boxShadow: '0 3px 0 #7a7262'}} />
            ))}
          </div>
        ))}
      </div>
      {/* cahaya layar ke wajah meja */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 38%, rgba(190,210,225,0.18) 0%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 80% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

/* =================== 3. kamar apartemen, 2001 =================== */
export const NUMBER_ROWS = ['38140  62617  90745', '27531  84092  45716', '91264  07438  52819'];

export const radioRoomGeometry = (L: Layout) => {
  const W = L.width;
  const H = L.height;
  return {
    radio: {x: W * 0.035, y: H * 0.445, w: L.px(380)},
    pad: {x: L.px(90), y: H * 0.572, w: L.px(560), h: L.px(280)},
    cal: {x: W * 0.565, y: H * 0.205, w: L.px(320), h: L.px(300)},
    woman: {x: W * 0.5 - L.px(330), y: H * 0.255, size: L.px(660)},
    desk: H * 0.555,
  };
};

export const RadioRoomScene: React.FC<S & {rows?: number; calCircles?: number; folder?: number; womanSrc?: string; lamp?: number}> = ({
  L,
  frame,
  rows = 4,
  calCircles = 1,
  folder = 1,
  womanSrc = 'storyboard/angka/montes_back.png',
  lamp = 1,
}) => {
  const W = L.width;
  const H = L.height;
  const {radio, pad, cal, woman, desk} = radioRoomGeometry(L);
  const lampF = lamp * (0.95 + smoothNoise('lamp3', frame, 6) * 0.05);
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hit = [2, 4, 6]; // TUE THU SAT
  return (
    <AbsoluteFill style={{backgroundColor: '#0d0f12'}}>
      {/* dinding */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2a2b2c 0%, #1b1c1d 60%, #101112 100%)'}} />
      <NoiseFill tex="stain" opacity={0.45} blend="multiply" />
      {/* jendela + kerai: cahaya lampu jalan bergaris */}
      <div style={{position: 'absolute', left: W * 0.06, top: H * 0.035, width: W * 0.46, height: H * 0.24, background: '#0b1418', border: `${L.px(16)}px solid #d7d2c6`, boxSizing: 'border-box', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(230,170,90,0.45) 0%, rgba(0,0,0,0) 60%)'}} />
        {Array.from({length: 18}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${i * 5.6}%`, height: '3.4%', background: 'linear-gradient(180deg, #cfc6b4 0%, #8e8676 100%)', opacity: 0.92}} />
        ))}
      </div>
      {/* garis cahaya kerai di dinding kanan */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(170deg, rgba(230,170,90,0.07) 0px, rgba(230,170,90,0.07) 14px, rgba(0,0,0,0) 14px, rgba(0,0,0,0) 34px)', clipPath: 'polygon(55% 0, 100% 0, 100% 45%, 55% 30%)'}} />
      {/* kalender dinding Mei 2001 (Selasa, Kamis, Sabtu dilingkari) */}
      <div style={{position: 'absolute', left: cal.x, top: cal.y, width: cal.w, height: cal.h, transform: 'rotate(2deg)'}}>
        <Paper w={cal.w} h={cal.h} color="#e4ddca" seed={63}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: cal.h * 0.2, background: '#7a2620', color: '#f1e6d2', fontFamily: FONT.type, fontSize: cal.h * 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: L.px(3)}}>MAY 2001</div>
          <div style={{position: 'absolute', left: L.px(12), right: L.px(12), top: cal.h * 0.24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: L.px(4)}}>
            {days.map((d, i) => (
              <div key={`d${i}`} style={{textAlign: 'center', fontFamily: FONT.mono, fontSize: cal.h * 0.06, color: '#3a2e25', position: 'relative'}}>
                {d}
                {hit.includes(i) && calCircles > 0 ? (
                  <div style={{position: 'absolute', left: '50%', top: '50%', width: cal.h * 0.13, height: cal.h * 0.11, marginLeft: -cal.h * 0.065, marginTop: -cal.h * 0.055, border: `${L.px(3)}px solid rgba(160,30,25,0.85)`, borderRadius: '50%', transform: `rotate(${i * 7}deg)`, opacity: clamp01(calCircles * 3 - hit.indexOf(i))}} />
                ) : null}
              </div>
            ))}
            {Array.from({length: 35}, (_, i) => {
              const n = i - 1; // 1 Mei 2001 = Selasa
              return (
                <div key={i} style={{textAlign: 'center', fontFamily: FONT.mono, fontSize: cal.h * 0.05, color: hit.includes(i % 7) ? '#7a2620' : '#4a4038'}}>{n >= 1 && n <= 31 ? n : ''}</div>
              );
            })}
          </div>
        </Paper>
      </div>
      {/* tokoh PSX dari belakang (render Blender, wajah tidak pernah terlihat) */}
      <Img src={staticFile(womanSrc)} style={{position: 'absolute', left: woman.x, top: woman.y, width: woman.size, height: woman.size, imageRendering: 'pixelated', filter: 'brightness(0.9)'}} />
      {/* sandaran kursi */}
      <div style={{position: 'absolute', left: woman.x + woman.size * 0.2, top: woman.y + woman.size * 0.66, width: woman.size * 0.6, height: woman.size * 0.4, borderRadius: `${L.px(20)}px ${L.px(20)}px 0 0`, background: 'linear-gradient(180deg, #2a2420 0%, #141110 100%)', boxShadow: '0 -4px 14px rgba(0,0,0,0.6)'}} />
      {/* meja */}
      <div style={{position: 'absolute', left: -W * 0.05, top: desk, width: W * 1.1, height: H * 0.5, background: 'linear-gradient(180deg, #4b3a2a 0%, #2a2018 45%, #120d09 100%)', transform: `perspective(${L.px(900)}px) rotateX(30deg)`, transformOrigin: '50% 0%'}}>
        <NoiseFill tex="desk" opacity={0.5} blend="multiply" />
      </div>
      {/* radio */}
      <ShortwaveRadio L={L} frame={frame} w={radio.w} x={radio.x} y={radio.y} glow={0.95} mhz={5.9} readout="" rot={-2} />
      {/* laptop tua */}
      <div style={{position: 'absolute', left: W * 0.7, top: H * 0.47, width: L.px(300), height: L.px(190), background: '#3c3e40', borderRadius: L.px(8), transform: `perspective(${L.px(800)}px) rotateX(8deg) rotate(3deg)`, boxShadow: '0 12px 30px rgba(0,0,0,0.85)'}}>
        <div style={{position: 'absolute', inset: L.px(16), background: '#26343a', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'}}>
          {Array.from({length: 7}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: L.px(10), top: L.px(10 + i * 26), width: `${40 + random(`lp-${i}`) * 50}%`, height: L.px(8), background: 'rgba(160,200,210,0.35)'}} />
          ))}
        </div>
      </div>
      {/* buku catatan angka 5 digit */}
      <div style={{position: 'absolute', left: pad.x, top: pad.y, width: pad.w, height: pad.h, transform: 'rotate(-3deg)'}}>
        <Paper w={pad.w} h={pad.h} color="#e8e2d0" seed={71} shadow={1.3}>
          {Array.from({length: 6}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: L.px(58 + i * 42), height: 1.5, background: 'rgba(90,120,170,0.3)'}} />
          ))}
          <div style={{position: 'absolute', left: L.px(36), top: L.px(20), fontFamily: FONT.hand, fontSize: L.px(29), color: '#28323f', lineHeight: `${L.px(42)}px`, letterSpacing: L.px(1)}}>
            {NUMBER_ROWS.map((r, i) => {
              const p = clamp01(rows - i);
              return (
                <div key={i} style={{clipPath: `inset(-20% ${100 - p * 100}% -20% 0)`, whiteSpace: 'nowrap'}}>{r}</div>
              );
            })}
          </div>
        </Paper>
        {/* pensil */}
        <div style={{position: 'absolute', right: -L.px(30), bottom: L.px(40), width: L.px(300), height: L.px(18), background: 'linear-gradient(180deg, #e4b33c 0%, #b8871d 100%)', transform: 'rotate(-28deg)', borderRadius: L.px(3)}}>
          <div style={{position: 'absolute', left: -L.px(30), top: 0, width: 0, height: 0, borderTop: `${L.px(9)}px solid transparent`, borderBottom: `${L.px(9)}px solid transparent`, borderRight: `${L.px(30)}px solid #e8d2a6`}} />
        </div>
      </div>
      {/* map berkas */}
      <div style={{position: 'absolute', left: W * 0.62, top: H * 0.585, width: L.px(320), height: L.px(190), transform: `rotate(5deg) translateY(${(1 - clamp01(folder)) * L.px(120)}px)`, opacity: clamp01(folder * 2)}}>
        <Paper w={L.px(320)} h={L.px(190)} color="#c9a86a" seed={77}>
          <div style={{position: 'absolute', left: L.px(26), top: L.px(30), fontFamily: FONT.type, fontSize: L.px(30), color: PAL.ink, letterSpacing: L.px(3)}}>BERKAS · 2001</div>
          <Stamp text="RAHASIA" x={L.px(34)} y={L.px(88)} size={L.px(30)} rot={-8} />
        </Paper>
      </div>
      {/* lampu meja hangat + skala radio */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 35% at 55% 62%, rgba(255,190,110,${0.28 * lampF}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 80% at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

/* =================== 4. overlay padang salju (render Blender di bawahnya) =================== */
export const SnowOverlay: React.FC<S & {freq?: number; count?: number; from?: number; to?: number; buzz?: number}> = ({L, frame, freq = 1, count = 1, from = 1982, to = 2026, buzz = 1}) => {
  const H = L.height;
  const year = Math.round(from + (to - from) * clamp01(count));
  const bars = Array.from({length: 48}, (_, i) => i);
  // dengung ±25/menit: nyala 1,2 dtk, jeda ±1,2 dtk (2,4 dtk = 72 frame)
  const on = buzz > 0 && frame % 72 < 36;
  return (
    <AbsoluteFill>
      {/* label pita frekuensi */}
      <div style={{position: 'absolute', left: L.px(110), top: H * 0.215, opacity: clamp01(freq), transform: `translateX(${(1 - clamp01(freq)) * -L.px(60)}px)`}}>
        <Tape x={0} y={0} w={L.px(420)} h={L.px(96)} rot={-4}>
          4625 kHz
        </Tape>
      </div>
      {/* layar spektrum fosfor kecil */}
      <div style={{position: 'absolute', left: L.px(110), top: H * 0.215 + L.px(130), width: L.px(380), height: L.px(170), background: '#050a06', border: `${L.px(6)}px solid #2a2c2a`, boxShadow: '0 8px 20px rgba(0,0,0,0.8)', overflow: 'hidden'}}>
        {bars.map((i) => {
          const center = Math.abs(i - 16) < 1.5;
          const hgt = center ? (on ? 0.85 : 0.12) : 0.06 + random(`sp-${i}-${Math.floor(frame / 2)}`) * 0.1;
          return <div key={i} style={{position: 'absolute', left: `${(i / bars.length) * 100}%`, bottom: 0, width: `${100 / bars.length - 0.5}%`, height: `${hgt * 100}%`, background: AK.phosphor, opacity: center ? 0.95 : 0.55, boxShadow: center && on ? `0 0 8px ${AK.phosphor}` : undefined}} />;
        })}
        <div style={{position: 'absolute', left: '33%', top: L.px(6), fontFamily: FONT.mono, fontSize: L.px(18), color: AK.phosphor, opacity: 0.8}}>▼ 4.625</div>
      </div>
      {/* penghitung tahun */}
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.6, display: 'flex', justifyContent: 'center', opacity: clamp01(count * 4)}}>
        <div style={{padding: `${L.px(10)}px ${L.px(30)}px`, background: 'rgba(5,8,10,0.75)', border: `1px solid rgba(159,180,199,0.4)`, fontFamily: FONT.mono, fontSize: L.px(64), color: AK.snow, letterSpacing: L.px(6)}}>
          {from} → {year}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* =================== 2b. close-up radio (match-cut dari lampu power monitor) =================== */
export const radioCloseGeometry = (L: Layout) => {
  const w = L.px(820);
  return {x: (L.width - w) / 2, y: L.height * 0.36, w};
};

export const RadioCloseScene: React.FC<S & {mhz?: number; glow?: number; readout?: string}> = ({L, frame, mhz = 4.625, glow = 1, readout = '4625'}) => {
  const H = L.height;
  const g = radioCloseGeometry(L);
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0907'}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #17120d 0%, #0b0907 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.5, bottom: 0, background: 'linear-gradient(180deg, #2a1f15 0%, #110c08 100%)'}}>
        <NoiseFill tex="desk" opacity={0.5} blend="multiply" />
      </div>
      <ShortwaveRadio L={L} frame={frame} w={g.w} x={g.x} y={g.y} glow={glow} mhz={mhz} readout={readout} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 30% at 50% 45%, rgba(232,163,61,${0.18 * glow}) 0%, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 95% 70% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};
