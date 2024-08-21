import { renderHook, waitFor } from "@testing-library/react-native";
import { getMatches } from "db/matches";
import { useGetMatches } from "hooks/useGetMatches";
import { useProfile } from "providers/ProfileProvider";
import { useSession } from "providers/AuthProvider";

jest.mock("providers/ProfileProvider");
jest.mock("providers/AuthProvider");
jest.mock("db/matches");

(useSession as jest.Mock).mockReturnValue({ user: { uid: "user1" } });

describe("useGetMatches", () => {
  const mockProfile = {
    matches: ["1", "2"],
    newMatches: ["1", "3"]
  };

  const mockMatches = [
    { id: "1", name: "Match 1", matchedUsers: ["user1", "user2"] },
    { id: "2", name: "Match 2", matchedUsers: ["user1", "user2"] }
  ];

  jest
    .spyOn(console, "error")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    (useProfile as jest.Mock).mockReturnValue({ profile: mockProfile });
    (getMatches as jest.Mock).mockResolvedValue(mockMatches);
  });

  it("sets matches and newMatches to empty arrays when there are no match IDs in the profile", async () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: {
        matches: []
      }
    });

    const { result } = renderHook(() => useGetMatches());

    await waitFor(() => {
      expect(result.current.matches).toEqual([]);
      expect(result.current.newMatches).toEqual([]);
      expect(result.current.hasNewMatches).toEqual(false);
      expect(result.current.newMatchesChatIds).toEqual([]);
    });
  });
  describe("matches", () => {
    it("returns matches for the current profile", async () => {
      (useProfile as jest.Mock).mockReturnValue({ profile: mockProfile });
      (getMatches as jest.Mock).mockResolvedValue(mockMatches);

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.matches).toEqual([
          {
            ...mockMatches[0],
            matchedUsers: ["user2"]
          },
          {
            ...mockMatches[1],
            matchedUsers: ["user2"]
          }
        ]);
      });
    });

    it("returns an empty array if there is no profile", async () => {
      (useProfile as jest.Mock).mockReturnValue({ profile: null });

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.matches).toEqual([]);
        expect(getMatches).not.toHaveBeenCalled();
      });
    });

    it("returns an empty array if getMatches fails", async () => {
      (getMatches as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch matches")
      );

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.matches).toEqual([]);
        expect(getMatches).toHaveBeenCalledWith(mockProfile.matches);
      });
    });

    it("returns an empty array if profile.matches is empty", async () => {
      (useProfile as jest.Mock).mockReturnValue({
        profile: { matches: [] }
      });

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.matches).toEqual([]);
        expect(getMatches).not.toHaveBeenCalled();
      });
    });

    it("returns an empty array if profile.matches is undefined", async () => {
      (useProfile as jest.Mock).mockReturnValue({
        profile: { ...mockProfile, matches: undefined }
      });

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.matches).toEqual([]);
        expect(getMatches).not.toHaveBeenCalled();
      });
    });
  });

  describe("newMatches", () => {
    it("returns only new matches", async () => {
      const mockMatches = [
        {
          id: "1",
          name: "Match 1",
          newMatch: true,
          matchedUsers: ["user1", "user2"]
        },
        {
          id: "2",
          name: "Match 2",
          newMatch: false,
          matchedUsers: ["user1", "user2"]
        }
      ];
      (getMatches as jest.Mock).mockResolvedValue(mockMatches);

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.newMatches).toEqual([
          {
            id: "1",
            name: "Match 1",
            newMatch: true,
            matchedUsers: ["user2"]
          }
        ]);
      });
    });
  });

  describe("hasNewMatches", () => {
    // it("returns hasNewMatches as true if there are new matches", async () => {
    //   (getMatches as jest.Mock).mockResolvedValue(mockMatches);
    //   const { result } = renderHook(() => useGetMatches());
    //   await waitFor(() => {
    //     expect(result.current.hasNewMatches).toEqual(true);
    //   });
    // });
    // it("returns hasNewMatches as false if there are no new matches", async () => {
    //   const mockMatches = [
    //     { id: "1", name: "Match 1", newMatch: false },
    //     { id: "2", name: "Match 2", newMatch: false }
    //   ];
    //   (getMatches as jest.Mock).mockResolvedValue(mockMatches);
    //   const { result } = renderHook(() => useGetMatches());
    //   await waitFor(() => {
    //     expect(result.current.hasNewMatches).toEqual(false);
    //   });
    // });
    // it("returns hasNewMatches as false if getMatches fails", async () => {
    //   (getMatches as jest.Mock).mockRejectedValue(
    //     new Error("Failed to fetch matches")
    //   );
    //   const { result } = renderHook(() => useGetMatches());
    //   await waitFor(() => {
    //     expect(result.current.hasNewMatches).toEqual(false);
    //   });
    // });
  });

  describe("newMatchesChatIds", () => {
    it("returns newMatchesChatIds as an array of chatIds of new matches", async () => {
      const mockMatches = [
        {
          id: "1",
          name: "Match 1",
          matchedUsers: ["user1", "user2"],
          chatId: "chat1"
        },
        { id: "2", name: "Match 2", matchedUsers: ["user1", "user2"] }
      ];
      (getMatches as jest.Mock).mockResolvedValue(mockMatches);

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.newMatchesChatIds).toEqual(["chat1"]);
      });
    });

    it("returns newMatchesChatIds as an empty array if there are no new matches", async () => {
      const mockMatches = [
        { id: "1", name: "Match 1", newMatch: false, chatId: "chat1" },
        { id: "2", name: "Match 2", newMatch: false, chatId: "chat2" }
      ];
      (getMatches as jest.Mock).mockResolvedValue(mockMatches);

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.newMatchesChatIds).toEqual([]);
      });
    });

    it("returns newMatchesChatIds as an empty array if getMatches fails", async () => {
      (getMatches as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch matches")
      );

      const { result } = renderHook(() => useGetMatches());

      await waitFor(() => {
        expect(result.current.newMatchesChatIds).toEqual([]);
      });
    });
  });
});
