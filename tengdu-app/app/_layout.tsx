import "react-native-gesture-handler";

import { Suspense, useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NunitoSans_200ExtraLight,
  NunitoSans_200ExtraLight_Italic,
  NunitoSans_300Light,
  NunitoSans_300Light_Italic,
  NunitoSans_400Regular,
  NunitoSans_400Regular_Italic,
  NunitoSans_600SemiBold,
  NunitoSans_600SemiBold_Italic,
  NunitoSans_700Bold,
  NunitoSans_700Bold_Italic,
  NunitoSans_800ExtraBold,
  NunitoSans_800ExtraBold_Italic,
  NunitoSans_900Black,
  NunitoSans_900Black_Italic,
  useFonts
} from "@expo-google-fonts/nunito-sans";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import CentredSpinner from "components/CentredSpinner";
import * as Notifications from "expo-notifications";
import { Slot, SplashScreen } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { ChatClientProvider } from "providers/ChatClientProvider";
import { NotificationProvider } from "providers/NotificationProvider";
import { styled, TamaguiProvider, Text, Theme, XStack } from "tamagui";

import { ChatOverlay } from "../components/chat/ChatOverlay";
import { MySafeAreaView } from "../components/MySafeAreaView";
import { SessionProvider } from "../providers/AuthProvider";
import config from "../tamagui.config";

SplashScreen.preventAutoHideAsync();

const CenterStack = styled(XStack, {
  justifyContent: "center",
  flex: 1
});

export default function Layout() {
  // const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    NunitoSans_200ExtraLight,
    NunitoSans_200ExtraLight_Italic,
    NunitoSans_300Light,
    NunitoSans_300Light_Italic,
    NunitoSans_400Regular,
    NunitoSans_400Regular_Italic,
    NunitoSans_600SemiBold,
    NunitoSans_600SemiBold_Italic,
    NunitoSans_700Bold,
    NunitoSans_700Bold_Italic,
    NunitoSans_800ExtraBold,
    NunitoSans_800ExtraBold_Italic,
    NunitoSans_900Black,
    NunitoSans_900Black_Italic
  });

  useEffect(() => {
    // lock in portrait mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

    // MUST be setup before any notifications are received
    // Defines how notifications are handled when the app is in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false // Set the badge count on the app icon
      })
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return (
      <TamaguiProvider config={config}>
        <CentredSpinner />
      </TamaguiProvider>
    );
  }

  // Only use <DismissKeyboard> on the relevant screens.

  return (
    <GestureHandlerRootView style={styles.container}>
      <NotificationProvider>
        <ChatOverlay>
          <SessionProvider>
            <ChatClientProvider>
              <TamaguiProvider config={config}>
                <Suspense fallback={<Text>Loading...</Text>}>
                  <Theme name={"light"}>
                    <ThemeProvider value={DefaultTheme}>
                      <CenterStack>
                        <MySafeAreaView>
                          <Slot />
                        </MySafeAreaView>
                      </CenterStack>
                    </ThemeProvider>
                  </Theme>
                </Suspense>
              </TamaguiProvider>
            </ChatClientProvider>
          </SessionProvider>
        </ChatOverlay>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
