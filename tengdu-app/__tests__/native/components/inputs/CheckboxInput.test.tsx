import "@testing-library/jest-native/extend-expect";

import React from "react";
import { Linking } from "react-native";
import { fireEvent } from "@testing-library/react-native";

import CheckboxInput from "../../../../components/inputs/CheckboxInput";
import { render } from "../../../../render";

describe("CheckboxInput", () => {
  it("renders correctly with required props", () => {
    const { getByTestId } = render(
      <CheckboxInput
        setChecked={() => {}}
        label="Test Label"
        testName="test"
      />,
      {}
    );

    const testLabel = getByTestId("test-label");
    expect(testLabel).toHaveTextContent("Test Label");
    expect(getByTestId("test-checkbox")).toHaveStyle({
      borderLeftColor: "#3c3632",
      borderRightColor: "#3c3632",
      borderTopColor: "#3c3632",
      borderBottomColor: "#3c3632"
    });
  });

  it("handleOnCheckedChange sets the checked state and clears the error", () => {
    const setChecked = jest.fn();
    const setError = jest.fn();
    const { getByTestId } = render(
      <CheckboxInput
        setChecked={setChecked}
        setError={setError}
        error={true}
        label="Test Label"
        testName="test"
      />,
      {}
    );

    const checkbox = getByTestId("test-checkbox");
    fireEvent.press(checkbox);

    expect(setChecked).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(false);
  });

  it("renders correctly with error prop", () => {
    const { getByTestId } = render(
      <CheckboxInput
        setChecked={() => {}}
        label="Test Label"
        testName="test"
        error={true}
      />,
      {}
    );
    // Replace this with a check for the actual visual indication of the error state
    expect(getByTestId("test-checkbox")).toHaveStyle({
      borderLeftColor: "red",
      borderRightColor: "red",
      borderTopColor: "red",
      borderBottomColor: "red"
    });
  });

  it("calls setChecked when checkbox is pressed", () => {
    const setChecked = jest.fn();
    const { getByTestId } = render(
      <CheckboxInput
        setChecked={setChecked}
        label="Test Label"
        testName="test"
      />,
      {}
    );

    fireEvent.press(getByTestId("test-checkbox"));
    expect(setChecked).toHaveBeenCalled();
  });

  it("opens link when label is pressed and labelLink is provided", () => {
    const labelLink = "https://example.com";
    const openURLSpy = jest.spyOn(Linking, "openURL");

    const { getByTestId } = render(
      <CheckboxInput
        setChecked={() => {}}
        label="Test Label"
        labelLink={labelLink}
        testName="test"
      />,
      {}
    );

    fireEvent.press(getByTestId("test-label"));
    expect(openURLSpy).toHaveBeenCalledWith(labelLink);
  });
});
