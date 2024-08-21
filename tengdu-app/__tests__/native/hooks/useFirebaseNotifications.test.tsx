/* eslint-disable @typescript-eslint/no-empty-function */
import messaging from "@react-native-firebase/messaging";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useFirebaseNotifications } from "hooks/useFirebaseNotifications";
import { notificationHandler } from "utils/notificationHandler";

jest.mock("utils/notificationHandler", () => ({
  notificationHandler: jest.fn()
}));

const mockOnMessage = jest.fn(() => () => {});
const mockSetBackgroundMessageHandler = jest.fn();
let mockGetToken = jest.fn().mockResolvedValue("mocked-token");
const mockOnTokenRefresh = jest.fn(() => () => {});
const mockOnNotificationOpenedApp = jest.fn(() => () => {});
const mockGetInitialNotification = jest.fn();

jest.mock("@react-native-firebase/messaging", () => {
  const messagingModule = jest.requireActual(
    "@react-native-firebase/messaging"
  );
  return () => ({
    ...messagingModule,
    onTokenRefresh: mockOnTokenRefresh,
    getToken: mockGetToken,
    onMessage: mockOnMessage,
    setBackgroundMessageHandler: mockSetBackgroundMessageHandler,
    onNotificationOpenedApp: mockOnNotificationOpenedApp,
    getInitialNotification: mockGetInitialNotification
  });
});

describe("useFirebaseNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should not get token if expoToken is not provided", async () => {
    const { result } = renderHook(() => useFirebaseNotifications(undefined));

    expect(result.current.token).toBeUndefined();
    expect(messaging().getToken).not.toHaveBeenCalled();
  });
  it("should get the FCM token when expoToken is present", async () => {
    const { result } = renderHook(() =>
      useFirebaseNotifications("token is present")
    );

    await waitFor(() => expect(result.current.token).toBe("mocked-token"));
  });

  it("should get the FCM token when expoToken is present", async () => {
    const { result } = renderHook(() =>
      useFirebaseNotifications("token is present")
    );

    await waitFor(() => expect(result.current.token).toBe("mocked-token"));
  });

  it("should not handle not getting the FCM token", async () => {
    mockGetToken = jest.fn().mockRejectedValueOnce(new Error("Token error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error getting FCM token",
        new Error("Token error")
      )
    );
    expect(result.current.token).toBeUndefined();

    //reset
    mockGetToken = jest.fn().mockResolvedValue("mocked-token");
  });

  it("should handle incoming foreground notifications", async () => {
    const mockMessage = {
      data: { key: "mockData" },
      fcmOptions: {
        analyticsLabel: "analytics-label",
        link: "https://example.com"
      }
    };

    // Render the hook
    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    // Access the onMessage function mock
    const onMessageMock = messaging().onMessage;

    // Call the onMessage callback with the mock message
    await waitFor(() => {
      (onMessageMock as jest.Mock).mock.calls[0][0](mockMessage);
    });

    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current.notification).toEqual(mockMessage);
    });
  });

  it("should handle incoming background notifications", async () => {
    const mockMessage = {
      data: { key: "mockData" },
      fcmOptions: {
        analyticsLabel: "analytics-label",
        link: "https://example.com"
      }
    };

    // Render the hook
    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    // Access the setBackgroundMessageHandler function mock
    const setBackgroundMessageHandlerMock =
      messaging().setBackgroundMessageHandler;

    // Call the setBackgroundMessageHandler callback with the mock message
    await waitFor(() => {
      (setBackgroundMessageHandlerMock as jest.Mock).mock.calls[0][0](
        mockMessage
      );
    });

    // Wait for the hook to update
    await waitFor(() => {
      expect(result.current.notification).toEqual(mockMessage);
    });
  });

  it("should handle an error when getting the FCM token fails", async () => {
    mockGetToken = jest.fn().mockRejectedValue(new Error("Token error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error getting FCM token",
        new Error("Token error")
      )
    );
    expect(result.current.token).toBeUndefined();

    // reset
    mockGetToken = jest.fn().mockResolvedValue("mocked-token");
  });

  it("should set up message handlers", async () => {
    renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() => {
      expect(messaging().onMessage).toHaveBeenCalled();
      expect(messaging().setBackgroundMessageHandler).toHaveBeenCalled();
    });
  });

  it("should not fetch the FCM token again if the Expo token has not changed", async () => {
    const { rerender } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Rerender the hook with the same Expo token
    rerender({});

    await waitFor(() => {
      // The getToken function should only have been called once
      expect(messaging().getToken).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle token refresh events", async () => {
    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    // Access the function mock
    const onTokenRefreshMock = messaging().onTokenRefresh;

    // Simulate a token refresh event
    const newToken = "newToken";
    await waitFor(() => {
      (onTokenRefreshMock as jest.Mock).mock.calls[0][0](newToken);
    });

    // Check that the new token is set in the state
    expect(result.current.token).toEqual(newToken);
  });

  it("should unsubscribe from foreground notifications on unmount", async () => {
    const unsubscribe = jest.fn();
    mockOnMessage.mockReturnValue(unsubscribe);

    const { unmount, result } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Wait for the token to be set
    await waitFor(() => expect(result.current.token).toBe("mocked-token"));

    unmount();

    await waitFor(() => expect(unsubscribe).toHaveBeenCalled());
  });

  it("should unsubscribe from token refresh events on unmount", async () => {
    const unsubscribe = jest.fn();
    mockOnTokenRefresh.mockReturnValue(unsubscribe);

    const { unmount, result } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Wait for the token to be set
    await waitFor(() => expect(result.current.token).toBe("mocked-token"));

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not fetch the FCM token again if the Expo token changes to a valid value", async () => {
    const { rerender } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Change the Expo token to a new valid value
    rerender("newExpoToken");

    // The getToken function should still only have been called once
    await waitFor(() => expect(messaging().getToken).toHaveBeenCalledTimes(1));
  });

  it("should stop fetching the FCM token if the Expo token changes to undefined", async () => {
    const { rerender } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Change the Expo token to undefined
    rerender(undefined);

    // The getToken function should not be called again
    await waitFor(() => expect(messaging().getToken).toHaveBeenCalledTimes(1));
  });

  it("should set the FCM token to undefined if the Expo token changes to undefined", async () => {
    const { rerender, result } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Change the Expo token to undefined
    rerender(undefined);

    // The FCM token should be set to undefined
    await waitFor(() => expect(result.current.token).toBeUndefined());
  });

  it("should handle notification opened app events", async () => {
    const mockMessage = {
      data: { key: "mockData" },
      fcmOptions: {
        analyticsLabel: "analytics-label",
        link: "https://example.com"
      }
    };

    const { result } = renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() => {
      (mockOnNotificationOpenedApp as jest.Mock).mock.calls[0][0](mockMessage);
    });

    expect(notificationHandler).toHaveBeenCalledWith(mockMessage, "firebase");
  });

  it("should handle initial notification", async () => {
    const mockMessage = {
      data: { key: "mockData" },
      fcmOptions: {
        analyticsLabel: "analytics-label",
        link: "https://example.com"
      }
    };

    mockGetInitialNotification.mockResolvedValue(mockMessage);

    renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() => {
      expect(notificationHandler).toHaveBeenCalledWith(mockMessage, "firebase");
    });
  });

  it("should not handle initial notification if there is none", async () => {
    mockGetInitialNotification.mockResolvedValue(null);

    renderHook(() => useFirebaseNotifications("expoToken"));

    await waitFor(() => {
      expect(notificationHandler).not.toHaveBeenCalled();
    });
  });

  it("should unsubscribe from notification opened app events on unmount", async () => {
    const unsubscribe = jest.fn();
    mockOnNotificationOpenedApp.mockReturnValue(unsubscribe);

    const { unmount, result } = renderHook(() =>
      useFirebaseNotifications("expoToken")
    );

    // Wait for the token to be set
    await waitFor(() => expect(result.current.token).toBe("mocked-token"));

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
