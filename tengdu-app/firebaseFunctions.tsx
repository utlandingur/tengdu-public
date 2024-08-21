import { PublicUserInfo } from "models/user";
import { firebaseFunctions } from "./firebaseConfig";

// references
const removeMatchCallable = firebaseFunctions.httpsCallable("removeMatch");
const removeUserFromMatchCallable = firebaseFunctions.httpsCallable(
  "removeUserFromMatch"
);
const reportUsersCallable = firebaseFunctions.httpsCallable("reportUsers");
const getPublicUsersCallable =
  firebaseFunctions.httpsCallable("getPublicUsers");
const confirmMatchCallable = firebaseFunctions.httpsCallable("confirmMatch");

// functions
export const removeUserFromMatch = async (matchId: string) => {
  try {
    await removeUserFromMatchCallable({ matchId });
  } catch (error) {
    console.error(error);
  }
};

export const reportUsers = async (reportedUsers: string[], reason: string) => {
  try {
    await reportUsersCallable({ reportedUsers, reason });
  } catch (error) {
    console.error(error);
  }
};

export const removeMatch = async (matchId: string) => {
  try {
    await removeMatchCallable({ matchId });
  } catch (error) {
    console.error(error);
  }
};

export const confirmMatch = async (matchId: string, uid: string) => {
  try {
    await confirmMatchCallable({ matchId, uid });
  } catch (error) {
    console.error(error);
  }
};

export const getPublicUsers = async (
  uids: string[]
): Promise<PublicUserInfo[]> => {
  try {
    const publicUsers = await getPublicUsersCallable({ uids });

    return publicUsers.data as PublicUserInfo[];
  } catch (error) {
    console.error(error);
  }
};
