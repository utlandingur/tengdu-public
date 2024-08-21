import { getStorybookUI } from "@storybook/react-native";

import "./storybook.requires";
import { Suspense, useEffect } from "react";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { TamaguiProvider, Text, Theme } from "tamagui";

import config from "../tamagui.config";

const StorybookDude = getStorybookUI({});

export default function StorybookUIRoot({}) {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    "Nunito-Black": require("../assets/fonts/nunito/Nunito-Black.ttf"),
    "Nunito-BlackItalic": require("../assets/fonts/nunito/Nunito-BlackItalic.ttf"),
    "Nunito-Bold": require("../assets/fonts/nunito/Nunito-Bold.ttf"),
    "Nunito-BoldItalic": require("../assets/fonts/nunito/Nunito-BoldItalic.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraBoldItalic": require("../assets/fonts/nunito/Nunito-ExtraBoldItalic.ttf"),
    "Nunito-Italic": require("../assets/fonts/nunito/Nunito-Italic.ttf"),
    "Nunito-Medium": require("../assets/fonts/nunito/Nunito-Medium.ttf"),
    "Nunito-MediumItalic": require("../assets/fonts/nunito/Nunito-MediumItalic.ttf"),
    "Nunito-Regular": require("../assets/fonts/nunito/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
    "Nunito-SemiBoldItalic": require("../assets/fonts/nunito/Nunito-SemiBoldItalic.ttf")
  });

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <Theme name={colorScheme}>
          <ThemeProvider
            value={colorScheme === "light" ? DefaultTheme : DarkTheme}
          >
            <StorybookDude />
          </ThemeProvider>
        </Theme>
      </Suspense>
    </TamaguiProvider>
  );
}
