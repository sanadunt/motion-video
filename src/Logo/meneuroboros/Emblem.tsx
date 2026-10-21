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
  /** 0..1, how much of the top snake is drawn (tail to snout). Default 1. */
  readonly topReveal?: number;
  /** 0..1, how much of the bottom snake is drawn (tail to snout). Default 1. */
  readonly bottomReveal?: number;
  /** 0..1, how much of the top snake is eaten away, tail first, snout last. Default 0. */
  readonly topErase?: number;
  /** 0..1, same for the bottom snake. Default 0. */
  readonly bottomErase?: number;
  /** 0..1, eyelid opening (1 = open). Default 1. */
  readonly eyeOpen?: number;
  /** 0..1, strength of the static highlights/shading. Default 1. */
  readonly lighting?: number;
};

const rot = (s: SnakeSpec, deg: number) =>
  `rotate(${deg.toFixed(3)} ${s.cx} ${s.cy})`;

const Eyes: React.FC<{
  s: SnakeSpec;
  size: number;
  glow: number;
  color: string;
  filterId: string;
  open: number;
}> = ({ s, size, glow, color, filterId, open }) => {
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
              ry={size * 0.7 * Math.max(0.06, open)}
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
  reveal: number;
  erase: number;
  maskId: string;
  eyeOpen: number;
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
  reveal,
  erase,
  maskId,
  eyeOpen,
}) => {
  const sweep = bodySweep(s);
  const masked = reveal < 1 || erase > 0;
  // the snake is "drawn" tail -> neck, then neck -> snout. Body and head get separate masks
  // because the snout overlaps the tail tip.
  const headSpan = s.headSweep + 4;
  const total = sweep + headSpan;
  const bodyReveal = Math.min(1, Math.max(0, (reveal * total) / sweep));
  const headReveal = Math.min(
    1,
    Math.max(0, (reveal * total - sweep) / headSpan),
  );
  // erase runs over the whole snake too: body from the tail, then the head up to the snout
  const bodyErase = Math.min(1, Math.max(0, (erase * total) / sweep));
  const headErase = Math.min(
    1,
    Math.max(0, (erase * total - sweep) / headSpan),
  );
  const line = (from: number, to: number, steps: number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const p = ringPoint(s, s.dir * (from + ((to - from) * i) / steps));
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(" ");
  // just wide enough to cover body / head + outline, so the round leading edge
  // never uncovers the neck end that lies next to the tail tip
  const bodyMaskWidth = 2 * (s.hw + s.outline / 2 + 2);
  const headMaskWidth = 2 * (s.hw * 1.5 + s.outline / 2 + 2);
  const pad = headMaskWidth;
  const maskBox = {
    x: s.cx - s.r - pad,
    y: s.cy - s.r - pad,
    width: (s.r + pad) * 2,
    height: (s.r + pad) * 2,
  };
  const scaleFrom = s.dir * sweep * 0.3;
  const scaleTo = s.dir * (sweep - 4);
  const dash = s.hw * 0.42;
  return (
    <g transform={rot(s, angle)}>
      {masked ? (
        <defs>
          <mask id={`${maskId}-body`} maskUnits="userSpaceOnUse" {...maskBox}>
            {bodyReveal - bodyErase > 0.0005 ? (
              <polyline
                points={line(0, sweep, 120)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={bodyMaskWidth}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${(bodyReveal - bodyErase).toFixed(4)} 2`}
                strokeDashoffset={-bodyErase}
              />
            ) : null}
          </mask>
          <mask id={`${maskId}-head`} maskUnits="userSpaceOnUse" {...maskBox}>
            {headReveal - headErase > 0.0005 ? (
              <polyline
                points={line(sweep - 3, sweep + headSpan, 24)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={headMaskWidth}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${(headReveal - headErase).toFixed(4)} 2`}
                strokeDashoffset={-headErase}
              />
            ) : null}
          </mask>
        </defs>
      ) : null}
      <g mask={masked ? `url(#${maskId}-body)` : undefined}>
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
      </g>
      <g mask={masked ? `url(#${maskId}-head)` : undefined}>
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
        <Eyes
          s={s}
          size={eyeSize}
          glow={eyeGlow}
          color={eyeColor}
          filterId={glowFilterId}
          open={eyeOpen}
        />
      </g>
    </g>
  );
};

/** Clip shape that follows a rotated snake (body + head). */
const SnakeClip: React.FC<{ id: string; s: SnakeSpec; angle: number }> = ({
  id,
  s,
  angle,
}) => (
  <clipPath id={id}>
    <path d={bodyPath(s)} transform={rot(s, angle)} />
    <path d={headPath(s)} transform={rot(s, angle)} />
  </clipPath>
);

export const Emblem: React.FC<Props> = ({
  topAngle,
  bottomAngle,
  eyeGlow,
  colors,
  idPrefix,
  topReveal = 1,
  bottomReveal = 1,
  topErase = 0,
  bottomErase = 0,
  eyeOpen = 1,
  lighting = 1,
}) => {
  // highlights only appear once the whole snake (incl. head) is drawn
  const gate = (r: number) => Math.min(1, Math.max(0, (r - 0.985) / 0.015));
  // ...and switch off as soon as the tail starts being eaten
  const ungate = (e: number) => Math.min(1, Math.max(0, 1 - e / 0.04));
  const topLight = lighting * gate(topReveal) * ungate(topErase);
  const bottomLight = lighting * gate(bottomReveal) * ungate(bottomErase);
  const ids = {
    glow: `${idPrefix}-glow`,
    topClip: `${idPrefix}-top-clip`,
    bottomClip: `${idPrefix}-bottom-clip`,
    front: `${idPrefix}-front`,
    shade: `${idPrefix}-shade`,
    topMask: `${idPrefix}-top-mask`,
    bottomMask: `${idPrefix}-bottom-mask`,
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
        reveal={topReveal}
        erase={topErase}
        maskId={ids.topMask}
        eyeOpen={eyeOpen}
      />
      {/* static light: highlight on the upper-left of the red ring */}
      <g clipPath={`url(#${ids.topClip})`} opacity={topLight}>
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
        reveal={bottomReveal}
        erase={bottomErase}
        maskId={ids.bottomMask}
        eyeOpen={eyeOpen}
      />
      {/* static light on the bottom ring: rim shading + two sheens */}
      <g clipPath={`url(#${ids.bottomClip})`} opacity={bottomLight}>
        <circle
          cx={BOTTOM.cx}
          cy={BOTTOM.cy}
          r={BOTTOM.r + BOTTOM.hw * 1.5}
          fill={`url(#${ids.shade})`}
        />
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
