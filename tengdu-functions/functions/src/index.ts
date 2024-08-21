// use-strict
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import {
  CallableRequest,
  onCall,
  onRequest,
} from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import { initializeApp, getApps } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

import * as functions from "firebase-functions";
import { UserRecord } from "firebase-admin/auth";
import { makeMatch } from "./utils/matching";
import { StreamChat } from "stream-chat";
import { getUsers, updateUserMatches } from "./utils/firestore/users";
import * as firestoreMatches from "./utils/firestore/matches";
import { getFirestore } from "firebase-admin/firestore";
import {
  createMatchChannel,
  deleteChannel,
  removeUserFromChannel,
} from "./utils/chat";
import { MatchInfo } from "./models/users";
import { addReportToUser } from "./utils/firestore/reporting";
import { onCallWithAuth } from "./utils/api/onCallFunctions";
import {
  createNewMatchNotifications,
  sendFirebasePushNotifications,
} from "./utils/pushNotifications";

if (getApps().length == 0) {
  initializeApp();
}
setGlobalOptions({ maxInstances: 10 });

// Define some parameters
const streamChatKey = defineString("STREAM_CHAT_KEY");
const streamChatSecret = defineString("STREAM_CHAT_SECRET");

const serverClient = StreamChat.getInstance(
  streamChatKey.value(),
  streamChatSecret.value(),
);

// When a user is deleted from Firebase their associated Stream account is also deleted.
export const deleteStreamUser = functions.auth
  .user()
  .onDelete((user: UserRecord) => {
    return serverClient.deleteUser(user.uid);
  });

// Create a Stream user and return auth token.
export const createStreamUserAndGetToken = functions.https.onCall(
  async (data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
      );
    } else {
      try {
        // Create user using the serverClient.
        await serverClient.upsertUser({
          id: context.auth.uid,
          name: context.auth.token.name,
          email: context.auth.token.email,
          image: context.auth.token.image,
        });

        // Create and return user auth token.
        return serverClient.createToken(context.auth.uid);
      } catch (err) {
        console.error(
          `Unable to create user with ID ${context.auth.uid} on Stream. Error ${err}`,
        );
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
          "aborted",
          "Could not create Stream user",
        );
      }
    }
  },
);

export const createStreamChatUser = functions.auth
  .user()
  .onCreate(async (user: UserRecord) => {
    // Checking that the user is authenticated.
    try {
      // Create user using the serverClient.
      await serverClient.upsertUser({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
      });

      // Create and return user auth token.
      return serverClient.createToken(user.uid);
    } catch (err) {
      console.error(
        `Unable to create user with ID ${user.uid} on Stream. Error ${err}`,
      );
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "aborted",
        "Could not create Stream user",
      );
    }
  });

// Get Stream user token.
export const getStreamUserToken = functions.https.onCall(
  (data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
      );
    } else {
      try {
        return serverClient.createToken(context.auth.uid);
      } catch (err) {
        console.error(
          `Unable to get user token with ID ${context.auth.uid} on Stream. Error ${err}`,
        );
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
          "aborted",
          "Could not get Stream user",
        );
      }
    }
  },
);

// Revoke the authenticated user's Stream chat token.
export const revokeStreamUserToken = functions.https.onCall(
  (data: any, context: any) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
      );
    } else {
      try {
        return serverClient.revokeUserToken(context.auth.uid);
      } catch (err) {
        console.error(
          `Unable to revoke user token with ID ${context.auth.uid} on Stream. Error ${err}`,
        );
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError(
          "aborted",
          "Could not get Stream user",
        );
      }
    }
  },
);

export const createMatch = onRequest(
  async (req: functions.https.Request, res: functions.Response) => {
    try {
      const body = req.body;

      const userIds: string[] = body.users;
      const createChat: boolean = body?.createChat;

      const users = await getUsers(userIds);

      if (users.some((u) => !u)) {
        res.status(400).json({
          error: "Couldn't find specified users",
        });
        return;
      }

      const newMatch = makeMatch(users);

      await firestoreMatches.createMatchDocument(newMatch);

      if (createChat) {
        newMatch.chatId = await createMatchChannel(serverClient, userIds);
      }

      await updateUserMatches(newMatch);

      // Send push notifications to all users in the match
      const messages = createNewMatchNotifications(users, newMatch);
      await sendFirebasePushNotifications(messages);

      res.json({ ...newMatch });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export const removeMatch = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
  },
  async (request: CallableRequest) => {
    await onCallWithAuth(request, async () => {
      const data = request.data;

      const matchId: string = data.matchId;

      const chatId = await firestoreMatches.deleteMatch(matchId);
      if (chatId) {
        await deleteChannel(serverClient, chatId);
      }
    });
  },
);

export const removeUserFromMatch = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
  },
  async (request: CallableRequest) => {
    await onCallWithAuth(request, async () => {
      const userId: string = request.auth.uid;
      const matchId: string = request.data.matchId;

      await firestoreMatches.removeUserFromMatch(matchId, userId);

      const match: MatchInfo = await firestoreMatches.getMatch(matchId);

      if (match.chatId) {
        await removeUserFromChannel(serverClient, match.chatId, userId);
      }
    });
  },
);

export const reportUsers = onCall(
  {
    enforceAppCheck: true, // Reject requests with missing or invalid App Check tokens.
  },
  (request: CallableRequest) => {
    onCallWithAuth(request, async () => {
      const data = request.data;
      functions.logger.log("Reporting user", data);

      const reportedBy = request.auth.uid;
      const reportedUsers: string[] = data.reportedUsers;
      const reason: string = data.reason;

      addReportToUser(reportedBy, reportedUsers, reason);
    });
  },
);

export const firestoreTriggerTest = onDocumentUpdated(
  "/test/{doc}",
  async (event: any) => {
    const dataAfter = event.data.after.data();
    const dataBefore = event.data.before.data();

    const firestore = getFirestore();
    await firestore.collection("newTest").doc("3").set({
      dataAfter: dataAfter,
      dataBefore: dataBefore,
    });
  },
);

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const addmessage = onRequest(async (req: any, res: any) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await getFirestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
export const proxyrequest = onRequest(
  { cors: true },
  async (req: any, res: any) => {
    let base = req.query.text;
    if (req.query?.key) {
      base += "&key=" + req.query.key;
    }
    const externalResponse = await fetch(base, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    const data = await externalResponse.json();

    res.json(data);
  },
);
