/**
 * Caption gaya TikTok: halaman pendek berisi beberapa kata, kata yang sedang
 * diucapkan di-highlight dan sedikit "pop" (membesar dengan spring).
 *
 * Diadaptasi dari elemen resmi Remotion "Popping Word Captions"
 * (https://www.remotion.dev/elements/captions/popping-word-captions),
 * dengan font Montserrat ExtraBold (dibundel lokal di public/fonts) dan warna
 * highlight kuning.
 */
import type { Caption, TikTokPage, TikTokToken } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import { fitText } from "@remotion/layout-utils";
import React, { useEffect, useMemo, useState } from "react";
import {
  cancelRender,
  Interactive,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractiveTransformProps,
  type InteractivitySchema,
  type SequenceProps,
} from "remotion";

type PoppingWordCaptionsProps = InteractiveTransformProps &
  Pick<SequenceProps, "width"> & {
    readonly captions: Caption[];
    readonly combineTokensWithinMilliseconds?: number;
    readonly highlightColor?: string;
    readonly fontSize?: number;
  };

const fontWeight = "800";
const textColor = "#ffffff";
const defaultHighlightColor = "#FACC15";
const defaultFontSize = 72;
const activeWordScale = 1.03;
const activeWordLiftPx = 6;
const defaultCombineTokensWithinMilliseconds = 1200;
const defaultWidth = 920;

const poppingWordCaptionsSchema = {
  ...Interactive.captionsSchema,
  width: {
    type: "number",
    min: 1,
    step: 1,
    default: undefined,
    description: "Caption area width",
    hiddenFromList: false,
  },
  combineTokensWithinMilliseconds: {
    type: "number",
    min: 0,
    step: 50,
    default: defaultCombineTokensWithinMilliseconds,
    description: "Time between caption pages",
    hiddenFromList: false,
  },
  highlightColor: {
    type: "color",
    default: defaultHighlightColor,
    description: "Highlight color",
  },
  fontSize: {
    type: "number",
    min: 16,
    max: 200,
    step: 1,
    default: defaultFontSize,
    description: "Font size",
    hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

const fontFamily = "Montserrat Captions";
const fontLoading = loadFont({
  family: fontFamily,
  url: staticFile("fonts/Montserrat-ExtraBold.woff2"),
  weight: fontWeight,
  format: "woff2",
});
const waitUntilDone = () => fontLoading;

const isTimeWithinHalfOpenInterval = (
  timeMs: number,
  fromMs: number,
  toMs: number,
) => timeMs >= fromMs && timeMs < toMs;

const getActivePageIndex = (
  pages: readonly Pick<TikTokPage, "startMs" | "durationMs">[],
  timeMs: number,
) =>
  pages.findIndex((page) =>
    isTimeWithinHalfOpenInterval(
      timeMs,
      page.startMs,
      page.startMs + page.durationMs,
    ),
  );

const getActiveTokenIndex = (
  tokens: readonly Pick<TikTokToken, "fromMs" | "toMs">[],
  timeMs: number,
) =>
  tokens.findIndex((token) =>
    isTimeWithinHalfOpenInterval(timeMs, token.fromMs, token.toMs),
  );

const getTokenScale = ({
  currentTimeMs,
  fps,
  token,
}: {
  readonly currentTimeMs: number;
  readonly fps: number;
  readonly token: Pick<TikTokToken, "fromMs" | "toMs">;
}) => {
  if (!isTimeWithinHalfOpenInterval(currentTimeMs, token.fromMs, token.toMs)) {
    return 1;
  }

  const tokenDurationInFrames = ((token.toMs - token.fromMs) / 1000) * fps;
  const tokenLocalFrame = ((currentTimeMs - token.fromMs) / 1000) * fps;
  const animationDurationInFrames = Math.min(4, tokenDurationInFrames / 2);
  const enterProgress = spring({
    config: { damping: 200 },
    durationInFrames: animationDurationInFrames,
    fps,
    frame: tokenLocalFrame,
  });
  const exitProgress = interpolate(
    tokenLocalFrame,
    [tokenDurationInFrames - animationDurationInFrames, tokenDurationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return 1 + Math.min(enterProgress, exitProgress) * (activeWordScale - 1);
};

const CaptionPage: React.FC<{
  readonly captionAreaWidth: number | null;
  readonly currentTimeMs: number;
  readonly fps: number;
  readonly page: TikTokPage;
  readonly pageIndex: number;
  readonly highlightColor: string;
  readonly desiredFontSize: number;
}> = ({
  captionAreaWidth,
  currentTimeMs,
  fps,
  page,
  pageIndex,
  highlightColor,
  desiredFontSize,
}) => {
  const { width: compositionWidth } = useVideoConfig();
  const availableWidth = captionAreaWidth ?? compositionWidth;
  const fontSize = useMemo(() => {
    const maximumTokenWidth = Math.max(1, availableWidth / activeWordScale);
    const tokenFontSizes = page.tokens
      .map((token) => token.text.trim())
      .filter(Boolean)
      .map(
        (text) =>
          fitText({
            fontFamily,
            fontWeight,
            text,
            validateFontIsLoaded: true,
            withinWidth: maximumTokenWidth,
          }).fontSize,
      );

    return Math.min(desiredFontSize, ...tokenFontSizes);
  }, [availableWidth, desiredFontSize, page.tokens]);
  const activeTokenIndex = getActiveTokenIndex(page.tokens, currentTimeMs);
  const textStrokeWidth = fontSize / 10;

  // Halaman baru: masuk dengan sedikit pop dari bawah.
  const pageLocalFrame = ((currentTimeMs - page.startMs) / 1000) * fps;
  const pageEnter = spring({
    config: { damping: 14, stiffness: 160, mass: 0.8 },
    durationInFrames: 10,
    fps,
    frame: pageLocalFrame,
  });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          color: textColor,
          fontFamily,
          fontSize,
          fontWeight,
          lineHeight: 1.35,
          paintOrder: "stroke fill",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1,
          wordSpacing: "0.14em",
          WebkitTextStroke: `${textStrokeWidth}px #000000`,
          textShadow: "0 6px 18px rgba(0,0,0,0.6)",
          whiteSpace: "normal",
          width: "100%",
          opacity: pageEnter,
          translate: `0px ${(1 - pageEnter) * 24}px`,
          scale: 0.9 + pageEnter * 0.1,
        }}
      >
        {page.tokens.map((token, tokenIndex) => {
          const isActive = tokenIndex === activeTokenIndex;
          const visibleText = token.text.trim();
          const visibleTextIndex = token.text.indexOf(visibleText);
          const leadingWhitespace = visibleText
            ? token.text.slice(0, visibleTextIndex)
            : token.text;
          const trailingWhitespace = visibleText
            ? token.text.slice(visibleTextIndex + visibleText.length)
            : "";

          return (
            <React.Fragment
              key={`${pageIndex}-${page.startMs}-${token.fromMs}-${tokenIndex}`}
            >
              {leadingWhitespace}
              <span
                style={{
                  color: isActive ? highlightColor : textColor,
                  display: "inline-block",
                  scale: getTokenScale({ currentTimeMs, fps, token }),
                  translate: `0px ${
                    (-(getTokenScale({ currentTimeMs, fps, token }) - 1) /
                      (activeWordScale - 1)) *
                    activeWordLiftPx
                  }px`,
                  transformOrigin: "center bottom",
                  whiteSpace: "pre",
                }}
              >
                {visibleText}
              </span>
              {trailingWhitespace}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const PoppingWordCaptionsContent: React.FC<PoppingWordCaptionsProps> = ({
  captions,
  combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
  highlightColor = defaultHighlightColor,
  fontSize = defaultFontSize,
  style,
  width = defaultWidth,
}) => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    waitUntilDone()
      .then(() => {
        setFontLoaded(true);
      })
      .catch((error) => {
        cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
  }, []);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds,
        breakOnSilenceAfterMilliseconds: 700,
      }).pages,
    [captions, combineTokensWithinMilliseconds],
  );
  const currentTimeMs = (frame / fps) * 1000;
  const activePageIndex = getActivePageIndex(pages, currentTimeMs);
  const page = pages[activePageIndex];

  return (
    <div
      style={{
        width,
        ...style,
      }}
    >
      {fontLoaded && page ? (
        <CaptionPage
          key={`${activePageIndex}-${page.startMs}`}
          captionAreaWidth={width ?? null}
          currentTimeMs={currentTimeMs}
          fps={fps}
          page={page}
          pageIndex={activePageIndex}
          highlightColor={highlightColor}
          desiredFontSize={fontSize}
        />
      ) : null}
    </div>
  );
};

export const PoppingWordCaptions = Interactive.create({
  Component: PoppingWordCaptionsContent,
  componentName: "<PoppingWordCaptions>",
  schema: poppingWordCaptionsSchema,
});
