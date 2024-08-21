import { renderHook } from "@testing-library/react-native";
import { Timestamp } from "firebase/firestore";
import { useGetMatches } from "hooks/useGetMatches";
import { Matches } from "models/user";
import { MatchProvider, useMatches } from "providers/MatchProvider";

jest.mock("hooks/useGetMatches");

const wrapper = ({ children }) => <MatchProvider>{children}</MatchProvider>;

describe("MatchProvider", () => {
  it("calls useGetMatches within MatchProvider", () => {
    (useGetMatches as jest.Mock).mockReturnValue({});

    renderHook(() => useMatches(), { wrapper });
    expect(useGetMatches).toHaveBeenCalled();
  });

  it("provides the correct context value", () => {
    const mockMatches: Matches = [
      {
        id: "1",
        newMatch: true,
        chatId: "chat1",
        matchedUsers: ["user1", "user2"],
        locations: ["location1", "location2"],
        sharedInterests: ["interest1", "interest2"],
        date: Timestamp.now()
      },
      {
        id: "2",
        newMatch: false,
        chatId: "chat2",
        matchedUsers: ["user3", "user4"],
        locations: ["location3", "location4"],
        sharedInterests: ["interest3", "interest4"],
        date: Timestamp.now()
      },
      {
        id: "3",
        newMatch: true,
        chatId: "chat3",
        matchedUsers: ["user5", "user6"],
        locations: ["location5", "location6"],
        sharedInterests: ["interest5", "interest6"],
        date: Timestamp.now()
      }
    ];

    const expectedResult = {
      matches: mockMatches,
      newMatches: mockMatches.filter((match) => match.newMatch),
      hasNewMatches: mockMatches.some((match) => match.newMatch),
      newMatchesChatIds: mockMatches
        .filter((match) => match.newMatch)
        .map((match) => match.chatId)
    };
    (useGetMatches as jest.Mock).mockReturnValue(expectedResult);

    const { result } = renderHook(() => useMatches(), { wrapper });
    expect(result.current).toEqual(expectedResult);
  });

  it("throws an error when useMatches is used outside of MatchProvider", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    try {
      renderHook(() => useMatches());
    } catch (error) {
      expect(error).toEqual(
        Error("useMatchesContext must be wrapped in a <MatchProvider />")
      );
    }
  });
});
