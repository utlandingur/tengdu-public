/* eslint-disable @typescript-eslint/no-empty-function */
// useNotificationPermission.test.js
import { renderHook, waitFor } from "@testing-library/react-native";
import { useNotificationPermission } from "hooks/useNotificationPermission";
import { registerForPushNotificationsAsync } from "utils/expoNotificationUtils";

jest.mock("utils/expoNotificationUtils");

const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("useNotificationPermission", () => {
  it("should get expo push token", async () => {
    const mockToken = "mock-token";
    (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue(
      mockToken
    );

    const { result } = renderHook(() => useNotificationPermission());

    await waitFor(() => {
      expect(result.current).toEqual(mockToken);
    });
  });

  it("should handle error when getting expo push token", async () => {
    const mockError = new Error("Error getting ExpoPushToken");
    (registerForPushNotificationsAsync as jest.Mock).mockRejectedValue(
      mockError
    );

    const { result } = renderHook(() => useNotificationPermission());

    await waitFor(() => {
      expect(result.current).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        "Error getting ExpoPushToken",
        mockError
      );
    });
  });
});
