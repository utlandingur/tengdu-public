import { waitFor } from "@testing-library/react-native";
import MatchOptionsDialogNavigator from "components/dialogs/matchOptions/MatchDialogNavigator";
import MatchPage from "pages/MatchPage";
import { useMatchInfo } from "providers/MatchInfoProvider";

import { render } from "../../../render";

let screenProps = null;
let headerRightFunction = null;

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  Stack: {
    Screen: (props) => {
      headerRightFunction = props.options.headerRight;
      screenProps = props;
      return props.children;
    }
  }
}));
jest.mock("providers/MatchInfoProvider");

// mock children
jest.mock("components/MatchOverview", () => {
  return jest.fn();
});
jest.mock("components/dialogs/matchOptions/MatchDialogNavigator", () => {
  return jest.fn();
});

describe("MatchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue(null);
    const { getByTestId } = render(MatchPage());
    await waitFor(() => expect(getByTestId("spinner")).toBeTruthy());
  });

  it("renders match data after loading", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "1", newMatch: true }
    });
    render(MatchPage());

    expect(screenProps).toEqual(
      expect.objectContaining({
        options: expect.objectContaining({
          headerShown: true,
          title: "View match",
          headerBackTitle: "Back",
          headerRight: expect.any(Function),
          navigationBarHidden: false
        })
      })
    );

    render(headerRightFunction(), {});
    expect(MatchOptionsDialogNavigator).toHaveBeenCalled();
  });

  it("has title View Match if not a new match", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "1", newMatch: false }
    });
    render(MatchPage());
    expect(screenProps).toEqual(
      expect.objectContaining({
        options: expect.objectContaining({
          headerShown: true,
          title: "View match",
          headerBackTitle: "Back",
          headerRight: expect.any(Function),
          navigationBarHidden: false
        })
      })
    );

    render(headerRightFunction(), {});
    expect(MatchOptionsDialogNavigator).toHaveBeenCalled();
  });
});
