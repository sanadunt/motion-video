/**
 * Motion logo "Isekai Juicer" (6 detik, 30 fps) + efek suara.
 *
 * Timeline (frame @30fps):
 *   0–20   partikel tersedot ke tengah, portal membuka (spring) sambil berputar cepat
 *   18     kilatan sihir
 *   24–60  enam buah "pop" keluar dari portal satu per satu
 *   50–90  gelas jus naik ke tengah portal, jus terisi + cipratan
 *   80     "ISEKAI" menghantam masuk
 *   95     "JUICER" menghantam masuk + layar bergetar
 *   112    tagline + chord penutup
 *   165–180 fade ke hitam (opsional lewat prop fadeOut)
 *
 * Komponen bebas resolusi: logo di-fit ke sisi terpendek (portrait, landscape, square).
 */
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { IsekaiJuicerArt, type LogoAnim } from "./isekai-juicer/Art";

export type IsekaiJuicerProps = {
  /** Fade ke hitam di 0.5 detik terakhir */
  fadeOut: boolean;
  /** Tampilkan efek suara */
  sound: boolean;
  /** Volume master 0..1 */
  volume: number;
};

export const ISEKAI_JUICER_DURATION = 180;

// Partikel deterministik (tanpa Math.random supaya tiap frame konsisten).
const hash = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const AMBIENT = Array.from({ length: 46 }, (_, i) => ({
  x: hash(i, 1),
  y: hash(i, 2),
  r: 1.5 + hash(i, 3) * 3.5,
  speed: 0.02 + hash(i, 4) * 0.05,
  phase: hash(i, 5) * Math.PI * 2,
}));

const SUCKED = Array.from({ length: 26 }, (_, i) => ({
  angle: hash(i, 6) * Math.PI * 2,
  radius: 0.55 + hash(i, 7) * 0.5,
  delay: hash(i, 8) * 8,
  r: 3 + hash(i, 9) * 5,
}));

export const IsekaiJuicer: React.FC<IsekaiJuicerProps> = ({
  fadeOut,
  sound,
  volume,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const time = frame / fps;

  // ---------- nilai animasi ----------
  const portal = spring({
    frame: frame - 4,
    fps,
    config: { damping: 11, stiffness: 120, mass: 1 },
  });
  const portalSpin =
    interpolate(frame, [0, 45], [0, 540], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }) +
    Math.max(0, frame - 45) * 1.1;
  const glow =
    portal * (0.7 + 0.3 * Math.sin(time * 5)) +
    interpolate(frame, [16, 20, 30], [0, 0.6, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const fruits = [0, 1, 2, 3, 4, 5].map((i) =>
    spring({
      frame: frame - (24 + i * 6),
      fps,
      config: { damping: 9, stiffness: 150, mass: 0.9 },
    }),
  );

  const cup = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 110 },
  });
  const juice = interpolate(frame, [58, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const isekai = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.8 },
  });
  const juicer = spring({
    frame: frame - 95,
    fps,
    config: { damping: 11, stiffness: 200, mass: 0.9 },
  });
  const tagline = interpolate(frame, [112, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const anim: LogoAnim = {
    portal,
    portalSpin,
    glow,
    fruits,
    fruitSpin: 0,
    cup,
    juice,
    isekai,
    juicer,
    tagline,
    time,
  };

  // ---------- getaran layar saat teks menghantam ----------
  const shakeAt = (start: number, amp: number) => {
    if (frame < start) return { x: 0, y: 0 };
    const t = frame - start;
    const decay = Math.exp(-t / 5);
    return {
      x: Math.sin(t * 2.9) * amp * decay,
      y: Math.cos(t * 2.3) * amp * 0.7 * decay,
    };
  };
  const s1 = shakeAt(80, 10);
  const s2 = shakeAt(95, 22);
  const shake = { x: s1.x + s2.x, y: s1.y + s2.y };

  // kilatan putih saat portal membuka & saat JUICER menghantam
  const flash =
    interpolate(frame, [17, 19, 28], [0, 0.55, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    interpolate(frame, [95, 96, 104], [0, 0.35, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const fade = fadeOut
    ? interpolate(
        frame,
        [durationInFrames - 15, durationInFrames - 1],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      )
    : 1;

  const minSide = Math.min(width, height);
  const logoSize = minSide * 0.94;
  const suckProgress = (delay: number) =>
    interpolate(frame, [delay, 22 + delay * 0.4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });

  const sfx = (file: string, from: number, vol: number) =>
    sound ? (
      <Audio
        key={`${file}-${from}`}
        name={`SFX ${file} @${from}`}
        src={staticFile(`sfx/isekai-juicer/${file}`)}
        from={from}
        volume={Math.min(1, vol * volume)}
      />
    ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: "#090314", overflow: "hidden" }}>
      {/* latar: gradasi radial ungu gelap */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, #2A1052 0%, #150827 45%, #090314 100%)",
        }}
      />

      {/* partikel ambien + partikel tersedot */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        {AMBIENT.map((p, i) => {
          const y = (((p.y - time * p.speed) % 1) + 1) % 1;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + p.phase));
          return (
            <circle
              key={i}
              cx={p.x * width + Math.sin(time + p.phase) * 12}
              cy={y * height}
              r={p.r}
              fill={i % 3 === 0 ? "#FACC15" : "#E9D5FF"}
              opacity={0.55 * tw * portal}
            />
          );
        })}
        {SUCKED.map((p, i) => {
          const q = suckProgress(p.delay);
          if (q >= 1 || frame > 40) return null;
          const rad = p.radius * minSide * (1 - q);
          const ang = p.angle + q * 4;
          const cx = width / 2 + Math.cos(ang) * rad;
          const cy = height / 2 - minSide * 0.03 + Math.sin(ang) * rad;
          return (
            <circle
              key={`s${i}`}
              cx={cx}
              cy={cy}
              r={p.r * (1 - q * 0.6)}
              fill="#E879F9"
              opacity={0.9 * (1 - q * 0.3)}
            />
          );
        })}
      </svg>

      {/* logo */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          translate: `${shake.x}px ${shake.y}px`,
        }}
      >
        <div style={{ width: logoSize, height: logoSize }}>
          <IsekaiJuicerArt anim={anim} />
        </div>
      </AbsoluteFill>

      {/* kilatan */}
      <AbsoluteFill
        style={{
          backgroundColor: "#FDF4FF",
          opacity: flash,
          pointerEvents: "none",
        }}
      />
      {/* fade ke hitam */}
      <AbsoluteFill style={{ backgroundColor: "#000000", opacity: 1 - fade }} />

      {/* ===== efek suara ===== */}
      {sfx("portal-open.wav", 0, 0.9)}
      {sfx("whoosh.wav", 4, 0.6)}
      {sfx("sparkle.wav", 18, 0.7)}
      {sfx("pop-1.wav", 24, 0.75)}
      {sfx("pop-2.wav", 30, 0.75)}
      {sfx("pop-3.wav", 36, 0.75)}
      {sfx("pop-4.wav", 42, 0.75)}
      {sfx("pop-5.wav", 48, 0.75)}
      {sfx("pop-3.wav", 54, 0.75)}
      {sfx("whoosh.wav", 50, 0.5)}
      {sfx("splash.wav", 60, 0.85)}
      {sfx("impact.wav", 80, 0.7)}
      {sfx("impact.wav", 95, 1)}
      {sfx("sparkle.wav", 100, 0.5)}
      {sfx("final-chord.wav", 112, 0.8)}
      {sfx("ding.wav", 113, 0.35)}
    </AbsoluteFill>
  );
};
