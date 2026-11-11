/**
 * NomorMerah — "Nomor Merah": rumor "SMS santet / telepon nomor merah", Mei 2008. Short ±88 dtk, portrait.
 * Nada skeptis, akhir terbuka: dua pertanyaan tidak dijawab, ponsel bergetar, layar "ANGKAT?", lalu hitam.
 * Set 2.5D: src/lib/scenes/merah.tsx. 3D PSX Blender: public/3d/merah/ (scripts/blender/merah/, timing dari cues yang sama).
 * Brief + storyboard: briefs/NomorMerah*.md.
 *
 * Satu sumber timing: posisi klip dari briefs/NomorMerah.vo.json, frasa dari merah-captions.json, kata dari merah-words.json.
 * Rumus objek B sama dengan scripts/blender/merah/merah_beats.py (frame 1 render = awal adegan).
 * Aturan topik: tanpa nama orang biasa, tanpa nama operator, tanpa wajah, tanpa sirene, tanpa jumpscare.
 * Denyut merah ≤ 0,45 Hz; merah jenuh tidak pernah memenuhi layar.
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {EASE, ensureFonts, progress, sec, useLayout} from '../lib/studio';
import {CameraRig, FONT, FilmGrade, NoiseFill, PAL} from '../lib/scenes';
import {clamp01} from '../lib/scenes/sets';
import {ClipScene, DateTape, FormScene, MapScene, MerahTitle, NoteOverlay, Slip, SourceCard, WorldScene} from '../lib/scenes/merah';
import captions from './merah-captions.json';
import vowords from './merah-words.json';
import voCfg from '../../briefs/NomorMerah.vo.json';

ensureFonts();

export const nomorMerahSchema = z.object({
  grain: z.number().min(0).max(1),
  handheld: z.number().min(0).max(1),
  captions: z.boolean(),
  showTitle: z.boolean(),
  pesanGain: z.number().min(0).max(2),
  bisikGain: z.number().min(0).max(2),
  sourceLines: z.array(z.string()),
  durationInSeconds: z.number().min(60).max(120),
});
export type NomorMerahProps = z.infer<typeof nomorMerahSchema>;
export const nomorMerahDefaults: NomorMerahProps = {
  grain: 0.5,
  handheld: 0.6,
  captions: true,
  showTitle: true,
  pesanGain: 1,
  bisikGain: 1,
  sourceLines: ['Kompas, detikcom, Antara,', 'Ditjen Postel (Mei 2008)', 'J. Bonhomme, Tracés 21 (2011)'],
  durationInSeconds: voCfg.end,
};

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
const between = (a: string, b: string) => (cap(a).end + cap(b).start) / 2;

const B = (() => {
  const sms = cap('SMS berantai').start;
  const jawa = word('02-sebar', 'jawa');
  return {
    nomor: word('01-hook', 'nomor'),
    merah1: word('01-hook', 'merah'),
    jangan: cap('jangan diangkat').start,
    s1End: between('jangan diangkat', 'Mei dua ribu'),
    mei: cap('Mei dua ribu').start,
    sms,
    riau: word('02-sebar', 'riau'),
    jawa,
    // titik kota menyala berurutan (urutan tanggal berita): Riau 7–8 Mei, Sumbar + Bengkulu 8 Mei, Jambi/Bangka/Jakarta 9 Mei, Banyuwangi 13 Mei
    cities: [sms + 0.15, sms + 0.6, sms + 1.05, sms + 1.75, sms + 2.35, sms + 3.05, sms + 3.55, jawa - 0.6, jawa],
    s2End: between('SMS berantai', 'Konon'),
    konon: cap('Konon').start,
    dukun: word('03-konon', 'dukun'),
    katanya: cap('Katanya').start,
    tewas: word('03-konon', 'tewas'),
    s3End: between('Katanya', 'Polisi'),
    bohong: word('04-resmi', 'kabar'),
    tak: cap('Tak satu pun').start,
    terbukti: word('04-resmi', 'terbukti'),
    s4End: between('Tak satu pun', 'Sepekan'),
    diamankan: word('05-iseng', 'diamankan'),
    motif: cap('Motifnya').start,
    iseng: word('05-iseng', 'iseng'),
    namanya: cap('Namanya').start,
    pernah: word('05-iseng', 'pernah'),
    s5End: between('Namanya', 'Tapi beberapa'),
    mengaku: word('06-sakit', 'mengaku'),
    jakarta: cap('Di Jakarta').start,
    memerah: word('06-sakit', 'memerah'),
    kejang: word('06-sakit', 'kejang'),
    sugesti: word('06-sakit', 'sugesti'),
    s6End: between('Pejabat', 'Dan pesan'),
    nigeria: cap('Dua ribu empat').start,
    nigeriaW: word('07-dunia', 'nigeria'),
    pakistan: cap('Dua ribu tujuh').start,
    pakistanW: word('07-dunia', 'pakistan'),
    merah7: cap('nomornya sudah').start,
    merah7W: word('07-dunia', 'merah'),
    s7End: between('nomornya sudah', 'Kalau pengirimnya'),
    benua: cap('di benua lain').start,
    benuaEnd: cap('di benua lain').end,
    malam: cap('Malam ini').start,
    ring: voCfg.ring,
    black: voCfg.black,
    sumber: voCfg.sumber,
    end: voCfg.end,
  };
})();

const NUM_LEN = 13; // "0866-XXX-XXXX" (lihat scripts/blender/merah/make_assets.py red_count)
const DAYS = ['7', '8', '9', '13'];

export const NomorMerah: React.FC<NomorMerahProps> = ({grain, handheld, captions: showCaptions, showTitle, pesanGain, bisikGain, sourceLines}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = useLayout();
  const W = L.width;
  const H = L.height;
  const px = L.px;
  const t = frame / fps;
  const F = (s: number) => sec(s, fps);
  const p = (from: number, dur: number, ease = EASE.inOut) => progress(frame, F(from), Math.max(1, F(dur)), ease);
  const lin = (v: number) => v;
  const hh = px(2.4) * handheld;

  /** Kamera: fokus ke titik (x, y) "px 1080" dengan zoom z; `free` = tanpa pembatas tepi (set lebih lebar dari frame). */
  const focus = (zm: number, fx: number, fy: number, free = false) => {
    const cx = free ? px(fx) : Math.min(W - W / (2 * zm), Math.max(W / (2 * zm), px(fx)));
    const cy = free ? px(fy) : Math.min(H - H / (2 * zm), Math.max(H / (2 * zm), px(fy)));
    return {zoom: zm, x: -zm * (cx - W / 2), y: -zm * (cy - H / 2), origin: '50% 50%'};
  };
  const path = (pts: Array<{t: number; z: number; x: number; y: number}>, free = false) => {
    const ts = pts.map((q) => q.t);
    const o = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: EASE.inOut};
    return focus(interpolate(t, ts, pts.map((q) => q.z), o), interpolate(t, ts, pts.map((q) => q.x), o), interpolate(t, ts, pts.map((q) => q.y), o), free);
  };
  const video = (src: string, from: number) => (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Sequence from={F(from)} layout="none">
        <OffthreadVideo src={staticFile(src)} muted style={{width: W, height: H, imageRendering: 'pixelated'}} />
      </Sequence>
    </AbsoluteFill>
  );

  type Shot = {node: React.ReactNode; zoom: number; x: number; y: number; origin?: string; black?: number; warm?: number; grade?: boolean; hideCaption?: boolean; overlay?: React.ReactNode; hand?: number};
  const still = {zoom: 1, x: 0, y: 0};

  const shot = ((): Shot => {
    /* 1. ponsel di meja (Blender): judul di frame pertama (thumbnail), digit nomor memerah satu per satu, ponsel bergetar */
    if (t < B.s1End) {
      const titleK = showTitle ? 1 - p(2.3, 0.45, EASE.in) : 0;
      const hiss = 1 - p(0, 0.6, lin);
      return {
        node: video('3d/merah/meja.mp4', 0),
        overlay: (
          <>
            {hiss > 0 && (
              <AbsoluteFill style={{opacity: hiss * 0.22, mixBlendMode: 'screen'}}>
                <NoiseFill tex={frame % 2 ? 'grain' : 'grain2'} tileSize={px(512)} offset={[frame * 37, frame * 53]} opacity={1} blend="normal" style={{filter: 'contrast(3)'}} />
              </AbsoluteFill>
            )}
            {titleK > 0 && <MerahTitle L={L} frame={frame} opacity={Math.min(1, titleK * 2)} glitch={t < 0.5 ? 0.5 : 1 - titleK} />}
          </>
        ),
        ...still,
        hand: 0.4,
        warm: 0.4,
        black: p(B.s1End - 0.2, 0.2, lin),
      };
    }

    /* 2. peta Sumatera–Jawa: titik menyala berurutan, amplop SMS melompat, label tanggal 7 → 13 Mei */
    if (t < B.s2End) {
      const ct = B.cities;
      let hop = -1;
      if (t >= ct[0]) hop = 0;
      for (let i = 1; i < ct.length; i++) if (t >= ct[i] - 0.35) hop = i - 1 + clamp01((t - (ct[i] - 0.35)) / 0.35);
      const dayIdx = t >= ct[8] ? 3 : t >= ct[5] ? 2 : t >= ct[3] ? 1 : 0;
      const flipAt = [0, ct[3], ct[5], ct[8]][dayIdx];
      const cam = path([
        {t: B.s1End, z: 1.0, x: 540, y: 800},
        {t: B.sms - 0.4, z: 1.04, x: 540, y: 800},
        {t: B.sms + 0.7, z: 1.7, x: 350, y: 705},
        {t: ct[3], z: 1.7, x: 345, y: 725},
        {t: ct[4] + 0.3, z: 1.5, x: 400, y: 830},
        {t: ct[6], z: 1.45, x: 470, y: 850},
        {t: B.jawa - 0.1, z: 1.18, x: 570, y: 860},
        {t: B.s2End, z: 1.21, x: 572, y: 862},
      ]);
      return {
        node: <MapScene L={L} frame={frame - F(B.s1End)} cities={ct.map((c) => p(c, 0.35, EASE.out))} hop={hop} slide={p(B.s1End, 0.6, EASE.out)} />,
        overlay: <DateTape L={L} day={DAYS[dayIdx]} k={p(B.mei + 0.1, 0.8, lin)} flip={dayIdx === 0 ? 1 : p(flipAt, 0.25, lin)} />,
        ...cam,
        warm: 0.5,
        black: 1 - p(B.s1End, 0.25, EASE.out),
      };
    }

    /* 3a. lorong warnet (Blender) + label KONON */
    if (t < B.katanya) {
      return {
        node: video('3d/merah/warnet.mp4', B.s2End),
        overlay: <Slip L={L} text="KONON" x={px(96)} y={px(420)} w={px(340)} rot={-4} k={p(B.konon + 0.1, 0.2, EASE.in)} />,
        ...still,
        hand: 0.3,
        warm: 0.2,
      };
    }

    /* 3b. kotak masuk "Fwd: Fwd: Fwd:" di meja warnet (Blender) + label KATANYA */
    if (t < B.s3End) {
      return {
        node: video('3d/merah/inbox.mp4', B.katanya),
        overlay: <Slip L={L} text="KATANYA:" x={px(96)} y={px(412)} w={px(430)} rot={-4} k={p(B.katanya + 0.1, 0.2, EASE.in)} />,
        ...still,
        hand: 0.4,
        warm: 0.25,
      };
    }

    /* 4. kliping jatuh ke meja: isu dicap HOAKS, jawaban polisi, tidak ada kematian yang terbukti */
    if (t < B.s4End) {
      const cam = path([
        {t: B.s3End, z: 1.04, x: 540, y: 790},
        {t: B.bohong - 0.4, z: 1.1, x: 535, y: 770},
        {t: B.bohong + 0.3, z: 1.22, x: 530, y: 720},
        {t: B.tak - 0.35, z: 1.22, x: 525, y: 725},
        {t: B.tak + 0.5, z: 1.2, x: 515, y: 985},
        {t: B.s4End, z: 1.28, x: 512, y: 1005},
      ]);
      return {
        node: <ClipScene L={L} frame={frame - F(B.s3End)} dropA={p(B.s3End - 0.05, 0.35, EASE.out)} dropB={p(B.s3End + 0.22, 0.4, EASE.out)} hoax={p(B.bohong, 0.16, EASE.in)} dropC={p(B.tak - 0.2, 0.4, EASE.out)} under={p(B.terbukti, 0.5, EASE.inOut)} />,
        ...cam,
        warm: 0.55,
        black: p(B.s4End - 0.18, 0.18, lin),
      };
    }

    /* 5a. ruang periksa, kursi kosong dari belakang (Blender) */
    if (t < B.diamankan) return {node: video('3d/merah/kursi.mp4', B.s4End), ...still, hand: 0.3, warm: 0.35, black: 1 - p(B.s4End, 0.3, EASE.out)};

    /* 5b. berkas "pengirim awal": status diketik, cap ISENG, nama ditutup balok hitam */
    if (t < B.s5End) {
      const cam = path([
        {t: B.diamankan, z: 1.0, x: 540, y: 800},
        {t: B.diamankan + 0.6, z: 1.25, x: 530, y: 690},
        {t: B.motif - 0.45, z: 1.27, x: 530, y: 715},
        {t: B.motif + 0.35, z: 1.4, x: 505, y: 895},
        {t: B.namanya - 0.3, z: 1.41, x: 505, y: 915},
        {t: B.namanya + 0.5, z: 1.45, x: 510, y: 1035},
        {t: B.s5End, z: 1.5, x: 510, y: 1048},
      ]);
      return {
        node: <FormScene L={L} frame={frame - F(B.diamankan)} slide={p(B.diamankan - 0.05, 0.35, EASE.out)} status={p(B.diamankan + 0.15, 1.5, lin)} jumlah={p(B.motif - 1.0, 0.6, lin)} iseng={p(B.iseng, 0.16, EASE.in)} bar={p(B.namanya + 0.12, 0.45, EASE.inOut)} note={p(B.pernah, 0.9, lin)} />,
        ...cam,
        warm: 0.55,
        black: p(B.s5End - 0.2, 0.2, lin),
      };
    }

    /* 6. ponsel di lantai, layar memerah, tangan kaku (Blender) + catatan pengakuan + cap SUGESTI? */
    if (t < B.s6End) {
      const items = p(B.mengaku, 0.3, lin) + p(B.mengaku + 0.5, 0.3, lin) + p(B.mengaku + 0.95, 0.3, lin);
      return {
        node: video('3d/merah/lantai.mp4', B.s5End),
        overlay: <NoteOverlay L={L} note={p(B.s5End + 0.25, 0.5, EASE.out)} items={items} clip={p(B.jakarta, 0.5, EASE.out)} stamp={p(B.sugesti, 0.18, EASE.in)} />,
        ...still,
        hand: 0.35,
        warm: 0.25,
        black: 1 - p(B.s5End, 0.3, EASE.out),
      };
    }

    /* 7. peta dunia: pin 2004 Nigeria → 2006 India → 2007 Pakistan → 2008 Indonesia, benang merah, foto layar "RED" */
    if (t < B.s7End) {
      const india = B.pakistan - 0.35;
      const indo = B.merah7W;
      const cam = path(
        [
          {t: B.s6End, z: 0.67, x: 560, y: 790},
          {t: B.nigeria - 0.25, z: 0.72, x: 560, y: 800},
          {t: B.nigeriaW - 0.3, z: 1.3, x: 170, y: 890},
          {t: india - 0.2, z: 1.3, x: 300, y: 870},
          {t: B.pakistanW - 0.2, z: 1.25, x: 690, y: 800},
          {t: B.merah7 - 0.15, z: 1.25, x: 705, y: 790},
          {t: B.merah7 + 0.55, z: 1.42, x: 770, y: 490},
          {t: indo - 0.6, z: 1.43, x: 770, y: 497},
          {t: indo + 0.05, z: 1.15, x: 900, y: 930},
          {t: B.s7End, z: 1.19, x: 908, y: 940},
        ],
        true,
      );
      const str = p(B.nigeriaW + 0.2, india - B.nigeriaW - 0.2, EASE.inOut) + p(india + 0.1, B.pakistanW - india - 0.1, EASE.inOut) + p(indo - 0.55, 0.5, EASE.inOut);
      return {
        node: <WorldScene L={L} frame={frame - F(B.s6End)} pins={[p(B.nigeriaW, 0.4, EASE.out), p(india, 0.4, EASE.out), p(B.pakistanW, 0.4, EASE.out), p(indo, 0.4, EASE.out)]} string={str} inset={p(B.merah7, 0.5, EASE.out)} />,
        ...cam,
        warm: 0.5,
        black: p(B.s7End - 0.25, 0.25, lin),
      };
    }

    /* 8–9. meja yang sama, lebih gelap (Blender): nomor merah menyala → bergetar → "ANGKAT? [YA] [TIDAK]" → hitam */
    if (t < B.black) return {node: video('3d/merah/tutup.mp4', B.s7End), ...still, hand: t >= B.ring ? 0 : 0.4, warm: 0.3, black: 1 - p(B.s7End, 0.4, EASE.out)};

    return {node: null, ...still, black: 1, grade: false, hideCaption: true};
  })();

  const sceneBlack = shot.black ?? 0;
  const sumberOn = t >= B.sumber;

  /* ---------- caption (strip mesin tik, y 1265–1480) ---------- */
  const captionNode = (() => {
    if (!showCaptions || sceneBlack >= 1 || shot.hideCaption) return null;
    const c = captions.find((x) => t >= x.start && t < x.end + 0.2);
    if (!c) return null;
    const chars = Math.min(c.text.length, Math.floor(((t - c.start) * fps) / 1.1) + 1);
    const fade = t > c.end ? 1 - (t - c.end) / 0.2 : 1;
    return (
      <div style={{position: 'absolute', left: px(60), right: px(120), top: px(1290), display: 'flex', justifyContent: 'center', opacity: fade}}>
        <div
          style={{
            maxWidth: px(860),
            padding: `${px(12)}px ${px(22)}px`,
            background: 'rgba(8,6,5,0.78)',
            borderLeft: `${px(4)}px solid #c81e14`,
            fontFamily: FONT.type,
            fontSize: px(36),
            lineHeight: 1.3,
            letterSpacing: px(1),
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
  })();

  /* ---------- audio helper ---------- */
  const Clip: React.FC<{src: string; from: number; dur?: number; vol?: number | ((f: number) => number); loop?: boolean}> = ({src, from, dur, vol = 1, loop}) => (
    <Sequence from={F(from)} durationInFrames={dur ? Math.max(1, F(dur)) : undefined}>
      <Audio src={staticFile(src)} volume={vol} loop={loop} />
    </Sequence>
  );
  const bed = (dur: number, v: number, inS = 0.5, outS = 0.5) => (f: number) => {
    const a = Math.max(1, F(inS));
    const b = Math.max(a + 1, F(dur) - F(outS));
    return interpolate(f, [0, a, b, Math.max(b + 1, F(dur))], [0, v, v, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };
  const rise = (dur: number, a: number, b: number, outS = 0.1) => (f: number) => {
    const m = Math.max(1, F(dur) - F(outS));
    return interpolate(f, [0, m, Math.max(m + 1, F(dur))], [a, b, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  };
  const ticks = Array.from({length: NUM_LEN}, (_, i) => B.nomor + (i / NUM_LEN) * (B.merah1 - B.nomor));
  const india = B.pakistan - 0.35;
  const pulses = Array.from({length: Math.max(0, Math.floor((B.s6End - B.memerah - 0.6) / 1.35))}, (_, i) => B.memerah + 0.5 + i * 1.35);
  const typing = (from: number, n: number, step = 0.11) => Array.from({length: n}, (_, i) => from + i * step);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      {shot.node && sceneBlack < 1 && (
        <CameraRig frame={frame} zoom={shot.zoom} x={shot.x} y={shot.y} origin={shot.origin} handheld={hh * (shot.hand ?? 1)}>
          {shot.node}
        </CameraRig>
      )}
      {sceneBlack < 1 && shot.overlay}
      {shot.node && sceneBlack < 1 && shot.grade !== false && <FilmGrade frame={frame} width={width} height={height} grain={grain} vignette={0.7} flicker={0.3} warm={shot.warm ?? 0.5} />}
      {captionNode}
      {sceneBlack > 0 && <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp01(sceneBlack)}} />}
      {sumberOn && <SourceCard L={L} opacity={p(B.sumber, 0.4, EASE.out)} lines={['SUMBER', ...sourceLines]} />}

      {/* ===== AUDIO (tanpa sirene; nada dering, getar, warnet = sintesis sendiri, scripts/sfx/merah_sfx.sh) ===== */}
      <Clip src="sfx/ripper/tape-hiss.wav" from={0} dur={B.black} vol={0.035} loop />
      {/* 1. meja: desis judul, dering pelan, getar di kayu, tik tiap digit memerah, bisikan sekali di jeda */}
      <Clip src="sfx/ripper/static-burst.wav" from={0} dur={0.6} vol={rise(0.6, 0.32, 0.04, 0.2)} />
      <Clip src="sfx/ripper/amb/room.wav" from={0} dur={B.s1End} vol={bed(B.s1End, 0.2, 0.3, 0.3)} />
      <Clip src="sfx/merah/ring.wav" from={0.25} dur={B.s1End - 0.45} vol={bed(B.s1End - 0.45, 0.11, 0.05, 0.6)} loop />
      <Clip src="sfx/merah/vibrate.wav" from={0.25} vol={0.28} />
      <Clip src="sfx/merah/vibrate.wav" from={0.25 + 3 * 1.12} dur={B.s1End - 0.25 - 3 * 1.12} vol={bed(B.s1End - 0.25 - 3 * 1.12, 0.28, 0.01, 0.15)} />
      {ticks.map((x, i) => (
        <Clip key={`tk${i}`} src="sfx/merah/tick.wav" from={x} vol={0.32} />
      ))}
      <Clip src="sfx/ripper/sub-hit.wav" from={B.merah1} vol={0.3} />
      <Clip src="vo/merah/mix/w1a.wav" from={cap('Kalau nomor').end - 0.25} vol={1.6 * bisikGain} />
      {/* 2. peta: kertas digeser, bip pesan tiap titik */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s1End} dur={B.s2End - B.s1End} vol={bed(B.s2End - B.s1End, 0.22, 0.3, 0.2)} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s1End} vol={0.6} />
      {typing(B.mei + 0.1, 6, 0.13).map((x, i) => (
        <Clip key={`ty${i}`} src="sfx/angka/key.wav" from={x} vol={0.3} />
      ))}
      {B.cities.map((x, i) => (
        <Clip key={`ct${i}`} src="sfx/merah/sms.wav" from={x} vol={i < 3 ? 0.3 : 0.24} />
      ))}
      <Clip src="sfx/ripper/sub-hit.wav" from={B.jawa} vol={0.28} />
      {/* suara pesan (speaker ponsel kecil), per kalimat, di bawah klip 02–03 */}
      <Clip src="vo/merah/mix/s1a.wav" from={B.sms - 0.85} vol={pesanGain} />
      <Clip src="vo/merah/mix/s1b.wav" from={B.riau} vol={pesanGain} />
      <Clip src="vo/merah/mix/s1c.wav" from={B.s2End + 1.3} vol={pesanGain} />
      <Clip src="vo/merah/mix/s1d.wav" from={B.katanya - 0.55} vol={pesanGain} />
      {/* 3. warnet: dengung CRT + kipas; kotak masuk: bip beruntun */}
      <Clip src="sfx/merah/warnet.wav" from={B.s2End} dur={B.s3End - B.s2End} vol={(f) => bed(B.s3End - B.s2End, 0.5, 0.25, 0.15)(f) * (B.s2End + f / fps >= B.katanya ? 0.55 : 1)} />
      <Clip src="sfx/wajah/stamp.wav" from={B.konon + 0.28} vol={0.7} />
      {[0, 0.2, 0.4, 0.6, 0.8].map((d) => (
        <Clip key={`in${d}`} src="sfx/merah/sms.wav" from={B.katanya + d} vol={0.3} />
      ))}
      <Clip src="sfx/wajah/stamp.wav" from={B.katanya + 0.28} vol={0.7} />
      <Clip src="sfx/angka/key.wav" from={B.katanya + 1.1} vol={0.45} />
      {/* 4. kliping */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s3End} dur={B.s4End - B.s3End} vol={bed(B.s4End - B.s3End, 0.22, 0.2, 0.2)} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s3End - 0.05} vol={0.55} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s3End + 0.22} vol={0.6} />
      <Clip src="sfx/wajah/stamp.wav" from={B.bohong + 0.14} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.bohong + 0.14} vol={0.25} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.tak - 0.2} vol={0.6} />
      <Clip src="sfx/angka/pencil.wav" from={B.terbukti} vol={0.5} />
      {/* 5. ruang periksa + berkas */}
      <Clip src="sfx/merah/neon.wav" from={B.s4End} dur={B.diamankan - B.s4End} vol={bed(B.diamankan - B.s4End, 0.4, 0.3, 0.1)} />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s4End} dur={B.s5End - B.s4End} vol={bed(B.s5End - B.s4End, 0.12, 0.6, 0.4)} />
      <Clip src="sfx/ripper/amb/room.wav" from={B.diamankan} dur={B.s5End - B.diamankan} vol={bed(B.s5End - B.diamankan, 0.2, 0.1, 0.2)} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.diamankan - 0.05} vol={0.6} />
      {typing(B.diamankan + 0.15, 13, 0.115).map((x, i) => (
        <Clip key={`st${i}`} src="sfx/angka/key.wav" from={x} vol={0.3} />
      ))}
      {typing(B.motif - 1.0, 5, 0.12).map((x, i) => (
        <Clip key={`jm${i}`} src="sfx/angka/key.wav" from={x} vol={0.26} />
      ))}
      <Clip src="sfx/wajah/stamp.wav" from={B.iseng + 0.14} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.iseng + 0.14} vol={0.25} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.namanya + 0.12} vol={0.5} />
      <Clip src="sfx/angka/pencil.wav" from={B.pernah} vol={0.45} />
      {/* 6. lantai: ruang sunyi, getar sekali saat layar memerah, denyut pelan, cap SUGESTI? */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s5End} dur={B.s6End - B.s5End} vol={bed(B.s6End - B.s5End, 0.2, 0.3, 0.2)} />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.jakarta} dur={B.s6End - B.jakarta} vol={rise(B.s6End - B.jakarta, 0.04, 0.26, 0.3)} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s5End + 0.25} vol={0.5} />
      {typing(B.mengaku, 3, 0.48).map((x, i) => (
        <Clip key={`mg${i}`} src="sfx/angka/key.wav" from={x} vol={0.34} />
      ))}
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.jakarta} vol={0.5} />
      <Clip src="sfx/merah/vibrate-one.wav" from={B.memerah} vol={0.34} />
      {pulses.map((x, i) => (
        <Clip key={`pl${i}`} src="sfx/merah/pulse.wav" from={x} vol={0.5} />
      ))}
      <Clip src="sfx/wajah/stamp.wav" from={B.sugesti + 0.16} vol={0.9} />
      <Clip src="sfx/ripper/sub-hit.wav" from={B.sugesti + 0.16} vol={0.25} />
      {/* 7. peta dunia: pin menancap, benang ditarik, foto layar "RED" */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s6End} dur={B.s7End - B.s6End} vol={bed(B.s7End - B.s6End, 0.22, 0.2, 0.3)} />
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.s6End} vol={0.45} />
      {[B.nigeriaW, india, B.pakistanW, B.merah7W].map((x, i) => (
        <React.Fragment key={`pin${i}`}>
          <Clip src="sfx/tiang/clip.wav" from={x + 0.25} vol={0.6} />
          <Clip src="sfx/ripper/sub-hit.wav" from={x + 0.25} vol={0.16} />
        </React.Fragment>
      ))}
      <Clip src="sfx/ripper/amb/paper-slide.wav" from={B.merah7} vol={0.5} />
      <Clip src="sfx/merah/sms.wav" from={B.merah7 + 0.5} vol={0.26} />
      {/* 8–9. penutup: drone naik pelan, bisikan sekali, ponsel bergetar (TANPA nada dering), potong ke hitam */}
      <Clip src="sfx/ripper/amb/room.wav" from={B.s7End} dur={B.black - B.s7End} vol={rise(B.black - B.s7End, 0.2, 0.2, 0.02)} />
      <Clip src="sfx/ripper/amb/drone.wav" from={B.s7End} dur={B.black - B.s7End} vol={rise(B.black - B.s7End, 0.05, 0.36, 0.02)} />
      <Clip src="vo/merah/mix/w1b.wav" from={B.benuaEnd + 0.1} vol={1.6 * bisikGain} />
      <Clip src="sfx/merah/vibrate.wav" from={B.ring} dur={B.black - B.ring} vol={0.6} />
      <Clip src="sfx/merah/tick.wav" from={B.ring} vol={0.4} />
      <Clip src="sfx/merah/off.wav" from={B.black} vol={0.5} />
      {/* transisi: riser + thud di batas adegan */}
      {[B.s1End, B.s4End, B.s5End, B.s7End].map((b) => (
        <React.Fragment key={b}>
          <Clip src="sfx/wajah/riser.wav" from={b - 0.75} vol={0.42} />
          <Clip src="sfx/ripper/sub-hit.wav" from={b} vol={0.3} />
        </React.Fragment>
      ))}
      {[B.s2End, B.s3End, B.diamankan, B.s6End].map((b) => (
        <Clip key={b} src="sfx/ripper/sub-hit.wav" from={b} vol={0.24} />
      ))}
      {/* VO narator (timeline vo.json) */}
      {voCfg.timeline.map((c) => (
        <Clip key={c.file} src={`vo/merah/mix/${c.file}.wav`} from={c.at} />
      ))}
    </AbsoluteFill>
  );
};

export const MERAH_BEATS = B;
