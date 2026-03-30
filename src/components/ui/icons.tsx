import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaultProps = { size: 24, color: "currentColor" };

function svgWrapper(
  props: IconProps,
  children: React.ReactNode
) {
  const { size = defaultProps.size, color = defaultProps.color, className } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconDroplet(props: IconProps) {
  return svgWrapper(props, (
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
  ));
}

export function IconStretch(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v6" />
      <path d="M8 10l4 2 4-2" />
      <path d="M10 18l2-4 2 4" />
    </>
  ));
}

export function IconWind(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M17.7 7.7A2.5 2.5 0 0 1 17 13H3" />
      <path d="M9.6 4.6A2 2 0 0 1 11 9H3" />
      <path d="M12.6 19.4A2 2 0 0 0 14 15H3" />
    </>
  ));
}

export function IconHeart(props: IconProps) {
  return svgWrapper(props, (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ));
}

export function IconFootprints(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5 10 7 9.23 8 8 10c-1.22 2-1 3-1 4" />
      <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 1.5.77 2.5 2 4.5 1.22 2 1 3 1 4" />
    </>
  ));
}

export function IconBook(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ));
}

export function IconBrain(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .97.3 1.87.83 2.6A3.5 3.5 0 0 0 4 12.5a3.5 3.5 0 0 0 1.67 2.98A4.5 4.5 0 0 0 9.5 22h.5v-9.5" />
      <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .97-.3 1.87-.83 2.6A3.5 3.5 0 0 1 20 12.5a3.5 3.5 0 0 1-1.67 2.98A4.5 4.5 0 0 1 14.5 22H14v-9.5" />
      <path d="M12 12.5V2" />
    </>
  ));
}

export function IconClipboard(props: IconProps) {
  return svgWrapper(props, (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </>
  ));
}

export function IconPhoneOff(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67" />
      <path d="M2 2l20 20" />
      <path d="M7.5 7.15a16 16 0 0 0-1.41 2.16l1.27 1.27a2 2 0 0 1 .45 2.11 12.84 12.84 0 0 0-.7 2.81 2 2 0 0 1-2 1.72h-3A2 2 0 0 1 0 15.04a19.79 19.79 0 0 1 3.07-8.63" />
    </>
  ));
}

export function IconPencil(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </>
  ));
}

export function IconSnowflake(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </>
  ));
}

export function IconApple(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M12 2c1 .5 2.5 1 3 2 .5 1 0 2-.5 3-.5 1-1.5 1.5-2.5 1.5S10.5 8 10 7s-1-2-.5-3 2-1.5 3-2z" />
      <path d="M17.5 10c1.5 1 2.5 3 2.5 5.5 0 3.5-2 6.5-5 6.5-1 0-2-.5-3-1-1 .5-2 1-3 1-3 0-5-3-5-6.5 0-2.5 1-4.5 2.5-5.5 1-.7 2.5-1 3.5-.5.5.3 1 .5 1.5.5s1-.2 1.5-.5c1-.5 2.5-.2 3.5.5z" />
    </>
  ));
}

export function IconMoon(props: IconProps) {
  return svgWrapper(props, (
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  ));
}

export function IconSparkle(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M12 3l1.912 5.813a1 1 0 0 0 .638.638L20.362 12l-5.812 1.912a1 1 0 0 0-.638.638L12 20.362l-1.912-5.812a1 1 0 0 0-.638-.638L3.638 12l5.812-1.912a1 1 0 0 0 .638-.638L12 3z" />
    </>
  ));
}

export function IconTarget(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ));
}

export function IconSun(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  ));
}

export function IconFlame(props: IconProps) {
  return svgWrapper(props, (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ));
}

export function IconCheck(props: IconProps) {
  return svgWrapper(props, (
    <polyline points="20 6 9 17 4 12" />
  ));
}

export function IconPlus(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ));
}

export function IconSettings(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ));
}

export function IconHome(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ));
}

export function IconCompass(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ));
}

export function IconTimer(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3l1.5 1.5" />
      <path d="M19 3l-1.5 1.5" />
      <path d="M12 3v2" />
    </>
  ));
}

export function IconJournal(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ));
}

export function IconUser(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ));
}

export function IconArrowUp(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ));
}

export function IconArrowDown(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ));
}

export function IconX(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ));
}

export function IconArrowLeft(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ));
}

export function IconArrowRight(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ));
}

export function IconSunrise(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="8 6 12 2 16 6" />
    </>
  ));
}

export function IconCoffee(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </>
  ));
}

export function IconTreePine(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M17 22v-2" />
      <path d="M7 22v-2" />
      <path d="M12 2L7 10h10L12 2z" />
      <path d="M12 8L5 18h14L12 8z" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </>
  ));
}

export function IconVolume(props: IconProps) {
  return svgWrapper(props, (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </>
  ));
}

export function IconMusic(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ));
}

export function IconBubble(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="8" r="5" />
      <circle cx="6" cy="16" r="3" />
      <circle cx="17" cy="17" r="2.5" />
    </>
  ));
}

export function IconSilence(props: IconProps) {
  return svgWrapper(props, (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </>
  ));
}

export function IconChevronRight(props: IconProps) {
  return svgWrapper(props, (
    <polyline points="9 18 15 12 9 6" />
  ));
}

export function IconMeditation(props: IconProps) {
  return svgWrapper(props, (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 7.5v3" />
      <path d="M7 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M5 20c.5-3 3.5-5 7-5s6.5 2 7 5" />
    </>
  ));
}

export function IconLightbulb(props: IconProps) {
  return svgWrapper(props, (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </>
  ));
}

export function IconZap(props: IconProps) {
  return svgWrapper(props, (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ));
}

export function IconChart(props: IconProps) {
  return svgWrapper(props, (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ));
}

// Category icon mapping - replaces emoji icons with SVG components
export const categoryIconMap: Record<string, React.FC<IconProps>> = {
  focus: IconTarget,
  mindfulness: IconMeditation,
  habits: IconZap,
  adhd: IconBrain,
  energy: IconSun,
  productivity: IconClipboard,
  movement: IconStretch,
  nutrition: IconApple,
  sleep: IconMoon,
  anxiety: IconHeart,
  "self-compassion": IconHeart,
  motivation: IconFlame,
};

// Habit icon mapping - replaces emoji icons in habits
export const habitIconMap: Record<string, React.FC<IconProps>> = {
  "\uD83D\uDCA7": IconDroplet,
  "\uD83E\uDDD8": IconMeditation,
  "\uD83E\uDDD8\u200D\u2640\uFE0F": IconMeditation,
  "\uD83C\uDF3F": IconWind,
  "\u2728": IconSparkle,
  "\uD83D\uDCAA": IconStretch,
  "\uD83C\uDFAF": IconTarget,
  "\uD83E\uDDE0": IconBrain,
  "\uD83D\uDCCB": IconClipboard,
  "\uD83D\uDCF5": IconPhoneOff,
  "\u270F\uFE0F": IconPencil,
  "\u2744\uFE0F": IconSnowflake,
  "\uD83C\uDF4E": IconApple,
  "\uD83C\uDF19": IconMoon,
  "\u2600\uFE0F": IconSun,
  "\uD83D\uDD25": IconFlame,
  "\uD83D\uDCD6": IconBook,
  "\uD83D\uDCA1": IconLightbulb,
  "\u26A1": IconZap,
  "\u2615": IconCoffee,
  "\uD83C\uDF05": IconSunrise,
  "\uD83C\uDF32": IconTreePine,
};
