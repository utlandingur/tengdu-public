import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import {
  ActionCodeSettings,
  Auth,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut
} from "firebase/auth";

import { makeUser } from "../db/users";
import { auth } from "../firebaseConfig";
import { useStorageState } from "../hooks/useStorageState";
import { User } from "../models/user";

const initialUserState: User = {
  uid: "",
  displayName: "",
  photoURL: "",
  email: ""
};

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => void;
  signUp: (email: string, password: string) => Promise<User>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  session?: string | null;
  user?: User;
  isLoading: boolean;
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

export const handlePasswordReset = async (
  email: string,
  actionCodeSettings?: ActionCodeSettings | null
): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export function SessionProvider(props: React.PropsWithChildren) {
  const router = useRouter();
  const [[isLoading, session], setSession] = useStorageState("session");
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return subscriber;
  }, []);

  const handleSignUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        // Signed up
        setUser(userCredential.user);
        makeUser(userCredential.user.uid, userCredential.user.email);
        return userCredential.user as User;
      }
    );
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
    });
  };

  const handleSignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // perform sign-in with Google logic here
    return signInWithRedirect(auth, provider)
      .then(() => {
        return getRedirectResult(auth);
      })
      .then((result) => {
        if (result.user) {
          setUser(result.user);
          return result.user as User;
        } else {
          throw new Error("No user found");
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  const handleSignIn = (email: string, password: string) => {
    // Perform sign-in logic here
    return signInWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        // Signed in
        setUser(userCredential.user);
        return userCredential.user as User;
      }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        signUp: handleSignUp,
        resetPassword: handlePasswordReset,
        session,
        user,
        isLoading
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
