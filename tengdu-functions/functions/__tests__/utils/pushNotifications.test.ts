import {
  createNewMatchNotifications,
  sendFirebasePushNotifications,
} from "src/utils/pushNotifications";
import { describe, expect, test } from "@jest/globals";
import { MatchInfo, UserInfo } from "src/models/users";
import { Timestamp } from "firebase-admin/firestore";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import { messaging } from "firebase-admin";

describe("createNewMatchNotifications", () => {
  test("createNewMatchNotifications creates correct messages for users with firebaseToken", () => {
    const users: UserInfo[] = [
      { firebaseToken: "token1" },
      { firebaseToken: "token2" },
      { firebaseToken: null },
    ];
    const newMatch: MatchInfo = {
      id: "match1",
      chatId: "chat1",
      newMatch: false,
      matchedUsers: [],
      date: Timestamp.now(),
    };

    const messages = createNewMatchNotifications(users, newMatch);

    expect(messages).toEqual([
      {
        token: "token1",
        notification: {
          title: "New Match",
          body: "Say hi and introduce yourself!",
        },
        data: {
          matchId: "match1",
          chatId: "chat1",
        },
      },
      {
        token: "token2",
        notification: {
          title: "New Match",
          body: "Say hi and introduce yourself!",
        },
        data: {
          matchId: "match1",
          chatId: "chat1",
        },
      },
    ]);
  });

  test("createNewMatchNotifications does not create messages for users without firebaseToken", () => {
    const users: UserInfo[] = [
      { firebaseToken: null },
      { firebaseToken: undefined },
    ];
    const newMatch: MatchInfo = {
      id: "match1",
      chatId: "chat1",
      newMatch: false,
      matchedUsers: [],
      date: Timestamp.now(),
    };

    const messages = createNewMatchNotifications(users, newMatch);

    expect(messages).toEqual([]);
  });

  test("createNewMatchNotifications does not add chatId if it is undefined in newMatch", () => {
    const users: UserInfo[] = [{ firebaseToken: "token1" }];
    const newMatch: MatchInfo = {
      id: "match1",
      chatId: undefined,
      newMatch: false,
      matchedUsers: [],
      date: Timestamp.now(),
    };

    const messages = createNewMatchNotifications(users, newMatch);

    expect(messages).toEqual([
      {
        token: "token1",
        notification: {
          title: "New Match",
          body: "Say hi and introduce yourself!",
        },
        data: {
          matchId: "match1",
        },
      },
    ]);
  });
});

describe("sendFirebasePushNotifications", () => {
  const mockSend = jest.fn();
  const sendSpy = jest.spyOn(messaging(), "send").mockImplementation(mockSend);

  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sendFirebasePushNotifications sends all messages", async () => {
    const messages: Message[] = [
      { token: "token1", notification: {}, data: {} },
      { token: "token2", notification: {}, data: {} },
    ];

    await sendFirebasePushNotifications(messages);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledWith(messages[0]);
    expect(mockSend).toHaveBeenCalledWith(messages[1]);
  });

  test("sendFirebasePushNotifications handles errors", async () => {
    const messages: Message[] = [
      { token: "token1", notification: {}, data: {} },
    ];

    (messaging().send as jest.Mock).mockRejectedValueOnce(
      new Error("Test error"),
    );

    await sendFirebasePushNotifications(messages);

    expect(sendSpy).toHaveBeenCalledWith(messages[0]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error sending push notifications:",
      new Error("Test error"),
    );
  });

  test("sendFirebasePushNotifications does not call send when there are no messages", async () => {
    const messages: Message[] = [];

    await sendFirebasePushNotifications(messages);

    expect(mockSend).not.toHaveBeenCalled();
  });

  test("sendFirebasePushNotifications handles multiple errors", async () => {
    const messages: Message[] = [
      { token: "token1", notification: {}, data: {} },
      { token: "token2", notification: {}, data: {} },
    ];

    sendSpy.mockRejectedValue(new Error("Test error"));
    await sendFirebasePushNotifications(messages);

    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error sending push notifications:",
      new Error("Test error"),
    );
  });

  test("sendFirebasePushNotifications does not call send when messages is null", async () => {
    const messages: Message[] = null;

    await sendFirebasePushNotifications(messages);

    expect(mockSend).not.toHaveBeenCalled();
  });

  test("sendFirebasePushNotifications does not call send when messages is undefined", async () => {
    const messages: Message[] = undefined;

    await sendFirebasePushNotifications(messages);

    expect(mockSend).not.toHaveBeenCalled();
  });
});
