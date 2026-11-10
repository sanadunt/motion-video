/**
 * ArsipTiang — "ARSIP 06 · Yang Berdiri di Antara Tiang", fan film Siren Head NON-KOMERSIAL, ±92 dtk portrait.
 * Set 2.5D: src/lib/scenes/tiang.tsx. 3D PSX Blender: public/3d/tiang/ (scripts/blender/tiang/, timing dari cues yang sama).
 * Brief, naskah, storyboard: briefs/ArsipTiang*.md. Siren Head © Trevor Henderson; kredit penuh di akhir.
 *
 * Satu sumber timing: posisi klip dari briefs/ArsipTiang.vo.json, frasa dari tiang-captions.json, kata dari tiang-words.json.
 * Rumus objek B sama dengan dict B di scripts/blender/tiang/tiang_scenes.py (frame 1 render = awal adegan).
 * Keselamatan: satu kilatan di jumpscare (9 frame), lampu jalan padam 4 frame sekali, lampu antena ≤ 2,5 Hz.
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {EASE, ensureFonts, progress, sec, useLayout} from '../lib/studio';
import {CameraRig, FONT, FilmGrade, NoiseFill, PAL} from '../lib/scenes';
import {clamp01} from '../lib/scenes/sets';
import {AK} from '../lib/scenes/angka';
import {CamcorderOSD, CreditCard, HTScene, TapeGlitchImg, TiangDeskScene, TiangLabel, htGeometry, tiangDeskGeometry} from '../lib/scenes/tiang';
import captions from './tiang-captions.json';
import vowords from './tiang-words.json';
import voCfg from '../../briefs/ArsipTiang.vo.json';

ensureFonts();

export const arsipTiangSchema = z.object({
  grain: z.number().min(0).max(1),
  handheld: z.number().min(0).max(1),
  mumbleGain: z.number().min(0).max(2),
  captions: z.boolean(),
  durationInSeconds: z.number().min(60).max(120),
});
export type ArsipTiangProps = z.infer<typeof arsipTiangSchema>;
export const arsipTiangDefaults: ArsipTiangProps = {grain: 0.5, handheld: 0.6, mumbleGain: 1, captions: true, durationInSeconds: 92.3};

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
  const c = voCfg.timeline.find((x) => x.file === file);
  if (!c) throw new Error(`klip tidak ada di timeline: ${file}`);
  return c.at;
};
const between = (a: string, b: string) => (cap(a).end + cap(b).start) / 2;

const B = (() => {
  const c23 = word('b2-tambah', 'tiga');
  const turn = c23 + 0.1;
  const back = turn + 1.45;
  const again = back + 0.45;
  const fall = again + 0.35;
  const jumpscare = voCfg.jumpscare;
  return {
    tambah: word('01-hook', 'bertambah'),
    jangan: word('01-hook', 'jangan'),
    s1End: between('dan jumlahnya', 'Dari jauh'),
    open: word('02-ciri', 'jauh'),
    tiang2: word('02-ciri', 'tiang'),
    daging: word('02-ciri', 'daging'),
    tanpa: word('02-ciri', 'tanpa'),
    dua: word('02-ciri', 'dua'),
    stamp: word('02-ciri', 'pengeras'),
    s2End: between('Dari dekat', 'Pengeras suara itu'),
    bersiaran: word('03a-siaran', 'bersiaran'),
    sirene: word('03a-siaran', 'sirene'),
    k1: at('k1-siaran'),
    k1v: cap('Selamat malam').start,
    k1e: cap('Selamat malam').end,
    kenal: word('03b-kenal', 'suara'),
    s3End: between('suara orang', 'Seorang'),
    rekam: word('04-pendaki', 'merekam') + 0.45,
    c21: word('b1-hitung', 'satu'),
    c23,
    turn,
    back,
    again,
    fall,
    firasat: back - 0.35,
    s4End: at('05-hilang') - 0.02,
    pendakinya: word('05-hilang', 'pendakinya'),
    satu: word('06-satu', 'ia'),
    radioOn: cap('Tak ada yang').end + 0.05,
    n7: cap('hitung lagi').start,
    hush: at('n7-tiru') + 2.39, // n7 file selesai (vo.json _beats: 82,25)
    jumpscare,
    credits: jumpscare + 1.0,
  };
})();

/* jenis klip untuk gaya caption */
const KIND: Record<string, string> = Object.fromEntries(voCfg.clips.map((c) => [c.file, c.kind]));

export const ArsipTiang: React.FC<ArsipTiangProps> = ({grain, handheld, mumbleGain, captions: showCaptions}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = useLayout();
  const W = L.width;
  const H = L.height;
  const t = frame / fps;
  const F = (s: number) => sec(s, fps);
  const p = (from: number, dur: number, ease = EASE.inOut) => progress(frame, F(from), Math.max(1, F(dur)), ease);
  const hh = L.px(2.4) * handheld;
  const jsF = F(B.jumpscare);
  const inJump = frame >= jsF && frame < jsF + 9;

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
  const video = (src: string, from: number) => (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={F(from)} layout="none">
        <OffthreadVideo src={staticFile(src)} muted style={{width: W, height: H, imageRendering: 'pixelated'}} />
      </Sequence>
    </AbsoluteFill>
  );

  type Shot = {node: React.ReactNode; zoom: number; x: number; y: number; origin?: string; black?: number; warm?: number; grade?: boolean; hideCaption?: boolean; overlay?: React.ReactNode};
  const g = tiangDeskGeometry(L);
  const ctr = (r: {x: number; y: number; w: number; h?: number}): [number, number] => [r.x + r.w / 2, r.y + (r.h ?? r.w * 0.56) / 2];
  const none: Shot = {node: null, zoom: 1, x: 0, y: 0, black: 1};

  const shot = ((): Shot => {
    /* 1. jalan desa (Blender): label kaset di frame 1 (thumbnail), lampu padam 4 frame di "jangan" (di render) */
    if (t < B.s1End) {
      const lab = 1 - p(4.2, 0.6, EASE.in);
      return {
        node: video('3d/tiang/jalan.mp4', 0),
        overlay: lab > 0 ? <div style={{opacity: lab, transform: `translateY(${(1 - lab) * -L.px(40)}px)`}}><TiangLabel L={L} x={L.px(110)} y={L.px(430)} /></div> : null,
        zoom: 1,
        x: 0,
        y: 0,
        warm: 0.35,
        black: p(B.s1End - 0.3, 0.3, (v) => v),
      };
    }

    /* 2. meja arsip: map terbuka di "jauh", kalkir di "tiang", sampel di "daging", tulisan di "tanpa", cap di "pengeras",
          lalu push ke lingkaran merah peta (match-cut ke lampu antena) */
    if (t < B.s2End) {
      const lf = frame - F(B.s1End);
      const cover: [number, number] = [W / 2, g.folder.y + g.folder.h * 0.4];
      const tr = ctr(g.trace);
      const sm = ctr(g.sample);
      const fm = ctr(g.form);
      const sk = ctr(g.sketch);
      const cam = path([
        {t: B.s1End, z: 1.12, x: cover[0], y: cover[1]},
        {t: B.open + 0.2, z: 1.08, x: W / 2, y: H * 0.5},
        {t: B.tiang2 - 0.4, z: 1.05, x: W / 2, y: H * 0.45},
        {t: B.tiang2 + 0.6, z: 1.65, x: tr[0], y: tr[1]},
        {t: B.daging - 0.5, z: 1.7, x: tr[0], y: tr[1] + L.px(20)},
        {t: B.daging + 0.4, z: 1.6, x: sm[0], y: sm[1]},
        {t: B.tanpa - 0.6, z: 1.62, x: sm[0] + L.px(20), y: sm[1]},
        {t: B.tanpa + 0.3, z: 1.75, x: fm[0], y: fm[1]},
        {t: B.dua - 0.5, z: 1.75, x: fm[0] + L.px(20), y: fm[1]},
        {t: B.dua + 0.3, z: 1.7, x: sk[0], y: sk[1]},
        {t: B.s2End - 1.0, z: 2.0, x: sk[0], y: sk[1] - L.px(20)},
        {t: B.s2End - 0.15, z: 4.2, x: g.circle.x, y: g.circle.y},
      ]);
      return {
        node: (
          <TiangDeskScene
            L={L}
            frame={lf}
            open={p(B.open, 0.8, EASE.inOut)}
            trace={p(B.tiang2, 0.7, EASE.out)}
            sample={p(B.daging, 0.45, EASE.out)}
            form={p(B.tanpa, 1.3, (v) => v)}
            stamp={p(B.stamp, 0.18, EASE.in)}
            circle={p(B.open + 0.9, 1.4, (v) => v)}
          />
        ),
        ...cam,
        black: 1 - p(B.s1End, 0.3, EASE.out),
        warm: 0.55,
        hideCaption: t > B.s2End - 1.0,
      };
    }

    /* 3. relay (Blender) ↔ HT di pos jaga (Remotion): HT di "bersiaran", relay saat "sirene", HT lagi sampai "suara orang…" */
    if (t < B.s3End) {
      const relay = video('3d/tiang/relay.mp4', B.s2End);
      const inHT = (t >= B.bersiaran && t < B.sirene) || (t >= B.sirene + 1.2 && t < B.kenal);
      if (!inHT) return {node: relay, zoom: 1, x: 0, y: 0, warm: 0.2, black: 0};
      const lf = frame - F(B.s2End);
      // lampu merah sama dengan render: nyala 25 / mati 25 frame, 6/6 selama 1,2 dtk "sirene"
      const fs0 = F(B.sirene) - F(B.s2End);
      const red = lf < fs0 ? Math.floor(lf / 25) % 2 === 0 : true;
      const hg = htGeometry(L);
      const grille: [number, number] = [hg.grille.x + hg.grille.w / 2, hg.grille.y + hg.grille.h / 2];
      const ledOn = t - B.bersiaran;
      const led = ledOn < 0 ? 0 : ledOn < 0.06 ? 1 : ledOn < 0.13 ? 0 : 1;
      const speaking = t >= B.k1v - 0.05 && t < B.k1e + 0.1;
      const lcd = speaking ? `${140 + Math.floor(random(`lcd${Math.floor(frame / 4)}`) * 30)}.${String(Math.floor(random(`lcd2${Math.floor(frame / 4)}`) * 999)).padStart(3, '0')}` : '146.520';
      const cam = path([
        {t: B.bersiaran, z: 1.05, x: W / 2, y: H * 0.5},
        {t: B.sirene, z: 1.12, x: W / 2, y: H * 0.48},
        {t: B.sirene + 1.2, z: 1.15, x: W / 2, y: H * 0.47},
        {t: B.k1v, z: 1.25, x: grille[0], y: grille[1] - L.px(80)},
        {t: B.k1e + 0.3, z: 1.6, x: grille[0], y: grille[1]},
        {t: B.kenal, z: 2.1, x: grille[0], y: grille[1]},
      ]);
      return {node: <HTScene L={L} frame={lf} led={led} lcd={lcd} speak={speaking ? 1 : 0} redBlink={red ? 1 : 0} />, ...cam, warm: 0.3, black: 0};
    }

    /* 4a. pendaki dari belakang (Blender) */
    if (t < B.rekam) return {node: video('3d/tiang/pendaki.mp4', B.s3End), zoom: 1, x: 0, y: 0, warm: 0.3, black: 0};

    /* 4b. rekaman camcorder (Blender) + OSD + artefak pita; firasat 2 frame; jatuh, statis, tape stop */
    if (t < B.s4End) {
      const lf = frame - F(B.rekam);
      const staticFrom = F(B.fall) + 10;
      const stopFrom = F(B.s4End - 0.5);
      const fir = frame >= F(B.firasat) && frame < F(B.firasat) + 2;
      const turning = (t >= B.turn && t < B.turn + 0.5) || (t >= B.back && t < B.again + 0.4) || (t >= B.fall && t < B.fall + 0.4);
      const glitch = fir ? 1 : turning ? 0.7 : 0.15;
      if (frame >= stopFrom) return {...none, grade: false, hideCaption: true};
      const isStatic = frame >= staticFrom;
      return {
        node: (
          <AbsoluteFill>
            {video('3d/tiang/cam.mp4', B.rekam)}
            {fir && <TapeGlitchImg src="3d/tiang/face/f_0003.png" W={W} H={H} frame={frame} amount={1} seed="fir" style={{clipPath: 'inset(36% 0 50% 0)', filter: 'brightness(0.35) contrast(1.4) saturate(0.6)', mixBlendMode: 'lighten'}} />}
            {isStatic && (
              <AbsoluteFill style={{backgroundColor: '#111', filter: 'contrast(8) brightness(0.7)'}}>
                <NoiseFill tex={frame % 2 ? 'grain' : 'grain2'} tileSize={L.px(512)} offset={[frame * 37, frame * 53]} opacity={1} blend="normal" />
              </AbsoluteFill>
            )}
            <CamcorderOSD L={L} frame={lf} sec={t - B.rekam + 24} glitch={glitch} rec={!isStatic} />
          </AbsoluteFill>
        ),
        zoom: 1,
        x: 0,
        y: 0,
        grade: false,
        black: 0,
        hideCaption: isStatic,
      };
    }

    /* 5. meja gelap: barang bukti, map ditutup di "Ia hanya ada satu", radio menyala sendiri, push ke speaker saat n7,
          hening 1,5 dtk, JUMPSCARE 9 frame, hitam */
    if (t < B.jumpscare) {
      const lf = frame - F(B.s4End);
      const bag = ctr(g.bag);
      const spk: [number, number] = [g.radio.x + g.radio.w * 0.18, g.radio.y + g.radio.w * 0.28];
      const on = t - B.radioOn;
      const glow = on < 0 ? 0 : on < 0.07 ? 0.9 : on < 0.15 ? 0.15 : on < 0.3 ? 1 : on < 0.36 ? 0.4 : 1;
      const spot = p(B.radioOn + 0.3, 1.2, EASE.inOut);
      const cam = path([
        {t: B.s4End, z: 1.55, x: bag[0], y: bag[1]},
        {t: B.pendakinya, z: 1.5, x: bag[0], y: bag[1]},
        {t: B.satu, z: 1.2, x: W / 2, y: H * 0.5},
        {t: B.radioOn - 0.2, z: 1.1, x: W / 2, y: H * 0.47},
        {t: B.radioOn + 0.4, z: 1.3, x: spk[0], y: spk[1] + L.px(100)},
        {t: B.n7, z: 1.4, x: spk[0], y: spk[1] + L.px(60)},
        {t: B.n7 + 0.9, z: 2.5, x: g.radio.x + g.radio.w * 0.5, y: g.radio.y + g.radio.w * 0.25},
      ]);
      return {
        node: <TiangDeskScene L={L} frame={lf} dark={0.55} evidence={p(B.s4End + 0.15, 0.5, EASE.out)} close={p(B.satu, 1.1, EASE.inOut)} radio radioGlow={glow} />,
        // setelah radio menyala: hanya radio yang terang, sisa meja (teks map) tenggelam gelap; hening jadi frame tergelap sebelum puncak
        overlay: spot > 0 ? <AbsoluteFill style={{opacity: spot, background: 'radial-gradient(ellipse 46% 26% at 48% 47%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.96) 100%)'}} /> : null,
        ...cam,
        black: 1 - p(B.s4End, 0.35, EASE.out),
        warm: 0.6,
        hideCaption: t >= B.hush,
      };
    }

    /* JUMPSCARE: 9 frame wajah (render Blender, lunge + frame drop), lalu hitam sampai kartu kredit */
    if (inJump) {
      const k = frame - jsF;
      const idx = [1, 2, 3, 3, 5, 6, 7, 7, 9][k];
      return {
        node: <TapeGlitchImg src={`3d/tiang/face/f_${String(idx).padStart(4, '0')}.png`} W={W} H={H} frame={frame} amount={k === 0 || k === 6 ? 0.9 : 0.25} seed="js" style={{filter: `brightness(${k === 0 ? 1.7 : 1.45}) contrast(1.2)`, transform: `translateX(${-L.px(30)}px) scale(0.92)`}} />,
        zoom: 1,
        x: 0,
        y: 0,
        grade: false,
        hideCaption: true,
        black: 0,
      };
    }
    return {...none, grade: false, hideCaption: true};
  })();

  const sceneBlack = shot.black ?? 0;
  const creditsOn = t >= B.credits;

  /* ---------- caption ---------- */
  const captionNode = (() => {
    if (!showCaptions || creditsOn || sceneBlack >= 1 || shot.hideCaption || inJump) return null;
    const c = captions.find((x) => t >= x.start && t < x.end + 0.2);
    if (!c) return null;
    const kind = KIND[c.clip] ?? 'narator';
    const radio = kind === 'ht' || kind === 'radio';
    const cam = kind === 'camcorder';
    const label = c.clip.startsWith('n7') ? '[RADIO] ' : radio ? '[HT] ' : '';
    const text = radio ? (label + c.text.toLowerCase()) : c.text;
    const chars = Math.min(text.length, Math.floor(((t - c.start) * fps) / 1.2) + label.length);
    const fade = t > c.end ? 1 - (t - c.end) / 0.2 : 1;
    return (
      <div style={{position: 'absolute', left: L.px(60), right: L.px(120), top: L.px(1290), display: 'flex', justifyContent: 'center', opacity: fade}}>
        <div
          style={{
            maxWidth: L.px(860),
            padding: `${L.px(12)}px ${L.px(22)}px`,
            background: 'rgba(8,6,5,0.74)',
            borderLeft: `${L.px(4)}px solid ${radio ? AK.phosphor : cam ? '#8c8c86' : '#E8A33D'}`,
            fontFamily: radio || cam ? FONT.mono : FONT.type,
            fontSize: L.px(cam ? 32 : 36),
            lineHeight: 1.3,
            letterSpacing: L.px(1),
            color: radio ? AK.phosphor : cam ? '#b9b8b0' : PAL.paper,
            textAlign: 'center',
            textShadow: radio ? '0 0 6px rgba(123,216,143,0.6)' : '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {text.slice(0, chars)}
          {chars < text.length ? '▮' : ''}
        </div>
      </div>
    );
  })();

  /* ---------- audio helper ---------- */
  const Clip: React.FC<{src: string; from: number; dur?: number; vol?: number | ((f: number) => number); loop?: boolean}> = ({src, from, dur, vol = 1, loop}) => (
    <Sequence from={F(from)} durationInFrames={dur ? Math.max(1, F(dur)) : undefined}>
      <Audio src={staticFile(src)} volume={vol} loop={loop} />
    </Sequence>
  );
  const bed = (dur: number, v: number, inS = 0.5, outS = 0.5) => (f: number) =>
    interpolate(f, [0, F(inS), Math.max(F(inS) + 1, F(dur) - F(outS)), F(dur)], [0, v, v, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const db = (d: number) => Math.pow(10, d / 20);
  const htSpans: Array<[number, number]> = [
    [B.bersiaran, B.sirene],
    [B.sirene + 1.2, B.kenal],
  ];

  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      {shot.node && sceneBlack < 1 && (
        <CameraRig frame={frame} zoom={shot.zoom} x={shot.x} y={shot.y} origin={shot.origin} handheld={shot.grade === false ? 0 : hh}>
          {shot.node}
        </CameraRig>
      )}
      {shot.overlay}
      {shot.node && sceneBlack < 1 && shot.grade !== false && <FilmGrade frame={frame} width={width} height={height} grain={grain} vignette={0.72} flicker={0.35} warm={shot.warm ?? 0.5} />}
      {captionNode}
      {sceneBlack > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp01(sceneBlack)}} />}
      {creditsOn && <CreditCard L={L} opacity={p(B.credits, 0.5, EASE.out)} />}

      {/* ===== AUDIO ===== */}
      <Audio src={staticFile('sfx/ripper/tape-click.wav')} volume={0.5} />
      <Clip src="sfx/ripper/tape-hiss.wav" from={0} dur={B.hush} vol={0.04} loop />
      {/* 1. jalan desa */}
      <Clip src="sfx/tiang/pine-wind.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.3, 0.4, 0.3)} loop />
      <Clip src="sfx/tiang/cable-hum.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.16, 0.4, 0.3)} loop />
      <Clip src="sfx/tiang/crickets.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.2, 0.6, 0.3)} loop />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.tambah} vol={0.22} />
      <Clip src="sfx/wajah/flicker.wav" from={B.jangan} vol={0.16} />
      {/* 2. arsip */}
      <Clip src="sfx/tiang/archive-room.wav" from={B.s1End} dur={B.s2End - B.s1End} vol={bed(B.s2End - B.s1End, 0.22, 0.3, 0.3)} loop />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.open} vol={0.55} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.tiang2} vol={0.4} />
      <Clip src="sfx/tiang/clip.wav" from={B.daging + 0.4} vol={0.5} />
      <Clip src="sfx/angka/pencil.wav" from={B.tanpa + 0.05} vol={0.45} />
      <Clip src="sfx/wajah/stamp.wav" from={B.stamp + 0.16} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.stamp + 0.16} vol={0.25} />
      <Clip src="sfx/angka/tune.wav" from={B.s2End - 0.5} vol={0.5} />
      {/* 3. relay + HT */}
      <Clip src="sfx/tiang/hill-wind.wav" from={B.s2End} dur={B.s3End - B.s2End} vol={(f) => {
        const tt = B.s2End + f / fps;
        const inside = htSpans.some(([a, b]) => tt >= a && tt < b);
        return interpolate(f, [0, F(0.4)], [0, 1], {extrapolateRight: 'clamp'}) * (inside ? 0.12 : 0.35);
      }} loop />
      {htSpans.map(([a, b]) => (
        <Clip key={a} src="sfx/tiang/ht-static.wav" from={a} dur={b - a} vol={(f) => interpolate(f, [0, F(b - a) - 6, F(b - a)], [0.1, 0.16, 0.05], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      ))}
      <Clip src="sfx/tiang/squelch.wav" from={B.bersiaran} vol={0.5} />
      <Clip src="sfx/tiang/siren.wav" from={B.sirene} vol={0.42} />
      <Clip src="sfx/tiang/ht-static.wav" from={B.s3End - 0.6} dur={0.6} vol={(f) => interpolate(f, [0, F(0.6)], [0.05, 0.6], {extrapolateRight: 'clamp'})} />
      {/* 4. pendaki + camcorder */}
      <Clip src="sfx/tiang/pine-wind.wav" from={B.s3End} dur={B.fall - B.s3End} vol={bed(B.fall - B.s3End, 0.22, 0.05, 0.05)} loop />
      <Clip src="sfx/tiang/crickets.wav" from={B.s3End} dur={B.turn - B.s3End} vol={0.1} loop />
      <Clip src="sfx/tiang/steps.wav" from={B.s3End} dur={B.turn - B.s3End} vol={0.32} loop />
      <Clip src="sfx/tiang/breath.wav" from={B.rekam + 0.6} vol={0.25} />
      <Clip src="sfx/tiang/breath.wav" from={B.c21 + 1.2} vol={0.28} />
      <Clip src="sfx/ripper/tape-click.wav" from={B.rekam} vol={0.4} />
      <Clip src="sfx/tiang/glitch.wav" from={B.turn} vol={0.35} />
      <Clip src="sfx/tiang/glitch.wav" from={B.firasat} vol={0.5} />
      <Clip src="sfx/tiang/glitch.wav" from={B.back} vol={0.3} />
      <Clip src="sfx/tiang/cable-hum.wav" from={B.again} dur={B.fall + 0.5 - B.again} vol={(f) => interpolate(f, [0, F(B.fall + 0.5 - B.again)], [0.05, 0.5], {extrapolateRight: 'clamp'})} />
      <Clip src="sfx/tiang/fall.wav" from={B.fall + 0.17} vol={0.85} />
      <Sequence from={F(B.fall) + 10} durationInFrames={Math.max(1, F(B.s4End - 0.5) - F(B.fall) - 10)}>
        <Audio src={staticFile('sfx/ripper/static-burst.wav')} volume={0.32} loop />
      </Sequence>
      <Clip src="sfx/ripper/tape-stop.wav" from={B.s4End - 0.5} vol={0.7} />
      {/* 5. meja gelap + radio */}
      <Clip src="sfx/tiang/archive-room.wav" from={B.s4End} dur={B.radioOn - B.s4End} vol={bed(B.radioOn - B.s4End, 0.16, 0.4, 0.2)} loop />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s4End + 0.15} vol={0.35} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.satu} vol={0.45} />
      <Clip src="sfx/angka/radio-on.wav" from={B.radioOn} vol={0.6} />
      <Clip src="sfx/angka/sw-static.wav" from={B.radioOn + 0.1} dur={B.hush - B.radioOn - 0.1} vol={(f) => interpolate(f, [0, F(B.hush - B.radioOn - 0.1) - 3, F(B.hush - B.radioOn - 0.1)], [0.06, 0.2, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s4End} dur={B.hush - B.s4End} vol={(f) => interpolate(f, [0, F(B.hush - B.s4End) - 4, F(B.hush - B.s4End)], [0.05, 0.3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} loop />
      {/* transisi: riser + thud di batas adegan */}
      {[B.s1End, B.s2End, B.s3End].map((b) => (
        <React.Fragment key={b}>
          <Clip src="sfx/wajah/riser.wav" from={b - 0.75} vol={0.5} />
          <Clip src="sfx/ripper/sub-hit.wav" from={b} vol={0.3} />
        </React.Fragment>
      ))}
      {/* VO + mumble (timeline vo.json; gain dB relatif level mix/) */}
      {voCfg.timeline.map((c) => (
        <Clip key={`${c.file}-${c.at}`} src={`vo/tiang/mix/${c.file}.wav`} from={c.at} dur={'dur' in c ? (c as {dur: number}).dur : undefined} vol={db(('gain' in c ? (c as {gain: number}).gain : 0)) * (c.file.startsWith('m') ? mumbleGain : 1)} />
      ))}
      {/* JUMPSCARE: satu lonjakan, lalu hening; desis pita kembali pelan di kartu kredit */}
      <Clip src="sfx/tiang/stinger.wav" from={B.jumpscare} vol={1} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.jumpscare} vol={0.8} />
      <Clip src="sfx/ripper/tape-hiss.wav" from={B.credits} dur={92.25 - B.credits} vol={bed(92.25 - B.credits, 0.05, 1.0, 1.0)} loop />
      <Clip src="sfx/tiang/cable-hum.wav" from={B.credits} dur={92.25 - B.credits} vol={bed(92.25 - B.credits, 0.04, 1.0, 1.0)} loop />
    </AbsoluteFill>
  );
};

export const TIANG_BEATS = B;
