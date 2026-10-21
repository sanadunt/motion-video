import { EMBLEM_BOX } from "./geometry";
import { WORDMARK_HEIGHT, WORDMARK_WIDTH } from "./wordmark";

export type LockupMode = "auto" | "horizontal" | "stacked";

/** Where the wordmark sits relative to the emblem centre in the original horizontal lockup. */
const LOCKUP_WORDMARK = { x: -673, y: -56 };

export type Layout = {
  /** logo units -> pixels */
  readonly s: number;
  /** pixel offset of the logo-unit origin */
  readonly tx: number;
  readonly ty: number;
  readonly emblem: { x: number; y: number; k: number };
  readonly wordmark: { x: number; y: number };
  readonly horizontal: boolean;
};

/**
 * Fits the Meneuroboros lockup into the frame inside the safe margin
 * (80 px portrait/square, 100 px landscape).
 * Horizontal = the original lockup (wordmark across the emblem);
 * stacked = emblem on top, wordmark underneath.
 */
export const getLockupLayout = (
  width: number,
  height: number,
  mode: LockupMode,
  options: { stackEmblemScale?: number; stackGap?: number; fill?: number } = {},
): Layout => {
  const { stackEmblemScale = 2.8, stackGap = 46, fill = 0.9 } = options;
  const horizontal =
    mode === "horizontal" || (mode === "auto" && width / height >= 1.3);
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
    const k = stackEmblemScale;
    emblem = { x: 0, y: 0, k };
    wordmark = { x: -WORDMARK_WIDTH / 2, y: k * (eb.y + eb.h) + stackGap };
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
  const s =
    Math.min((width - 2 * margin) / bw, (height - 2 * margin) / bh) * fill;
  return {
    s,
    tx: width / 2 - s * (box.x0 + bw / 2),
    ty: height / 2 - s * (box.y0 + bh / 2),
    emblem,
    wordmark,
    horizontal,
  };
};
