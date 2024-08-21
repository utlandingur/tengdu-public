import { renderHook } from "@testing-library/react-native";
import { useChatFilters } from "hooks/useChatFilters";
import { useSession } from "providers/AuthProvider";

jest.mock("providers/AuthProvider");
const mockUser = { uid: "testUid" };

describe("useChatFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return correct filters", () => {
    (useSession as jest.Mock).mockImplementation(() => {
      return { user: mockUser };
    });
    const newMatchesChatIds = ["id1", "id2"];

    const { result } = renderHook(() => useChatFilters(newMatchesChatIds));

    expect(result.current).toEqual({
      members: { $in: [mockUser.uid] },
      type: "messaging",
      id: { $nin: newMatchesChatIds }
    });
  });

  it("should not include id filter when newMatchesChatIds is empty", () => {
    (useSession as jest.Mock).mockImplementation(() => {
      return { user: mockUser };
    });
    const newMatchesChatIds = [];

    const { result } = renderHook(() => useChatFilters(newMatchesChatIds));

    expect(result.current).toEqual({
      members: { $in: [mockUser.uid] },
      type: "messaging"
    });
  });

  it("should handle null user", () => {
    (useSession as jest.Mock).mockImplementation(() => {
      return { user: null };
    });

    const newMatchesChatIds = ["id1", "id2"];

    const { result } = renderHook(() => useChatFilters(newMatchesChatIds));

    expect(result.current).toEqual(null);
  });

  it("should handle undefined values in newMatchesChatIds", () => {
    (useSession as jest.Mock).mockImplementation(() => {
      return { user: mockUser };
    });
    const newMatchesChatIds = ["id1", undefined, "id2"];

    const { result } = renderHook(() => useChatFilters(newMatchesChatIds));

    expect(result.current).toEqual({
      members: { $in: [mockUser.uid] },
      type: "messaging",
      id: { $nin: ["id1", "id2"] } // undefined values should be filtered out
    });
  });

  it("should handle non-string values in newMatchesChatIds", () => {
    (useSession as jest.Mock).mockImplementation(() => {
      return { user: mockUser };
    });
    const newMatchesChatIds = ["id1", 123, "id2"];

    const { result } = renderHook(() => useChatFilters(newMatchesChatIds));

    expect(result.current).toEqual({
      members: { $in: [mockUser.uid] },
      type: "messaging",
      id: { $nin: ["id1", "id2"] } // non-string values should be filtered out
    });
  });
});
