import { useCallback, useEffect, useState } from "react";
import { UserInfo } from "models/user";
import { useSession } from "providers/AuthProvider";
import { db } from "../firebaseConfig";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

const privateUserInfo = (
  uid: string
): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> => {
  if (uid) {
    return db.collection("users").doc(uid);
  } else {
    throw new Error("User ID is required");
  }
};

async function setUser(uid: string, user: Partial<UserInfo>) {
  if (uid && user) {
    try {
      await privateUserInfo(uid).set(user, { merge: true });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error updating user data: ", error);
      }
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.error("User ID and user data are required");
    }
  }
}

export const useUserInfo = () => {
  const { user, authenticatedUserInfo } = useSession();
  const { uid, email } = user || {};
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    // setup a real-time listener to the database for the user document
    const unsubscribe = privateUserInfo(uid).onSnapshot(async (doc) => {
      if (doc.exists) {
        // if there is a user, set the user info
        setUserInfo(doc.data() as UserInfo);
      } else {
        // if there is no user, create a user with their info
        const userData: UserInfo = {
          email,
          setupComplete: false,
          ...authenticatedUserInfo
        };

        await setUser(uid, userData);
      }
    });

    return unsubscribe;
  }, [user]);

  const updateUserInfo = useCallback(
    async (updatedUserInfo?: Partial<UserInfo>): Promise<void> => {
      if (uid && userInfo && updatedUserInfo) {
        try {
          // Update user info in database
          await setUser(uid, updatedUserInfo);
        } catch {
          console.error("Error updating user info");
        }
      }
    },
    [uid, userInfo, setUser]
  );

  return { userInfo, updateUserInfo };
};
