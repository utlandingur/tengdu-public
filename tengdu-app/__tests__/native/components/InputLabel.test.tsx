import { waitFor } from "@testing-library/react-native";
import InputLabel from "components/InputLabel";

import { render } from "../../../render";

describe("InputLabel", () => {
  it("renders the label text", () => {
    const { getByText } = render(<InputLabel label="Test Label" />, {});
    expect(getByText("Test Label")).toBeTruthy();
  });

  it("renders the error message when error is true", () => {
    const { getByText } = render(
      <InputLabel
        label="Test Label"
        error={true}
        errorMessage="Test Error"
      />,
      {}
    );
    expect(getByText("Test Error")).toBeTruthy();
  });

  it("does not render the error message when error is false", () => {
    const { queryByText } = render(
      <InputLabel
        label="Test Label"
        error={false}
        errorMessage="Test Error"
      />
    );
    expect(queryByText("Test Error")).toBeNull();
  });

  it("uses the testID for the error message element when provided", () => {
    const { getByTestId } = render(
      <InputLabel
        label="Test Label"
        error={true}
        errorMessage="Test Error"
        testID="test-id"
      />
    );
    expect(getByTestId("test-id-error-message")).toBeTruthy();
  });

  it("uses the label for the error message element when testID is not provided", () => {
    const { getByTestId } = render(
      <InputLabel
        label="Test Label"
        error={true}
        errorMessage="Test Error"
      />
    );
    expect(getByTestId("Test Label-error-message")).toBeTruthy();
  });

  it("updates the error message when the error prop changes", async () => {
    const { queryByTestId, getByTestId, rerender, debug } = render(
      <InputLabel
        label="Test Label"
        error={false}
        errorMessage="Initial Error"
      />
    );

    // Initially, the error message should not be present
    expect(queryByTestId("Test Label-error-message")).toBeNull();

    // Rerender the component with the error prop set to true
    rerender(
      <InputLabel
        label="Test Label"
        error={true}
        errorMessage="Updated Error"
      />
    );
    // Now, the error message should be present

    expect(getByTestId("Test Label-error-message")).toBeTruthy();

    expect(getByTestId("Test Label-error-message").props.children).toBe(
      "Updated Error"
    );

    // Rerender the component with the error prop set back to false
    rerender(
      <InputLabel
        label="Test Label"
        error={false}
        errorMessage="Updated Error"
      />
    );
    // The error message should not be present again
    expect(queryByTestId("Test Label-error-message")).toBeNull();
  });

  it("updates the error message when the error and errorMessage props change", async () => {
    const { queryByTestId, getByTestId, rerender, debug } = render(
      <InputLabel
        label="Test Label"
        error={false}
        errorMessage="Initial Error"
      />
    );

    // Initially, the error message should not be present
    expect(queryByTestId("Test Label-error-message")).toBeNull();

    // Rerender the component with the error prop set to true and a new errorMessage
    rerender(
      <InputLabel
        label="Test Label"
        error={true}
        errorMessage="Updated Error"
      />
    );

    // Now, the error message should be present and should have the updated text
    await waitFor(() =>
      expect(getByTestId("Test Label-error-message")).toBeTruthy()
    );
    expect(getByTestId("Test Label-error-message").props.children).toBe(
      "Updated Error"
    );

    // Rerender the component with the error prop set back to false and another new errorMessage
    rerender(
      <InputLabel
        label="Test Label"
        error={false}
        errorMessage="Another Updated Error"
      />
    );

    // The error message should not be present again
    expect(queryByTestId("Test Label-error-message")).toBeNull();
  });
});
