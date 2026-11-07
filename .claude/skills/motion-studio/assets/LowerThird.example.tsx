/**
 * POLA REFERENSI, bukan aset terdaftar. Salin ke src/Templates/LowerThird.tsx
 * saat diminta, lalu sesuaikan. Menunjukkan: schema zod (editable di Studio),
 * durasi dari props, layout responsif, timing per beat, dan easing/spring.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {
  EASE,
  SPRING,
  ensureFonts,
  fontStack,
  mix,
  progress,
  readingFrames,
  sec,
  springIn,
  theme,
  useLayout,
} from '../../../../src/lib/studio';

ensureFonts();

export const lowerThirdSchema = z.object({
  name: z.string(),
  role: z.string(),
  accent: zColor(),
  textColor: zColor(),
  panelColor: zColor(),
  durationInSeconds: z.number().min(2).max(30),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const lowerThirdDefaults: LowerThirdProps = {
  name: 'Iqbal Ramadhan',
  role: 'Motion Designer',
  accent: theme.accent,
  textColor: theme.text,
  panelColor: 'rgba(15,15,26,0.82)',
  durationInSeconds: 5,
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  accent,
  textColor,
  panelColor,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const L = useLayout();

  // BEATS (frame lokal). Satu sumber kebenaran; revisi cukup ubah angka di sini.
  const T = {
    bar: 0, // aksen tumbuh dulu (mata ke sini)
    name: sec(0.15, fps), // nama menyusul
    role: sec(0.3, fps), // peran 0,15 dtk setelahnya
    exitStart: durationInFrames - sec(0.5, fps),
    exitDur: sec(0.4, fps),
  };
  // Teks harus terbaca sebelum keluar. Kalau props terlalu pendek, keluar ditunda.
  const minExit = T.role + readingFrames(`${name} ${role}`, fps);
  T.exitStart = Math.max(T.exitStart, Math.min(minExit, durationInFrames - T.exitDur));

  const bar = progress(frame, T.bar, sec(0.4, fps), EASE.out);
  const nameIn = springIn({frame, fps, delay: T.name, config: SPRING.snappy});
  const roleIn = springIn({frame, fps, delay: T.role, config: SPRING.smooth});
  const exit = progress(frame, T.exitStart, T.exitDur, EASE.in);

  const fontName = L.px(L.pick({portrait: 64, landscape: 56, square: 60}));
  const fontRole = fontName * 0.55;
  const barW = L.px(10);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: L.safe,
          bottom: L.safe + L.px(L.pick({portrait: 240, landscape: 40, square: 80})),
          maxWidth: L.contentWidth * L.pick({portrait: 1, landscape: 0.6, square: 0.85}),
          display: 'flex',
          gap: L.px(24),
          padding: `${L.px(24)}px ${L.px(32)}px`,
          background: panelColor,
          borderRadius: L.px(20),
          opacity: 1 - exit,
          transform: `translateY(${mix(exit, 0, L.px(40))}px)`,
        }}
      >
        <div
          style={{
            width: barW,
            borderRadius: barW,
            background: accent,
            transform: `scaleY(${bar})`,
            transformOrigin: 'bottom',
          }}
        />
        <div style={{overflow: 'hidden'}}>
          <div
            style={{
              fontFamily: fontStack(theme.fontHeading),
              fontWeight: 800,
              fontSize: fontName,
              lineHeight: 1.1,
              color: textColor,
              opacity: nameIn,
              transform: `translateY(${mix(nameIn, L.px(30), 0)}px)`,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: fontStack(theme.fontBody),
              fontWeight: 600,
              fontSize: fontRole,
              marginTop: L.px(8),
              color: textColor,
              opacity: roleIn * 0.8,
              transform: `translateY(${mix(roleIn, L.px(20), 0)}px)`,
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/*
 * Registrasi di src/Root.tsx:
 *
 * <Folder name="Templates">
 *   <FormatVariants
 *     id="LowerThird"
 *     component={LowerThird}
 *     schema={lowerThirdSchema}
 *     defaultProps={lowerThirdDefaults}
 *   />
 * </Folder>
 */
