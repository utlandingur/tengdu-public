import { describe, expect, test } from "@jest/globals";
import admin from "firebase-admin";
import {
  clearUsers,
  initializeUsers,
  generateUserTestData,
} from "../__data__/users";
import { makeMatch } from "../src/utils/matching";
import { clearMatches } from "../__data__/matches";
import { MatchInfo, UserInfo } from "../src/models/users";
import { getFirestore } from "firebase-admin/firestore";
import {
  getUsers,
  removeUserFromMatchedUsers,
} from "../src/utils/firestore/users";
import { v4 as uuidv4 } from "uuid";
import { DefaultGenerics, StreamChat } from "stream-chat";
import * as chatUtils from "../src/utils/chat";
import { getMatch } from "../src/utils/firestore/matches";
import * as PushNotifications from "src/utils/pushNotifications";
import { user } from "firebase-functions/v1/auth";
import { messaging } from "firebase-admin";
import { before } from "node:test";
import exp from "node:constants";

// describe("simple firebase test", () => {
//   test("firestore trigger", async () => {
//     // Make a fake document snapshot to pass to the function
//     const beforeSnap = global.fTest.firestore.makeDocumentSnapshot(
//       { text: "sesar" },
//       "test/1",
//     );
//     // Make snapshot for state of database after the change
//     const afterSnap = global.fTest.firestore.makeDocumentSnapshot(
//       { text: "luke" },
//       "test/1",
//     );
//     const change = global.fTest.makeChange(beforeSnap, afterSnap);
//     const wrapped = global.fTest.wrap(global.myFunctions.firestoreTriggerTest);

//     // Call the function
//     await wrapped({ data: change, params: {} });

//     // Check the data in the Firestore emulator
//     const snap = await admin.firestore().doc("/newTest/3").get();
//     expect(snap.data()).toEqual({
//       dataAfter: {
//         text: "luke",
//       },
//       dataBefore: {
//         text: "sesar",
//       },
//     });
//   });
// });

describe("Match API", () => {
  let users = [];
  let userIds = [];

  let matchesToClear: string[] = [];

  beforeEach(async () => {
    users = generateUserTestData();
    userIds = users.map((user) => user.uid);
    await initializeUsers(users);
  });

  afterEach(async () => {
    await clearUsers(users);
    if (matchesToClear.length > 0) {
      await clearMatches(matchesToClear);
      matchesToClear = [];
    }
  });

  describe("createMatch", () => {
    const mockSend = jest.fn();
    const sendSpy = jest
      .spyOn(messaging(), "send")
      .mockImplementation(mockSend);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const sendFirebasePushNotificationsSpy = jest.spyOn(
      PushNotifications,
      "sendFirebasePushNotifications",
    );

    const createNewMatchNotificationsSpy = jest.spyOn(
      PushNotifications,
      "createNewMatchNotifications",
    );

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should create match", async () => {
      // A fake request object, with req.query.text set to 'input'
      const req = { body: { users: userIds } };
      // Invoke addMessage with our fake request and response objects. This will cause the
      // assertions in the response object to be evaluated.

      const expectedMatch = makeMatch(users);

      const res = {
        json: (data) => {
          expectedMatch.id = data.id;
          expectedMatch.date = data.date;
          matchesToClear.push(data.id);
          expect(data).toEqual(expectedMatch);
        },
      };

      await global.myFunctions.createMatch(req, res);

      for (const id of userIds) {
        const userData = await getFirestore().collection("users").doc(id).get();
        const user = userData.data();
        expect(user.matches).toContainEqual(expectedMatch.id);
      }
    });

    test("should send push notifications if there are tokens on the users in the match", async () => {
      users = generateUserTestData();
      users[0].firebaseToken = "test-token";
      userIds = users.map((user) => user.uid);
      await initializeUsers(users);

      // A fake request object, with req.query.text set to 'input'
      const req = { body: { users: userIds } };

      // Invoke addMessage with our fake request and response objects. This will cause the
      // assertions in the response object to be evaluated.
      const expectedMatch = makeMatch(users);

      const res = {
        json: (data) => {
          expectedMatch.id = data.id;
          expectedMatch.date = data.date;
          matchesToClear.push(data.id);
          expect(data).toEqual(expectedMatch);
        },
      };

      await global.myFunctions.createMatch(req, res);

      for (const id of userIds) {
        const userData = await getFirestore().collection("users").doc(id).get();
        const user = userData.data();
        expect(user.matches).toContainEqual(expectedMatch.id);
      }

      expect(createNewMatchNotificationsSpy).toBeCalledTimes(1);
      expect(createNewMatchNotificationsSpy).toBeCalledWith(
        users,
        expectedMatch,
      );
      expect(sendFirebasePushNotificationsSpy).toBeCalledTimes(1);
      expect(sendFirebasePushNotificationsSpy).toBeCalledWith([
        {
          data: { matchId: expect.any(String) },
          notification: {
            body: "Say hi and introduce yourself!",
            title: "New Match",
          },
          token: "test-token",
        },
      ]);
    });

    test("should send push notifications if there are tokens on the users in the match", async () => {
      // give the first user a token
      users = generateUserTestData();
      users[0].firebaseToken = "test-token";
      userIds = users.map((user) => user.uid);
      await initializeUsers(users);

      // mock the createMatchChannel function
      jest
        .spyOn(chatUtils, "createMatchChannel")
        .mockResolvedValueOnce("chat-id");

      // A fake request object, with req.query.text set to 'input'
      const req = { body: { users: userIds, createChat: true } };

      // Invoke addMessage with our fake request and response objects. This will cause the
      // assertions in the response object to be evaluated.
      const expectedMatch = makeMatch(users);
      expectedMatch.chatId = "chat-id";

      const res = {
        json: (data) => {
          expectedMatch.id = data.id;
          expectedMatch.date = data.date;
          matchesToClear.push(data.id);
          expect(data).toEqual(expectedMatch);
        },
      };

      await global.myFunctions.createMatch(req, res);

      for (const id of userIds) {
        const userData = await getFirestore().collection("users").doc(id).get();
        const user = userData.data();
        expect(user.matches).toContainEqual(expectedMatch.id);
      }

      expect(createNewMatchNotificationsSpy).toBeCalledTimes(1);
      expect(createNewMatchNotificationsSpy).toBeCalledWith(
        users,
        expectedMatch,
      );
      expect(sendFirebasePushNotificationsSpy).toBeCalledTimes(1);
      expect(sendFirebasePushNotificationsSpy).toBeCalledWith([
        {
          data: { matchId: expect.any(String), chatId: "chat-id" },
          notification: {
            body: "Say hi and introduce yourself!",
            title: "New Match",
          },
          token: "test-token",
        },
      ]);
    });

    test("should add to existing matches", async () => {
      // A fake request object, with req.query.text set to 'input'
      const req = { body: { users: userIds } };
      const expectedMatch: MatchInfo = makeMatch(users);
      const expectedMatches: MatchInfo[] = [];

      const res = {
        json: (data) => {
          matchesToClear.push(data.id);
          expectedMatch.id = data.id;
          expectedMatch.date = data.date;
          expectedMatches.push({ ...expectedMatch });
        },
      };

      // Create two matches
      await global.myFunctions.createMatch(req, res);
      await global.myFunctions.createMatch(req, res);

      for (const id of userIds) {
        const userData = await getFirestore().collection("users").doc(id).get();
        const user: UserInfo = userData.data();
        expect(user.matches).toEqual(expectedMatches.map((m) => m.id));
      }
    });
    test("should return error on missing user id's", async () => {
      const req = { body: {} };

      const res = {
        status: (statusCode: number) => {
          expect(statusCode).toBe(400);
          return {
            json: (data) => {
              expect(data).toEqual({
                error: "Cannot read properties of undefined (reading 'map')",
              });
            },
          };
        },
      };
      await global.myFunctions.createMatch(req, res);
    });
    test("should return error on invalid user id's", async () => {
      const req = { body: { users: [uuidv4(), uuidv4()] } };

      const res = {
        status: (statusCode: number) => {
          expect(statusCode).toBe(400);
          return {
            json: (data) => {
              expect(data).toEqual({
                error: "Couldn't find specified users",
              });
            },
          };
        },
      };
      await global.myFunctions.createMatch(req, res);
    });
    test("should return error on missing body", async () => {
      const req = {};

      const res = {
        status: (statusCode: number) => {
          expect(statusCode).toBe(400);
          return {
            json: (data) => {
              expect(data).toEqual({
                error: "Cannot read properties of undefined (reading 'users')",
              });
            },
          };
        },
      };
      await global.myFunctions.createMatch(req, res);
    });
    test("should create chat channel if createChat is true", async () => {
      jest
        .spyOn(chatUtils, "createMatchChannel")
        .mockImplementation(
          async () => new Promise((resolve, reject) => resolve("chat-id")),
        );
      const req = { body: { users: userIds, createChat: true } };

      const expectedMatch = makeMatch(users);

      const res = {
        json: (data) => {
          expectedMatch.id = data.id;
          expectedMatch.date = data.date;
          expectedMatch.chatId = "chat-id";
          matchesToClear.push(data.id);
          expect(data).toEqual(expectedMatch);
        },
      };

      await global.myFunctions.createMatch(req, res);

      for (const id of userIds) {
        const userData = await getFirestore().collection("users").doc(id).get();
        const user = userData.data();
        expect(user.matches).toContainEqual(expectedMatch.id);
      }
    });
  });

  describe("removeMatch", () => {
    test("should remove match", async () => {
      const createReq = { body: { users: userIds } };

      let matchId = "";
      const createRes = {
        json: (data) => {
          matchId = data.id;
        },
      };

      await global.myFunctions.createMatch(createReq, createRes);

      const request = {
        auth: { uid: userIds[0] },
        data: { matchId },
      };
      const wrapped = global.fTest.wrap(global.myFunctions.removeMatch);
      await wrapped(request);

      const match = await getMatch(matchId);

      expect(match).toEqual(undefined);

      const usersInFirebase = await getUsers(userIds);
      for (const user of usersInFirebase) {
        expect(user.matches).toHaveLength(0);
      }
    });

    test("should remove user from match", async () => {
      let matchId = "";
      const createReq = { body: { users: userIds } };

      const createRes = {
        json: (data) => {
          matchId = data.id;
          matchesToClear.push(data.id);
        },
      };

      await global.myFunctions.createMatch(createReq, createRes);

      const request = {
        auth: { uid: userIds[0] },
        data: { matchId },
      };

      const wrapped = global.fTest.wrap(global.myFunctions.removeUserFromMatch);
      await wrapped(request);

      const match: MatchInfo = await getMatch(matchId);
      const usersInFirebase: UserInfo[] = await getUsers(userIds);

      expect(match.matchedUsers).toEqual([userIds[1]]);
      for (const u of usersInFirebase) {
        if (u.uid == users[0].uid) {
          expect(u.matches).toHaveLength(0);
        } else {
          expect(u.matches).toEqual([matchId]);
        }
      }
    });
  });
});
