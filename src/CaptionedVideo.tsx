/**
 * CaptionedVideo — memutar video dari folder public/ dan menampilkan caption
 * animasi (kata-per-kata) dari file JSON hasil transkripsi whisper.cpp
 * (lihat scripts/transcribe.ts).
 *
 * Props yang dipakai saat render:
 *   src          nama file video di public/, mis. "kakashi-chidori.mp4"
 *   captionsFile nama file JSON caption di public/, mis. "kakashi-chidori.captions.json"
 *
 * Durasi komposisi dan isi caption dihitung otomatis di calculateMetadata.
 */
import type { Caption } from "@remotion/captions";
import { Video } from "@remotion/media";
import { getVideoMetadata } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Interactive,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import { PoppingWordCaptions } from "./captions/PoppingWordCaptions";

export type CaptionedVideoProps = {
  src: string;
  captionsFile: string;
  captions: Caption[];
  /** Posisi atas area caption, dalam px (komposisi 1080x1920). */
  captionTop: number;
  /** Tinggi area caption, dalam px. */
  captionHeight: number;
  /** Buramkan area di belakang caption (menutup subtitle bawaan video). */
  blurBehindCaptions: boolean;
};

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  CaptionedVideoProps
> = async ({ props, abortSignal }) => {
  const [metadata, captionsResponse] = await Promise.all([
    getVideoMetadata(staticFile(props.src)),
    fetch(staticFile(props.captionsFile), { signal: abortSignal }),
  ]);

  if (!captionsResponse.ok) {
    throw new Error(
      `Tidak bisa memuat caption ${props.captionsFile}: ${captionsResponse.status}`,
    );
  }

  const captions = (await captionsResponse.json()) as Caption[];
  const fps = 30;

  return {
    fps,
    durationInFrames: Math.max(1, Math.ceil(metadata.durationInSeconds * fps)),
    props: { ...props, captions },
  };
};

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  src,
  captions,
  captionTop,
  captionHeight,
  blurBehindCaptions,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Video
        name="Source video"
        src={staticFile(src)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />

      {blurBehindCaptions ? (
        <Interactive.Div
          name="Caption backdrop"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: captionTop,
            height: captionHeight,
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            maskImage:
              "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
          }}
        />
      ) : null}

      <PoppingWordCaptions
        name="Captions"
        captions={captions}
        width={920}
        combineTokensWithinMilliseconds={1200}
        highlightColor="#FACC15"
        fontSize={72}
        style={{
          position: "absolute",
          left: 80,
          top: captionTop,
          height: captionHeight,
        }}
      />
    </AbsoluteFill>
  );
};
