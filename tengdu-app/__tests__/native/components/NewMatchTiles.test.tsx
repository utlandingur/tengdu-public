import { waitFor } from "@testing-library/react-native";
import NewMatchTile from "components/NewMatchTile";
import NewMatchTiles from "components/NewMatchTiles";
import { Timestamp } from "firebase/firestore";
import { MatchInfo, PublicUserInfo } from "models/user";
import { useMatches } from "providers/MatchProvider";

import { render } from "../../../render";

jest.mock("providers/MatchProvider");
jest.mock("components/NewMatchTile");

// mock the new match tile component
const mockNewMatchTile = jest.fn();
(NewMatchTile as jest.Mock).mockImplementation(mockNewMatchTile);

// mock the useMatches hook
(useMatches as jest.Mock).mockReturnValue({
  hasNewMatches: true,
  newMatches: []
});

const mockUser: PublicUserInfo = {
  uid: "1",
  firstName: "Test",
  lastName: "User",
  photoURL: "http://example.com/photo.jpg"
};

const mockMatch: MatchInfo = {
  id: "1",
  newMatch: true,
  matchedUsers: [mockUser.uid, mockUser.uid, mockUser.uid, mockUser.uid],
  date: Timestamp.now()
};

describe("NewMatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display all the matches", async () => {
    (useMatches as jest.Mock).mockReturnValue({
      hasNewMatches: true,
      newMatches: [mockMatch, mockMatch, mockMatch, mockMatch]
    });

    render(<NewMatchTiles />, {});
    await waitFor(() => {
      expect(mockNewMatchTile).toHaveBeenCalledTimes(4);
    });
  });
  it("should display nothing when there are no matches", async () => {
    (useMatches as jest.Mock).mockReturnValue({
      hasNewMatches: false,
      newMatches: []
    });

    const { queryByTestId } = render(<NewMatchTiles />, {});

    await waitFor(() => {
      expect(queryByTestId("new-match-tiles-scroll")).toBeNull();
    });
  });
});
