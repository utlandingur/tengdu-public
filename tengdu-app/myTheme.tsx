import {
  addChildren,
  applyMask,
  createStrengthenMask,
  createTheme,
  createWeakenMask,
  MaskOptions
} from "@tamagui/create-theme";
import {
  colorTokens,
  darkColors,
  lightColors,
  palettes
} from "@tamagui/themes";

type ColorName = keyof typeof colorTokens.dark;

const lightTransparent = "rgba(255,255,255,0)";
const darkTransparent = "rgba(10,10,10,0)";

type ColorTokenType = typeof colorTokens;

const myColorTokens: ColorTokenType = {
  ...colorTokens,
  light: {
    ...colorTokens.light,
    green: {
      green1: lightTransparent,
      green2: "#57B058",
      green3: "#4BA04D",
      green4: "#428C43",
      green5: "#39783A",
      green6: "#2F6430",
      green7: "#265026",
      green8: "#1C3C1D",
      green9: "#132813",
      green10: "#09140A",
      green11: "#000000",
      green12: "#FFFFFF"
    },
    blue: {
      blue1: lightTransparent,
      blue2: "#21426D",
      blue3: "#2A558D",
      blue4: "#3468AD",
      blue5: "#437CC7",
      blue6: "#6292D0",
      blue7: "#81A8D9",
      blue8: "#A1BDE3",
      blue9: "#C0D3EC",
      blue10: "#E0E9F6",
      blue11: "#FFFFFF",
      blue12: "#FFFFFF"
    },
    red: {
      red1: lightTransparent,
      red2: "#fff",
      red3: "red",
      red4: "red",
      red5: "red",
      red6: "red",
      red7: "red",
      red8: "red",
      red9: "red",
      red10: "#E0E9F6",
      red11: "#FFFFFF",
      red12: "#FFFFFF"
    }
  }
};

// background => foreground
const my_palettes = {
  dark: [
    lightTransparent,
    "#000",
    "#000",
    "#f8f8f8",
    "hsl(0, 0%, 96.3%)",
    "hsl(0, 0%, 94.1%)",
    "hsl(0, 0%, 92.0%)",
    "hsl(0, 0%, 90.0%)",
    "hsl(0, 0%, 88.5%)",
    "hsl(0, 0%, 81.0%)",
    "#000",
    "#57b058",
    "#fff",
    darkTransparent
  ],
  light: [
    darkTransparent,
    "#fff",
    "#fff",
    "#f8f8f8",
    "#3c3632",
    "#44A751", // Focus border
    "#3c3632", // Border
    "#44A751",
    "#44A751",
    "#3c3632", // Date picker text
    "#fff",
    "#57b058",
    "#000",
    lightTransparent
  ]
  //   light: [
  //     "#fff",
  //     "#fff",
  //     "#F1F1F1", // Background strong
  //     "#E3E3E3", // Background hover, Button press
  //     "#21426d", // Button background
  //     "#37557c", // Button hover
  //     "#4d688a", // Border color
  //     "#647b99",
  //     "#7a8ea7", //Button border hover
  //     "#90a1b6",
  //     "#fff", // Button text
  //     "#57b058", // alt Text
  //     "#21426d", // Text
  //     darkTransparent
  //   ]
};

//my_palettes.light[1] = "#edece1";

const templateColors = {
  color1: 1,
  color2: 2,
  color3: 3,
  color4: 4,
  color5: 5,
  color6: 6,
  color7: 7,
  color8: 8,
  color9: 9,
  color10: 10,
  color11: 11,
  color12: 12
};

const templateShadows = {
  shadowColor: 1,
  shadowColorHover: 1,
  shadowColorPress: 2,
  shadowColorFocus: 2
};

// we can use subset of our template as a "skip" so it doesn't get adjusted with masks
const skip = {
  ...templateColors,
  ...templateShadows
};

// templates use the palette and specify index
// negative goes backwards from end so -1 is the last item
const template = {
  ...skip,
  // the background, color, etc keys here work like generics - they make it so you
  // can publish components for others to use without mandating a specific color scale
  // the @tamagui/button Button component looks for `$background`, so you set the
  // dark_red_Button theme to have a stronger background than the dark_red theme.
  background: 2,
  backgroundHover: 3,
  backgroundPress: 1,
  backgroundFocus: 2,
  backgroundStrong: 1,
  backgroundTransparent: 0,
  color: -1,
  colorHover: -2,
  colorPress: -1,
  colorFocus: -2,
  colorTransparent: -0,
  borderColor: 4,
  borderColorHover: 5,
  borderColorPress: 3,
  borderColorFocus: 4,
  placeholderColor: -4
};

const lightShadowColor = "rgba(0,0,0,0.02)";
const lightShadowColorStrong = "rgba(0,0,0,0.066)";
const darkShadowColor = "rgba(0,0,0,0.2)";
const darkShadowColorStrong = "rgba(0,0,0,0.3)";

const lightShadows = {
  shadowColor: lightShadowColorStrong,
  shadowColorHover: lightShadowColorStrong,
  shadowColorPress: lightShadowColor,
  shadowColorFocus: lightShadowColor
};

const darkShadows = {
  shadowColor: darkShadowColorStrong,
  shadowColorHover: darkShadowColorStrong,
  shadowColorPress: darkShadowColor,
  shadowColorFocus: darkShadowColor
};

const lightTemplate = {
  ...template,
  // our light color palette is... a bit unique
  borderColor: 6,
  borderColorHover: 7,
  borderColorFocus: 5,
  borderColorPress: 6,
  ...lightShadows
};

const darkTemplate = { ...template, ...darkShadows };

const light = createTheme(my_palettes.light, lightTemplate);
// const dark = createTheme(my_palettes.dark, darkTemplate);
const dark = createTheme(my_palettes.light, lightTemplate);

type SubTheme = typeof light;

const baseThemes: {
  light: SubTheme;
  dark: SubTheme;
} = {
  light,
  dark
};

const masks = {
  weaker: createWeakenMask(),
  stronger: createStrengthenMask()
};

// default mask options for most uses
const maskOptions: MaskOptions = {
  skip,
  // avoids the transparent ends
  max: my_palettes.light.length - 2,
  min: 1
};

const allThemes = addChildren(baseThemes, (name, theme) => {
  const isLight = name === "light";
  const inverseName = isLight ? "dark" : "light";
  const inverseTheme = baseThemes[inverseName];
  const transparent = (hsl: string, opacity = 0) =>
    hsl.replace(`%)`, `%, ${opacity})`).replace(`hsl(`, `hsla(`);

  // setup colorThemes and their inverses
  const [colorThemes, inverseColorThemes] = [
    myColorTokens[name],
    myColorTokens[inverseName]
  ].map((colorSet) => {
    return Object.fromEntries(
      Object.keys(colorSet).map((color) => {
        const colorPalette = Object.values(colorSet[color]) as string[];
        // were re-ordering these
        const [head, tail] = [
          colorPalette.slice(0, 6),
          colorPalette.slice(colorPalette.length - 5)
        ];
        // add our transparent colors first/last
        // and make sure the last (foreground) color is white/black rather than colorful
        // this is mostly for consistency with the older theme-base
        const palette = [
          transparent(colorPalette[0]),
          ...head,
          ...tail,
          theme.color,
          transparent(colorPalette[colorPalette.length - 1])
        ];
        const colorTheme = createTheme(
          palette,
          isLight
            ? {
                ...lightTemplate,
                // light color themes are a bit less sensitive
                borderColor: 4,
                borderColorHover: 5,
                borderColorFocus: 4,
                borderColorPress: 4
              }
            : darkTemplate
        );
        return [color, colorTheme];
      })
    ) as Record<ColorName, SubTheme>;
  });

  const allColorThemes = addChildren(colorThemes, (colorName, colorTheme) => {
    const inverse = inverseColorThemes[colorName];
    return {
      ...getAltThemes(colorTheme, inverse),
      ...getComponentThemes(colorTheme, inverse)
    };
  });

  const baseActiveTheme = applyMask(colorThemes.blue, masks.weaker, {
    ...maskOptions,
    strength: 4
  });

  const baseSubThemes = {
    ...getAltThemes(theme, inverseTheme, baseActiveTheme),
    ...getComponentThemes(theme, inverseTheme)
  };

  return {
    ...baseSubThemes,
    ...allColorThemes
  };

  function getAltThemes(
    theme: SubTheme,
    inverse: SubTheme,
    activeTheme?: SubTheme
  ) {
    const maskOptionsAlt = {
      ...maskOptions,
      skip: templateShadows
    };
    const alt1 = applyMask(theme, masks.weaker, maskOptionsAlt);
    const alt2 = applyMask(alt1, masks.weaker, maskOptionsAlt);
    const active =
      activeTheme ??
      applyMask(theme, masks.weaker, {
        ...maskOptions,
        strength: 4
      });
    return addChildren({ alt1, alt2, active }, (_, subTheme) => {
      return getComponentThemes(
        subTheme,
        subTheme === inverse ? theme : inverse
      );
    });
  }

  function getComponentThemes(theme: SubTheme, inverse: SubTheme) {
    const weaker1 = applyMask(theme, masks.weaker, maskOptions);
    const weaker2 = applyMask(weaker1, masks.weaker, maskOptions);
    const stronger1 = applyMask(theme, masks.stronger, maskOptions);
    const inverse1 = applyMask(inverse, masks.weaker, maskOptions);
    const inverse2 = applyMask(inverse1, masks.weaker, maskOptions);
    const strongerBorderLighterBackground: SubTheme = isLight
      ? {
          ...stronger1,
          borderColor: weaker1.borderColor,
          borderColorHover: weaker1.borderColorHover,
          borderColorPress: weaker1.borderColorPress,
          borderColorFocus: weaker1.borderColorFocus
        }
      : {
          ...theme,
          borderColor: weaker1.borderColor,
          borderColorHover: weaker1.borderColorHover,
          borderColorPress: weaker1.borderColorPress,
          borderColorFocus: weaker1.borderColorFocus
        };
    const inverseTheme: SubTheme = {
      ...theme,
      backgroundStrong: theme.color
    };
    return {
      Card: weaker1,
      Button: weaker2,
      Checkbox: weaker2,
      DrawerFrame: weaker1,
      SliderTrack: stronger1,
      SliderTrackActive: weaker2,
      SliderThumb: inverse1,
      Progress: weaker1,
      ProgressIndicator: inverse,
      Switch: weaker2,
      SwitchThumb: inverse2,
      TooltipArrow: weaker1,
      TooltipContent: weaker2,
      Input: theme,
      TextArea: theme,
      Tooltip: inverse1,
      Inverse: inverseTheme
    };
  }
});

export const themes = {
  ...allThemes,
  // bring back the full type, the rest use a subset to avoid clogging up ts,
  // tamagui will be smart and use the top level themes as the type for useTheme() etc
  light: createTheme(my_palettes.light, lightTemplate, {
    nonInheritedValues: lightColors
  }),
  dark: createTheme(my_palettes.dark, darkTemplate, {
    nonInheritedValues: darkColors
  })
};
