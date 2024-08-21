import { fireEvent, waitFor } from "@testing-library/react-native";
import MyButton from "components/inputs/MyButton";
import ThreeDotsMenu from "components/ThreeDotsMenu";
import { Dialog } from "tamagui";

import createNavigatorComponent, {
  DialogScreen
} from "../../../factoryFunctions/createNavigatorComponent";
import { render } from "../../../render";

// theres a bug in the test library that causes a warning to be thrown
// eslint-disable-next-line @typescript-eslint/no-empty-function
console.warn = () => {};
interface mockBodyProps {
  navigate: (screen: string) => () => void;
}

// Mock components for testing
const MockBodyComponent = ({ navigate }: mockBodyProps) => (
  <MyButton
    onPress={navigate("testScreen")}
    testID="body"
  >
    Navigate
  </MyButton>
);

const MockFooterComponent = () => (
  <Dialog.Close
    displayWhenAdapted
    asChild
  >
    <MyButton
      text="Footer"
      testID="Footer"
    />
  </Dialog.Close>
);

const initialScreen: DialogScreen = {
  dialogInfo: {
    title: "Initial Screen",
    description: "This is the initial screen"
  },
  body: MockBodyComponent,
  footer: MockFooterComponent
};
const testScreen: DialogScreen = {
  dialogInfo: {
    title: "Test Screen",
    description: "This is the test screen"
  },
  body: MockBodyComponent,
  footer: MockFooterComponent
};

const screens = {
  initialScreen: initialScreen,
  testScreen: testScreen
};

describe("Navigator", () => {
  it("navigates to the correct screen when navigate is called", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, getByTestId, queryByText, queryByTestId } = render(
      <Navigator />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    // Initial screen should be visible
    await waitFor(() => expect(getByText("Initial Screen")).toBeTruthy());

    // Navigate to testScreen
    await waitFor(() => fireEvent.press(getByText("Navigate")));

    // Test screen should be visible
    await waitFor(() => expect(queryByText("Test Screen")).toBeTruthy());
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });
  it("initial screen is not visible after navigation", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, queryByText, getByTestId, queryByTestId } = render(
      <Navigator />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });
    // Navigate to testScreen
    await waitFor(() => fireEvent.press(getByText("Navigate")));

    // Initial screen should not be visible
    await waitFor(() => expect(queryByText("Initial Screen")).toBeNull());

    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("Test Screen is not visible after closing the dialog", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, queryByText, getByTestId } = render(<Navigator />, {});

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    // Navigate to testScreen
    await waitFor(() => fireEvent.press(getByText("Navigate")));

    // Close the dialog
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));

    // Test screen should not be visible
    await waitFor(() => expect(queryByText("Test Screen")).toBeNull());
  });

  it("does not render the title when titleHidden is true", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, getByTestId, queryByTestId } = render(
      <Navigator titleHidden />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("Initial Screen")).toBeNull();
      expect(getByText("This is the initial screen")).toBeDefined();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });
  it("does not render the description when descriptionHidden is true", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, getByTestId, queryByTestId } = render(
      <Navigator descriptionHidden />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(getByText("Initial Screen")).toBeDefined();
      expect(queryByTestId("This is the initial screen")).toBeNull();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the footer in the body when footerInBody is true", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByText, getByTestId, queryByTestId } = render(
      <Navigator footerInBody />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(getByText("Initial Screen")).toBeDefined();
      expect(getByText("Close")).toBeDefined();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the custom footer when customFooter is true", async () => {
    const footerScreen: DialogScreen = {
      dialogInfo: {
        title: "Initial Screen",
        description: "This is the initial screen",
        customFooter: true
      },
      body: MockBodyComponent,
      footer: MockFooterComponent
    };

    const Navigator = createNavigatorComponent(
      { footer: footerScreen },
      "footer",
      ThreeDotsMenu
    );
    const { findByText, getByTestId, queryByTestId, debug } = render(
      <Navigator />,
      {}
    );

    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(findByText("Initial Screen")).toBeDefined();
    });
    await waitFor(() => expect(findByText("Footer")).toBeDefined());

    await waitFor(() => fireEvent.press(getByTestId("Footer")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });
  it("throws an error when navigate is called with a screen name that doesn't exist", async () => {
    const Navigator = createNavigatorComponent(
      screens,
      "initialScreen",
      ThreeDotsMenu
    );
    const { getByTestId, queryByTestId } = render(<Navigator />, {});

    // Simulate a press event to open the dialog
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    // Try to navigate to a screen that doesn't exist
    expect(() =>
      fireEvent.press(getByTestId("navigate-nonexistent-screen"))
    ).toThrow();

    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });
});
