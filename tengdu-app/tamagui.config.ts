import { createAnimations } from "@tamagui/animations-react-native";
import { config as defaultConfig } from "@tamagui/config/v2";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { radius, size, space, zIndex } from "@tamagui/themes";
import { createFont, createTamagui, createTokens } from "tamagui";

import { colors, nunitoFace } from "./GLOBAL_VALUES";
import { themes } from "./myTheme";
// const lightTransparent = 'rgba(255,255,255,0)'
// const darkTransparent = 'rgba(10,10,10,0)'

// const palettes = {
//   light: [
//     lightTransparent,
//   ]
// }

// themes.light.color = "#21426d";
// themes.light
// themes.light_Button.color = "#FFFFFF";
// themes.light_Button.background = "#21426d";
// themes.light.backgroundStrong = "#edece1";

const animations = createAnimations({
  bouncy: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100
  },
  lazy: {
    type: "spring",
    damping: 20,
    stiffness: 60
  },
  quick: {
    type: "spring",
    damping: 40,
    mass: 1.2,
    stiffness: 250
  }
});

const nunitoBodyFont = createFont({
  // font-family name(s) for web use via CSS
  family: "NunitoSans_800ExtraBold",
  size: defaultConfig.fonts.body.size,
  lineHeight: defaultConfig.fonts.body.lineHeight,
  weight: defaultConfig.fonts.body.weight,
  letterSpacing: defaultConfig.fonts.body.letterSpacing,
  face: nunitoFace
});

const nunitoHeadingFont = createFont({
  // font-family name(s) for web use via CSS
  family: "NunitoSans_900Black",
  size: defaultConfig.fonts.heading.size,
  lineHeight: defaultConfig.fonts.heading.lineHeight,
  weight: defaultConfig.fonts.heading.weight,
  letterSpacing: defaultConfig.fonts.heading.letterSpacing,
  face: nunitoFace
});

const headingFont = nunitoHeadingFont;
const bodyFont = nunitoBodyFont;

const tokens = createTokens({
  size,
  space,
  zIndex,
  color: colors,
  radius
});

const config = createTamagui({
  animations,
  defaultTheme: "light",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont
  },
  themes,
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" }
  })
});

export type AppConfig = typeof config;

declare module "tamagui" {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

// to avoid hardcording the values
export const onPressStyles = {
  transform: [{ scale: 0.95 }],
  opacity: 0.8
};
