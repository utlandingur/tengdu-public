import { createContext, useCallback, useContext, useEffect } from "react";
import { useUserInfo } from "hooks/useUserInfo";
import { useNotificationProvider } from "providers/NotificationProvider";

import { UserInfo } from "../models/user";

const ProfileContext = createContext<{
  profile: UserInfo;
  updateProfile: (updatedUserInfo?: Partial<UserInfo>) => Promise<void>;
  completeProfile: () => Promise<void>;
} | null>(null);

export function useProfile() {
  const value = useContext(ProfileContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useProfile must be wrapped in a <ProfileProvider />");
    }
  }

  return value;
}

export function ProfileProvider(props: React.PropsWithChildren) {
  const { expoPushToken, firebaseToken } = useNotificationProvider();
  const { userInfo, updateUserInfo } = useUserInfo();

  const completeProfile = useCallback(async () => {
    await updateUserInfo({
      setupComplete: true
    });
  }, [updateUserInfo]);

  // Update the user's expoPushToken if it has changed
  useEffect(() => {
    if (userInfo && expoPushToken && expoPushToken !== userInfo.expoPushToken) {
      updateUserInfo({
        ...userInfo,
        expoPushToken
      });
    }
  }, [expoPushToken, userInfo]);

  // Update the user's firebaseToken if it has changed
  useEffect(() => {
    if (userInfo && firebaseToken && firebaseToken !== userInfo.firebaseToken) {
      updateUserInfo({
        ...userInfo,
        firebaseToken
      });
    }
  }, [firebaseToken, userInfo]);

  return (
    <ProfileContext.Provider
      value={{
        profile: userInfo,
        updateProfile: updateUserInfo,
        completeProfile
      }}
    >
      {props.children}
    </ProfileContext.Provider>
  );
}
