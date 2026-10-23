import { Composition, Folder, Still } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
} from "./CaptionedVideo";
import { HaloDunia } from "./HaloDunia";
import { ISEKAI_JUICER_DURATION, IsekaiJuicer } from "./Logo/IsekaiJuicer";
import { IsekaiJuicerStill } from "./Logo/IsekaiJuicerStill";
import {
  calculateMeneuroborosVHSMetadata,
  MeneuroborosVHS,
  meneuroborosVHSDefaults,
  meneuroborosVHSSchema,
} from "./Logo/MeneuroborosVHS";
import {
  calculateMeneuroborosMinimalMetadata,
  MeneuroborosMinimal,
  meneuroborosMinimalDefaults,
  meneuroborosMinimalSchema,
} from "./Logo/MeneuroborosMinimal";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HaloDunia"
        component={HaloDunia}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          style: {
            backgroundColor: "#000000",
          },
        }}
      />
      <Folder name="Captions">
        <Composition
          id="CaptionedVideo"
          component={CaptionedVideo}
          durationInFrames={1842}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calculateCaptionedVideoMetadata}
          defaultProps={{
            src: "kakashi-chidori.mp4",
            captionsFile: "kakashi-chidori.captions.json",
            captions: [],
            captionTop: 1260,
            captionHeight: 220,
            blurBehindCaptions: true,
          }}
        />
      </Folder>
      <Folder name="Logo">
        <Composition
          id="MeneuroborosVHS-Portrait"
          component={MeneuroborosVHS}
          schema={meneuroborosVHSSchema}
          calculateMetadata={calculateMeneuroborosVHSMetadata}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={meneuroborosVHSDefaults}
        />
        <Composition
          id="MeneuroborosVHS-Landscape"
          component={MeneuroborosVHS}
          schema={meneuroborosVHSSchema}
          calculateMetadata={calculateMeneuroborosVHSMetadata}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={meneuroborosVHSDefaults}
        />
        <Composition
          id="MeneuroborosVHS-Square"
          component={MeneuroborosVHS}
          schema={meneuroborosVHSSchema}
          calculateMetadata={calculateMeneuroborosVHSMetadata}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={meneuroborosVHSDefaults}
        />
        <Composition
          id="MeneuroborosMinimal-Portrait"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={meneuroborosMinimalDefaults}
        />
        <Composition
          id="MeneuroborosMinimal-Landscape"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={meneuroborosMinimalDefaults}
        />
        <Composition
          id="MeneuroborosMinimal-Square"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={meneuroborosMinimalDefaults}
        />
        <Composition
          id="MeneuroborosMinimalBlack-Portrait"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            ...meneuroborosMinimalDefaults,
            backgroundColor: "#000000",
          }}
        />
        <Composition
          id="MeneuroborosMinimalBlack-Landscape"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            ...meneuroborosMinimalDefaults,
            backgroundColor: "#000000",
          }}
        />
        <Composition
          id="MeneuroborosMinimalBlack-Square"
          component={MeneuroborosMinimal}
          schema={meneuroborosMinimalSchema}
          calculateMetadata={calculateMeneuroborosMinimalMetadata}
          durationInFrames={165}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            ...meneuroborosMinimalDefaults,
            backgroundColor: "#000000",
          }}
        />
        <Composition
          id="IsekaiJuicer-Landscape"
          component={IsekaiJuicer}
          durationInFrames={ISEKAI_JUICER_DURATION}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ fadeOut: true, sound: true, volume: 0.85 }}
        />
        <Composition
          id="IsekaiJuicer-Portrait"
          component={IsekaiJuicer}
          durationInFrames={ISEKAI_JUICER_DURATION}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ fadeOut: true, sound: true, volume: 0.85 }}
        />
        <Composition
          id="IsekaiJuicer-Square"
          component={IsekaiJuicer}
          durationInFrames={ISEKAI_JUICER_DURATION}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{ fadeOut: true, sound: true, volume: 0.85 }}
        />
        <Still
          id="IsekaiJuicer-Logo"
          component={IsekaiJuicerStill}
          width={1200}
          height={1200}
          defaultProps={{ background: true, showText: true }}
        />
      </Folder>
    </>
  );
};
