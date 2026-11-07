import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import type {z} from 'zod';

export const FORMATS = {
  Portrait: {width: 1080, height: 1920},
  Landscape: {width: 1920, height: 1080},
  Square: {width: 1080, height: 1080},
} as const;

export type FormatName = keyof typeof FORMATS;

export const DEFAULT_FPS = 30;

/** Durasi diambil dari prop `durationInSeconds` supaya bisa diubah di Studio. */
export const durationFromProps =
  <P extends Record<string, unknown> & {durationInSeconds: number}>(
    fps = DEFAULT_FPS,
  ): CalculateMetadataFunction<P> =>
  ({props}) => ({
    durationInFrames: Math.max(1, Math.round(props.durationInSeconds * fps)),
  });

type DurationSchema = z.ZodObject<{durationInSeconds: z.ZodNumber}>;

type VariantsProps<S extends DurationSchema> = {
  /** Id dasar tanpa akhiran, contoh "LowerThird". */
  id: string;
  component: React.FC<z.infer<S>>;
  schema: S;
  defaultProps: z.infer<S>;
  fps?: number;
  formats?: FormatName[];
};

/**
 * Mendaftarkan varian -Portrait / -Landscape / -Square sekaligus.
 * Taruh di dalam <Folder name="Templates"> dsb. di Root.tsx.
 */
export const FormatVariants = <S extends DurationSchema>({
  id,
  component,
  schema,
  defaultProps,
  fps = DEFAULT_FPS,
  formats = ['Portrait', 'Landscape', 'Square'],
}: VariantsProps<S>) => (
  <>
    {formats.map((f) => (
      <Composition
        key={f}
        id={`${id}-${f}`}
        component={component}
        schema={schema}
        defaultProps={defaultProps}
        width={FORMATS[f].width}
        height={FORMATS[f].height}
        fps={fps}
        durationInFrames={Math.round(defaultProps.durationInSeconds * fps)}
        calculateMetadata={({props}: {props: unknown}) => ({
          durationInFrames: Math.max(
            1,
            Math.round((props as {durationInSeconds: number}).durationInSeconds * fps),
          ),
        })}
      />
    ))}
  </>
);
