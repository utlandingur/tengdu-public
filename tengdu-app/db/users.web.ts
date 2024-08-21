import { collection, doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebaseConfig";
import { UserInfo } from "../models/user";

export async function getUser(uid: string): Promise<UserInfo> {
  const userRef = doc(db, "users", uid);
  const user = await getDoc(userRef);
  if (user.exists()) {
    return user.data() as UserInfo;
  } else {
    throw new Error("Profile doesn't exist");
  }
}

export async function makeUser(uid: string, email: string) {
  return await setDoc(
    doc(db, "users", uid),
    { setupComplete: false, email: email },
    { merge: true }
  );
}

export async function setUser(uid: string, user: UserInfo) {
  user.localPhotoURL = "";
  await setDoc(doc(db, "users", uid), user, { merge: true });
}
