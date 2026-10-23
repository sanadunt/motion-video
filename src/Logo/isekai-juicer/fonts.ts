import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Font untuk logo Isekai Juicer. Semua dibundel di public/fonts supaya render
 * tidak bergantung pada jaringan (lokal maupun GitHub Actions).
 *
 * - Cinzel Decorative Black : "ISEKAI"  -> nuansa fantasi / dunia lain
 * - Luckiest Guy            : "JUICER"  -> chunky, ceria, ala kedai jus
 * - Lilita One              : tagline
 */
export const FONT_ISEKAI = "Cinzel Decorative Logo";
export const FONT_JUICER = "Luckiest Guy Logo";
export const FONT_TAGLINE = "Lilita One Logo";

loadFont({
  family: FONT_ISEKAI,
  url: staticFile("fonts/CinzelDecorative-Black.woff2"),
  weight: "900",
  format: "woff2",
});

loadFont({
  family: FONT_JUICER,
  url: staticFile("fonts/LuckiestGuy-Regular.woff2"),
  weight: "400",
  format: "woff2",
});

loadFont({
  family: FONT_TAGLINE,
  url: staticFile("fonts/LilitaOne-Regular.woff2"),
  weight: "400",
  format: "woff2",
});
