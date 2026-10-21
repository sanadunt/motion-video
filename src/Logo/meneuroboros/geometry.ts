// Geometry for the animated Meneuroboros emblem: two ouroboros snakes.
// Emblem units: origin = centre of the bottom (black) snake. SVG angles: 0deg = +x, clockwise.

export type SnakeSpec = {
  /** centre of the ring the snake lies on */
  readonly cx: number;
  readonly cy: number;
  /** radius of the body centreline */
  readonly r: number;
  /** half of the body thickness (fill only) */
  readonly hw: number;
  /** black outline width (drawn behind the fill, so half of it shows) */
  readonly outline: number;
  /** +1 = head leads clockwise, -1 = head leads counter-clockwise */
  readonly dir: 1 | -1;
  /** head length along the centreline, in degrees */
  readonly headSweep: number;
  /** how far the snout overlaps the tail tip, in degrees */
  readonly bite: number;
};

// Bottom snake: the big ring (moves counter-clockwise).
export const BOTTOM: SnakeSpec = {
  cx: 0,
  cy: 0,
  r: 89,
  hw: 18,
  outline: 14,
  dir: -1,
  headSweep: 40,
  bite: 9,
};

// Top snake: the red ring (moves clockwise). Sits low enough to dip into the bottom ring's hole.
export const TOP: SnakeSpec = {
  cx: 6,
  cy: -112,
  r: 52.5,
  hw: 6.5,
  outline: 13,
  dir: 1,
  headSweep: 34,
  bite: 8,
};

/** Bounding box of the emblem in emblem units, with room for the head bulge and outline. */
const EMBLEM_TOP = TOP.cy - TOP.r - TOP.hw * 1.5 - TOP.outline / 2 - 2;
const EMBLEM_EXTENT = BOTTOM.r + BOTTOM.hw * 1.45 + BOTTOM.outline / 2;
export const EMBLEM_BOX = {
  x: -EMBLEM_EXTENT,
  y: EMBLEM_TOP,
  w: EMBLEM_EXTENT * 2,
  h: EMBLEM_EXTENT - EMBLEM_TOP,
} as const;

const rad = (d: number) => (d * Math.PI) / 180;
const fmt = (v: number) => v.toFixed(2);

/** Sweep (degrees, unsigned) of the body from tail tip to neck. */
export const bodySweep = (s: SnakeSpec) => 360 - s.headSweep + s.bite;

const easeOutSine = (x: number) => Math.sin((Math.min(1, Math.max(0, x)) * Math.PI) / 2);

/** Half-width of the body at u in [0,1] (0 = tail tip, 1 = neck). */
const bodyWidth = (s: SnakeSpec, u: number) => s.hw * (0.12 + 0.88 * easeOutSine(u / 0.24));

/** Half-width of the head at v in [0,1] (0 = neck, 1 = snout tip). */
export const headWidth = (s: SnakeSpec, v: number) => {
  const swell = 0.94 + 0.5 * Math.sin(Math.PI * Math.min(1, v / 0.85));
  const round = v > 0.62 ? Math.sqrt(Math.max(0, 1 - ((v - 0.62) / 0.38) ** 2)) : 1;
  return s.hw * swell * round;
};

/**
 * Closed outline of a strip that follows the snake's ring between two angles,
 * with a half-width given by `w(t)` for t in [0,1].
 */
const ribbon = (
  s: SnakeSpec,
  startDeg: number,
  sweepDeg: number,
  w: (t: number) => number,
  steps: number,
) => {
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = rad(startDeg + s.dir * sweepDeg * t);
    const hw = w(t);
    const c = Math.cos(a);
    const n = Math.sin(a);
    outer.push(`${fmt(s.cx + (s.r + hw) * c)} ${fmt(s.cy + (s.r + hw) * n)}`);
    inner.push(`${fmt(s.cx + (s.r - hw) * c)} ${fmt(s.cy + (s.r - hw) * n)}`);
  }
  inner.reverse();
  return `M${outer.join("L")}L${inner.join("L")}Z`;
};

/** Tail tip angle is 0deg in the snake's own frame; rotate the group to move it. */
export const bodyPath = (s: SnakeSpec) =>
  ribbon(s, 0, bodySweep(s), (t) => bodyWidth(s, t), 180);

export const headPath = (s: SnakeSpec) =>
  ribbon(s, s.dir * (bodySweep(s) - 1.5), s.headSweep + 1.5, (t) => headWidth(s, t), 48);

/** Angle (degrees) of a point along the head, v in [0,1]. */
export const headAngle = (s: SnakeSpec, v: number) => s.dir * (bodySweep(s) + s.headSweep * v);

/** Point on the ring at angle `deg`, offset `off` outward from the centreline. */
export const ringPoint = (s: SnakeSpec, deg: number, off = 0) => {
  const a = rad(deg);
  return {x: s.cx + (s.r + off) * Math.cos(a), y: s.cy + (s.r + off) * Math.sin(a)};
};

/** Arc along the centreline (radius r + off) between two angles in the snake's frame. */
export const arcPath = (s: SnakeSpec, fromDeg: number, toDeg: number, off = 0) => {
  const p0 = ringPoint(s, fromDeg, off);
  const p1 = ringPoint(s, toDeg, off);
  const sweep = toDeg - fromDeg;
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  const cw = sweep > 0 ? 1 : 0;
  const rr = s.r + off;
  return `M${fmt(p0.x)} ${fmt(p0.y)}A${fmt(rr)} ${fmt(rr)} 0 ${large} ${cw} ${fmt(p1.x)} ${fmt(p1.y)}`;
};
