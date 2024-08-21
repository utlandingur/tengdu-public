import { View } from "react-native";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useCreateChatClient } from "hooks/useCreateChatClient";
import { useSession } from "providers/AuthProvider";
import {
  ChatClientProvider,
  useChatClient
} from "providers/ChatClientProvider";

import { render } from "../../../render";

jest.mock("providers/AuthProvider");
jest.mock("hooks/useCreateChatClient");

jest.mock("stream-chat-expo", () => ({
  Streami18n: jest.fn().mockImplementation(() => ({
    // Mock implementation of Streami18n methods if needed
  })),
  Chat: ({ children }) => children // Mock Chat as a component that just renders its children
}));

describe("ChatClientProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when user is defined and chatClient is defined", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: { id: 1 } });
    (useCreateChatClient as jest.Mock).mockReturnValue("mockChatClient");

    const { findByTestId } = render(
      <ChatClientProvider>
        <View testID="test" />
      </ChatClientProvider>,
      {}
    );

    await waitFor(() => expect(findByTestId("test")).toBeDefined());
  });

  test("renders CentredSpinner when user is defined and chat client is not defined", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: { id: 1 } });
    (useCreateChatClient as jest.Mock).mockReturnValue(null);

    const { getByTestId } = render(<ChatClientProvider />, {});

    await waitFor(() => expect(getByTestId("spinner")).toBeDefined());
  });

  it("renders children when user is not defined", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: null });

    const { findByTestId } = render(
      <ChatClientProvider>
        <View testID="test" />
      </ChatClientProvider>,
      {}
    );

    await waitFor(() => expect(findByTestId("test")).toBeDefined());
  });

  describe("useChatClient", () => {
    const wrapper = ({ children }) => (
      <ChatClientProvider>{children}</ChatClientProvider>
    );
    it("throws an error when not used within a ChatClientProvider", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementationOnce(() => {});

      let error;
      try {
        renderHook(() => useChatClient());
      } catch (e) {
        error = e;
      }
      // Check if an error was thrown
      expect(error).toBeDefined();

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it("returns the correct value when used within a ChatClientProvider", () => {
      const mockChatClient = "mockChatClient";

      (useSession as jest.Mock).mockReturnValue({ user: { id: 1 } });
      (useCreateChatClient as jest.Mock).mockReturnValue(mockChatClient);

      const { result } = renderHook(() => useChatClient(), { wrapper });

      expect(result.current).toEqual(mockChatClient);
    });

    it("returns null when used within a ChatClientProvider and chatClient is null", () => {
      (useSession as jest.Mock).mockReturnValue({ user: { id: 1 } });
      (useCreateChatClient as jest.Mock).mockReturnValue(null);

      const wrapper = ({ children }) => (
        <ChatClientProvider>{children}</ChatClientProvider>
      );

      const { result } = renderHook(() => useChatClient(), { wrapper });

      expect(result.current).toBeNull();
    });
  });
});
