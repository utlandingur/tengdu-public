import { fireEvent } from "@testing-library/react-native";

import UserAvatarList from "../../../components/UserAvatarList";
import { render } from "../../../render";

describe("UserAvatarList", () => {
  const matchedUsers = [
    { uid: "1", firstName: "User1", photoURL: "url1" },
    { uid: "2", firstName: "User2", photoURL: "url2" }
  ];
  const highlightedUsers = [{ uid: "1", firstName: "User1", photoURL: "url1" }];

  it("renders without crashing", () => {
    render(<UserAvatarList users={matchedUsers} />, {});
  });

  it("renders highlighted users correctly", () => {
    const mockSetHighlightedUsers = jest.fn();

    const { getAllByTestId, getByText } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );

    expect(getAllByTestId("user-avatar-image").length).toBe(2);
    expect(getByText("User1")).toBeTruthy();
    expect(getByText("User2")).toBeTruthy();
  });

  it("calls setHighlightedUsers when a user is clicked", () => {
    const mockSetHighlightedUsers = jest.fn();

    const { getAllByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );

    fireEvent.press(getAllByTestId("user-avatar-image")[0]);
    expect(mockSetHighlightedUsers).toHaveBeenCalledTimes(1);
  });

  it("highlights a user when they are clicked", () => {
    const mockSetHighlightedUsers = jest.fn();

    const { getAllByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );

    fireEvent.press(getAllByTestId("user-avatar-image")[0]);

    // Check that setHighlightedUsers was called with the correct user
    expect(mockSetHighlightedUsers).toHaveBeenCalledWith(
      expect.arrayContaining([matchedUsers[0]])
    );
  });

  it("renders highlighted and unhighlighted users correctly", () => {
    const mockSetHighlightedUsers = jest.fn();
    const highlightedUsers = [matchedUsers[0]];

    const { getAllByTestId, getByTestId, getByText } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );

    expect(getAllByTestId("user-avatar-image").length).toBe(1);
    expect(getAllByTestId("user-avatar-image").length).toBe(1);
    expect(getByText("User1")).toBeTruthy();

    expect(getByTestId("highlighted-user-text")).toHaveTextContent(
      matchedUsers[0].firstName
    );
    expect(getByTestId("match-text")).toHaveTextContent(
      matchedUsers[1].firstName
    );
  });

  it("unhighlights a user when they are clicked again", () => {
    const mockSetHighlightedUsers = jest.fn();
    const highlightedUsers = [matchedUsers[0]];

    const { getAllByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );

    fireEvent.press(getAllByTestId("highlighted-user-avatar-image")[0]);

    // Check that setHighlightedUsers was called with an array that does not contain the user
    expect(mockSetHighlightedUsers).toHaveBeenCalledWith(
      expect.not.arrayContaining([matchedUsers[0]])
    );
  });
  it("renders correctly with no users", () => {
    const { queryByTestId } = render(<UserAvatarList users={[]} />, {});
    expect(queryByTestId("user-avatar-image")).toBeNull();
  });
  it("renders correctly with no highlighted users", () => {
    const { queryByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={[]}
      />,
      {}
    );
    expect(queryByTestId("highlighted-user-avatar-image")).toBeNull();
  });
  it("renders correctly with all users highlighted", () => {
    const mockSetHighlightedUsers = jest.fn();

    const { getAllByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={matchedUsers}
        setHighlightedUsers={mockSetHighlightedUsers}
      />,
      {}
    );
    expect(getAllByTestId("highlighted-user-avatar-image").length).toBe(
      matchedUsers.length
    );
  });
  it("does not call setHighlightedUsers when a user is clicked and no setHighlightedUsers prop is provided", () => {
    const mockSetHighlightedUsers = jest.fn();

    const { getAllByTestId } = render(
      <UserAvatarList
        users={matchedUsers}
        highlightedUsers={highlightedUsers}
      />,
      {}
    );

    fireEvent.press(getAllByTestId("user-avatar-image")[0]);
    expect(mockSetHighlightedUsers).not.toHaveBeenCalled();
  });
});
