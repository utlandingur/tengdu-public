import { CallableRequest } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

export const onCallWithAuth = async (
  request: CallableRequest,
  handler: () => Promise<void>,
) => {
  try {
    const auth = request.auth;
    if (!auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
      );
    }

    await handler();
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
};
