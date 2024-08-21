// import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { Matches, MatchInfo } from "models/user";

import { db } from "../firebaseConfig";

export async function getMatches(matchIds: string[]): Promise<Matches> {
  const matchesPromises = matchIds.map(async (id) => {
    const match = await db.collection("matches").doc(id).get();
    if (match.exists) {
      return match.data() as MatchInfo;
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error getting document");
      }
    }
  });

  const matches: PromiseSettledResult<MatchInfo>[] = await Promise.allSettled(
    matchesPromises
  );

  return matches
    .filter(
      (result): result is PromiseFulfilledResult<MatchInfo> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);
}
