import {useVideoConfig} from 'remotion';

export type Orientation = 'portrait' | 'landscape' | 'square';

export type Layout = {
  width: number;
  height: number;
  orientation: Orientation;
  /** 1 unit = 1 px pada sisi pendek 1080. Kalikan semua ukuran desain dengan u. */
  u: number;
  /** Margin aman: 80 (portrait/square) atau 100 (landscape), sudah dikali u. */
  safe: number;
  contentWidth: number;
  contentHeight: number;
  /** Konversi ukuran desain (basis sisi pendek 1080) ke piksel. */
  px: (n: number) => number;
  /** Pilih nilai per orientasi. */
  pick: <T>(values: Record<Orientation, T>) => T;
};

export const getLayout = (width: number, height: number): Layout => {
  const orientation: Orientation =
    width === height ? 'square' : width > height ? 'landscape' : 'portrait';
  const u = Math.min(width, height) / 1080;
  const safe = (orientation === 'landscape' ? 100 : 80) * u;
  return {
    width,
    height,
    orientation,
    u,
    safe,
    contentWidth: width - 2 * safe,
    contentHeight: height - 2 * safe,
    px: (n) => n * u,
    pick: (values) => values[orientation],
  };
};

/** Pakai ini di setiap komponen, jangan hardcode 1080/1920. */
export const useLayout = (): Layout => {
  const {width, height} = useVideoConfig();
  return getLayout(width, height);
};
