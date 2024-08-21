import { fireEvent, waitFor } from "@testing-library/react-native";
import DialogInstance from "components/DialogInstance";
import { UnmatchDialogBody } from "components/dialogs/matchOptions/UnmatchDialogScreen";
import ThreeDotsMenu from "components/ThreeDotsMenu";
import { useRouter } from "expo-router";
import { useMatchInfo } from "providers/MatchInfoProvider";
import { useMatches } from "providers/MatchProvider";

import { removeUserFromMatch } from "../../../firebaseFunctions";
import { render } from "../../../render";
import { getMockMatches, makeMockMatch } from "__mocks__/mockMatchData";

// theres a bug in the test library that causes a warning to be thrown
// eslint-disable-next-line @typescript-eslint/no-empty-function
console.warn = () => {};

jest.mock("expo-router");
(useRouter as jest.Mock).mockReturnValue({
  navigate: jest.fn()
});

jest.mock("providers/MatchProvider");
(useMatches as jest.Mock).mockReturnValue({
  matches: []
});
jest.mock("providers/MatchInfoProvider");
(useMatchInfo as jest.Mock).mockReturnValue({
  match: { id: "1" }
});

jest.mock("../../../firebaseFunctions");
(removeUserFromMatch as jest.Mock).mockResolvedValue({});

describe("UnmatchDialogBody", () => {
  const mockNavigate = jest.fn();

  it("should render correctly", async () => {
    const { getByText } = render(
      <UnmatchDialogBody
        navigate={mockNavigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );
    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("should navigate to matchOptions when Cancel button is pressed", async () => {
    const { getByTestId } = render(
      <UnmatchDialogBody
        navigate={mockNavigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );
    fireEvent.press(getByTestId("cancel-button"));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("matchOptions")
    );
  });

  it("should remove user from match and navigate to parent when Yes button is pressed", async () => {
    console.log = jest.fn();
    const mockMatch = makeMockMatch(1);
    const { getByText, getByTestId, queryByTestId } = render(
      <DialogInstance
        title={""}
        description={""}
        trigger={ThreeDotsMenu}
        body={
          <UnmatchDialogBody
            navigate={mockNavigate}
            matchInfo={mockMatch}
          />
        }
      />,
      {}
    );

    // Simulate a press event to open the dialog
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => fireEvent.press(getByText("Yes")));
    await waitFor(
      () => {
        expect(removeUserFromMatch).toHaveBeenCalledWith(mockMatch.match.id);
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
        expect(useRouter().navigate).toHaveBeenCalledWith("/chat");
      },
      { timeout: 2000 }
    );
  });

  it("should render with correct initial state", () => {
    const { getByText } = render(
      <UnmatchDialogBody
        navigate={mockNavigate}
        matchInfo={makeMockMatch(1)}
      />,
      {}
    );
    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("should navigate to matchOptions when Cancel button is pressed", () => {
    const mockNavigate = jest.fn();
    const { getByTestId } = render(
      <UnmatchDialogBody
        navigate={mockNavigate}
        matchInfo={makeMockMatch(1)}
      />
    );
    const cancelButton = getByTestId("cancel-button");

    fireEvent.press(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("matchOptions");
  });
});
