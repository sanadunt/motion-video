/**
 * Logo statis "Isekai Juicer" untuk dirender jadi PNG (ikon, thumbnail, dsb).
 * background=false menghasilkan PNG transparan (render dengan --image-format=png).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { IsekaiJuicerArt, LOGO_SETTLED } from "./isekai-juicer/Art";

export type IsekaiJuicerStillProps = {
  background: boolean;
  showText: boolean;
};

export const IsekaiJuicerStill: React.FC<IsekaiJuicerStillProps> = ({
  background,
  showText,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: background
          ? "radial-gradient(ellipse at 50% 42%, #2A1052 0%, #150827 45%, #090314 100%)"
          : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "94%", height: "94%" }}>
        <IsekaiJuicerArt anim={LOGO_SETTLED} showText={showText} />
      </div>
    </AbsoluteFill>
  );
};
