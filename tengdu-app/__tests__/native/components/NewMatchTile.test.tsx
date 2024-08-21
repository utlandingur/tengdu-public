import { fireEvent, waitFor } from "@testing-library/react-native";
import NewMatchTile from "components/NewMatchTile";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import * as useMatchDefault from "hooks/useMatch";
import { MatchInfo, PublicUserInfo } from "models/user";

import { render } from "../../../render";

let mockMatchedUsers: PublicUserInfo[] = [
  {
    uid: "1",
    firstName: "Janet",
    lastName: "Smith",
    photoURL: "http://example.com/photo.jpg"
  }
];

const mockMatchedUsersIds = ["1"];

const match: MatchInfo = {
  id: "1",
  newMatch: true,
  matchedUsers: mockMatchedUsersIds,
  date: Timestamp.now()
};

jest.spyOn(useMatchDefault, "useMatch").mockReturnValue({
  users: mockMatchedUsers,
  match: undefined
});

const mockNavigate = jest.fn();
jest.mock("expo-router");
(useRouter as jest.Mock).mockReturnValue({
  navigate: mockNavigate
});

describe("NewMatchTile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render", async () => {
    const { getByTestId } = render(<NewMatchTile match={match} />);
    await waitFor(() => expect(getByTestId("match-text")).toBeTruthy());
  });

  it("should show a profile picture and no placeholder if matched users provided", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(<NewMatchTile match={match} />, {})
    );
    await waitFor(() => {
      expect(queryByTestId("match-image-placeholder")).toBeNull();
      expect(getByTestId("match-image")).toBeDefined();
    });
  });

  it("should return null if no matched users are provided", async () => {
    const { queryByTestId } = await waitFor(() =>
      render(<NewMatchTile match={null} />, {})
    );
    expect(queryByTestId("match-image-placeholder")).toBeNull();
    expect(queryByTestId("match-image")).toBeNull();
  });

  it("should not show match text if there is a placeholder", async () => {
    const { queryByTestId } = await waitFor(() =>
      render(<NewMatchTile match={null} />, {})
    );
    await waitFor(() => {
      expect(queryByTestId("match-text")).toBeNull();
    });
  });

  it("should show 1 profile pictures/placeholder if there are 2 or more people in the match", async () => {
    mockMatchedUsers = [
      {
        uid: "1",
        firstName: "Janet",
        lastName: "Smith",
        photoURL: "http://example.com/photo.jpg"
      },
      {
        uid: "2",
        firstName: "John",
        lastName: "Doe",
        photoURL: "http://example.com/photo.jpg"
      }
    ];
    const { queryAllByTestId } = await waitFor(() =>
      render(<NewMatchTile match={match} />, {})
    );
    await waitFor(() => {
      expect(queryAllByTestId("match-image").length).toBe(1);
    });
  });
  it("should show the name of the person if there is one person in the match", async () => {
    mockMatchedUsers = [
      {
        uid: "1",
        firstName: "Janet",
        lastName: "Smith",
        photoURL: "http://example.com/photo.jpg"
      }
    ];
    const { getByText } = render(<NewMatchTile match={match} />, {});
    await waitFor(() => {
      expect(getByText("Janet")).toBeTruthy();
    });
  });
  it("should show the name of the first person and the other person in the match if there are 2 people", async () => {
    jest.spyOn(useMatchDefault, "useMatch").mockReturnValueOnce({
      users: [
        {
          uid: "1",
          firstName: "Janet",
          lastName: "Smith",
          photoURL: "http://example.com/photo.jpg"
        },
        {
          uid: "2",
          firstName: "John",
          lastName: "Doe",
          photoURL: "http://example.com/photo.jpg"
        }
      ],
      match: undefined
    });

    const { getByText } = render(<NewMatchTile match={match} />, {});
    await waitFor(() => {
      expect(getByText("John + 1")).toBeTruthy();
    });
  });
  it("should show the name of the first person and the number of other people in the match if there are more than 2 people", async () => {
    jest.spyOn(useMatchDefault, "useMatch").mockReturnValueOnce({
      users: [
        {
          uid: "1",
          firstName: "Janet",
          lastName: "Smith",
          photoURL: "http://example.com/photo.jpg"
        },
        {
          uid: "2",
          firstName: "Johnny",
          lastName: "Doe",
          photoURL: "http://example.com/photo.jpg"
        },
        {
          uid: "3",
          firstName: "Jill",
          lastName: "Doe",
          photoURL: "http://example.com/photo.jpg"
        }
      ],
      match: undefined
    });

    const { getByText } = render(
      <NewMatchTile match={match} />,

      {}
    );
    expect(getByText("Jill + 2")).toBeTruthy();
  });

  it("should go to MatchOverview when pressed", async () => {
    const { getByTestId } = await waitFor(() =>
      render(<NewMatchTile match={match} />, {})
    );
    await waitFor(() => {
      expect(getByTestId("match-image")).toBeDefined();
    });
    fireEvent.press(getByTestId("match-image"));
    fireEvent.press(getByTestId("match-text"));
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith(`/chat/matches/${match.id}`);
  });
  // TODO - write tests for the shortestName function
});
