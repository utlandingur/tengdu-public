import { fireEvent, waitFor } from "@testing-library/react-native";
import { useMatches } from "providers/MatchProvider";

import { ReportUserDialogBody } from "../../../components/dialogs/matchOptions/ReportUserDialogScreen";
import { removeUserFromMatch, reportUsers } from "../../../firebaseFunctions";
import { render } from "../../../render";
import { makeMockMatch } from "__mocks__/mockMatchData";

jest.mock("providers/ProfileProvider");

jest.mock("providers/MatchProvider");
(useMatches as jest.Mock).mockReturnValue({
  matches: []
});

jest.mock("../../../firebaseFunctions");
(reportUsers as jest.Mock).mockResolvedValue({});
(removeUserFromMatch as jest.Mock).mockResolvedValue({});

const mockRouter = {
  navigate: jest.fn(),
  isReady: jest.fn().mockReturnValue(true)
};

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => mockRouter
}));

const navigate = jest.fn();

describe("ReportUserDialogBody", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders without crashing", async () => {
    render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(2)}
      />,
      {}
    );
  });

  it("renders the UserAvatarList and input field", async () => {
    const { getByText, getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(2)}
      />,
      {}
    );

    await waitFor(() => {
      expect(getByText("Select the user(s)")).toBeDefined();
      expect(getByTestId("user-avatars-scroll")).toBeDefined();
      expect(getByText("Reason")).toBeDefined();
    });
  });

  it("selects a user when pressed", async () => {
    const { getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );

    fireEvent.press(getByTestId("user-avatar-image"));
    await waitFor(() =>
      expect(getByTestId("highlighted-user-avatar-image")).toBeDefined()
    );
  });

  it("unselects a selected user when pressed", async () => {
    const { getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );

    fireEvent.press(getByTestId("user-avatar-image"));
    await waitFor(() =>
      expect(getByTestId("highlighted-user-avatar-image")).toBeDefined()
    );

    fireEvent.press(getByTestId("highlighted-user-avatar-image"));
    await waitFor(() => expect(getByTestId("user-avatar-image")).toBeDefined());
  });

  it("displays an error when no user is selected", async () => {
    const { getByText } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(1)}
      />
    );

    fireEvent.press(getByText("Report"));
    await waitFor(() =>
      expect(getByText("Please select a user to report")).toBeDefined()
    );
  });

  it("displays an error when the reason is less than 50 characters", async () => {
    const { getByText, getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );
    fireEvent.press(getByTestId("user-avatar-image"));
    await waitFor(() =>
      expect(getByTestId("highlighted-user-avatar-image")).toBeDefined()
    );

    await waitFor(() => {
      fireEvent.changeText(getByText("Reason"), "Short reason");
      fireEvent.press(getByTestId("report-button"));
    });
    await waitFor(() => expect(getByText("Min 50 Characters")).toBeDefined());
  });

  it("reports a user when a user is selected and the reason is valid", async () => {
    const mockMatch = makeMockMatch(1);
    const { getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={mockMatch}
      />,
      {}
    );

    fireEvent.press(getByTestId("user-avatar-image"));
    await waitFor(() =>
      expect(getByTestId("highlighted-user-avatar-image")).toBeDefined()
    );

    fireEvent.changeText(
      getByTestId("Reason-input"),
      "This is a mock reason for testing and it is 50 chars.."
    );
    fireEvent.press(getByTestId("report-button"));
    await waitFor(() => {
      expect(reportUsers).toHaveBeenCalledWith(
        [mockMatch.users[0].uid],
        "This is a mock reason for testing and it is 50 chars.."
      );
      expect(removeUserFromMatch).toHaveBeenCalledWith(mockMatch.match.id);
      expect(mockRouter.navigate).toHaveBeenCalledWith("/chat");
    });
  });

  it("navigates back to the match options screen when the cancel button is pressed", async () => {
    const navigate = jest.fn();
    const { getByTestId } = render(
      <ReportUserDialogBody
        navigate={navigate}
        matchInfo={makeMockMatch(2)}
      />,
      {}
    );

    fireEvent.press(getByTestId("cancel-button"));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("matchOptions"));
  });
});
