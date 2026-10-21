import { zColor } from "@remotion/zod-types";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Emblem, EmblemColors } from "./meneuroboros/Emblem";
import { EMBLEM_BOX } from "./meneuroboros/geometry";
import {
  WORDMARK_HEIGHT,
  WORDMARK_LETTERS,
  WORDMARK_OUTLINE,
  WORDMARK_WIDTH,
} from "./meneuroboros/wordmark";

export const meneuroborosVHSSchema = z.object({
  layout: z.enum(["auto", "horizontal", "stacked"]),
  durationInSeconds: z.number().min(5).max(30),
  rotationSpeed: z.number().min(0).max(360).describe("Degrees per second"),
  backgroundColor: zColor(),
  letterColor: zColor(),
  outlineColor: zColor(),
  topSnakeColor: zColor(),
  bottomSnakeColor: zColor(),
  eyeColor: zColor(),
  vhs: z.boolean(),
  vhsIntensity: z.number().min(0).max(1),
  seed: z.number().int(),
});

export type MeneuroborosVHSProps = z.infer<typeof meneuroborosVHSSchema>;

export const meneuroborosVHSDefaults: MeneuroborosVHSProps = {
  layout: "auto",
  durationInSeconds: 6,
  rotationSpeed: 38,
  backgroundColor: "#060607",
  letterColor: "#EDEBE4",
  outlineColor: "#000000",
  topSnakeColor: "#921C1D",
  bottomSnakeColor: "#3A3A3A",
  eyeColor: "#FF2A1F",
  vhs: true,
  vhsIntensity: 0.8,
  seed: 7,
};

export const calculateMeneuroborosVHSMetadata: CalculateMetadataFunction<MeneuroborosVHSProps> = ({
  props,
}) => {
  const fps = 30;
  return { durationInFrames: Math.round(props.durationInSeconds * fps), fps };
};

// ------------------------------------------------------------------ layout

/** Where the wordmark sits relative to the emblem centre in the original horizontal lockup. */
const LOCKUP_WORDMARK = { x: -673, y: -56 };
const STACK_EMBLEM_SCALE = 2.8;
const STACK_GAP = 46;

type Layout = {
  readonly s: number;
  readonly tx: number;
  readonly ty: number;
  readonly emblem: { x: number; y: number; k: number };
  readonly wordmark: { x: number; y: number };
};

const getLayout = (
  width: number,
  height: number,
  mode: MeneuroborosVHSProps["layout"],
): Layout => {
  const horizontal = mode === "horizontal" || (mode === "auto" && width / height >= 1.3);
  const eb = EMBLEM_BOX;
  let emblem: Layout["emblem"];
  let wordmark: Layout["wordmark"];
  let box: { x0: number; y0: number; x1: number; y1: number };
  if (horizontal) {
    emblem = { x: 0, y: 0, k: 1 };
    wordmark = LOCKUP_WORDMARK;
    box = {
      x0: Math.min(eb.x, wordmark.x),
      y0: Math.min(eb.y, wordmark.y),
      x1: Math.max(eb.x + eb.w, wordmark.x + WORDMARK_WIDTH),
      y1: Math.max(eb.y + eb.h, wordmark.y + WORDMARK_HEIGHT),
    };
  } else {
    const k = STACK_EMBLEM_SCALE;
    emblem = { x: 0, y: 0, k };
    wordmark = { x: -WORDMARK_WIDTH / 2, y: k * (eb.y + eb.h) + STACK_GAP };
    box = {
      x0: Math.min(k * eb.x, wordmark.x),
      y0: k * eb.y,
      x1: Math.max(k * (eb.x + eb.w), wordmark.x + WORDMARK_WIDTH),
      y1: wordmark.y + WORDMARK_HEIGHT,
    };
  }
  const margin = width > height ? 100 : 80;
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  // 0.9 leaves room for jitter, the slow push-in and the RGB split inside the safe area
  const s = Math.min((width - 2 * margin) / bw, (height - 2 * margin) / bh) * 0.9;
  return {
    s,
    tx: width / 2 - s * (box.x0 + bw / 2),
    ty: height / 2 - s * (box.y0 + bh / 2),
    emblem,
    wordmark,
  };
};

// ------------------------------------------------------------------ timing (seconds)

const T = {
  staticOut: [0.0, 0.55, 0.9] as const,
  emblemIn: [0.45, 1.9] as const,
  spinRamp: [0.45, 1.9] as const,
  lettersStart: 2.05,
  letterStagger: 0.09,
  letterWindow: 0.3,
  glow: [3.35, 4.1] as const,
};

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Rotation angle reached at `frame`, with the speed easing in over T.spinRamp. */
const spinAngle = (frame: number, fps: number, speed: number) => {
  let a = 0;
  for (let i = 0; i < frame; i++) {
    const v = interpolate(i / fps, T.spinRamp, [0, 1], {
      ...clampOpts,
      easing: Easing.inOut(Easing.sin),
    });
    a += (speed * v) / fps;
  }
  return a;
};

// ------------------------------------------------------------------ logo layer

type LetterState = { visible: boolean; dx: number; glyph: number };

const LogoLayer: React.FC<{
  props: MeneuroborosVHSProps;
  layout: Layout;
  zoom: number;
  topAngle: number;
  bottomAngle: number;
  eyeGlow: number;
  emblemOpacity: number;
  letters: LetterState[];
  vhs: { wobble: number; split: number; noiseSeed: number } | null;
  idPrefix: string;
}> = ({
  props,
  layout,
  zoom,
  topAngle,
  bottomAngle,
  eyeGlow,
  emblemOpacity,
  letters,
  vhs,
  idPrefix,
}) => {
  const { width, height } = useVideoConfig();
  const colors: EmblemColors = {
    top: props.topSnakeColor,
    topHighlight: "#C8433D",
    bottom: props.bottomSnakeColor,
    outline: props.outlineColor,
    eye: props.eyeColor,
  };
  const s = layout.s * zoom;
  const cx = width / 2;
  const cy = height / 2;
  const filterId = `${idPrefix}-vhs`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {vhs ? (
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={width}
            height={height}
            colorInterpolationFilters="sRGB"
          >
            {/* horizontal line wobble: noise that varies mostly per scanline */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0006 0.035"
              numOctaves={1}
              seed={vhs.noiseSeed}
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={vhs.wobble}
              xChannelSelector="R"
              yChannelSelector="G"
              result="wob"
            />
            {/* chromatic aberration: red right, blue left */}
            <feColorMatrix
              in="wob"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r"
            />
            <feOffset in="r" dx={vhs.split} result="r2" />
            <feColorMatrix
              in="wob"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="g"
            />
            <feColorMatrix
              in="wob"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="b"
            />
            <feOffset in="b" dx={-vhs.split} result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </defs>
      ) : null}
      <g filter={vhs ? `url(#${filterId})` : undefined}>
        <g
          transform={`translate(${cx} ${cy}) scale(${s}) translate(${(layout.tx - cx) / layout.s} ${
            (layout.ty - cy) / layout.s
          })`}
        >
          <g
            opacity={emblemOpacity}
            transform={`translate(${layout.emblem.x} ${layout.emblem.y}) scale(${layout.emblem.k})`}
          >
            <Emblem
              topAngle={topAngle}
              bottomAngle={bottomAngle}
              eyeGlow={eyeGlow}
              colors={colors}
              idPrefix={idPrefix}
            />
          </g>
          <g
            transform={`translate(${layout.wordmark.x} ${layout.wordmark.y})`}
            fill={props.letterColor}
            stroke={props.outlineColor}
            strokeWidth={WORDMARK_OUTLINE}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {WORDMARK_LETTERS.map((letter, i) => {
              const st = letters[i];
              if (!st.visible) return null;
              const g = WORDMARK_LETTERS[st.glyph];
              return (
                <path
                  key={i}
                  d={g.d}
                  transform={`translate(${letter.x - g.x + st.dx} 0)`}
                />
              );
            })}
          </g>
        </g>
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ VHS overlays

/** Film/tape noise. `mode` picks how much of the noise becomes visible specks. */
const Noise: React.FC<{
  id: string;
  seed: number;
  freq: string;
  slope: number;
  intercept: number;
  opacity: number;
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ id, seed, freq, slope, intercept, opacity, blend = "screen" }) => {
  const { width, height } = useVideoConfig();
  // rendered at half resolution and scaled up: chunkier grain, cheaper to render
  const w = Math.ceil(width / 2);
  const h = Math.ceil(height / 2);
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        opacity,
        mixBlendMode: blend,
        imageRendering: "pixelated",
      }}
      preserveAspectRatio="none"
    >
      <filter id={id} x={0} y={0} width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} />
        <feColorMatrix
          type="matrix"
          values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${slope} 0 0 0 ${intercept}`}
        />
      </filter>
      <rect width={w} height={h} filter={`url(#${id})`} />
    </svg>
  );
};

// ------------------------------------------------------------------ main

export const MeneuroborosVHS: React.FC<MeneuroborosVHSProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const D = durationInFrames / fps;
  const I = props.vhs ? props.vhsIntensity : 0;
  const rnd = (key: string) => random(`${props.seed}-${key}`);

  const layout = getLayout(width, height, props.layout);

  // slow push-in for the whole piece
  const zoom = interpolate(t, [0, D], [0.97, 1.03], {
    ...clampOpts,
    easing: Easing.inOut(Easing.quad),
  });

  // --- the two snakes: top clockwise, bottom counter-clockwise
  const spin = spinAngle(frame, fps, props.rotationSpeed);
  const topAngle = -90 + spin;
  const bottomAngle = 110 - spin * 0.72;

  // --- emblem flickers in through the static
  const emblemP = interpolate(t, T.emblemIn, [0, 1], {
    ...clampOpts,
    easing: Easing.out(Easing.cubic),
  });
  const emblemOn = emblemP >= 1 || rnd(`emb-${frame}`) < 0.2 + 0.8 * emblemP;
  let emblemOpacity = emblemOn ? emblemP : emblemP * 0.18;
  if (emblemP >= 1 && rnd(`hold-flicker-${frame}`) < 0.035) {
    emblemOpacity = 0.55;
  }

  // --- letters glitch in one by one
  const letters: LetterState[] = WORDMARK_LETTERS.map((_, i) => {
    const start = T.lettersStart + i * T.letterStagger + (rnd(`ls-${i}`) - 0.5) * 0.05;
    const u = (t - start) / T.letterWindow;
    if (u < 0) return { visible: false, dx: 0, glyph: i };
    if (u >= 1) return { visible: true, dx: 0, glyph: i };
    const k = `l-${i}-${frame}`;
    const visible = rnd(`${k}-v`) < 0.45 + 0.55 * u;
    const dx = (rnd(`${k}-x`) - 0.5) * 30 * (1 - u);
    const wrong = rnd(`${k}-w`) < 0.4 * (1 - u);
    const glyph = wrong ? Math.floor(rnd(`${k}-g`) * WORDMARK_LETTERS.length) : i;
    return { visible, dx, glyph };
  });
  const lettersActive =
    t >= T.lettersStart &&
    t <= T.lettersStart + WORDMARK_LETTERS.length * T.letterStagger + T.letterWindow;

  // --- eyes ignite
  const eyeBase = interpolate(t, T.glow, [0, 1], { ...clampOpts, easing: Easing.inOut(Easing.cubic) });
  const eyeGlow = eyeBase * (0.85 + 0.15 * Math.sin(t * 9));

  // --- glitches
  const hitStart = Math.round((D - 1.55) * fps);
  const hit = frame >= hitStart && frame < hitStart + 3;
  const invert = frame === hitStart + 1;
  const miniChance = lettersActive ? 0.12 : emblemP >= 1 ? 0.025 : 0;
  const mini = !hit && rnd(`mini-${frame}`) < miniChance;
  const spike = hit ? 1 : mini ? 0.45 : 0;

  // --- CRT power-off at the end
  const offY = interpolate(t, [D - 0.7, D - 0.45], [1, 0.004], {
    ...clampOpts,
    easing: Easing.in(Easing.cubic),
  });
  const offX = interpolate(t, [D - 0.42, D - 0.16], [1, 0.002], {
    ...clampOpts,
    easing: Easing.in(Easing.cubic),
  });
  const offBright = interpolate(t, [D - 0.7, D - 0.45], [1, 3], clampOpts);
  const lineOpacity = interpolate(t, [D - 0.5, D - 0.45, D - 0.2, D - 0.06], [0, 1, 1, 0], clampOpts);
  const endFade = interpolate(t, [D - 0.2, D - 0.04], [1, 0], clampOpts);

  // --- per-frame tape behaviour
  const flicker = 1 + (rnd(`fl-${frame}`) - 0.5) * 0.09 * I;
  const jitterY = (rnd(`jy-${frame}`) - 0.5) * 3 * I + (hit ? (rnd(`hy-${frame}`) - 0.5) * height * 0.03 : 0);
  const jitterX = (rnd(`jx-${frame}`) - 0.5) * 1.6 * I;
  const vhsParams = props.vhs
    ? {
        wobble: (3 + spike * 26) * I * (width / 1080),
        split: (2.2 + spike * 9) * I * (width / 1080),
        noiseSeed: Math.floor(frame / 2) + props.seed * 1000,
      }
    : null;

  // screen position of the emblem's centre (same transform as LogoLayer)
  const eb = EMBLEM_BOX;
  const emblemCenter = {
    x: layout.emblem.x + layout.emblem.k * (eb.x + eb.w / 2),
    y: layout.emblem.y + layout.emblem.k * (eb.y + eb.h / 2),
  };
  const backlight = {
    x: width / 2 + zoom * (layout.s * emblemCenter.x + layout.tx - width / 2),
    y: height / 2 + zoom * (layout.s * emblemCenter.y + layout.ty - height / 2),
    r: layout.s * zoom * layout.emblem.k * eb.h * 0.95,
  };

  const layer = (idPrefix: string) => (
    <LogoLayer
      props={props}
      layout={layout}
      zoom={zoom}
      topAngle={topAngle}
      bottomAngle={bottomAngle}
      eyeGlow={eyeGlow}
      emblemOpacity={emblemOpacity}
      letters={letters}
      vhs={vhsParams}
      idPrefix={idPrefix}
    />
  );

  // horizontal tears on glitch frames: a few slices of the frame shifted sideways
  const tears =
    hit || mini
      ? Array.from({ length: hit ? 7 : 2 }, (_, k) => {
          const key = `tear-${frame}-${k}`;
          const y0 = rnd(`${key}-y`) * height;
          const h = (hit ? 0.03 + rnd(`${key}-h`) * 0.09 : 0.01 + rnd(`${key}-h`) * 0.025) * height;
          const dx = (rnd(`${key}-dx`) - 0.5) * width * (hit ? 0.14 : 0.05);
          return { y0, h, dx, k };
        })
      : [];

  const grade = props.vhs
    ? `saturate(0.62) contrast(1.14) brightness(${(flicker * offBright).toFixed(3)})${invert ? " invert(1)" : ""}`
    : `brightness(${offBright})`;

  const trackPeriod = 2.7;
  const trackP = (t % trackPeriod) / trackPeriod;
  const trackY = interpolate(trackP, [0, 1], [height * 1.1, -height * 0.15], {
    easing: Easing.inOut(Easing.sin),
  });
  const scanPeriod = Math.max(3, Math.round(height / 400));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill
        style={{
          backgroundColor: props.backgroundColor,
          scale: `${offX} ${offY}`,
          opacity: endFade,
          overflow: "hidden",
        }}
      >
        <AbsoluteFill
          style={{
            filter: grade,
            translate: `${jitterX}px ${jitterY}px`,
            backgroundColor: props.backgroundColor,
          }}
        >
          {/* dim back-light so the black outlines read as a silhouette */}
          <div
            style={{
              position: "absolute",
              left: backlight.x - backlight.r,
              top: backlight.y - backlight.r,
              width: backlight.r * 2,
              height: backlight.r * 2,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(92,90,98,0.42) 0%, rgba(60,58,66,0.22) 38%, rgba(0,0,0,0) 70%)",
              opacity: interpolate(emblemP, [0, 1], [0, 1]) * (0.9 + 0.1 * Math.sin(t * 2.3)),
            }}
          />
          {layer("logo")}
          {tears.map((tr) => (
            <AbsoluteFill
              key={tr.k}
              style={{
                clipPath: `inset(${tr.y0}px 0 ${Math.max(0, height - tr.y0 - tr.h)}px 0)`,
                translate: `${tr.dx}px 0px`,
                backgroundColor: props.backgroundColor,
              }}
            >
              {layer(`tear-${tr.k}`)}
            </AbsoluteFill>
          ))}
        </AbsoluteFill>

        {props.vhs ? (
          <>
            {/* tape grain */}
            <Noise
              id="grain"
              seed={frame + props.seed * 31}
              freq="0.9"
              slope={3.2}
              intercept={-1.72}
              opacity={0.42 * I}
            />
            {/* tracking band rolling up the frame */}
            <div
              style={{
                position: "absolute",
                left: 0,
                width,
                top: trackY,
                height: height * 0.07,
                background:
                  "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.06) 65%, transparent)",
                opacity: I,
                overflow: "hidden",
              }}
            >
              <Noise
                id="track"
                seed={frame * 3 + 1}
                freq="0.004 0.55"
                slope={3}
                intercept={-1.6}
                opacity={0.7}
              />
            </div>
            {/* head-switching noise along the bottom edge */}
            <div
              style={{
                position: "absolute",
                left: 0,
                width,
                bottom: 0,
                height: height * (0.022 + rnd(`hs-${frame}`) * 0.006),
                overflow: "hidden",
                opacity: 0.75 * I,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Noise
                id="headswitch"
                seed={frame * 7 + 3}
                freq="0.006 0.8"
                slope={2.6}
                intercept={-1.1}
                opacity={1}
              />
            </div>
            {/* scanlines */}
            <AbsoluteFill
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) ${
                  scanPeriod / 2
                }px, transparent ${scanPeriod / 2}px, transparent ${scanPeriod}px)`,
                opacity: I,
              }}
            />
            {/* vignette */}
            <AbsoluteFill
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.9) 100%)",
              }}
            />
          </>
        ) : null}

        {/* opening static (and a burst on the big glitch) */}
        <Noise
          id="snow"
          seed={frame * 13 + 5}
          freq="0.75"
          slope={1.7}
          intercept={-0.25}
          opacity={Math.max(
            interpolate(t, T.staticOut, [1, 0.85, 0], { ...clampOpts, easing: Easing.in(Easing.quad) }),
            hit ? 0.45 * Math.max(I, 0.3) : 0,
          )}
        />
      </AbsoluteFill>

      {/* bright line left behind when the picture collapses */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: lineOpacity }}>
        <div
          style={{
            width: width * offX,
            height: Math.max(2, height * 0.0025),
            backgroundColor: "#F4F1FF",
            boxShadow: `0 0 ${width * 0.02}px ${width * 0.006}px rgba(220,215,255,0.7)`,
            borderRadius: 4,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
