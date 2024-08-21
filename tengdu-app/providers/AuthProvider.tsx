import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { ChatSession } from "models/chat";

import { makeUser } from "../db/users";
import {
  createUserWithEmailAndPassword,
  firebaseFunctions,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut
} from "../firebaseConfig";
import { useStorageState } from "../hooks/useStorageState";
import { User, UserInfo } from "../models/user";

GoogleSignin.configure({
  webClientId:
    "1008510641654-nh7vs9ajkrkn5h80708kgef7urr9eqcl.apps.googleusercontent.com"
});

const getToken = async () => {
  const callable = firebaseFunctions.httpsCallable("getStreamUserToken");
  try {
    const result = await callable();
    return result.data as string;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }
};

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  signOut: () => void;
  signUp: (email: string, password: string) => Promise<User>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  session?: string | null;
  user?: User;
  isLoading: boolean;
  chatSession?: ChatSession;
  authenticatedUserInfo?: UserInfo;
} | null>(null);

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

// can be moved inside the function to avoid manual export.
// was originally done for testing, but can be handled another way
export const handlePasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(email);
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const [user, setUser] = useState<User>(null);
  const [authenticatedUserInfo, setAuthenticatedUserInfo] =
    useState<UserInfo>(null);
  const [chatSession, setChatSession] = useState<ChatSession>(null);

  // Handle user state changes
  function setUserOnAuthStateChange(userDetails: User) {
    setUser(userDetails);
  }

  const fetchChatToken = async () => {
    const token = await getToken();
    const session = {
      tokenOrProvider: token,
      userData: {
        id: user.uid
      }
    };
    setChatSession(session);
  };

  useEffect(() => {
    if (user?.uid) {
      fetchChatToken();
    }
  }, [user]);

  useEffect(() => {
    const subscriber = onAuthStateChanged(setUserOnAuthStateChange);
    return subscriber; // unsubscribe on unmount
  }, []);

  const handleSignUp = async (email: string, password: string) => {
    if (!email && !password) {
      throw new Error("email missing-email and password missing-password");
    }
    if (!email) {
      throw new Error("email missing-email");
    }
    if (!password) {
      throw new Error("password missing-password");
    }

    const userCredential = await createUserWithEmailAndPassword(
      email,
      password
    );
    const firebaseUser = userCredential.user;
    const tengduUser: User = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      email: firebaseUser.email || ""
    };

    // Signed up
    setUser(tengduUser);
    makeUser(tengduUser.uid, tengduUser.email);
    return tengduUser as User;
  };

  const handleSignOut = async () => {
    signOut();
    setUser(null);
    setChatSession(null);
    setAuthenticatedUserInfo(null);
  };

  const handleSignInWithApple = async () => {
    try {
      // Get the users ID token
      const { identityToken } = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });
      // Create an Apple credential with the token
      const appleCredential = auth.AppleAuthProvider.credential(identityToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(appleCredential);
      const firebaseUser = userCredential.user;
      const tengduUser: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        email: firebaseUser.email || ""
      };
      // Signed in
      setUser(tengduUser);
      setAuthenticatedUserInfo({
        user: tengduUser,
        firstName: userCredential.user.displayName ?? null,
        photoURL: userCredential.user?.photoURL ?? null
      });
      return user;
    } catch (e) {
      return;
    }
  };

  const handleSignInWithGoogle = async () => {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true
      });
    }

    try {
      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(googleCredential);
      const firebaseUser = userCredential.user;
      const tengduUser: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        email: firebaseUser.email || ""
      };

      // Signed in
      setUser(tengduUser);
      setAuthenticatedUserInfo({
        user: tengduUser,
        firstName:
          userCredential.additionalUserInfo?.profile?.given_name ?? null,
        lastName:
          userCredential.additionalUserInfo?.profile?.family_name ?? null,
        photoURL: userCredential.additionalUserInfo?.profile?.picture
          ? userCredential.user.photoURL
          : null
      });

      return user;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password) {
      return Promise.reject("Email and password are required");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      const tengduUser: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        email: firebaseUser.email || ""
      };
      // Signed in
      setUser(tengduUser);
      return tengduUser; // to avoid user not having been updated yet
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: (email, password) => {
          return handleSignIn(email, password);
        },
        signInWithGoogle: handleSignInWithGoogle,
        signInWithApple: handleSignInWithApple,
        signOut: () => {
          handleSignOut();
        },
        signUp: handleSignUp,
        resetPassword: handlePasswordReset,
        session,
        user,
        isLoading,
        chatSession,
        authenticatedUserInfo
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
