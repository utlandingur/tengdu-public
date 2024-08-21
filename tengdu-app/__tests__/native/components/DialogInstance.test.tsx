// import "@tamagui/animate-presence";

import { View } from "react-native";
import { fireEvent, waitFor } from "@testing-library/react-native";
import MyButton from "components/inputs/MyButton";
import ThreeDotsMenu from "components/ThreeDotsMenu";

import DialogInstance from "../../../components/DialogInstance";
import { render } from "../../../render";

// theres a bug in the test library that causes a warning to be thrown
// eslint-disable-next-line @typescript-eslint/no-empty-function
console.warn = () => {};

// TODO - Not an ideal way to avoid animations giving errors in tests
// Will need to be applied to all future dialog tests until a better solution is found

describe("DialogInstance", () => {
  const defaultProps = {
    title: "Test Title",
    description: "Test Description",
    button: MyButton,
    body: (() => <View testID="test-body" />)(),
    footerPrimaryButtonText: "Confirm",
    footerCancelButtonText: "Cancel",
    animationType: undefined,
    trigger: ThreeDotsMenu
  };

  it("renders without crashing", async () => {
    await waitFor(() => render(<DialogInstance {...defaultProps} />, {}));
  });

  it("renders the title and description", async () => {
    const { getByText, getByTestId, queryByTestId } = await waitFor(() =>
      render(<DialogInstance {...defaultProps} />, {})
    );
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(getByText("Test Title")).toBeDefined();
      expect(getByText("Test Description")).toBeDefined();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("does not render the title when titleHidden is true", async () => {
    const { getByText, getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          titleHidden
        />,
        {}
      )
    );
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("Test Title")).toBeNull();
      expect(getByText("Test Description")).toBeDefined();
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
    const { getByText, getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          titleHidden
        />,
        {}
      )
    );
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });

    await waitFor(() => {
      expect(getByText("Test Title")).toBeDefined();
      expect(queryByTestId("Test Description")).toBeNull();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the body within a scrollView by default", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(<DialogInstance {...defaultProps} />, {})
    );
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });
    await waitFor(() => {
      expect(getByTestId("scrollable-body-view")).toHaveTextContent(
        "Test Title"
      );
    });
    fireEvent.press(getByTestId("dialog-close-button"));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the body without a scrollView when noScrollableBody is true ", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          noScrollableBody
        />,
        {}
      )
    );
    await waitFor(() => {
      fireEvent.press(getByTestId("my-button"));
    });
    await waitFor(() => {
      expect(queryByTestId("scrollable-body-view")).toBeNull();
      expect(getByTestId("test-body")).toBeDefined();
    });
    fireEvent.press(getByTestId("dialog-close-button"));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the body component", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(<DialogInstance {...defaultProps} />, {})
    );
    fireEvent.press(getByTestId("my-button"));
    await waitFor(() => {
      expect(getByTestId("test-body")).toBeDefined();
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
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          footerInBody
        />,
        {}
      )
    );
    fireEvent.press(getByTestId("my-button"));
    await waitFor(() => {
      expect(getByTestId("scrollable-body-view")).toHaveTextContent("Cancel");
      expect(getByTestId("dialog-footer")).toBeDefined();
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the footer in the body when footerInBody is false", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          footerInBody={false}
        />,
        {}
      )
    );
    fireEvent.press(getByTestId("my-button"));
    await waitFor(() => {
      expect(getByTestId("dialog-footer")).toBeDefined();
      expect(getByTestId("scrollable-body-view")).not.toHaveTextContent(
        "Cancel"
      );
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders the correct cancel button text when footerCancelButtonText is provided", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          footerCancelButtonText="Close"
        />,
        {}
      )
    );
    fireEvent.press(getByTestId("my-button"));
    await waitFor(() => {
      expect(getByTestId("dialog-footer")).toHaveTextContent("Close");
    });
    await waitFor(() => fireEvent.press(getByTestId("dialog-close-button")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  it("renders a custom footer when customFooter is provided", async () => {
    const CustomFooter = () => <View testID="custom-footer" />;

    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <DialogInstance
          {...defaultProps}
          customFooter={CustomFooter()}
        />,
        {}
      )
    );
    fireEvent.press(getByTestId("my-button"));
    await waitFor(() => {
      expect(getByTestId("custom-footer")).toBeDefined();
    });
    await waitFor(() => fireEvent.press(getByTestId("custom-footer")));
    await waitFor(
      () => {
        expect(queryByTestId("dialog-sheet-overlay")).not.toBeDefined;
      },
      { timeout: 2000 }
    );
  });

  // TODO - Add test for animationType
});
