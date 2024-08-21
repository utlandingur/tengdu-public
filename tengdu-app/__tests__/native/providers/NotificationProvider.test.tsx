/* eslint-disable @typescript-eslint/no-empty-function */
import { renderHook, waitFor } from "@testing-library/react-native";
// import { useExpoNotifications } from "hooks/useExpoNotifications";
import { useFirebaseNotifications } from "hooks/useFirebaseNotifications";
import { useNotificationPermission } from "hooks/useNotificationPermission";
import {
  NotificationProvider,
  useNotificationProvider
} from "providers/NotificationProvider";

// jest.mock("hooks/useExpoNotifications");
jest.mock("hooks/useNotificationPermission");
jest.mock("hooks/useFirebaseNotifications");

const mockExpoPushToken = "expoPushToken";
const mockFirebaseToken = "firebaseToken";
const mockExpoNotification = { data: "Expo Notification" };
const mockFirebaseNotification = { data: "Firebase Notification" };

jest.spyOn(console, "error").mockImplementation(() => {});

const wrapper = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe("NotificationProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("provides the expo and firebase tokens and the notification", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: mockFirebaseNotification
    });
    const { result } = renderHook(() => useNotificationProvider(), { wrapper });

    await waitFor(() =>
      expect(result.current).toEqual({
        notificationsEnabled: true,
        expoPushToken: mockExpoPushToken,
        firebaseToken: mockFirebaseToken,
        notification: mockFirebaseNotification
      })
    );
  });

  it("throws an error when used outside of an NotificationProvider", () => {
    try {
      renderHook(() => useNotificationProvider());
    } catch (error) {
      expect(error).toEqual(
        Error(
          "useNotificationContext must be wrapped in a <NotificationProvider />"
        )
      );
    }
  });

  it("it always provides the most recent notification", () => {
    const newFirebaseNotification = { data: "New Firebase Notification" };
    const newestFirebaseNotification = { data: "Newest Expo Notification" };

    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: mockFirebaseNotification
    });

    const { result, rerender } = renderHook(() => useNotificationProvider(), {
      wrapper
    });

    expect(result.current.notification).toBe(mockFirebaseNotification);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: newFirebaseNotification
    });

    rerender({});

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: newestFirebaseNotification
    });

    rerender({});

    expect(result.current.notification).toBe(newestFirebaseNotification);
  });

  it("returns undefined for the notification when there are no notifications", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: undefined
    });

    const { result } = renderHook(() => useNotificationProvider(), { wrapper });

    await waitFor(() => expect(result.current.notification).toBeUndefined());
  });

  it("returns undefined for the tokens when they are undefined", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(undefined);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: undefined,
      notification: mockFirebaseNotification
    });

    const { result } = renderHook(() => useNotificationProvider(), { wrapper });

    await waitFor(() => {
      expect(result.current.expoPushToken).toBeUndefined();
      expect(result.current.firebaseToken).toBeUndefined();
    });
  });

  it("updates the tokens when they change", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: mockFirebaseNotification
    });

    const { result, rerender } = renderHook(() => useNotificationProvider(), {
      wrapper
    });

    expect(result.current.expoPushToken).toBe(mockExpoPushToken);
    expect(result.current.firebaseToken).toBe(mockFirebaseToken);

    const newExpoPushToken = "newExpoPushToken";
    const newFirebaseToken = "newFirebaseToken";

    (useNotificationPermission as jest.Mock).mockReturnValue(newExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: newFirebaseToken,
      notification: mockFirebaseNotification
    });

    rerender({});

    expect(result.current.expoPushToken).toBe(newExpoPushToken);
    expect(result.current.firebaseToken).toBe(newFirebaseToken);
  });

  it("always provides the most recent notification when multiple notifications are received in quick succession", async () => {
    const firstNotification = { data: "First Notification" };
    const secondNotification = { data: "Second Notification" };
    const thirdNotification = { data: "Third Notification" };

    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: firstNotification
    });

    const { result, rerender } = renderHook(() => useNotificationProvider(), {
      wrapper
    });

    expect(result.current.notification).toBe(firstNotification);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: secondNotification
    });

    rerender({});

    expect(result.current.notification).toBe(secondNotification);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: thirdNotification
    });

    rerender({});

    expect(result.current.notification).toBe(thirdNotification);
  });

  it("provides the notificationsEnabled value based on the expoPushToken", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(mockExpoPushToken);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: mockFirebaseNotification
    });

    const { result } = renderHook(() => useNotificationProvider(), { wrapper });

    await waitFor(() => expect(result.current.notificationsEnabled).toBe(true));
  });

  it("provides the notificationsEnabled value as false when expoPushToken is undefined", async () => {
    (useNotificationPermission as jest.Mock).mockReturnValue(undefined);

    (useFirebaseNotifications as jest.Mock).mockReturnValue({
      token: mockFirebaseToken,
      notification: mockFirebaseNotification
    });

    const { result } = renderHook(() => useNotificationProvider(), { wrapper });

    await waitFor(() =>
      expect(result.current.notificationsEnabled).toBe(false)
    );
  });
});
