import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Font dibundel di public/fonts, tidak boleh dari jaringan saat render.
 * Sesuaikan nama file dengan isi public/fonts di repo.
 */
const FONTS = [
  {family: 'Montserrat', file: 'fonts/Montserrat-Bold.woff2', weight: '700'},
  {family: 'Montserrat', file: 'fonts/Montserrat-ExtraBold.woff2', weight: '800'},
  {family: 'Inter', file: 'fonts/Inter-Regular.woff2', weight: '400'},
  {family: 'Inter', file: 'fonts/Inter-SemiBold.woff2', weight: '600'},
  // Analog horror / arsip (RipperTape)
  {family: 'Special Elite', file: 'fonts/SpecialElite-Regular.woff2', weight: '400'},
  {family: 'Courier Prime', file: 'fonts/CourierPrime-Regular.woff2', weight: '400'},
  {family: 'Courier Prime', file: 'fonts/CourierPrime-Bold.woff2', weight: '700'},
  {family: 'EB Garamond', file: 'fonts/EBGaramond-Medium.woff2', weight: '500'},
] as const;

let loaded: Promise<void[]> | null = null;

/** Panggil sekali di level modul komponen: `ensureFonts();` */
export const ensureFonts = () => {
  if (!loaded) {
    loaded = Promise.all(
      FONTS.map((f) =>
        loadFont({family: f.family, url: staticFile(f.file), weight: f.weight}),
      ),
    );
  }
  return loaded;
};
