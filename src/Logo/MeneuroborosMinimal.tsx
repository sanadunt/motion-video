import { zColor } from "@remotion/zod-types";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
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
  durationInSeconds: z.number().min(3).max(30),
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
  durationInSeconds: 4.5,
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

export const MeneuroborosMinimal: React.FC<MeneuroborosMinimalProps> = (
  props,
) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

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
  const topAngle = TOP_REST - props.spinIn * (1 - settle) + idle;
  const bottomAngle =
    BOTTOM_REST + props.spinIn * 0.8 * (1 - settle) - idle * 0.8;
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
  const pop = interpolate(t, T.pop, [0.9, 1], { ...clamp, easing: outExpo });
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
              return (
                <path
                  key={i}
                  d={letter.d}
                  transform={`translate(0 ${(rise * (WORDMARK_HEIGHT + 10)).toFixed(2)})`}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
