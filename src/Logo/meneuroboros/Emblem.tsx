import React from "react";
import { interpolateColors } from "remotion";
import {
  arcPath,
  BOTTOM,
  bodyPath,
  bodySweep,
  headAngle,
  headPath,
  headWidth,
  ringPoint,
  SnakeSpec,
  TOP,
} from "./geometry";

export type EmblemColors = {
  readonly top: string;
  readonly topHighlight: string;
  readonly bottom: string;
  readonly outline: string;
  readonly eye: string;
};

type Props = {
  /** rotation of the top snake in degrees (clockwise positive) */
  readonly topAngle: number;
  /** rotation of the bottom snake in degrees (clockwise positive) */
  readonly bottomAngle: number;
  /** 0 = plain white eyes, 1 = fully glowing eyes */
  readonly eyeGlow: number;
  readonly colors: EmblemColors;
  readonly idPrefix: string;
};

const rot = (s: SnakeSpec, deg: number) => `rotate(${deg.toFixed(3)} ${s.cx} ${s.cy})`;

const Eyes: React.FC<{
  s: SnakeSpec;
  size: number;
  glow: number;
  color: string;
  filterId: string;
}> = ({ s, size, glow, color, filterId }) => {
  const v = 0.5;
  const a = headAngle(s, v);
  const w = headWidth(s, v);
  const core = interpolateColors(glow, [0, 1], ["#FFFFFF", color]);
  return (
    <>
      {[-1, 1].map((side) => {
        const p = ringPoint(s, a, side * w * 0.55);
        return (
          <g key={side}>
            <circle
              cx={p.x}
              cy={p.y}
              r={size * 1.9}
              fill={color}
              opacity={glow * 0.75}
              filter={`url(#${filterId})`}
            />
            <ellipse
              cx={p.x}
              cy={p.y}
              rx={size}
              ry={size * 0.7}
              fill={core}
              transform={`rotate(${a + 90} ${p.x} ${p.y})`}
            />
          </g>
        );
      })}
    </>
  );
};

/** One snake: tapered body, segmented back, head biting its own tail, two eyes. */
const Snake: React.FC<{
  s: SnakeSpec;
  angle: number;
  fill: string;
  scaleColor: string;
  scaleOpacity: number;
  outline: string;
  eyeSize: number;
  eyeGlow: number;
  eyeColor: string;
  glowFilterId: string;
  marks?: string;
}> = ({
  s,
  angle,
  fill,
  scaleColor,
  scaleOpacity,
  outline,
  eyeSize,
  eyeGlow,
  eyeColor,
  glowFilterId,
  marks,
}) => {
  const sweep = bodySweep(s);
  const scaleFrom = s.dir * sweep * 0.3;
  const scaleTo = s.dir * (sweep - 4);
  const dash = s.hw * 0.42;
  return (
    <g transform={rot(s, angle)}>
      <path
        d={bodyPath(s)}
        fill={fill}
        stroke={outline}
        strokeWidth={s.outline}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path
        d={arcPath(s, scaleFrom, scaleTo)}
        fill="none"
        stroke={scaleColor}
        strokeOpacity={scaleOpacity}
        strokeWidth={s.hw * 1.25}
        strokeDasharray={`${dash.toFixed(2)} ${(dash * 1.6).toFixed(2)}`}
      />
      {marks
        ? [0.55, 0.8].map((u) => {
            const p = ringPoint(s, s.dir * sweep * u);
            const a = s.dir * sweep * u;
            return (
              <ellipse
                key={u}
                cx={p.x}
                cy={p.y}
                rx={s.hw * 1.05}
                ry={s.hw * 0.17}
                fill={marks}
                transform={`rotate(${a + 90} ${p.x} ${p.y})`}
              />
            );
          })
        : null}
      <path
        d={headPath(s)}
        fill={fill}
        stroke={outline}
        strokeWidth={s.outline}
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      {/* faint centre ridge on the head */}
      <path
        d={arcPath(s, headAngle(s, 0.12), headAngle(s, 0.78))}
        fill="none"
        stroke="#000000"
        strokeOpacity={0.35}
        strokeWidth={s.hw * 0.16}
        strokeLinecap="round"
      />
      <Eyes s={s} size={eyeSize} glow={eyeGlow} color={eyeColor} filterId={glowFilterId} />
    </g>
  );
};

/** Clip shape that follows a rotated snake (body + head). */
const SnakeClip: React.FC<{ id: string; s: SnakeSpec; angle: number }> = ({ id, s, angle }) => (
  <clipPath id={id}>
    <path d={bodyPath(s)} transform={rot(s, angle)} />
    <path d={headPath(s)} transform={rot(s, angle)} />
  </clipPath>
);

export const Emblem: React.FC<Props> = ({ topAngle, bottomAngle, eyeGlow, colors, idPrefix }) => {
  const ids = {
    glow: `${idPrefix}-glow`,
    topClip: `${idPrefix}-top-clip`,
    bottomClip: `${idPrefix}-bottom-clip`,
    front: `${idPrefix}-front`,
    shade: `${idPrefix}-shade`,
  };

  const top = (
    <>
      <Snake
        s={TOP}
        angle={topAngle}
        fill={colors.top}
        scaleColor="#000000"
        scaleOpacity={0.2}
        outline={colors.outline}
        eyeSize={2.3}
        eyeGlow={eyeGlow}
        eyeColor={colors.eye}
        glowFilterId={ids.glow}
      />
      {/* static light: highlight on the upper-left of the red ring */}
      <g clipPath={`url(#${ids.topClip})`}>
        <path
          d={arcPath(TOP, 195, 262, TOP.hw * 0.45)}
          fill="none"
          stroke={colors.topHighlight}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </g>
    </>
  );

  // the top ring is in front of the bottom ring on its right half, behind on its left half
  const frontW = 400;

  return (
    <g>
      <defs>
        <filter id={ids.glow} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation={1.6} />
        </filter>
        <SnakeClip id={ids.topClip} s={TOP} angle={topAngle} />
        <SnakeClip id={ids.bottomClip} s={BOTTOM} angle={bottomAngle} />
        <clipPath id={ids.front}>
          <rect x={TOP.cx} y={TOP.cy - 200} width={frontW} height={400} />
        </clipPath>
        <radialGradient
          id={ids.shade}
          gradientUnits="userSpaceOnUse"
          cx={BOTTOM.cx}
          cy={BOTTOM.cy}
          r={BOTTOM.r + BOTTOM.hw * 1.5}
        >
          <stop offset={0.62} stopColor="#000000" stopOpacity={0.55} />
          <stop offset={0.74} stopColor="#000000" stopOpacity={0} />
          <stop offset={0.86} stopColor="#000000" stopOpacity={0} />
          <stop offset={1} stopColor="#000000" stopOpacity={0.35} />
        </radialGradient>
      </defs>

      {top}

      <Snake
        s={BOTTOM}
        angle={bottomAngle}
        fill={colors.bottom}
        scaleColor="#FFFFFF"
        scaleOpacity={0.07}
        outline={colors.outline}
        eyeSize={4.6}
        eyeGlow={eyeGlow}
        eyeColor={colors.eye}
        glowFilterId={ids.glow}
        marks={colors.top}
      />
      {/* static light on the bottom ring: rim shading + two sheens */}
      <g clipPath={`url(#${ids.bottomClip})`}>
        <circle cx={BOTTOM.cx} cy={BOTTOM.cy} r={BOTTOM.r + BOTTOM.hw * 1.5} fill={`url(#${ids.shade})`} />
        <path
          d={arcPath(BOTTOM, 200, 262, BOTTOM.hw * 0.35)}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.28}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={arcPath(BOTTOM, 55, 125, -BOTTOM.hw * 0.55)}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity={0.14}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>

      <g clipPath={`url(#${ids.front})`}>{top}</g>
    </g>
  );
};
