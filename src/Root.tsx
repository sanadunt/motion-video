import { Composition, Folder, Still } from "remotion";
import { FormatVariants } from "./lib/studio";
import {
  RipperTape,
  ripperTapeDefaults,
  ripperTapeSchema,
} from "./Videos/RipperTape";
import {
  RipperStoryboard,
  ripperStoryboardDefaults,
  ripperStoryboardSchema,
} from "./Videos/RipperStoryboard";
import {
  WajahStoryboard,
  wajahStoryboardDefaults,
  wajahStoryboardSchema,
} from "./Videos/WajahStoryboard";
import {
  WajahDiLukisan,
  wajahDefaults,
  wajahSchema,
} from "./Videos/WajahDiLukisan";
import {
  AngkaStoryboard,
  angkaStoryboardDefaults,
  angkaStoryboardSchema,
} from "./Videos/AngkaStoryboard";
import {
  ArsipTiang,
  arsipTiangDefaults,
  arsipTiangSchema,
} from "./Videos/ArsipTiang";
import {
  NomorMerah,
  nomorMerahDefaults,
  nomorMerahSchema,
} from "./Videos/NomorMerah";
import {
  TiangStoryboard,
  tiangStoryboardDefaults,
  tiangStoryboardSchema,
} from "./Videos/TiangStoryboard";
import {
  SiaranAngka,
  siaranAngkaDefaults,
  siaranAngkaSchema,
} from "./Videos/SiaranAngka";
import {
  TextureBake,
  textureBakeDefaults,
  textureBakeSchema,
} from "./lib/scenes/TextureBake";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
} from "./CaptionedVideo";
import { HaloDunia } from "./HaloDunia";
import {
  CREW_FULL_FRAMES,
  CREW_IDLE_FRAMES,
  CREW_IN_FRAMES,
  CREW_OUT_FRAMES,
  CrewReveal,
} from "./Characters/CrewReveal";
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
      <Folder name="Characters">
        <Composition
          id="CrewReveal-Portrait"
          component={CrewReveal}
          durationInFrames={CREW_FULL_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            phase: "full",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        <Composition
          id="CrewReveal-Landscape"
          component={CrewReveal}
          durationInFrames={CREW_FULL_FRAMES}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            phase: "full",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        <Composition
          id="CrewReveal-Square"
          component={CrewReveal}
          durationInFrames={CREW_FULL_FRAMES}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            phase: "full",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        <Composition
          id="CrewRevealIn-Portrait"
          component={CrewReveal}
          durationInFrames={CREW_IN_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            phase: "in",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        <Composition
          id="CrewRevealIdle-Portrait"
          component={CrewReveal}
          durationInFrames={CREW_IDLE_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            phase: "idle",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        <Composition
          id="CrewRevealOut-Portrait"
          component={CrewReveal}
          durationInFrames={CREW_OUT_FRAMES}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            phase: "out",
            bgTop: "#1B1F4B",
            bgBottom: "#0B0A1E",
            glowColor: "#5B4DD6",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: true,
          }}
        />
        {/* Untuk web: latar transparan, rasio gambar asli, In + Idle (web me-loop bagian Idle) */}
        <Composition
          id="CrewReveal-Web"
          component={CrewReveal}
          durationInFrames={CREW_IN_FRAMES + CREW_IDLE_FRAMES}
          fps={30}
          width={900}
          height={1272}
          defaultProps={{
            phase: "full",
            bgTop: "transparent",
            bgBottom: "transparent",
            glowColor: "transparent",
            skinColor: "#FCEEEF",
            skinColorRight: "#FCEEEF",
            fitMode: "contain",
            motionAmount: 1,
            particles: false,
            fadeBottom: 0.1,
          }}
        />
      </Folder>
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
      <Folder name="Videos">
        <FormatVariants
          id="RipperTape"
          component={RipperTape}
          schema={ripperTapeSchema}
          defaultProps={ripperTapeDefaults}
        />
        <FormatVariants
          id="RipperStoryboard"
          component={RipperStoryboard}
          schema={ripperStoryboardSchema}
          defaultProps={ripperStoryboardDefaults}
          formats={["Portrait"]}
        />
        <FormatVariants
          id="WajahDiLukisan"
          component={WajahDiLukisan}
          schema={wajahSchema}
          defaultProps={wajahDefaults}
        />
        <FormatVariants
          id="WajahStoryboard"
          component={WajahStoryboard}
          schema={wajahStoryboardSchema}
          defaultProps={wajahStoryboardDefaults}
          formats={["Portrait"]}
        />
        <FormatVariants
          id="SiaranAngka"
          component={SiaranAngka}
          schema={siaranAngkaSchema}
          defaultProps={siaranAngkaDefaults}
        />
        <FormatVariants
          id="AngkaStoryboard"
          component={AngkaStoryboard}
          schema={angkaStoryboardSchema}
          defaultProps={angkaStoryboardDefaults}
          formats={["Portrait"]}
        />
        <FormatVariants
          id="ArsipTiang"
          component={ArsipTiang}
          schema={arsipTiangSchema}
          defaultProps={arsipTiangDefaults}
          formats={["Portrait"]}
        />
        <FormatVariants
          id="ArsipTiangStoryboard"
          component={TiangStoryboard}
          schema={tiangStoryboardSchema}
          defaultProps={tiangStoryboardDefaults}
          formats={["Portrait"]}
        />
        <FormatVariants
          id="NomorMerah"
          component={NomorMerah}
          schema={nomorMerahSchema}
          defaultProps={nomorMerahDefaults}
          formats={["Portrait"]}
        />
      </Folder>
      <Folder name="Utils">
        <Still
          id="TextureBake-Full"
          component={TextureBake}
          schema={textureBakeSchema}
          width={1080}
          height={1920}
          defaultProps={textureBakeDefaults}
        />
        <Still
          id="TextureBake-Tile"
          component={TextureBake}
          schema={textureBakeSchema}
          width={512}
          height={512}
          defaultProps={textureBakeDefaults}
        />
      </Folder>
    </>
  );
};
