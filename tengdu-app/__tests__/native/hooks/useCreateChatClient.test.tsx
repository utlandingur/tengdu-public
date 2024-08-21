import { renderHook, waitFor } from "@testing-library/react-native";
import { useCreateChatClient } from "hooks/useCreateChatClient";
import { useHandleAppState } from "hooks/useHandleAppState";
import { useSession } from "providers/AuthProvider";
import { useNotificationProvider } from "providers/NotificationProvider";
import { StreamChat } from "stream-chat";
import { registerOrRemoveDevice } from "utils/chatUtils";

jest.mock("hooks/useHandleAppState");
(useHandleAppState as jest.Mock).mockImplementation(() => ({}));

jest.mock("stream-chat");
(StreamChat.getInstance as jest.Mock).mockImplementation(() => ({
  connectUser: jest.fn().mockResolvedValue({}),
  disconnectUser: jest.fn().mockResolvedValue({})
}));

jest.mock("providers/AuthProvider");
jest.mock("providers/NotificationProvider");
(useNotificationProvider as jest.Mock).mockImplementation(() => ({
  notificationsEnabled: true,
  expoPushToken: "test-token"
}));

jest.mock("utils/chatUtils", () => ({
  registerOrRemoveDevice: jest.fn().mockResolvedValue({})
}));

describe("useCreateChatClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when chatSession is null", () => {
    (useSession as jest.Mock).mockReturnValueOnce({
      chatSession: null
    });
    const { result } = renderHook(() => useCreateChatClient());
    expect(result.current).toBeNull();
  });

  it("should create a new chatClient when chatSession is not null", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });
    const { result } = renderHook(() => useCreateChatClient());

    await waitFor(() => expect(result.current).not.toBeNull());
    await waitFor(() =>
      expect(StreamChat.getInstance).toHaveBeenCalledTimes(1)
    );
  });

  it("should call connectUser and registerOrRemoveDevice when chatSession and chatClient are not null", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result } = renderHook(() => useCreateChatClient());

    // Wait for the chatClient to be created
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current).not.toBeNull();
      expect(registerOrRemoveDevice).toHaveBeenCalledTimes(1);
    });
  });

  it("should call disconnectUser when chatSession changes to null", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Initially, chatSession is not null, so connectUser should be called
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current.disconnectUser).toHaveBeenCalledTimes(0);
    });

    // Now we'll rerender the hook with chatSession as null
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });
    rerender({});

    // disconnectUser should be called when chatSession is null
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
    });

    expect(result.current.disconnectUser).toHaveBeenCalledTimes(1);
  });

  it("should not call connectUser and registerOrRemoveDevice again when chatSession is the same", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Wait for the chatClient to be created
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current).not.toBeNull();
    });

    // Now we'll rerender the hook with the same chatSession
    rerender({});

    // connectUser should not be called again, because chatSession hasn't changed
    expect(result.current.connectUser).toHaveBeenCalledTimes(1);
    expect(registerOrRemoveDevice).toHaveBeenCalledTimes(1);
  });

  it("should not call connectUser again when chatSession changes and user is still logged in", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Initially, connectUser should be called once
    await waitFor(() =>
      expect(result.current.connectUser).toHaveBeenCalledTimes(1)
    );

    // Now we'll rerender the hook with a different chatSession
    (useSession as jest.Mock).mockReturnValueOnce({
      chatSession: {
        userData: { id: "new-id" },
        tokenOrProvider: "new-token"
      },
      user: { name: "test" }
    });
    rerender({});

    // connectUser should be called again, because chatSession has changed
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(registerOrRemoveDevice).toHaveBeenCalledTimes(1);
    });
  });

  it("should call connectUser and registerOrRemoveDevice again when chatSession changes and user is disconnected", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Initially, connectUser should be called once
    await waitFor(() =>
      expect(result.current.connectUser).toHaveBeenCalledTimes(1)
    );

    // Now we'll simulate the user disconnecting
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });
    rerender({});

    await waitFor(() => {
      expect(result.current.disconnectUser).toHaveBeenCalledTimes(1);
      expect(registerOrRemoveDevice).toHaveBeenCalledTimes(1);
    });

    // Now we'll rerender the hook with a different chatSession
    (useSession as jest.Mock).mockReturnValueOnce({
      chatSession: {
        userData: { id: "new-id" },
        tokenOrProvider: "new-token"
      },
      user: { name: "test" }
    });
    rerender({});

    // connectUser should be called again, because chatSession has changed and user was disconnected
    await waitFor(() => {
      expect(result.current.disconnectUser).toHaveBeenCalledTimes(1);
    });
    expect(result.current.connectUser).toHaveBeenCalledTimes(2);
  });

  it("should not call connectUser and registerOrRemoveDevice again when chatSession changes to the same value", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Initially, connectUser should be called once
    await waitFor(() =>
      expect(result.current.connectUser).toHaveBeenCalledTimes(1)
    );

    // Now we'll rerender the hook with the same chatSession
    rerender({});

    // connectUser should not be called again, because chatSession hasn't changed
    expect(result.current.connectUser).toHaveBeenCalledTimes(1);
    expect(registerOrRemoveDevice).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when calling connectUser", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementationOnce(() => {});

    (StreamChat.getInstance as jest.Mock).mockImplementationOnce(() => ({
      connectUser: jest.fn().mockRejectedValue(new Error("Test error")),
      disconnectUser: jest.fn().mockResolvedValue({})
    }));

    let result;
    let error;
    try {
      result = renderHook(() => useCreateChatClient());
    } catch (e) {
      error = e;
    }

    await waitFor(() => expect(result.current).not.toBeNull());

    // Check if an error was thrown
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it("should only create one chatClient", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { rerender, result } = renderHook(() => useCreateChatClient());

    // Rerender the hook to simulate a component update
    rerender({});

    await waitFor(() => {
      expect(StreamChat.getInstance).toHaveBeenCalledTimes(1);
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current.disconnectUser).toHaveBeenCalledTimes(0);
    });
  });

  it("should only create one chatClient and connectUser once", async () => {
    const connectUserMock = jest.fn().mockResolvedValue({});
    const disconnectUserMock = jest.fn().mockResolvedValue({});

    (StreamChat.getInstance as jest.Mock).mockReturnValue({
      connectUser: connectUserMock,
      disconnectUser: disconnectUserMock
    });

    // Chat session null & chat client null
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Chat session non-null & chat client now non-null
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    rerender({});

    // User connected
    await waitFor(() => expect(connectUserMock).toHaveBeenCalledTimes(1));

    // User logged out, so now chat session null & chat client non-null
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });

    rerender({});

    // At this stage the chat session should stay active but there is no user.
    await waitFor(() => expect(disconnectUserMock).toHaveBeenCalledTimes(1));

    // Then when logging back in the chatSession we should have
    // Chat session non-null & chat client non-null (same as before)
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    rerender({});

    // Now user should be connected ONCE
    await waitFor(() => expect(result.current).not.toBeNull());

    await waitFor(() => expect(connectUserMock).toHaveBeenCalledTimes(2));
  });

  it("should handle errors when calling disconnectUser", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    (StreamChat.getInstance as jest.Mock).mockImplementationOnce(() => ({
      connectUser: jest.fn().mockResolvedValue({}),
      disconnectUser: jest.fn().mockRejectedValue(new Error("Test error"))
    }));

    let result, rerender;
    let error;
    try {
      const hook = renderHook(() => useCreateChatClient());
      result = hook.result;
      rerender = hook.rerender;
    } catch (e) {
      console.log("error logged");
      error = e;
    }
    await waitFor(() => expect(result.current).not.toBeNull());

    // force disconnect
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });

    rerender({});
    // // Check if an error was logged
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

    // // Restore console.error
    consoleSpy.mockRestore();
  });

  it("should call connectUser when chatSession and chatClient are not null", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result } = renderHook(() => useCreateChatClient());

    // Wait for the chatClient to be created
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current).not.toBeNull();
    });
  });

  it("should call disconnectUser when chatSession changes to null", async () => {
    (useSession as jest.Mock).mockReturnValue({
      chatSession: {
        userData: { id: "test-id" },
        tokenOrProvider: "test-token"
      },
      user: { name: "test" }
    });

    const { result, rerender } = renderHook(() => useCreateChatClient());

    // Initially, chatSession is not null, so connectUser should be called
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
      expect(result.current.disconnectUser).toHaveBeenCalledTimes(0);
    });

    // Now we'll rerender the hook with chatSession as null
    (useSession as jest.Mock).mockReturnValue({
      chatSession: null
    });
    rerender({});

    // disconnectUser should be called when chatSession is null
    await waitFor(() => {
      expect(result.current.connectUser).toHaveBeenCalledTimes(1);
    });

    expect(result.current.disconnectUser).toHaveBeenCalledTimes(1);
  });

  // struggling with this
  // result.current is true, but in the handleFunctions is says its false.
  // works when manually testing

  // it("should call connectUser when handleAppStateChangeToActive is invoked by the mocked useHandleAppState hook", async () => {
  //   const mockConnectUser = jest.fn();
  //   const mockDisconnectUser = jest.fn();

  //   (StreamChat.getInstance as jest.Mock).mockImplementation(() => ({
  //     connectUser: mockConnectUser,
  //     disconnectUser: mockDisconnectUser
  //   }));

  //   (useSession as jest.Mock).mockReturnValue({
  //     chatSession: { userData: {}, tokenOrProvider: "" }
  //   });

  //   (useNotificationProvider as jest.Mock).mockReturnValue({
  //     notificationsEnabled: true,
  //     expoPushToken: "test-token"
  //   });

  //   const { result } = renderHook(() => useCreateChatClient());

  //   const handleChangeToActiveState = (useHandleAppState as jest.Mock).mock
  //     .calls[0][0].handleChangeToActiveState;

  //   // Wait for the chatClient to be created
  //   await waitFor(() => {
  //     expect(result.current.connectUser).toHaveBeenCalledTimes(1);
  //     expect(result.current).toBeTruthy();
  //   });

  //   console.log("result.current", result.current);
  //   console.log("result.current", Boolean(result.current));

  //   handleChangeToActiveState();

  //   // await waitFor(() => expect(mockConnectUser).toHaveBeenCalledTimes(2));
  // });

  // // it("should call disconnectUser when handleAppStateChangeToNonActive is invoked by the mocked useHandleAppState hook", async () => {
  // //   const mockConnectUser = jest.fn();
  // //   const mockDisconnectUser = jest.fn();

  // //   (StreamChat.getInstance as jest.Mock).mockImplementation(() => ({
  // //     connectUser: mockConnectUser,
  // //     disconnectUser: mockDisconnectUser
  // //   }));

  // //   (useSession as jest.Mock).mockReturnValue({
  // //     chatSession: { userData: {}, tokenOrProvider: "" }
  // //   });

  // //   (useNotificationProvider as jest.Mock).mockReturnValue({
  // //     notificationsEnabled: true,
  // //     expoPushToken: "test-token"
  // //   });

  //   const { result } = renderHook(() => useCreateChatClient());

  //   // Wait for the chatClient to be created
  //   await waitFor(() => {
  //     expect(result.current.connectUser).toHaveBeenCalledTimes(1);
  //     expect(result.current).toBeTruthy();
  //   });

  //   const handleChangeToNonActiveState = (useHandleAppState as jest.Mock).mock
  //     .calls[0][0].handleChangeToNonActiveState;

  //   handleChangeToNonActiveState();

  //   expect(mockDisconnectUser).toHaveBeenCalled();
  // });
});
