import { fireEvent } from "@testing-library/react-native";

import { MatchOptionsDialogBody } from "../../../components/dialogs/matchOptions/MatchOptionsDialogScreen";
import { render } from "../../../render";

describe("MatchOptionsDialogBody", () => {
  it("renders the Unmatch and Report User buttons", () => {
    const navigate = jest.fn();
    const { getByText } = render(
      <MatchOptionsDialogBody navigate={navigate} />,
      {}
    );

    expect(getByText("Unmatch")).toBeDefined();
    expect(getByText("Report User")).toBeDefined();
  });

  it("calls navigate with the correct screen when Unmatch button is pressed", () => {
    const navigate = jest.fn();
    const { getByText } = render(
      <MatchOptionsDialogBody navigate={navigate} />,
      {}
    );

    fireEvent.press(getByText("Unmatch"));
    expect(navigate).toHaveBeenCalledWith("unmatch");
  });

  it("calls navigate with the correct screen when Report User button is pressed", () => {
    const navigate = jest.fn();
    const { getByText } = render(
      <MatchOptionsDialogBody navigate={navigate} />,
      {}
    );

    fireEvent.press(getByText("Report User"));
    expect(navigate).toHaveBeenCalledWith("report");
  });
});
