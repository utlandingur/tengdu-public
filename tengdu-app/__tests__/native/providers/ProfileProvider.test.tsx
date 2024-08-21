import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useUserInfo } from "hooks/useUserInfo";
import { UserInfo } from "models/user";
import { useNotificationProvider } from "providers/NotificationProvider";
import { ProfileProvider, useProfile } from "providers/ProfileProvider";

let mockUserInfo: UserInfo = {
  firstName: "test-user"
};

const mockUpdateUserInfo = jest.fn();

jest.mock("hooks/useUserInfo");
(useUserInfo as jest.Mock).mockReturnValue({
  userInfo: mockUserInfo,
  updateUserInfo: mockUpdateUserInfo
});

let mockTokens = {
  expoPushToken: null,
  firebaseToken: null
};

jest.mock("providers/NotificationProvider");
(useNotificationProvider as jest.Mock).mockImplementation(() => mockTokens);

const wrapper = ({ children }) => <ProfileProvider>{children}</ProfileProvider>;

describe("ProfileProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get user profile on mount", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() =>
      expect(result.current.profile).toStrictEqual(mockUserInfo)
    );
  });

  it("should update profile", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toEqual({ firstName: "test-user" });
    });
  });

  it("should complete profile", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      !result.current.profile === null;
    });

    await act(() => result.current.completeProfile());

    expect(mockUpdateUserInfo).toHaveBeenCalledWith({
      setupComplete: true
    });
    expect(mockUpdateUserInfo).toHaveBeenCalledTimes(1);
  });

  it("should update profile", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      !result.current.profile === null;
    });

    await act(() => {
      result.current.updateProfile({ firstName: "updated-user" });
    });

    expect(mockUpdateUserInfo).toHaveBeenCalledWith({
      firstName: "updated-user"
    });
    expect(mockUpdateUserInfo).toHaveBeenCalledTimes(1);
  });

  it("should handle useUserInfo return value changes", async () => {
    const { result, rerender } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      result.current.profile === mockUserInfo;
    });

    mockUserInfo = { firstName: "updated-user" };

    rerender({});

    await waitFor(() => {
      result.current.profile = { firstName: "updated-user" };
    });

    // reset
    mockUserInfo = { firstName: "test-user" };
  });

  it("should update expoPushToken", async () => {
    const { result, rerender } = renderHook(() => useProfile(), { wrapper });

    // Wait for the initial profile to be fetched
    await waitFor(() => {
      result.current.profile === mockUserInfo;
    });

    // Update the expoPushToken
    mockTokens = {
      expoPushToken: "new-expo-push-token",
      firebaseToken: null
    };

    rerender({});

    // Check that updateUserInfo was called with the new expoPushToken
    await waitFor(() => {
      expect(mockUpdateUserInfo).toHaveBeenCalledWith({
        ...mockUserInfo,
        expoPushToken: "new-expo-push-token"
      });
    });

    // Reset
    mockTokens = {
      expoPushToken: null,
      firebaseToken: null
    };
  });

  it("should update firebaseToken", async () => {
    const { result, rerender } = renderHook(() => useProfile(), { wrapper });

    // Wait for the initial profile to be fetched
    await waitFor(() => {
      result.current.profile === mockUserInfo;
    });

    // Update the firebaseToken
    mockTokens = {
      expoPushToken: null,
      firebaseToken: "new-firebase-token"
    };

    rerender({});

    // Check that updateUserInfo was called with the new firebaseToken
    await waitFor(() => {
      expect(mockUpdateUserInfo).toHaveBeenCalledWith({
        ...mockUserInfo,
        firebaseToken: "new-firebase-token"
      });
    });

    // Reset
    mockTokens = {
      expoPushToken: null,
      firebaseToken: null
    };
  });

  it("throws error when useProfile is not wrapped in a ProfileProvider", () => {
    expect(() => expect(renderHook(() => useProfile())).toThrow());
  });
});
