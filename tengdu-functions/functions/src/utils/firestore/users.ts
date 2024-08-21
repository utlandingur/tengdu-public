import { getFirestore } from "firebase-admin/firestore";
import { MatchInfo, PublicUserInfo, UserInfo } from "../../models/users";
import admin from "firebase-admin";

export const createUserDocument = async (user: UserInfo) => {
  await getFirestore().collection("users").doc(user.uid).set(user);
};

export const deleteUserDocument = async (uid: string) => {
  await getFirestore().collection("users").doc(uid).delete();
};

export const getUsers = async (userIds: string[]): Promise<UserInfo[]> => {
  return await Promise.all(
    userIds.map(async (id) => {
      const user = await getFirestore().collection("users").doc(id).get();
      if (user.exists) {
        return { uid: id, ...user.data() } as UserInfo;
      } else {
        return null;
      }
    }),
  );
};

export const extractPublicUserInformation = (
  userInfo: UserInfo,
): PublicUserInfo => {
  const {
    uid,
    firstName,
    lastName,
    photoURL,
    gender,
    location,
    availability,
    interests,
  } = userInfo;
  return {
    uid,
    firstName,
    lastName,
    photoURL,
    gender,
    location,
    availability,
    interests,
  } as PublicUserInfo;
};

export const removeUserFromMatchedUsers = (
  match: MatchInfo,
  uid: string,
): MatchInfo => {
  const tmp = { ...match };
  tmp.matchedUsers = tmp.matchedUsers.filter((u) => u != uid);
  return tmp;
};

export const updateUserMatches = async (match: MatchInfo) => {
  const users = match.matchedUsers;
  for (const user of users) {
    await getFirestore()
      .collection("users")
      .doc(user)
      .update({
        matches: admin.firestore.FieldValue.arrayUnion(match.id),
      });
  }
};

export const removeMatchFromUser = async (uid: string, matchId: string) => {
  await getFirestore()
    .collection("users")
    .doc(uid)
    .update({
      matches: admin.firestore.FieldValue.arrayRemove(matchId),
    });
};

export const removeMatchFromUsers = async (match: MatchInfo) => {
  for (const uid of match.matchedUsers) {
    await removeMatchFromUser(uid, match.id);
  }
};
