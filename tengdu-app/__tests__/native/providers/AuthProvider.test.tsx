/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect } from "react";
import { Text, View } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { waitFor } from "@testing-library/react-native";
import { useSession } from "providers/AuthProvider";

import {
  createUserWithEmailAndPassword,
  firebaseFunctions,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from "../../../firebaseConfig";
import { renderWithAuth } from "../../../render";

jest.mock("@react-native-firebase/auth", () => ({
  GoogleAuthProvider: {
    credential: jest.fn().mockReturnValue("testCredential")
  }
}));

jest.mock("@react-native-google-signin/google-signin");

jest.mock("db/users", () => {
  return {
    makeUser: jest.fn()
  };
});

jest.mock("../../../firebaseConfig", () => {
  return {
    firebaseAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
    firebaseFunctions: {
      httpsCallable: jest.fn()
    },
    sendPasswordResetEmail: jest.fn(),
    signInWithCredential: jest.fn().mockResolvedValue({
      user: {
        uid: "testUid",
        displayName: "testDisplayName",
        photoURL: "testPhotoURL",
        email: "testEmail"
      }
    }),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: "testUid",
        displayName: "testDisplayName",
        photoURL: "testPhotoURL",
        email: "testEmail"
      }
    }),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: "testUid",
        displayName: "testDisplayName",
        photoURL: "testPhotoURL",
        email: "testEmail"
      }
    })
  };
});

(firebaseFunctions.httpsCallable as jest.Mock).mockImplementation(() => {
  return jest.fn().mockResolvedValue({ data: "mockToken" });
});

jest.spyOn(console, "error").mockImplementation(() => {});

describe("SessionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("does not throw error when used within SessionProvider", async () => {
    // Render TestComponent within SessionProvider
    function TestComponent() {
      return (
        <View testID="text111">
          <Text>Test</Text>
        </View>
      );
    }
    await waitFor(() => {
      expect(() => renderWithAuth(<TestComponent />, {})).not.toThrow();
    });
  });

  it("updates user state when authentication state changes", async () => {
    const userDetails = {
      uid: "testUid",
      displayName: "",
      photoURL: "",
      email: "test@example.com"
    };

    (onAuthStateChanged as jest.Mock).mockImplementation((cb) => {
      cb(userDetails);
    });

    let testUser;
    // user state change happens asynchronously so we need to wait for that to happen
    // and then re-render
    function TestComponent() {
      const { user } = useSession();
      useEffect(() => {
        testUser = user;
      }, [user]);
      return null;
    }

    renderWithAuth(<TestComponent />, {});

    await waitFor(() => {
      expect(testUser).toEqual(userDetails);
    });
  });

  describe("resetPassword()", () => {
    it("calls resetPassword with an email", async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue({});

      const email = "test@example.com";
      const TestComponent = () => {
        const session = useSession();
        useEffect(() => {
          session?.resetPassword(email);
        }, []);

        return null;
      };
      await waitFor(() => renderWithAuth(<TestComponent />, {}));
      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(email);
      });
    });
  });

  describe("signInWithGoogle()", () => {
    it("signs in with Google if on Android", async () => {
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValueOnce({});
      (GoogleSignin.signIn as jest.Mock).mockResolvedValueOnce({
        idToken: "testIdToken"
      });
      (GoogleSignin.signIn as jest.Mock).mockResolvedValueOnce({});

      const setUser = jest.fn();
      function TestComponent() {
        const { user, signInWithGoogle } = useSession();
        useEffect(() => {
          signInWithGoogle();
        }, []);

        useEffect(() => {
          setUser(user);
        }, [user]);
        return null;
      }

      await waitFor(() => {
        renderWithAuth(<TestComponent />, {});
      });

      expect(setUser).toHaveBeenCalledWith({
        uid: "testUid",
        displayName: "testDisplayName",
        photoURL: "testPhotoURL",
        email: "testEmail"
      });
    });

    it("calls hasPlayServices if OS is android", async () => {
      jest.mock("react-native/Libraries/Utilities/Platform", () => ({
        OS: "android"
      }));

      let testUser;
      const TestComponent = () => {
        const { signInWithGoogle } = useSession();
        useEffect(() => {
          const getTestuser = async () => {
            testUser = await signInWithGoogle();
          };
          getTestuser();
        }, []);
        return null;
      };

      await waitFor(() => {
        renderWithAuth(<TestComponent />, {});
      });

      (GoogleSignin.signIn as jest.Mock).mockResolvedValueOnce({});
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValueOnce({});

      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    });

    it("applies authenticated user Info if available", async () => {
      const setAuthenticatedUserInfo = jest.fn();

      function TestComponent() {
        const { authenticatedUserInfo, signInWithGoogle } = useSession();

        useEffect(() => {
          signInWithGoogle();
        }, []);

        useEffect(() => {
          if (authenticatedUserInfo) {
            setAuthenticatedUserInfo(authenticatedUserInfo);
          }
        }, [authenticatedUserInfo]);

        return null;
      }

      await waitFor(() => {
        renderWithAuth(<TestComponent />, {});
      });

      await waitFor(() =>
        expect(setAuthenticatedUserInfo).toHaveBeenCalledWith({
          user: {
            uid: "testUid",
            displayName: "testDisplayName",
            photoURL: "testPhotoURL",
            email: "testEmail"
          },
          firstName: null,
          lastName: null,
          photoURL: null
        })
      );
    });
  });

  describe("signIn()", () => {
    it("calls signInWithEmailAndPassword with correct arguments", async () => {
      const email = "test@example.com";
      const password = "password";

      const TestComponent = () => {
        const { signIn } = useSession();
        useEffect(() => {
          try {
            signIn(email, password);
          } catch (error) {
            console.error("error", error);
          }
        }, []);

        return null;
      };

      await waitFor(() => {
        renderWithAuth(<TestComponent />, {});
      });
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          email,
          password
        );
      });
    });

    it("handles signInWithEmailAndPassword errors", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockImplementationOnce(() => {
        return Promise.reject(new Error("Test error"));
      });

      const email = "test@example.com";
      const password = "password";

      const mockErrorHandler = jest.fn();

      const TestComponent = () => {
        const { signIn } = useSession();
        useEffect(() => {
          signIn(email, password).catch(mockErrorHandler);
        }, []);
        return null;
      };

      await waitFor(() => renderWithAuth(<TestComponent />, {}));

      // Wait for the error to be handled
      await waitFor(() =>
        expect(mockErrorHandler).toHaveBeenCalledWith(new Error("Test error"))
      );
    });
  });
  describe("signOut()", () => {
    it("handles sign out", async () => {
      const setStates = jest.fn();

      function TestComponent() {
        const { signOut, user, chatSession, authenticatedUserInfo } =
          useSession();

        useEffect(() => {
          signOut();
        }, []);

        useEffect(() => {
          setStates({ user, chatSession, authenticatedUserInfo });
        }, [user, chatSession, authenticatedUserInfo]);

        return null;
      }

      await waitFor(() => renderWithAuth(<TestComponent />, {}));
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
        expect(setStates).toHaveBeenCalledWith({
          user: null,
          chatSession: null,
          authenticatedUserInfo: null
        });
      });
    });
  });

  describe("signUp()", () => {
    interface SignUpProps {
      email: string;
      password: string;
    }

    let errorLogged;
    const setUser = jest.fn();

    function SignUpTestComponent({ email, password }: SignUpProps) {
      const { user, signUp } = useSession();

      useEffect(() => {
        signUp(email, password).catch((error) => {
          errorLogged = error;
        });
      }, []);

      useEffect(() => {
        setUser(user);
      }, [user]);

      return null;
    }

    it("calls signUp with an email and password and creates a user", async () => {
      const email = "test@example.com";
      const password = "password";

      await waitFor(() =>
        renderWithAuth(
          <SignUpTestComponent
            email={email}
            password={password}
          />,
          {}
        )
      );
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          email,
          password
        );
        expect(setUser).toHaveBeenCalledWith({
          uid: "testUid",
          displayName: "testDisplayName",
          photoURL: "testPhotoURL",
          email: "testEmail"
        });
      });
    });
    it("rejects with an error when email and password are missing", async () => {
      const email = "";
      const password = "";

      await waitFor(() =>
        renderWithAuth(
          <SignUpTestComponent
            email={email}
            password={password}
          />,
          {}
        )
      );

      expect(errorLogged).toEqual(
        new Error("email missing-email and password missing-password")
      );
    });
    it("rejects with an error when only email is missing", async () => {
      const email = "";
      const password = "password";

      renderWithAuth(
        <SignUpTestComponent
          email={email}
          password={password}
        />,
        {}
      );

      await waitFor(() =>
        expect(errorLogged).toEqual(new Error("email missing-email"))
      );
    });

    it("rejects with an error when only password is missing", async () => {
      const email = "test@example.com";
      const password = "";

      renderWithAuth(
        <SignUpTestComponent
          email={email}
          password={password}
        />,
        {}
      );
      await waitFor(() =>
        expect(errorLogged).toEqual(new Error("password missing-password"))
      );
    });
  });
});
