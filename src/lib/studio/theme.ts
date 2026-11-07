/**
 * Token gaya default studio. Komponen menerima warna lewat props,
 * dan nilai di sini hanya menjadi defaultProps. Kalau ada brand lain,
 * buat objek tema baru dengan bentuk yang sama, jangan ubah yang ini.
 */
export const theme = {
  bgFrom: '#0F0F1A',
  bgTo: '#1E1B4B',
  accent: '#8B5CF6',
  accent2: '#FACC15',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.72)',
  fontHeading: 'Montserrat',
  fontBody: 'Inter',
} as const;

export type Theme = {[K in keyof typeof theme]: string};

/** Gradien background default. `angle` dalam derajat CSS. */
export const bgGradient = (
  from: string = theme.bgFrom,
  to: string = theme.bgTo,
  angle = 160,
) => `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;

/** Fallback stack supaya teks tetap tampil kalau font gagal dimuat. */
export const fontStack = (family: string) =>
  `${family}, Inter, "Helvetica Neue", Arial, sans-serif`;
