// import "@testing-library/jest-dom";
import "@testing-library/jest-native/extend-expect";

jest.mock("expo-router/build/testing-library/mocks", () => {
  const originalModule = jest.requireActual(
    "expo-router/build/testing-library/mocks"
  );

  return {
    ...originalModule,
    initialUrlRef: {}
  };
});
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");
jest.mock("@react-native-firebase/app", () => ({
  apps: [],
  initializeApp: jest.fn()
}));
jest.mock("@react-native-firebase/functions", () => {
  return () => ({
    httpsCallable: jest.fn(() => async () => ({ data: {} }))
  });
});
jest.mock("@react-native-firebase/auth", () => {
  let mockUser = null;

  return () => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback(mockUser);
      return jest.fn(); // mock unsubscribe function
    }),
    __setMockUser: (user) => {
      mockUser = user;
    },
    auth: () => {
      {
        jest.fn();
      }

      // Add other methods as needed
    }
  });
});

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ idToken: "testIdToken" })),
    configure: jest.fn()
  }
}));

jest.mock("@react-native-firebase/firestore", () => {
  return () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValueOnce({})
    // Add other methods as needed
  });
});

jest.mock("@react-native-firebase/storage", () => {
  return () => ({
    ref: jest.fn().mockReturnThis()
    // Add other methods aAs needed
  });
});

jest.mock("./firebaseConfig", () => {
  const originalModule = jest.requireActual("./firebaseConfig");

  return {
    __esModule: true,
    ...originalModule,
    db: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: jest
          .fn()
          .mockReturnValue({ setupComplete: false, email: "test@test.com" })
      })
    },
    createUserWithEmailAndPassword: jest
      .fn()
      .mockImplementation((email, password) => {
        return Promise.resolve({
          additionalUserInfo: { isNewUser: true, providerId: "password" },
          user: {
            uid: "testUid",
            email: email,
            emailVerified: false,
            isAnonymous: false,
            providerId: "firebase",
            refreshToken: "testRefreshToken"
          }
        });
      }),
    signInWithEmailAndPassword: jest
      .fn()
      .mockImplementation((email, password) => {
        return Promise.resolve({
          additionalUserInfo: { isNewUser: true, providerId: "password" },
          user: {
            uid: "testUid",
            email: email,
            emailVerified: false,
            isAnonymous: false,
            providerId: "firebase",
            refreshToken: "testRefreshToken"
          }
        });
      }),
    signOut: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    }),
    sendPasswordResetEmail: jest.fn().mockImplementation((email) => {
      return Promise.resolve();
    }),
    // I've hard coded details as we don't know the email etc until promise is returned
    signInWithCredential: jest.fn(() => {
      return Promise.resolve({
        additionalUserInfo: { isNewUser: true, providerId: "password" },
        user: {
          uid: "testUid",
          email: "google-email",
          emailVerified: false,
          isAnonymous: false,
          providerId: "firebase",
          refreshToken: "testRefreshToken"
        }
      });
    })
  };
});

jest.mock("./providers/AuthProvider", () => {
  const originalModule = jest.requireActual("./providers/AuthProvider");

  return {
    ...originalModule,
    useSession: jest.fn(() => ({
      ...originalModule.useSession(), // Include the original useSession functions
      loading: false,
      error: null
    }))
  };
});

jest.mock("@tamagui/animate-presence", () => {
  return {
    AnimatePresence: ({ children }) => children
  };
});

// mocking KeyboardAwareScrollView to avoid error
jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const { View } = require("react-native");
  return { KeyboardAwareScrollView: View };
});
