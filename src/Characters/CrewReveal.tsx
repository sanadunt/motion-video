/**
 * CrewReveal — menghidupkan ilustrasi grup dari cutout manual per karakter.
 *
 * Lapisan (semua dalam koordinat gambar asli 1414x2000, lihat public/crew/layers.json,
 * dibuat oleh scripts/layers/crew_layers.py):
 *   char-7 .. char-2  karakter di belakang; bagian yang tertutup karakter depan ditambal 40 px
 *   front.png         karakter 1 (gadis jaket biru) tanpa dua helai rambut bawah
 *   hair-left/right   helai rambut bawah yang bergoyang
 *   eyes-mask.png     area mata tanpa poni: kelopak kedip hanya digambar di sini
 *   blink-char-N.png  area kelopak karakter 2, 3, 4, 5, 7
 *   tv-j/tv-a.png     huruf di layar TV karakter 6 (memipih saat "berkedip")
 *
 * Fase:
 *   in   (IN_FRAMES)   gadis depan pop-in, lalu karakter 2..7 bergantian keluar dari belakang
 *                      karakter yang sudah ada (skala dari titik kontak, lihat "anchor")
 *   idle (IDLE_FRAMES) semua gerak periodik: napas, goyang per karakter, rambut, kedip, kamera -> loop mulus
 *   out  (OUT_FRAMES)  kebalikan "in" (7 hilang dulu, gadis depan terakhir)
 *   full               in + idle + out (untuk render MP4)
 *
 * Idle dirancang agar frame 0 == frame terakhir+1 (semua gerak bernilai 0 di awal & periodik),
 * dan keadaan akhir "in" == keadaan dasar idle, jadi Player di web bisa:
 * mainkan "in" sekali -> loop "idle" -> mainkan "out" saat keluar.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import layout from "../../public/crew/layers.json";

export const CREW_IN_FRAMES = 60;
export const CREW_IDLE_FRAMES = 180;
export const CREW_OUT_FRAMES = 45;
export const CREW_FULL_FRAMES =
  CREW_IN_FRAMES + CREW_IDLE_FRAMES + CREW_OUT_FRAMES;

export type CrewPhase = "in" | "idle" | "out" | "full";

export type CrewRevealProps = {
  phase: CrewPhase;
  /** Warna latar atas & bawah */
  bgTop: string;
  bgBottom: string;
  /** Warna cahaya di belakang grup */
  glowColor: string;
  /** Warna kelopak mata (sampel kulit di bawah tiap mata) */
  skinColor: string;
  skinColorRight: string;
  /** contain = seluruh gambar terlihat, cover = isi penuh frame (tepi dipotong) */
  fitMode: "contain" | "cover";
  /** Kekuatan gerak idle, 1 = default */
  motionAmount: number;
  /** Tampilkan partikel */
  particles: boolean;
  /**
   * Pudar ke transparan di bagian bawah (0..1 dari tinggi frame, 0 = mati). Untuk render
   * transparan: tepi bawah ilustrasi yang terpotong melebur ke latar halaman.
   */
  fadeBottom?: number;
};

const IMG_W = layout.width;
const IMG_H = layout.height;
const FRONT_PIVOT = { x: 707, y: IMG_H }; // napas gadis depan: jangkar di kaki
const STRAND_PHASE = { "hair-left": 0, "hair-right": 1.3 } as const;

// Karakter 2..7 (urutan muncul). Digambar terbalik (7 paling bawah).
// cycles/phase: gerak idle; depth: kekuatan paralaks terhadap ayunan kamera.
const CHARS = (
  [
    { id: "char-2", cycles: 2, phase: 0.6, depth: 0.15 },
    { id: "char-3", cycles: 2, phase: 2.4, depth: 0.2 },
    { id: "char-4", cycles: 3, phase: 1.1, depth: 0.3 },
    { id: "char-5", cycles: 2, phase: 4.0, depth: 0.4 },
    { id: "char-6", cycles: 3, phase: 3.2, depth: 0.45 },
    { id: "char-7", cycles: 2, phase: 5.1, depth: 0.5 },
  ] as const
).map((c, i) => ({
  ...c,
  ...layout.chars[c.id],
  start: 10 + i * 5, // frame mulai muncul di fase "in"
  // titik skala saat muncul: kontak dengan karakter di depannya; yang terpotong tepi bawah gambar
  // diskalakan dari tepi bawah supaya potongannya tidak terlihat melayang
  origin: {
    x: layout.chars[c.id].anchor.x - layout.chars[c.id].x,
    y:
      layout.chars[c.id].y + layout.chars[c.id].h >= layout.height - 1
        ? layout.chars[c.id].h
        : layout.chars[c.id].anchor.y - layout.chars[c.id].y,
  },
}));

const POP_FRAMES = 22;
const TV = { x: 650, y: 240 }; // layar TV (karakter 6)
const GEM = { x: 1078, y: 690 }; // permata pedang (karakter 4)
const CLIP = { x: 872, y: 940 }; // jepit rambut (karakter 1)

const hash = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  x: hash(i, 1),
  y: hash(i, 2),
  r: 2 + hash(i, 3) * 4,
  speed: 1 + Math.floor(hash(i, 4) * 2), // siklus per loop idle (1 atau 2) -> tetap mulus
  phase: hash(i, 5) * Math.PI * 2,
}));

const TWO_PI = Math.PI * 2;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Gelombang periodik yang bernilai 0 di u = 0 (supaya awal idle == akhir "in"). */
const wave = (u: number, cycles: number, phase: number) =>
  Math.sin(TWO_PI * u * cycles + phase) - Math.sin(phase);

/** Nilai animasi fase "in" pada frame lokal t (0..IN_FRAMES-1). */
const inState = (t: number, fps: number) => {
  const frontPop = spring({
    frame: t,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.9 },
  });
  const chars = CHARS.map((c) => ({
    pop: spring({
      frame: t - c.start,
      fps,
      config: { damping: 12, stiffness: 120, mass: 0.8 },
      durationInFrames: POP_FRAMES,
    }),
    opacity: interpolate(t - c.start, [0, 5], [0, 1], clamp),
  }));
  const camera = interpolate(t, [0, CREW_IN_FRAMES - 1], [1.1, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const bg = interpolate(t, [0, 20], [0, 1], clamp);
  const hairSwing = (1 - frontPop) * -8;
  const tvT = t - CHARS[4].start - 4;
  const tvFlicker =
    tvT > 0 && tvT < 22
      ? Math.max(0, Math.sin(tvT * 2.1) * Math.sin(tvT * 0.9)) * 0.5
      : 0;
  const sparkle = spring({
    frame: t - 44,
    fps,
    config: { damping: 8, stiffness: 160 },
  });
  return {
    frontScale: 0.55 + 0.45 * frontPop,
    frontOpacity: Math.min(1, frontPop * 2),
    chars,
    camera,
    bg,
    hairSwing,
    tvFlicker,
    sparkle: sparkle < 1 ? sparkle : Math.max(0, 1 - (t - 50) / 9),
  };
};

type InState = ReturnType<typeof inState>;

const settled = (): InState => ({
  frontScale: 1,
  frontOpacity: 1,
  chars: CHARS.map(() => ({ pop: 1, opacity: 1 })),
  camera: 1,
  bg: 1,
  hairSwing: 0,
  tvFlicker: 0,
  sparkle: 0,
});

const Sparkle: React.FC<{
  x: number;
  y: number;
  k: number;
  size: number;
}> = ({ x, y, k, size }) => (
  <g
    transform={`translate(${x} ${y}) rotate(${k * 90}) scale(${Math.max(0, k)})`}
    opacity={Math.min(1, k * 1.2)}
  >
    <path
      d={`M0,-${size} Q${size * 0.12},-${size * 0.12} ${size},0 Q${size * 0.12},${size * 0.12} 0,${size} Q-${size * 0.12},${size * 0.12} -${size},0 Q-${size * 0.12},-${size * 0.12} 0,-${size} Z`}
      fill="#FFFFFF"
    />
    <circle r={size * 0.18} fill="#FFF7D6" />
  </g>
);

// Kedip per lapisan: frame mulai (di fase idle, tiap kedip 8 frame). Disebar supaya tidak serempak;
// karakter 3 kedip ganda. Karakter 6 (TV): huruf di layar yang "berkedip".
const BLINK_AT = {
  front: [70, 150],
  "char-2": [22, 118],
  "char-3": [46, 132, 141],
  "char-4": [95, 160],
  "char-5": [8, 104],
  "char-6": [58, 162],
  "char-7": [34, 124],
} as const;

type Box = { x: number; y: number; w: number; h: number };
type LidEye = {
  points: string;
  pivotY: number;
  lash: string;
  lashColor: string;
  lashWidth: number;
  color: string;
};

/** Kelopak: poligon warna kulit menutup dari atas (pivotY), hanya di dalam mask (tanpa rambut/kacamata). */
const Lids: React.FC<{
  box: Box;
  mask: string;
  eyes: LidEye[];
  blink: number;
  left: number;
  top: number;
}> = ({ box, mask, eyes, blink, left, top }) =>
  blink > 0 ? (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: box.w,
        height: box.h,
        WebkitMaskImage: `url(${staticFile(mask)})`,
        maskImage: `url(${staticFile(mask)})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      <svg
        width={box.w}
        height={box.h}
        viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
        style={{ display: "block" }}
      >
        {eyes.map((e) => (
          <g
            key={e.points}
            transform={`translate(0 ${e.pivotY}) scale(1 ${blink}) translate(0 ${-e.pivotY})`}
          >
            <polygon points={e.points} fill={e.color} />
            <path
              d={e.lash}
              fill="none"
              stroke={e.lashColor}
              strokeWidth={e.lashWidth}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  ) : null;

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={IMG_W}
    height={IMG_H}
    viewBox={`0 0 ${IMG_W} ${IMG_H}`}
    style={{ position: "absolute", inset: 0, overflow: "visible" }}
  >
    {children}
  </svg>
);

export const CrewReveal: React.FC<CrewRevealProps> = ({
  phase,
  bgTop,
  bgBottom,
  glowColor,
  skinColor,
  skinColorRight,
  fitMode,
  motionAmount,
  particles,
  fadeBottom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ----- pemetaan frame ke fase -----
  let st: InState;
  let idleT = 0; // frame lokal idle (0..IDLE_FRAMES-1)
  let inIdle = false;
  const outToIn = (t: number) =>
    Math.round((CREW_IN_FRAMES - 1) * (1 - t / (CREW_OUT_FRAMES - 1)));
  if (phase === "in") {
    st = inState(Math.min(frame, CREW_IN_FRAMES - 1), fps);
  } else if (phase === "idle") {
    st = settled();
    inIdle = true;
    idleT = frame % CREW_IDLE_FRAMES;
  } else if (phase === "out") {
    st = inState(outToIn(Math.min(frame, CREW_OUT_FRAMES - 1)), fps);
  } else if (frame < CREW_IN_FRAMES) {
    st = inState(frame, fps);
  } else if (frame < CREW_IN_FRAMES + CREW_IDLE_FRAMES) {
    st = settled();
    inIdle = true;
    idleT = frame - CREW_IN_FRAMES;
  } else {
    st = inState(
      outToIn(
        Math.min(
          frame - CREW_IN_FRAMES - CREW_IDLE_FRAMES,
          CREW_OUT_FRAMES - 1,
        ),
      ),
      fps,
    );
  }

  // ----- gerak idle (semua periodik terhadap IDLE_FRAMES, bernilai 0 di awal) -----
  const u = idleT / CREW_IDLE_FRAMES; // 0..1
  const k = inIdle ? motionAmount : 0;
  const breathe = 1 + 0.012 * k * Math.sin(TWO_PI * u * 2); // 2 siklus / loop (3 s)
  const swayX = 6 * k * Math.sin(TWO_PI * u); // 1 siklus
  const swayY = 3 * k * Math.sin(TWO_PI * u * 2);
  const idleZoom = 1 + 0.012 * k * Math.sin(TWO_PI * u);
  const hairIdle = (ph: number) => 2.4 * k * Math.sin(TWO_PI * u * 3 + ph); // 3 siklus (2 s)
  const glowPulse = 0.85 + 0.15 * Math.sin(TWO_PI * u * 2);
  const tvIdle = 0.08 * k * (0.5 + 0.5 * Math.sin(TWO_PI * u * 4));
  // kedip: tutup 3 frame, tahan 1, buka 3 (jadwal per lapisan di BLINK_AT)
  const blinkAt = (start: number) => {
    const d = idleT - start;
    if (d < 0 || d > 7) return 0;
    if (d <= 3) return d / 3;
    if (d === 4) return 1;
    return Math.max(0, (7 - d) / 3);
  };
  const blinkOf = (id: keyof typeof BLINK_AT) =>
    inIdle ? Math.max(...BLINK_AT[id].map(blinkAt)) : 0;
  const blink = blinkOf("front");
  // kilau idle di permata & jepit (bergantian)
  const sparkleIdle = (start: number) => {
    const d = idleT - start;
    if (d < 0 || d > 20) return 0;
    return Math.sin((d / 20) * Math.PI);
  };
  const gemSparkle = Math.max(st.sparkle, inIdle ? sparkleIdle(30) : 0);
  const clipSparkle = Math.max(st.sparkle * 0.8, inIdle ? sparkleIdle(120) : 0);

  // ----- skala gambar ke komposisi -----
  const fit =
    fitMode === "cover"
      ? Math.max(width / IMG_W, height / IMG_H)
      : Math.min(width / IMG_W, height / IMG_H);
  const stageW = IMG_W * fit;
  const stageH = IMG_H * fit;
  const minSide = Math.min(width, height);

  const eyeBox = layout.eyeMask;
  const lidColor = { left: skinColor, right: skinColorRight } as const;
  const fadeMask =
    fadeBottom > 0
      ? `linear-gradient(180deg, #000 ${(1 - fadeBottom) * 100}%, transparent 100%)`
      : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: bgBottom, overflow: "hidden" }}>
      {/* latar */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)`,
          opacity: st.bg,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 55%, ${glowColor} 0%, transparent 60%)`,
          opacity: 0.55 * st.bg * glowPulse,
        }}
      />
      {particles ? (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0 }}
        >
          {PARTICLES.map((p, i) => {
            const y = (((p.y - u * p.speed) % 1) + 1) % 1;
            const tw = 0.5 + 0.5 * Math.sin(TWO_PI * u * p.speed * 2 + p.phase);
            return (
              <circle
                key={i}
                cx={p.x * width + Math.sin(TWO_PI * u + p.phase) * 10}
                cy={y * height}
                r={p.r * (minSide / 1080)}
                fill="#FFFFFF"
                opacity={0.35 * tw * st.bg}
              />
            );
          })}
        </svg>
      ) : null}

      {/* panggung dalam koordinat gambar */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          WebkitMaskImage: fadeMask,
          maskImage: fadeMask,
        }}
      >
        <div
          style={{
            width: stageW,
            height: stageH,
            position: "relative",
            scale: st.camera * idleZoom,
            translate: `${swayX * fit}px ${swayY * fit}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: IMG_W,
              height: IMG_H,
              transformOrigin: "0 0",
              scale: fit,
            }}
          >
            {/* karakter 7..2: keluar dari belakang karakter yang sudah ada */}
            {CHARS.map((c, i) => ({ c, s: st.chars[i] }))
              .reverse()
              .map(({ c, s }) => {
                const bob = 4 * k * wave(u, c.cycles, c.phase);
                const lean = 0.008 * k * wave(u, c.cycles, c.phase + 1.4);
                const lids =
                  c.id in layout.blinks
                    ? layout.blinks[c.id as keyof typeof layout.blinks]
                    : null;
                const charBlink = blinkOf(c.id);
                return (
                  <div
                    key={c.id}
                    style={{
                      position: "absolute",
                      left: c.x,
                      top: c.y,
                      width: c.w,
                      height: c.h,
                      opacity: s.opacity,
                      transformOrigin: `${c.origin.x}px ${c.origin.y}px`,
                      scale: 0.55 + 0.45 * s.pop,
                      translate: `${-swayX * c.depth}px ${bob - swayY * c.depth}px`,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "50% 100%",
                        scale: `1 ${1 + lean}`,
                      }}
                    >
                      <Img
                        src={staticFile(`crew/${c.id}.png`)}
                        style={{ width: c.w, height: c.h, display: "block" }}
                      />
                      {lids ? (
                        <Lids
                          box={lids.mask}
                          mask={`crew/blink-${c.id}.png`}
                          eyes={lids.eyes.map((e) => ({ ...e, color: e.skin }))}
                          blink={charBlink}
                          left={lids.mask.x - c.x}
                          top={lids.mask.y - c.y}
                        />
                      ) : null}
                      {c.id === "char-6"
                        ? // huruf J & A di layar TV "berkedip": memipih jadi garis
                          (["tv-j", "tv-a"] as const).map((id) => {
                            const g = layout.tvGlyphs[id];
                            return (
                              <Img
                                key={id}
                                src={staticFile(`crew/${id}.png`)}
                                style={{
                                  position: "absolute",
                                  left: g.x - c.x,
                                  top: g.y - c.y,
                                  width: g.w,
                                  height: g.h,
                                  scale: `1 ${1 - 0.85 * charBlink}`,
                                }}
                              />
                            );
                          })
                        : null}
                    </div>
                    {c.id === "char-6" ? (
                      // layar TV menyala
                      <div
                        style={{
                          position: "absolute",
                          left: TV.x - c.x - 175,
                          top: TV.y - c.y - 150,
                          width: 350,
                          height: 300,
                          rotate: "-14deg",
                          borderRadius: 24,
                          background:
                            "radial-gradient(circle at 50% 45%, rgba(190,220,255,0.95) 0%, rgba(120,160,255,0.5) 45%, transparent 75%)",
                          opacity: st.tvFlicker + tvIdle,
                          mixBlendMode: "screen",
                        }}
                      />
                    ) : null}
                    {c.id === "char-4" ? (
                      <svg
                        width={c.w}
                        height={c.h}
                        viewBox={`${c.x} ${c.y} ${c.w} ${c.h}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          overflow: "visible",
                        }}
                      >
                        <Sparkle x={GEM.x} y={GEM.y} k={gemSparkle} size={44} />
                      </svg>
                    ) : null}
                  </div>
                );
              })}

            {/* gadis depan + helai rambut + kelopak: napas dengan jangkar di kaki */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: st.frontOpacity,
                transformOrigin: `${FRONT_PIVOT.x}px ${FRONT_PIVOT.y}px`,
                scale: `${st.frontScale} ${st.frontScale * breathe}`,
              }}
            >
              <Img
                src={staticFile("crew/front.png")}
                style={{
                  position: "absolute",
                  left: layout.front.x,
                  top: layout.front.y,
                  width: layout.front.w,
                  height: layout.front.h,
                }}
              />
              {(["hair-left", "hair-right"] as const).map((id) => {
                const s = layout.strands[id];
                return (
                  <Img
                    key={id}
                    src={staticFile(`crew/${id}.png`)}
                    style={{
                      position: "absolute",
                      left: s.x,
                      top: s.y,
                      width: s.w,
                      height: s.h,
                      transformOrigin: "50% 0%",
                      rotate: `${st.hairSwing + hairIdle(STRAND_PHASE[id])}deg`,
                    }}
                  />
                );
              })}
              {/* kelopak mata: menutup dari atas, hanya di area mata (mask tanpa poni) */}
              <Lids
                box={eyeBox}
                mask="crew/eyes-mask.png"
                eyes={(["left", "right"] as const).map((side) => ({
                  ...layout.eyes[side],
                  lashColor: "#1A1424",
                  lashWidth: 5,
                  color: lidColor[side],
                }))}
                blink={blink}
                left={eyeBox.x}
                top={eyeBox.y}
              />
              <Overlay>
                <Sparkle x={CLIP.x} y={CLIP.y} k={clipSparkle} size={30} />
              </Overlay>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
