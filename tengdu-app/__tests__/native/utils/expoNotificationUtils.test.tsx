/* eslint-disable @typescript-eslint/no-empty-function */
import * as Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import fetchMock from "jest-fetch-mock";

jest.mock("expo-notifications");
jest.mock("expo-device");
jest.mock("expo-constants");

// Mock the fetch function
fetchMock.enableMocks();

import { Alert, Platform } from "react-native";
import {
  registerForPushNotificationsAsync,
  sendPushNotification
} from "utils/expoNotificationUtils";

describe("expoNotificationUtils", () => {
  afterEach(() => {
    // Clear all instances and calls to constructor and all methods:
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe("registerForPushNotificationsAsync", () => {
    it("registers for push notifications", async () => {
      // Mock the Platform.OS value
      Object.defineProperty(Platform, "OS", { value: "android" });

      // Mock the setNotificationChannelAsync function
      (
        Notifications.setNotificationChannelAsync as jest.Mock
      ).mockResolvedValue({
        id: "default",
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        bypassDnd: false,
        description: "Default notification channel",
        lightColor: "#FF231F7C",
        lockscreenVisibility: 0,
        showBadge: true,
        sound: "default",
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          flags: {
            enforceAudibility: false,
            requestHardwareAudioVideoSynchronization: false
          }
        },
        vibrationPattern: null,
        enableVibrate: true,
        enableLights: true
      } as Notifications.NotificationChannel);

      // Mock the getPermissionsAsync function
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted"
      });

      // Mock the getExpoPushTokenAsync function
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: "test-token"
      });

      // Mock the getDevicePushTokenAsync function
      (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({
        data: "test-token"
      });

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      // Mock the Constants
      Constants.default.expoConfig = {
        name: "test-app",
        slug: "test-app",
        extra: {
          eas: {
            projectId: "test-project-id"
          }
        }
      };

      const token = await registerForPushNotificationsAsync();

      expect(token).toEqual("test-token");

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles permission not granted error", async () => {
      // Mock the getPermissionsAsync function to return 'undetermined'
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "undetermined"
      });

      // Mock the requestPermissionsAsync function to return 'denied'
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied"
      });

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(
        "Permission not granted to get push token for push notification!"
      );

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles function called when not on a physical device", async () => {
      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(
        "Must use physical device for push notifications"
      );
    });

    it("does not set notification channel for iOS", async () => {
      // Mock the Platform.OS value
      Object.defineProperty(Platform, "OS", { value: "ios" });

      // Mock the getPermissionsAsync function
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted"
      });

      // Mock the getExpoPushTokenAsync function
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: "test-token"
      });

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      // Mock the Constants
      Constants.default.expoConfig = {
        name: "test-app",
        slug: "test-app",
        extra: {
          eas: {
            projectId: "test-project-id"
          }
        }
      };

      await registerForPushNotificationsAsync();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles error when getting getDevicePushTokenAsync fails", async () => {
      // Mock the getPermissionsAsync function
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted"
      });

      // Mock the getDevicePushTokenAsync function to throw an error
      (
        Notifications.getDevicePushTokenAsync as jest.Mock
      ).mockRejectedValueOnce(new Error("Test error"));

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      // Mock the Constants
      Constants.default.expoConfig = {
        name: "test-app",
        slug: "test-app",
        extra: {
          eas: {
            projectId: "test-project-id"
          }
        }
      };

      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe("Error: Test error");

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles when no project ID is found", async () => {
      // Mock the getPermissionsAsync function
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted"
      });

      // Mock the getExpoPushTokenAsync function
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValueOnce({
        data: "test-token"
      });

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      // Mock the Constants
      Constants.default.expoConfig = {
        name: "test-app",
        slug: "test-app",
        extra: {
          eas: {}
        }
      };

      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe("Project ID not found");

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles error when getting permissions fails", async () => {
      // Mock the getPermissionsAsync function to throw an error
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error("getPermissionsAsync Test error")
      );

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe("getPermissionsAsync Test error");

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    it("handles when fetching permissions returns 'denied'", async () => {
      // Mock the getPermissionsAsync function
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied"
      });

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      let error;
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(
        "Permission not granted to get push token for push notification!"
      );

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });

    // TODO - Fix this test
    it("handles error when setting notification channel fails", async () => {
      // Mock the Platform.OS value
      Object.defineProperty(Platform, "OS", { value: "android" });

      // Mock the setNotificationChannelAsync function to throw an error
      (
        Notifications.setNotificationChannelAsync as jest.Mock
      ).mockRejectedValueOnce(new Error("Test channel error"));

      // Mock the isDevice value
      const originalIsDevice = Device.isDevice;
      Object.defineProperty(Device, "isDevice", { value: true });

      let error;
      try {
        await registerForPushNotificationsAsync();
        console.log("registerForPushNotificationsAsync");
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe("Test channel error");

      // reset some mocks
      Object.defineProperty(Device, "isDevice", { value: originalIsDevice });
    });
  });

  describe("sendPushNotification", () => {
    const mockToken = "test-token";
    const mockTitle = "test-title";
    const mockBody = "test-body";
    const mockData = { test: "data" };

    it("sends a push notification", async () => {
      // Mock a successful fetch
      fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

      await sendPushNotification(mockToken, mockTitle, mockBody, mockData);

      // Check that fetch was called with the correct arguments
      expect(fetch).toHaveBeenCalledWith(
        "https://exp.host/--/api/v2/push/send",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: mockToken,
            sound: "default",
            title: mockTitle,
            body: mockBody,
            data: mockData
          })
        }
      );
    });

    it("handles error when sending push notification fails", async () => {
      // Mock the fetch function to reject with an error
      fetchMock.mockRejectOnce(new Error("Test fetch error"));

      let error;
      try {
        await sendPushNotification("test-token", "test-title", "test-body", {
          test: "data"
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe("Failed to send push notification");
    });

    it("throws an error when called with missing parameters", async () => {
      let error;
      try {
        await sendPushNotification(mockToken, undefined, mockBody, mockData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe("Missing parameters for sendPushNotification");
    });
  });
});
