import { createContext, useContext, useEffect, useState } from "react";
import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useFirebaseNotifications } from "hooks/useFirebaseNotifications";
import { useNotificationPermission } from "hooks/useNotificationPermission";

const NotificationContext = createContext<{
  notificationsEnabled: boolean;
  expoPushToken: string;
  firebaseToken: string;
  notification:
    | Notifications.NotificationContent
    | FirebaseMessagingTypes.RemoteMessage
    | undefined;
} | null>(null);

export function useNotificationProvider() {
  const value = useContext(NotificationContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useNotificationContext must be wrapped in a <NotificationProvider />"
      );
    }
  }

  return value;
}

export const NotificationProvider = (props: React.PropsWithChildren) => {
  const expoPushToken = useNotificationPermission();
  // const {
  //   notification: expoNotification
  // } = useExpoNotifications();
  const { token: firebaseToken, notification: firebaseNotification } =
    useFirebaseNotifications(expoPushToken);

  // Combine Expo and Firebase notifications into a single notification state
  const [notification, setNotification] = useState<
    | Notifications.NotificationContent
    | FirebaseMessagingTypes.RemoteMessage
    | undefined
  >();

  useEffect(() => {
    if (firebaseNotification) {
      setNotification(firebaseNotification);
    }
  }, [firebaseNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled: Boolean(expoPushToken),
        expoPushToken,
        firebaseToken,
        notification
      }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};
