import { renderHook, waitFor } from "@testing-library/react-native";
import { getUsers } from "db/users";
import { useMatch } from "hooks/useMatch";
import { useMatches } from "providers/MatchProvider";
import { useSession } from "providers/AuthProvider";

jest.mock("providers/AuthProvider");

jest.mock("db/users");
jest.mock("providers/MatchProvider");

(useSession as jest.Mock).mockReturnValue({ user: { uid: "user1" } });

const mockMatches = [
  { id: "1", matchedUsers: ["user1", "user2"] },
  { id: "2", matchedUsers: ["user3", "user4"] }
];

const mockUsers = [
  { id: "user1", name: "User 1" },
  { id: "user2", name: "User 2" }
];

const mockOtherUsers = [
  { id: "user3", name: "User 3" },
  { id: "user3", name: "User 3" }
];

(useMatches as jest.Mock).mockReturnValue({ matches: mockMatches });
(getUsers as jest.Mock).mockResolvedValue([]);

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, "error").mockImplementation(() => {});

describe("useMatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns undefined match when matchId is not found", async () => {
    const { result } = renderHook(() => useMatch("3"));
    await waitFor(() => expect(result.current.match).toBeUndefined());
  });

  it("returns the correct match when matchId is found", async () => {
    const { result } = renderHook(() => useMatch("1"));

    await waitFor(() => expect(result.current.match).toEqual(mockMatches[0]));
  });

  it("returns the correct users when match is defined", async () => {
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    const { result } = renderHook(() => useMatch("1"));

    await waitFor(() => {
      expect(result.current.users).toEqual(mockUsers);
    });
  });

  it("returns empty users array when match is undefined", async () => {
    const { result } = renderHook(() => useMatch("3"));
    await waitFor(() => expect(result.current.users).toEqual([]));
  });

  it("returns undefined match when matchId is undefined", async () => {
    const { result } = renderHook(() => useMatch(undefined));

    await waitFor(() => expect(result.current.match).toBeUndefined());
  });

  it("returns undefined match when matches is undefined", async () => {
    (useMatches as jest.Mock).mockReturnValue(undefined);
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.match).toBeUndefined());

    (useMatches as jest.Mock).mockReturnValue({ matches: mockMatches });
  });
  it("returns empty users array when getUsers returns an empty array", async () => {
    (getUsers as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.users).toEqual([]));
  });

  it("returns empty users array when getUsers returns undefined", async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.users).toEqual([]));
  });

  it("returns empty users array when matchedUsers is an empty array", async () => {
    (useMatches as jest.Mock).mockReturnValueOnce({
      matches: [{ id: "1", matchedUsers: [] }]
    });
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.users).toEqual([]));
  });

  it("updates users when match changes", async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
    const { result, rerender } = renderHook(({ id }) => useMatch(id), {
      initialProps: { id: "1" }
    });
    await waitFor(() => expect(result.current.users).toEqual(mockUsers));
    (getUsers as jest.Mock).mockResolvedValueOnce(mockOtherUsers);

    rerender({ id: "2" });
    await waitFor(() => expect(result.current.users).toEqual(mockOtherUsers));
  });

  it("updates match when matchId changes", async () => {
    const { result, rerender } = renderHook(({ id }) => useMatch(id), {
      initialProps: { id: "1" }
    });
    await waitFor(() => expect(result.current.match).toEqual(mockMatches[0]));

    rerender({ id: "2" });
    await waitFor(() => expect(result.current.match).toEqual(mockMatches[1]));
  });

  it("handles error when getUsers throws", async () => {
    (getUsers as jest.Mock).mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.users).toEqual([]));
  });

  it("returns undefined match when matches is an empty array", async () => {
    (useMatches as jest.Mock).mockReturnValue({ matches: [] });
    const { result } = renderHook(() => useMatch("1"));
    await waitFor(() => expect(result.current.match).toBeUndefined());
  });
});
