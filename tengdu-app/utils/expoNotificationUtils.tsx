import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Strictly for demonstration purposes
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: object
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: data
  };

  if (!expoPushToken || !title || !body || !data) {
    handleRegistrationError("Missing parameters for sendPushNotification");
  }

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
  } catch (e) {
    handleRegistrationError(`Failed to send push notification`);
  }
}

// For showing an alert in case of an error
function handleRegistrationError(errorMessage: string) {
  throw new Error(errorMessage);
}

// To grab the Expo push token
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF44A751" // This is ##44A751 in AARRBBGG format
      });
    } catch (e) {
      handleRegistrationError(e.message);
      return;
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (await Notifications.getDevicePushTokenAsync())
        .data;
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}
