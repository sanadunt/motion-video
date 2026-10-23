/**
 * Grafik logo "Isekai Juicer" dalam ruang 1000x1000 (SVG vektor).
 *
 * Konsep: portal sihir ungu yang bukannya membuka jalan pulang malah
 * memuntahkan buah-buahan, dan Ucok menampungnya ke gelas jus.
 * Emblem = portal berputar + gelas jus di tengah + 6 buah terlempar keluar,
 * lalu wordmark "ISEKAI" (fantasi) dan "JUICER" (chunky, juicy).
 *
 * Semua nilai animasi dikirim lewat prop `anim` (0..1). Untuk logo statis,
 * pakai `LOGO_SETTLED`.
 */
import React from "react";
import { FONT_ISEKAI, FONT_JUICER, FONT_TAGLINE } from "./fonts";

export type LogoAnim = {
  /** 0..1 skala portal (boleh >1 untuk overshoot spring) */
  portal: number;
  /** derajat rotasi cincin portal */
  portalSpin: number;
  /** 0..1 intensitas glow */
  glow: number;
  /** 0..1 progres tiap buah keluar dari portal (6 nilai) */
  fruits: number[];
  /** derajat rotasi idle buah */
  fruitSpin: number;
  /** 0..1 gelas naik ke posisi */
  cup: number;
  /** 0..1 isi jus */
  juice: number;
  /** 0..1 teks ISEKAI masuk */
  isekai: number;
  /** 0..1 teks JUICER masuk */
  juicer: number;
  /** 0..1 opacity tagline */
  tagline: number;
  /** waktu (detik) untuk gerak idle: gelembung, goyang buah */
  time: number;
};

export const LOGO_SETTLED: LogoAnim = {
  portal: 1,
  portalSpin: 20,
  glow: 0.85,
  fruits: [1, 1, 1, 1, 1, 1],
  fruitSpin: 0,
  cup: 1,
  juice: 1,
  isekai: 1,
  juicer: 1,
  tagline: 1,
  time: 1.3,
};

export const PORTAL_CX = 500;
export const PORTAL_CY = 380;
export const PORTAL_R = 230;

type FruitKind =
  | "orange"
  | "apple"
  | "grapes"
  | "lemon"
  | "strawberry"
  | "watermelon";

type FruitSpec = {
  kind: FruitKind;
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

/** Posisi akhir buah relatif ke pusat portal. */
export const FRUITS: FruitSpec[] = [
  { kind: "orange", x: -215, y: -150, rotate: -15, scale: 1 },
  { kind: "apple", x: 225, y: -130, rotate: 14, scale: 1 },
  { kind: "grapes", x: -262, y: 50, rotate: -18, scale: 0.95 },
  { kind: "lemon", x: 262, y: 70, rotate: 28, scale: 1 },
  { kind: "strawberry", x: -105, y: -262, rotate: -28, scale: 0.9 },
  { kind: "watermelon", x: 140, y: -250, rotate: 18, scale: 0.95 },
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const Fruit: React.FC<{ kind: FruitKind }> = ({ kind }) => {
  switch (kind) {
    case "orange":
      return (
        <g>
          <circle r={44} fill="#FB923C" />
          <circle r={44} fill="url(#fruitShade)" />
          <circle cx={-14} cy={-16} r={12} fill="#FFFFFF" opacity={0.35} />
          <ellipse
            cx={14}
            cy={-44}
            rx={18}
            ry={9}
            fill="#22C55E"
            transform="rotate(-30 14 -44)"
          />
          <circle cx={0} cy={-44} r={4} fill="#166534" />
        </g>
      );
    case "apple":
      return (
        <g>
          <circle cx={-15} cy={6} r={36} fill="#EF4444" />
          <circle cx={15} cy={6} r={36} fill="#EF4444" />
          <circle cx={0} cy={10} r={34} fill="#EF4444" />
          <circle cx={0} cy={6} r={50} fill="url(#fruitShade)" />
          <rect x={-4} y={-46} width={8} height={22} rx={3} fill="#78350F" />
          <ellipse
            cx={16}
            cy={-34}
            rx={16}
            ry={8}
            fill="#22C55E"
            transform="rotate(-35 16 -34)"
          />
          <circle cx={-16} cy={-10} r={9} fill="#FFFFFF" opacity={0.3} />
        </g>
      );
    case "grapes": {
      const dots: [number, number][] = [
        [-18, -28],
        [18, -28],
        [-34, -4],
        [0, -4],
        [34, -4],
        [-18, 20],
        [18, 20],
        [0, 44],
      ];
      return (
        <g>
          <rect x={-3} y={-60} width={6} height={26} rx={3} fill="#78350F" />
          {dots.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={17} fill="#A855F7" />
              <circle
                cx={x - 5}
                cy={y - 5}
                r={5}
                fill="#FFFFFF"
                opacity={0.35}
              />
            </g>
          ))}
        </g>
      );
    }
    case "lemon":
      return (
        <g>
          <ellipse rx={48} ry={33} fill="#FACC15" />
          <circle cx={-48} cy={0} r={7} fill="#FACC15" />
          <circle cx={48} cy={0} r={7} fill="#FACC15" />
          <ellipse rx={48} ry={33} fill="url(#fruitShade)" />
          <ellipse
            cx={-14}
            cy={-11}
            rx={12}
            ry={7}
            fill="#FFFFFF"
            opacity={0.4}
          />
        </g>
      );
    case "strawberry":
      return (
        <g>
          <path
            d="M0,-38 C30,-38 46,-8 38,16 C30,38 14,52 0,56 C-14,52 -30,38 -38,16 C-46,-8 -30,-38 0,-38 Z"
            fill="#F43F5E"
          />
          <path
            d="M0,-38 C30,-38 46,-8 38,16 C30,38 14,52 0,56 C-14,52 -30,38 -38,16 C-46,-8 -30,-38 0,-38 Z"
            fill="url(#fruitShade)"
          />
          {[
            [-16, -8],
            [8, -14],
            [20, 8],
            [-6, 14],
            [-22, 18],
            [10, 30],
            [-4, 36],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={3} ry={5} fill="#FDE68A" />
          ))}
          <path
            d="M-30,-34 L-12,-44 L0,-30 L12,-44 L30,-34 L18,-20 L0,-26 L-18,-20 Z"
            fill="#22C55E"
          />
        </g>
      );
    case "watermelon":
      return (
        <g>
          <path d="M-50,-6 A50,50 0 0 0 50,-6 Z" fill="#15803D" />
          <path d="M-43,-6 A43,43 0 0 0 43,-6 Z" fill="#DCFCE7" />
          <path d="M-37,-6 A37,37 0 0 0 37,-6 Z" fill="#F43F5E" />
          {[
            [-18, 6],
            [0, 14],
            [18, 6],
            [-8, 22],
            [10, 24],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={3} ry={5} fill="#1F2937" />
          ))}
        </g>
      );
    default:
      return null;
  }
};

export const IsekaiJuicerArt: React.FC<{
  anim: LogoAnim;
  /** Tampilkan wordmark + tagline (false = emblem saja, viewBox dipersempit) */
  showText?: boolean;
}> = ({ anim, showText = true }) => {
  const viewBox = showText ? "0 0 1000 1000" : "60 40 880 660";
  const {
    portal,
    portalSpin,
    glow,
    fruits,
    fruitSpin,
    cup,
    juice,
    isekai,
    juicer,
    tagline,
    time,
  } = anim;

  // Teks: progres spring (bisa >1) dipetakan ke skala & opacity.
  const isekaiScale = 2.4 - 1.4 * isekai;
  const isekaiOpacity = clamp01(isekai * 2.5);
  const juicerScale = 2.8 - 1.8 * juicer;
  const juicerOpacity = clamp01(juicer * 2.5);
  const juicerRotate = -3 - 7 * (1 - clamp01(juicer));

  const cupY = (1 - cup) * 320;
  const cupOpacity = clamp01(cup * 2);
  const juiceLevel = clamp01(juice);

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E879F9" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#A855F7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vortex" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0B0520" />
          <stop offset="55%" stopColor="#3B0764" />
          <stop offset="85%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#D8B4FE" />
        </radialGradient>
        <radialGradient id="fruitShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </radialGradient>
        <linearGradient id="juiceFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="55%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="45%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="juicyText" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#FF3D7F" />
        </linearGradient>
        <clipPath id="cupClip">
          <path d="M-86,-120 L86,-120 L68,96 Q66,112 50,112 L-50,112 Q-66,112 -68,96 Z" />
        </clipPath>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="6"
            floodColor="#1E0A3C"
            floodOpacity="0.9"
          />
        </filter>
      </defs>

      {/* ===== PORTAL ===== */}
      <g
        transform={`translate(${PORTAL_CX} ${PORTAL_CY}) scale(${Math.max(0, portal)})`}
      >
        <circle r={330} fill="url(#portalGlow)" opacity={clamp01(glow)} />
        <circle r={PORTAL_R - 14} fill="url(#vortex)" />

        {/* pusaran energi di dalam portal */}
        <g transform={`rotate(${portalSpin * 0.7})`} opacity={0.32}>
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              d="M0,-30 C80,-40 150,10 160,100 C150,60 110,30 70,40 C30,50 10,20 0,-30 Z"
              fill="#E9D5FF"
              opacity={0.35}
              transform={`rotate(${a})`}
            />
          ))}
        </g>
        <g transform={`rotate(${-portalSpin * 1.1})`} opacity={0.5}>
          {[0, 90, 180, 270].map((a) => (
            <path
              key={a}
              d="M0,-170 A170,170 0 0 1 120,-120"
              fill="none"
              stroke="#F5D0FE"
              strokeWidth={6}
              strokeLinecap="round"
              transform={`rotate(${a})`}
            />
          ))}
        </g>

        {/* cincin utama */}
        <circle
          r={PORTAL_R}
          fill="none"
          stroke="#C084FC"
          strokeWidth={26}
          filter="url(#softGlow)"
        />
        <circle r={PORTAL_R} fill="none" stroke="#F0ABFC" strokeWidth={6} />
        <g transform={`rotate(${portalSpin})`}>
          <circle
            r={PORTAL_R}
            fill="none"
            stroke="#FDF4FF"
            strokeWidth={10}
            strokeDasharray="34 30"
            strokeLinecap="round"
            opacity={0.85}
          />
        </g>
        <g transform={`rotate(${-portalSpin * 1.6})`}>
          <circle
            r={PORTAL_R - 30}
            fill="none"
            stroke="#A78BFA"
            strokeWidth={5}
            strokeDasharray="10 22"
            opacity={0.8}
          />
        </g>
        {/* rune di sekeliling */}
        <g transform={`rotate(${portalSpin * 0.25})`}>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect
              key={i}
              x={-4}
              y={-(PORTAL_R + 34)}
              width={8}
              height={i % 2 === 0 ? 20 : 12}
              rx={3}
              fill="#E9D5FF"
              opacity={0.8}
              transform={`rotate(${(i * 360) / 16})`}
            />
          ))}
        </g>
      </g>

      {/* ===== GELAS JUS ===== */}
      <g
        transform={`translate(${PORTAL_CX} ${PORTAL_CY + 22 + cupY})`}
        opacity={cupOpacity}
      >
        {/* isi jus */}
        <g clipPath="url(#cupClip)">
          <rect
            x={-100}
            y={112 - 232 * juiceLevel}
            width={200}
            height={240}
            fill="url(#juiceFill)"
          />
          {/* permukaan bergelombang */}
          <path
            d={`M-100,${112 - 232 * juiceLevel} ${Array.from({ length: 9 })
              .map((_, i) => {
                const x = -100 + i * 25;
                const y =
                  112 - 232 * juiceLevel + Math.sin(time * 5 + i * 1.1) * 5;
                return `L${x},${y}`;
              })
              .join(
                " ",
              )} L100,${112 - 232 * juiceLevel + 20} L-100,${112 - 232 * juiceLevel + 20} Z`}
            fill="#FDBA74"
            opacity={0.6 * juiceLevel}
          />
          {/* gelembung */}
          {[0, 1, 2, 3, 4].map((i) => {
            const cycle = (time * 0.35 + i * 0.2) % 1;
            const y = 100 - cycle * 200 * juiceLevel;
            return (
              <circle
                key={i}
                cx={-40 + i * 20 + Math.sin(time * 2 + i) * 6}
                cy={y}
                r={4 + (i % 3)}
                fill="#FFFFFF"
                opacity={0.45 * juiceLevel * (1 - cycle)}
              />
            );
          })}
        </g>
        {/* kaca */}
        <path
          d="M-86,-120 L86,-120 L68,96 Q66,112 50,112 L-50,112 Q-66,112 -68,96 Z"
          fill="#FFFFFF"
          fillOpacity={0.12}
          stroke="#FFFFFF"
          strokeOpacity={0.85}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d="M-62,-96 L-54,70"
          stroke="#FFFFFF"
          strokeOpacity={0.5}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* sedotan */}
        <g transform="translate(34 -120) rotate(18)">
          <rect
            x={-10}
            y={-120}
            width={20}
            height={150}
            rx={10}
            fill="#FFFFFF"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={-10}
              y={-110 + i * 30}
              width={20}
              height={14}
              fill="#F43F5E"
            />
          ))}
        </g>
      </g>

      {/* ===== BUAH ===== */}
      {FRUITS.map((f, i) => {
        const p = fruits[i] ?? 0;
        if (p <= 0) return null;
        const pc = clamp01(p);
        const arc = -90 * Math.sin(pc * Math.PI);
        const x = PORTAL_CX + f.x * p;
        const y = PORTAL_CY + f.y * p + arc;
        const bob = Math.sin(time * 2.2 + i * 1.3) * 6 * pc;
        const s = (0.15 + 0.85 * p) * f.scale;
        const rot =
          f.rotate + (1 - pc) * 240 + fruitSpin + Math.sin(time * 1.7 + i) * 4;
        return (
          <g
            key={f.kind}
            transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${s})`}
            filter="url(#textShadow)"
          >
            <Fruit kind={f.kind} />
          </g>
        );
      })}

      {/* ===== WORDMARK ===== */}
      {showText ? (
        <>
          <g
            transform={`translate(500 738) scale(${isekaiScale})`}
            opacity={isekaiOpacity}
          >
            <text
              textAnchor="middle"
              fontFamily={`'${FONT_ISEKAI}', serif`}
              fontWeight={900}
              fontSize={86}
              letterSpacing={12}
              fill="url(#goldText)"
              stroke="#3B0764"
              strokeWidth={9}
              paintOrder="stroke fill"
              filter="url(#textShadow)"
            >
              ISEKAI
            </text>
          </g>

          <g
            transform={`translate(500 905) rotate(${juicerRotate}) scale(${juicerScale})`}
            opacity={juicerOpacity}
          >
            {/* bayangan 3D */}
            <text
              textAnchor="middle"
              fontFamily={`'${FONT_JUICER}', sans-serif`}
              fontSize={196}
              fill="#1E0A3C"
              stroke="#1E0A3C"
              strokeWidth={16}
              transform="translate(8 12)"
            >
              JUICER
            </text>
            <text
              textAnchor="middle"
              fontFamily={`'${FONT_JUICER}', sans-serif`}
              fontSize={196}
              fill="url(#juicyText)"
              stroke="#3B0764"
              strokeWidth={16}
              paintOrder="stroke fill"
            >
              JUICER
            </text>
            {/* tetesan jus menggantung dari huruf */}
            {[
              [-150, "#FF3D7F", 1],
              [122, "#FF8C42", 1.15],
            ].map(([x, color, k], i) => (
              <g key={i} transform={`translate(${x} -16) scale(${k})`}>
                <path
                  d="M-12,0 H12 C12,12 9,20 8,28 A8,8 0 1 1 -8,28 C-9,20 -12,12 -12,0 Z"
                  fill={String(color)}
                  stroke="#3B0764"
                  strokeWidth={5}
                  paintOrder="stroke fill"
                />
                <circle cx={-3} cy={12} r={3} fill="#FFFFFF" opacity={0.55} />
              </g>
            ))}
          </g>

          <text
            x={500}
            y={972}
            textAnchor="middle"
            fontFamily={`'${FONT_TAGLINE}', sans-serif`}
            fontSize={42}
            letterSpacing={4}
            fill="#C4B5FD"
            opacity={clamp01(tagline)}
          >
            JUS SEGAR DARI DUNIA LAIN
          </text>
        </>
      ) : null}
    </svg>
  );
};
