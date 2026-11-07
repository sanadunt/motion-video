import {Easing, interpolate, spring} from 'remotion';

type SpringConfig = NonNullable<Parameters<typeof spring>[0]['config']>;

/** Detik → frame. Tulis timing dalam detik, simpan sebagai frame. */
export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);

/** Kurva standar. Jangan pakai linear untuk gerak elemen. */
export const EASE = {
  /** Masuk: cepat di awal, mendarat lembut. Default untuk entrance. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Pindah posisi atau push kamera. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Keluar: pelan di awal, cepat di akhir. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Masuk dengan sedikit overshoot. */
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** Preset spring. Ubah satu parameter per percobaan, destinasi tetap. */
export const SPRING = {
  smooth: {damping: 200},
  snappy: {damping: 20, stiffness: 200},
  bouncy: {damping: 12, stiffness: 140},
  heavy: {damping: 15, stiffness: 80, mass: 2},
} satisfies Record<string, Partial<SpringConfig>>;

/** Progres 0→1 dari `start` selama `duration` frame, selalu di-clamp. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.out,
) =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Spring 0→1 dengan delay. */
export const springIn = (opts: {
  frame: number;
  fps: number;
  delay?: number;
  config?: Partial<SpringConfig>;
  durationInFrames?: number;
}) =>
  spring({
    frame: opts.frame,
    fps: opts.fps,
    delay: opts.delay ?? 0,
    config: opts.config ?? SPRING.snappy,
    durationInFrames: opts.durationInFrames,
  });

/** Selubung masuk-tahan-keluar: 0 → 1 → 0. */
export const envelope = (opts: {
  frame: number;
  inStart: number;
  inDuration: number;
  outStart: number;
  outDuration: number;
}) =>
  Math.min(
    progress(opts.frame, opts.inStart, opts.inDuration, EASE.out),
    1 - progress(opts.frame, opts.outStart, opts.outDuration, EASE.in),
  );

/** Interpolasi nilai (bukan waktu). `t` biasanya sudah di-ease. */
export const mix = (t: number, from: number, to: number) => from + (to - from) * t;

/**
 * Perkiraan waktu baca minimum (patokan kasar, tetap cek dengan membaca keras):
 * 0,5 dtk + 0,3 dtk per kata, minimal 1,5 dtk.
 */
export const readingFrames = (text: string, fps: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return sec(Math.max(1.5, 0.5 + words * 0.3), fps);
};
