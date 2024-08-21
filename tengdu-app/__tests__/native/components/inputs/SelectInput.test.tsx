import React from "react";
import { fireEvent } from "@testing-library/react-native";

import SelectInput, {
  SelectItem
} from "../../../../components/inputs/SelectInput";
import { render } from "../../../../render";

describe("SelectInput", () => {
  const setState = jest.fn();
  const items: SelectItem[] = [
    { name: "Option 1" },
    { name: "Option 2" },
    { name: "Option 3" }
  ];

  it("renders without crashing", () => {
    render(
      <SelectInput
        items={items}
        state=""
        setState={setState}
        label="Test"
      />,
      {}
    );
  });

  it("renders the correct number of options", () => {
    const { getAllByTestId } = render(
      <SelectInput
        items={items}
        state=""
        setState={setState}
        testID="test"
        label="test"
      />,
      {}
    );
    const options = getAllByTestId("test-select-item");
    expect(options.length).toBe(items.length);
  });

  it("calls setState when an option is selected", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectInput
        items={items}
        state=""
        setState={setState}
        testID="test"
        label="test"
      />,
      {}
    );

    const select = getByTestId("test-select-trigger");
    await fireEvent.press(select);

    const options = getAllByTestId("test-select-item");
    fireEvent.press(options[0]);
    expect(setState).toHaveBeenCalledWith(items[0].name.toLowerCase());
  });

  it("opens and closes correctly", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectInput
        items={items}
        state=""
        setState={setState}
        testID="test"
        label="test"
      />,
      {}
    );

    expect(
      getByTestId("test-select-trigger").props.accessibilityState.expanded
    ).toBeFalsy();
    const select = getByTestId("test-select-trigger");
    await fireEvent.press(select);
    expect(
      getByTestId("test-select-trigger").props.accessibilityState.expanded
    ).toBeTruthy();

    const options = getAllByTestId("test-select-item");
    fireEvent.press(options[0]);
    expect(setState).toHaveBeenCalledWith(items[0].name.toLowerCase());
    expect(
      getByTestId("test-select-trigger").props.accessibilityState.expanded
    ).toBeFalsy();
  });

  it("renders label when provided", () => {
    const { getByTestId, queryByTestId } = render(
      <SelectInput
        label="Test"
        items={items}
        state=""
        setState={setState}
        testID="Test"
      />,
      {}
    );
    expect(getByTestId("Test-label")).toBeTruthy();
    expect(queryByTestId("Test-error-message")).toBeNull();
  });

  it("renders error message when error is true", () => {
    const { getByTestId } = render(
      <SelectInput
        error={true}
        errorMessage="Test Error"
        items={items}
        state=""
        setState={setState}
        testID="Test"
        label="Test"
      />,
      {}
    );
    expect(getByTestId("Test-error-message")).toHaveTextContent("Test Error");
    expect(getByTestId("Test-select-trigger")).toHaveStyle({
      borderTopColor: "red",
      borderBottomColor: "red",
      borderLeftColor: "red",
      borderRightColor: "red"
    });
  });

  it("does not render an error message when error is false", () => {
    const { queryByTestId } = render(
      <SelectInput
        error={false}
        errorMessage="Test Error"
        items={items}
        state=""
        setState={setState}
        testID="Test"
        label="Test"
      />,
      {}
    );
    expect(queryByTestId("Test-error-message")).toBeNull();
  });
});
