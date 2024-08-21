import { useEffect, useState } from "react";
import messaging, {
  FirebaseMessagingTypes
} from "@react-native-firebase/messaging";
import { useRouter } from "expo-router";

type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

export const useFirebaseNotifications = (expoToken: string | undefined) => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<RemoteMessage | undefined>(
    undefined
  );
  const router = useRouter();

  const notificationHandler = (
    notification: FirebaseMessagingTypes.RemoteMessage,
    provider: "firebase" | "expo"
  ) => {
    router.navigate(`/chat/`);
  };

  const FCM = messaging();

  const getToken = async () => {
    try {
      const token = await FCM.getToken();
      setToken(token);
    } catch (error) {
      console.error("Error getting FCM token", error);
    }
  };

  const handleForegroundNotifications = async (
    remoteMessage: RemoteMessage
  ) => {
    setNotification(remoteMessage);
  };

  const handleBackgroundMessage = async (remoteMessage: RemoteMessage) => {
    setNotification(remoteMessage);
  };

  const handleNotificationOpenedApp = (remoteMessage: RemoteMessage) => {
    notificationHandler(remoteMessage, "firebase");
  };

  const handleInitialNotification = async () => {
    const remoteMessage: RemoteMessage = await FCM.getInitialNotification();

    notificationHandler(remoteMessage, "firebase");
  };

  const handleTokenRefresh = (newToken) => {
    setToken(newToken);
  };

  useEffect(() => {
    if (!expoToken) return;

    getToken();
  }, [expoToken]);

  useEffect(() => {
    if (!token) return;
    const unsubscribeFromForegroundNotifications = FCM.onMessage(
      handleForegroundNotifications
    );
    FCM.setBackgroundMessageHandler(handleBackgroundMessage);
    const unsubscribeFromNotificationOpenedApp = FCM.onNotificationOpenedApp(
      handleNotificationOpenedApp
    );
    handleInitialNotification();
    const unsubscribeFromTokenRefresh = FCM.onTokenRefresh(handleTokenRefresh);

    return () => {
      unsubscribeFromForegroundNotifications();
      unsubscribeFromTokenRefresh();
      unsubscribeFromNotificationOpenedApp();
    };
  }, [token]);

  return { token, notification };
};
