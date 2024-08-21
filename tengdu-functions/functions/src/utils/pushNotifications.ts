import { messaging } from "firebase-admin";
import {
  AndroidConfig,
  WebpushConfig,
  ApnsConfig,
  Message,
} from "firebase-admin/lib/messaging/messaging-api";
import { MatchInfo, UserInfo } from "../models/users";

// create push notifications for all users that have a new match and an FCM token
export const createNewMatchNotifications = (
  users: UserInfo[],
  newMatch: MatchInfo,
): Message[] => {
  const messages: Message[] = [];
  for (const user of users) {
    if (user.firebaseToken) {
      const message: Message = {
        token: user.firebaseToken,
        notification: {
          title: "New Match",
          body: "Say hi and introduce yourself!",
        },
        data: {
          matchId: newMatch.id,
        },
      };

      if (newMatch.chatId) {
        message.data.chatId = newMatch.chatId;
      }

      messages.push(message);
    }
  }
  return messages;
};

// send a FCM push notification
export const sendFirebasePushNotifications = async (messages: Message[]) => {
  if (messages) {
    for (const message of messages) {
      try {
        await messaging().send(message);
      } catch (error) {
        console.error("Error sending push notifications:", error);
      }
    }
  }
  return;
};
