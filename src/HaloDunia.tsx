import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * HaloDunia — 1080x1920, 30 fps, 8 detik.
 *
 * Timeline (detik):
 *  0–1  Lingkaran ungu muncul dari tengah (spring, sedikit membal)
 *  1–3  "Halo," lalu "Dunia!" slide up + fade in (jeda 0.2 s)
 *  3–5  Subjudul "Dibuat oleh AI" fade in
 *  5–7  Angka count-up 0 → 100% di bagian bawah
 *  7–8  Semua elemen zoom out + fade out ke hitam
 */
const HaloDuniaInner = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Nilai count-up: ease-out supaya melambat saat mendekati 100.
  const count = Math.round(
    interpolate(frame, [5 * fps, 7 * fps], [0, 100], {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <>
      {/* Stage: semua elemen zoom out + fade out pada detik 7–8 menuju hitam */}
      <Interactive.Div
        name="Stage"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, 'Liberation Sans', Arial, Helvetica, sans-serif",
          scale: interpolate(frame, [7 * fps, durationInFrames - 1], [1, 0.8], {
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          opacity: interpolate(frame, [7 * fps, durationInFrames - 1], [1, 0], {
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {/* Latar gradasi gelap */}
        <Interactive.Div
          name="Background"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(180deg, #0F0F1A 0%, #1E1B4B 100%)",
          }}
        />

        {/* Lingkaran ungu: scale 0 → 1 dengan spring yang sedikit membal */}
        <Interactive.Div
          name="Circle"
          style={{
            width: 420,
            height: 420,
            borderRadius: 210,
            backgroundColor: "#8B5CF6",
            boxShadow: "0 0 160px 20px rgba(139, 92, 246, 0.45)",
            marginBottom: 120,
            scale: interpolate(frame, [0, 1 * fps], [0, 1], {
              easing: Easing.spring({ damping: 12, mass: 1, stiffness: 120 }),
              output: "perceptual-scale",
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* Judul: kata per kata, slide up + fade in, jeda 0.2 s antar kata */}
        <Interactive.Div
          name="Title"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            color: "#FFFFFF",
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <Interactive.Div
            name="Word 1"
            style={{
              opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [1 * fps, 1.8 * fps],
                ["0px 90px", "0px 0px"],
                {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            Halo,
          </Interactive.Div>
          <Interactive.Div
            name="Word 2"
            style={{
              opacity: interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [1.2 * fps, 2 * fps],
                ["0px 90px", "0px 0px"],
                {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            Dunia!
          </Interactive.Div>
        </Interactive.Div>

        {/* Subjudul: fade in detik 3–5 */}
        <Interactive.Div
          name="Subtitle"
          style={{
            marginTop: 40,
            color: "#A5B4FC",
            fontSize: 56,
            fontWeight: 500,
            letterSpacing: 1,
            paddingLeft: 80,
            paddingRight: 80,
            textAlign: "center",
            opacity: interpolate(frame, [3 * fps, 4.2 * fps], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [3 * fps, 4.4 * fps],
              ["0px 30px", "0px 0px"],
              {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          Dibuat oleh AI
        </Interactive.Div>

        {/* Counter: 0 → 100% di bagian bawah, detik 5–7 */}
        <Interactive.Div
          name="Counter"
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 160,
            textAlign: "center",
            color: "#FACC15",
            fontSize: 160,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -4,
            fontVariantNumeric: "tabular-nums",
            opacity: interpolate(frame, [5 * fps, 5.4 * fps], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [5 * fps, 5.8 * fps], [0.85, 1], {
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {count}%
        </Interactive.Div>
      </Interactive.Div>
    </>
  );
};

export const HaloDunia = Interactive.create({
  Component: HaloDuniaInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
