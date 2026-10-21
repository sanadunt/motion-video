import { Audio } from "@remotion/media";
import { zColor } from "@remotion/zod-types";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Emblem } from "./meneuroboros/Emblem";
import { EMBLEM_BOX } from "./meneuroboros/geometry";
import { getLockupLayout } from "./meneuroboros/layout";
import {
  WORDMARK_HEIGHT,
  WORDMARK_LETTERS,
  WORDMARK_OUTLINE,
  WORDMARK_WIDTH,
} from "./meneuroboros/wordmark";

export const meneuroborosMinimalSchema = z.object({
  layout: z.enum(["auto", "horizontal", "stacked"]),
  durationInSeconds: z.number().min(4).max(30),
  backgroundColor: zColor(),
  transparentBackground: z
    .boolean()
    .describe(
      "Render without background (use ProRes 4444 / WebM to keep alpha)",
    ),
  letterColor: zColor(),
  outlineColor: zColor(),
  topSnakeColor: zColor(),
  bottomSnakeColor: zColor(),
  eyeColor: zColor(),
  spinIn: z
    .number()
    .min(0)
    .max(720)
    .describe("Degrees each snake turns while settling in"),
  idleSpin: z
    .number()
    .min(0)
    .max(90)
    .describe(
      "Degrees per second the snakes keep turning (0 = stop after settling)",
    ),
  blink: z.boolean(),
  outro: z
    .boolean()
    .describe(
      "End transition: letters drop, each snake swallows itself tail-first",
    ),
  outroDuration: z.number().min(0.6).max(3).describe("Seconds"),
  sound: z
    .boolean()
    .describe("Sound effects (bundled in public/sfx/meneuroboros)"),
  soundVolume: z.number().min(0).max(1),
  shading: z
    .number()
    .min(0)
    .max(1)
    .describe("Strength of highlights and rim shading"),
});

export type MeneuroborosMinimalProps = z.infer<
  typeof meneuroborosMinimalSchema
>;

export const meneuroborosMinimalDefaults: MeneuroborosMinimalProps = {
  layout: "auto",
  durationInSeconds: 5.5,
  backgroundColor: "#FFFFFF",
  transparentBackground: false,
  letterColor: "#FFFFFF",
  outlineColor: "#000000",
  topSnakeColor: "#921C1D",
  bottomSnakeColor: "#3A3A3A",
  eyeColor: "#FFFFFF",
  spinIn: 150,
  idleSpin: 36,
  blink: true,
  outro: true,
  outroDuration: 1.3,
  sound: true,
  soundVolume: 0.9,
  shading: 1,
};

export const calculateMeneuroborosMinimalMetadata: CalculateMetadataFunction<
  MeneuroborosMinimalProps
> = ({ props }) => {
  const fps = 30;
  return { durationInFrames: Math.round(props.durationInSeconds * fps), fps };
};

// resting pose: top head upper-right, bottom head lower-right
const TOP_REST = -32;
const BOTTOM_REST = 20;

// timing in seconds
const T = {
  bottomDraw: [0.1, 1.15] as const,
  topDraw: [0.3, 1.25] as const,
  settle: [0.1, 1.7] as const,
  spinRamp: [0.4, 1.6] as const,
  pop: [0, 1.3] as const,
  lettersStart: 1.0,
  letterStagger: 0.035,
  letterRise: 0.6,
  blink: [2.7, 2.77, 2.86] as const,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const inExpo = Easing.bezier(0.7, 0, 0.84, 0);
// starts slow, finishes fast: the snake gulps the last bit (its head) quickly
const eraseEase = Easing.bezier(0.5, 0, 0.9, 0.55);

/** Outro timing as fractions of the outro window. */
const OUTRO = {
  letterStagger: 0.025,
  letterFall: 0.34,
  bottomErase: [0.06, 0.8] as const,
  topErase: [0.13, 0.84] as const,
  headsOut: [0.78, 0.94] as const,
  extraSpin: 150,
};

export const MeneuroborosMinimal: React.FC<MeneuroborosMinimalProps> = (
  props,
) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const D = durationInFrames / fps;
  // outro window [o0, D]; with outro off it sits past the end and never starts
  const O = props.outroDuration;
  const o0 = props.outro ? D - O : D + 1;
  const ot = (f: number) => o0 + f * O;

  const layout = getLockupLayout(width, height, props.layout, { fill: 0.92 });

  // the snakes draw themselves on (tail -> snout) while turning into their resting pose:
  // top clockwise, bottom counter-clockwise
  const settle = interpolate(t, T.settle, [0, 1], {
    ...clamp,
    easing: outExpo,
  });
  // continuous spin: eases in while the settle slows down, so the snakes never stop
  let idle = 0;
  for (let i = 0; i < frame; i++) {
    const ramp = interpolate(i / fps, T.spinRamp, [0, 1], {
      ...clamp,
      easing: smooth,
    });
    idle += (props.idleSpin * ramp) / fps;
  }
  // the spin speeds up as the snakes eat themselves
  const extra =
    OUTRO.extraSpin *
    interpolate(t, [o0, D], [0, 1], {
      ...clamp,
      easing: Easing.in(Easing.cubic),
    });
  const topAngle = TOP_REST - props.spinIn * (1 - settle) + idle + extra;
  const bottomAngle =
    BOTTOM_REST + props.spinIn * 0.8 * (1 - settle) - (idle + extra) * 0.8;
  const topErase = interpolate(
    t,
    [ot(OUTRO.topErase[0]), ot(OUTRO.topErase[1])],
    [0, 1],
    {
      ...clamp,
      easing: eraseEase,
    },
  );
  const bottomErase = interpolate(
    t,
    [ot(OUTRO.bottomErase[0]), ot(OUTRO.bottomErase[1])],
    [0, 1],
    { ...clamp, easing: eraseEase },
  );
  // what is left (the two heads) shrinks away
  const headsOut = interpolate(
    t,
    [ot(OUTRO.headsOut[0]), ot(OUTRO.headsOut[1])],
    [0, 1],
    {
      ...clamp,
      easing: inExpo,
    },
  );
  const topReveal = interpolate(t, T.topDraw, [0, 1], {
    ...clamp,
    easing: smooth,
  });
  const bottomReveal = interpolate(t, T.bottomDraw, [0, 1], {
    ...clamp,
    easing: smooth,
  });

  const eyeOpen = props.blink
    ? interpolate(t, T.blink, [1, 0.05, 1], clamp)
    : 1;

  // gentle scale-in of the emblem around its own centre
  const pop =
    interpolate(t, T.pop, [0.9, 1], { ...clamp, easing: outExpo }) *
    (1 - 0.12 * headsOut);
  const ec = {
    x: EMBLEM_BOX.x + EMBLEM_BOX.w / 2,
    y: EMBLEM_BOX.y + EMBLEM_BOX.h / 2,
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: props.transparentBackground
          ? "transparent"
          : props.backgroundColor,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <clipPath id="wordmark-clip">
            <rect
              x={-30}
              y={-2}
              width={WORDMARK_WIDTH + 60}
              height={WORDMARK_HEIGHT + 4}
            />
          </clipPath>
        </defs>
        <g
          transform={`translate(${layout.tx} ${layout.ty}) scale(${layout.s})`}
        >
          <g
            opacity={1 - headsOut}
            transform={`translate(${layout.emblem.x} ${layout.emblem.y}) scale(${layout.emblem.k}) translate(${ec.x} ${ec.y}) scale(${pop}) translate(${-ec.x} ${-ec.y})`}
          >
            <Emblem
              topAngle={topAngle}
              bottomAngle={bottomAngle}
              eyeGlow={0}
              colors={{
                top: props.topSnakeColor,
                topHighlight: "#C8433D",
                bottom: props.bottomSnakeColor,
                outline: props.outlineColor,
                eye: props.eyeColor,
              }}
              idPrefix="min"
              topReveal={topReveal}
              bottomReveal={bottomReveal}
              topErase={topErase}
              bottomErase={bottomErase}
              eyeOpen={eyeOpen}
              lighting={props.shading}
            />
          </g>
          <g
            transform={`translate(${layout.wordmark.x} ${layout.wordmark.y})`}
            clipPath="url(#wordmark-clip)"
            fill={props.letterColor}
            stroke={props.outlineColor}
            strokeWidth={WORDMARK_OUTLINE}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {WORDMARK_LETTERS.map((letter, i) => {
              const start = T.lettersStart + i * T.letterStagger;
              const rise = interpolate(
                t,
                [start, start + T.letterRise],
                [1, 0],
                {
                  ...clamp,
                  easing: outExpo,
                },
              );
              const fallStart = ot(i * OUTRO.letterStagger);
              const fall = interpolate(
                t,
                [fallStart, fallStart + OUTRO.letterFall * O],
                [0, 1],
                { ...clamp, easing: inExpo },
              );
              return (
                <path
                  key={i}
                  d={letter.d}
                  transform={`translate(0 ${((rise + fall) * (WORDMARK_HEIGHT + 10)).toFixed(2)})`}
                />
              );
            })}
          </g>
        </g>
      </svg>
      {props.sound ? (
        <SoundTrack
          volume={props.soundVolume}
          blink={props.blink}
          outro={props.outro}
          outroStart={o0}
          outroDuration={O}
          end={D}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ sound

const sfx = (name: string) => staticFile(`sfx/meneuroboros/${name}.wav`);

/** Synthesised SFX (scripts/sfx/meneuroboros_sfx.py), placed on the animation's beats. */
const SoundTrack: React.FC<{
  volume: number;
  blink: boolean;
  outro: boolean;
  outroStart: number;
  outroDuration: number;
  end: number;
}> = ({ volume, blink, outro, outroStart, outroDuration, end }) => {
  const { fps } = useVideoConfig();
  const at = (sec: number) => Math.max(0, Math.round(sec * fps));
  const ot = (f: number) => outroStart + f * outroDuration;
  // the pad fades in, then out with the outro (or at the very end without one)
  const padOutStart = outro ? outroStart : end - 0.6;
  const padOutEnd = outro ? ot(0.95) : end;
  return (
    <>
      <Audio
        name="Pad"
        src={sfx("pad")}
        loop
        volume={(f) =>
          volume *
          0.35 *
          interpolate(f / fps, [0, 1, padOutStart, padOutEnd], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Audio
        name="Whoosh in"
        from={at(0.05)}
        src={sfx("whoosh-in")}
        volume={volume * 0.62}
      />
      <Audio
        name="Letters"
        from={at(T.lettersStart)}
        src={sfx("letters")}
        volume={volume * 0.7}
      />
      <Audio
        name="Bite (bottom)"
        from={at(1.08)}
        src={sfx("bite")}
        volume={volume * 0.62}
      />
      <Audio
        name="Bite (top)"
        from={at(1.2)}
        src={sfx("bite")}
        playbackRate={1.3}
        volume={volume * 0.36}
      />
      <Audio
        name="Hiss"
        from={at(1.3)}
        src={sfx("hiss")}
        volume={volume * 0.6}
      />
      {blink ? (
        <Audio
          name="Blink"
          from={at(T.blink[0] - 0.01)}
          src={sfx("blink")}
          volume={volume * 0.8}
        />
      ) : null}
      {outro ? (
        <>
          <Audio
            name="Whoosh out"
            from={at(outroStart)}
            src={sfx("whoosh-out")}
            playbackRate={Math.min(
              2,
              Math.max(0.5, 1.15 / (outroDuration * 0.9)),
            )}
            volume={volume * 0.75}
          />
          <Audio
            name="Gulp"
            from={at(ot(0.8))}
            src={sfx("gulp")}
            volume={volume * 0.85}
          />
        </>
      ) : null}
    </>
  );
};
