import { useEffect } from "react";
import { MessageCircle, Smile, UserCircle } from "@tamagui/lucide-icons";
import { Redirect, SplashScreen, Tabs } from "expo-router";
import { ChatProvider } from "providers/ChatProvider";
import { MatchProvider } from "providers/MatchProvider";

import { TAB_NAV_ICON_SIZE } from "../../../GLOBAL_VALUES";
import { useProfile } from "../../../providers/ProfileProvider";

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const { profile } = useProfile();

  useEffect(() => {
    if (profile) {
      SplashScreen.hideAsync();
    }
  }, [profile]);

  if (!profile) return null;

  if (!profile.setupComplete) {
    return <Redirect href="/createProfile/profile" />;
  }

  return (
    <MatchProvider>
      <ChatProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              paddingBottom: 0
            },
            tabBarActiveTintColor: "$primaryBackground",
            tabBarShowLabel: false
          }}
        >
          <Tabs.Screen
            name="feedback"
            options={{
              title: "Feedback",
              tabBarIcon({ color }) {
                return (
                  <Smile
                    size={TAB_NAV_ICON_SIZE}
                    color={color}
                  />
                );
              }
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: "Chat",
              tabBarIcon({ color }) {
                return (
                  <MessageCircle
                    size={TAB_NAV_ICON_SIZE}
                    color={color}
                  />
                );
              }
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon({ color }) {
                return (
                  <UserCircle
                    size={TAB_NAV_ICON_SIZE}
                    color={color}
                  />
                );
              }
            }}
          />
          <Tabs.Screen
            name="index"
            options={{ href: null }}
          />
        </Tabs>
      </ChatProvider>
    </MatchProvider>
  );
}
