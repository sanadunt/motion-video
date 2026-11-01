/**
 * CrewReveal — menghidupkan ilustrasi grup (PNG datar) tanpa memotong tiap karakter.
 *
 * Lapisan (semua dalam koordinat gambar asli, lihat public/crew/layers.json):
 *   back.png        gambar utuh; muncul "mengembang" dari belakang gadis depan
 *   front.png       gadis depan (dipotong otomatis), tanpa dua helai rambut bawah
 *   hair-left/right helai rambut bawah yang bergoyang
 *   kelopak mata    digambar (SVG) di atas mata untuk kedip
 *
 * Fase:
 *   in   (IN_FRAMES)   gadis depan pop-in, lalu yang lain mengembang keluar dari tengah
 *   idle (IDLE_FRAMES) semua gerak periodik: napas, rambut, kedip, ayunan kamera -> bisa di-loop mulus
 *   out  (OUT_FRAMES)  kebalikan "in"
 *   full               in + idle + out (untuk render MP4)
 *
 * Idle dirancang agar frame 0 == frame terakhir+1 (semua sinus mulai dari 0),
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
};

// Geometri gambar sumber (1414x2000). Koordinat helai dari public/crew/layers.json.
const IMG_W = 1414;
const IMG_H = 2000;
const ANCHOR = { x: 707, y: 1250 }; // dada gadis depan: pusat "mengembang"
const STRANDS = {
  left: { x: 545, y: 1060, w: 105, h: 175, phase: 0 },
  right: { x: 840, y: 990, w: 160, h: 265, phase: 1.3 },
};
// Poligon area mata yang terlihat (untuk kelopak), pivot di garis atas.
const EYE_LEFT =
  "625,933 648,926 672,922 681,944 674,972 652,979 630,974 612,956";
const EYE_RIGHT =
  "740,905 766,895 790,893 808,914 802,952 778,962 752,961 736,934";
const LASH_LEFT = "M614,956 C632,982 664,984 680,960";
const LASH_RIGHT = "M738,936 C752,968 790,968 806,936";

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

/** Nilai animasi fase "in" pada frame lokal t (0..IN_FRAMES-1). */
const inState = (t: number, fps: number) => {
  const frontPop = spring({
    frame: t,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.9 },
  });
  const backGrow = spring({
    frame: t - 14,
    fps,
    config: { damping: 15, stiffness: 90, mass: 1.1 },
  });
  const backOpacity = interpolate(t, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reveal = interpolate(t, [14, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const camera = interpolate(t, [0, CREW_IN_FRAMES - 1], [1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const bg = interpolate(t, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hairSwing = (1 - frontPop) * -8;
  const tvFlicker =
    t > 26 && t < 52
      ? Math.max(0, Math.sin(t * 2.1) * Math.sin(t * 0.9)) * 0.5
      : 0;
  const sparkle = spring({
    frame: t - 40,
    fps,
    config: { damping: 8, stiffness: 160 },
  });
  return {
    frontScale: 0.55 + 0.45 * frontPop,
    frontOpacity: Math.min(1, frontPop * 2),
    backScale: 0.78 + 0.22 * backGrow,
    backOpacity,
    reveal,
    camera,
    bg,
    hairSwing,
    tvFlicker,
    sparkle: sparkle < 1 ? sparkle : Math.max(0, 1 - (t - 48) / 14),
  };
};

type InState = ReturnType<typeof inState>;

const settled = (): InState => ({
  frontScale: 1,
  frontOpacity: 1,
  backScale: 1,
  backOpacity: 1,
  reveal: 1,
  camera: 1,
  bg: 1,
  hairSwing: 0,
  tvFlicker: 0,
  sparkle: 0,
});

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
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ----- pemetaan frame ke fase -----
  let st: InState;
  let idleT = 0; // frame lokal idle (0..IDLE_FRAMES-1), -1 kalau bukan idle
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

  // ----- gerak idle (semua periodik terhadap IDLE_FRAMES, mulai dari 0) -----
  const u = idleT / CREW_IDLE_FRAMES; // 0..1
  const k = inIdle ? motionAmount : 0;
  const breathe = 1 + 0.012 * k * Math.sin(TWO_PI * u * 2); // 2 siklus / loop (3 s)
  const swayX = 6 * k * Math.sin(TWO_PI * u); // 1 siklus
  const swayY = 3 * k * Math.sin(TWO_PI * u * 2);
  const idleZoom = 1 + 0.012 * k * Math.sin(TWO_PI * u);
  const hairIdle = (ph: number) => 2.4 * k * Math.sin(TWO_PI * u * 3 + ph); // 3 siklus (2 s)
  const glowPulse = 0.85 + 0.15 * Math.sin(TWO_PI * u * 2);
  const tvIdle = 0.08 * k * (0.5 + 0.5 * Math.sin(TWO_PI * u * 4));
  // kedip di frame 70 dan 150 (tutup 3 frame, tahan 1, buka 3)
  const blinkAt = (start: number) => {
    const d = idleT - start;
    if (d < 0 || d > 7) return 0;
    if (d <= 3) return d / 3;
    if (d === 4) return 1;
    return Math.max(0, (7 - d) / 3);
  };
  const blink = inIdle ? Math.max(blinkAt(70), blinkAt(150)) : 0;
  // kilau idle di permata & jepit (bergantian tiap 90 frame)
  const sparkleIdle = (start: number) => {
    const d = idleT - start;
    if (d < 0 || d > 20) return 0;
    return Math.sin((d / 20) * Math.PI);
  };
  const gemSparkle = Math.max(st.sparkle, inIdle ? sparkleIdle(30) : 0);
  const clipSparkle = Math.max(st.sparkle * 0.8, inIdle ? sparkleIdle(120) : 0);

  // ----- skala gambar ke komposisi (contain) -----
  const fit =
    fitMode === "cover"
      ? Math.max(width / IMG_W, height / IMG_H)
      : Math.min(width / IMG_W, height / IMG_H);
  const stageW = IMG_W * fit;
  const stageH = IMG_H * fit;
  const minSide = Math.min(width, height);

  const revealRadius = st.reveal * 1500; // px dalam koordinat gambar
  const maskCss = `radial-gradient(circle at ${ANCHOR.x}px ${ANCHOR.y}px, #000 ${Math.max(0, revealRadius - 180)}px, transparent ${revealRadius}px)`;

  const Sparkle: React.FC<{
    x: number;
    y: number;
    k: number;
    size: number;
  }> = ({ x, y, k: kk, size }) => (
    <g
      transform={`translate(${x} ${y}) rotate(${kk * 90}) scale(${Math.max(0, kk)})`}
      opacity={Math.min(1, kk * 1.2)}
    >
      <path
        d={`M0,-${size} Q${size * 0.12},-${size * 0.12} ${size},0 Q${size * 0.12},${size * 0.12} 0,${size} Q-${size * 0.12},${size * 0.12} -${size},0 Q-${size * 0.12},-${size * 0.12} 0,-${size} Z`}
        fill="#FFFFFF"
      />
      <circle r={size * 0.18} fill="#FFF7D6" />
    </g>
  );

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
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
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
            {/* lapisan belakang: mengembang dari dada gadis depan */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: st.backOpacity,
                transformOrigin: `${ANCHOR.x}px ${ANCHOR.y}px`,
                scale: st.backScale,
                translate: `${-swayX * 0.6}px ${-swayY * 0.6}px`,
                WebkitMaskImage: maskCss,
                maskImage: maskCss,
              }}
            >
              <Img
                src={staticFile("crew/back.png")}
                style={{ width: IMG_W, height: IMG_H, display: "block" }}
              />
              {/* layar TV menyala */}
              <div
                style={{
                  position: "absolute",
                  left: 650 - 175,
                  top: 240 - 150,
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
              <svg
                width={IMG_W}
                height={IMG_H}
                viewBox={`0 0 ${IMG_W} ${IMG_H}`}
                style={{ position: "absolute", inset: 0 }}
              >
                <Sparkle x={1078} y={690} k={gemSparkle} size={44} />
              </svg>
            </div>

            {/* gadis depan + helai rambut + kelopak: napas dengan jangkar di kaki */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: st.frontOpacity,
                transformOrigin: `${ANCHOR.x}px ${IMG_H}px`,
                scale: `${st.frontScale} ${st.frontScale * breathe}`,
              }}
            >
              <Img
                src={staticFile("crew/front.png")}
                style={{ width: IMG_W, height: IMG_H, display: "block" }}
              />
              {(["left", "right"] as const).map((side) => {
                const s = STRANDS[side];
                return (
                  <Img
                    key={side}
                    src={staticFile(`crew/hair-${side}.png`)}
                    style={{
                      position: "absolute",
                      left: s.x,
                      top: s.y,
                      width: s.w,
                      height: s.h,
                      transformOrigin: "50% 0%",
                      rotate: `${st.hairSwing + hairIdle(s.phase)}deg`,
                    }}
                  />
                );
              })}
              <svg
                width={IMG_W}
                height={IMG_H}
                viewBox={`0 0 ${IMG_W} ${IMG_H}`}
                style={{ position: "absolute", inset: 0 }}
              >
                {/* kelopak mata: poligon area mata, menutup dari atas */}
                <g
                  transform={`translate(0 922) scale(1 ${blink}) translate(0 -922)`}
                >
                  <polygon points={EYE_LEFT} fill={skinColor} />
                  <path
                    d={LASH_LEFT}
                    fill="none"
                    stroke="#1A1424"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                </g>
                <g
                  transform={`translate(0 893) scale(1 ${blink}) translate(0 -893)`}
                >
                  <polygon points={EYE_RIGHT} fill={skinColorRight} />
                  <path
                    d={LASH_RIGHT}
                    fill="none"
                    stroke="#1A1424"
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                </g>
                <Sparkle x={872} y={940} k={clipSparkle} size={30} />
              </svg>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
