// useNotificationPermission.ts
import { useEffect, useState } from "react";
import { registerForPushNotificationsAsync } from "utils/expoNotificationUtils";

export const useNotificationPermission: () => string = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>(undefined);

  const getExpoPushToken: () => Promise<void> = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token ?? undefined);
    } catch (error) {
      setExpoPushToken(undefined);
      console.error("Error getting ExpoPushToken", error);
    }
  };

  useEffect(() => {
    getExpoPushToken();
  }, []);

  return expoPushToken;
};
