import { getPublicUsers } from "firebaseFunctions";

import { db } from "../firebaseConfig";
import { PublicUserInfo, UserInfo } from "../models/user";

// if one of the user IDs is invalid, the function will throw an error
export async function getUsers(userIds: string[]): Promise<PublicUserInfo[]> {
  const users = await getPublicUsers(userIds);
  return users;
}

export async function getUser(uid: string): Promise<UserInfo> {
  if (uid) {
    const user = await db.collection("users").doc(uid).get();
    if (user.exists) {
      return user.data() as UserInfo;
    } else {
      throw new Error("Profile doesn't exist");
    }
  } else {
    throw new Error("User ID is required");
  }
}
