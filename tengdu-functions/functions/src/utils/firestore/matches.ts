import { getFirestore } from "firebase-admin/firestore";
import { MatchInfo } from "../../models/users";
import { removeMatchFromUser, removeMatchFromUsers } from "./users";
import admin from "firebase-admin";

export const createMatchDocument = async (match: MatchInfo) => {
  await getFirestore().collection("matches").doc(match.id).set(match);
};

export const deleteMatchDocument = async (id: string) => {
  await getFirestore().collection("matches").doc(id).delete();
};

export const getMatch = async (id: string): Promise<MatchInfo> => {
  const match = await getFirestore().collection("matches").doc(id).get();
  if (match.exists) {
    return match.data() as MatchInfo;
  } else {
    return undefined;
  }
};

export const deleteMatch = async (id: string): Promise<string> => {
  const match = await getMatch(id);
  await removeMatchFromUsers(match);
  await deleteMatchDocument(id);
  return match.chatId;
};

export const removeUserFromMatch = async (matchId: string, uid: string) => {
  await getFirestore()
    .collection("matches")
    .doc(matchId)
    .update({
      matchedUsers: admin.firestore.FieldValue.arrayRemove(uid),
    });
  await removeMatchFromUser(uid, matchId);
};
