/* eslint-disable @typescript-eslint/no-empty-function */
import "@testing-library/jest-native/extend-expect";

import React from "react";
import { fireEvent } from "@testing-library/react-native";

import TextInput from "../../../../components/inputs/TextInput";
import { render } from "../../../../render";

describe("TextInput", () => {
  // it("renders the UI as usual", () => {
  //   const tree = renderSnapshot(
  //     <TextInput
  //       label="Test"
  //       state=""
  //       setState={() => {}}
  //     />
  //   ).toJSON();
  //   expect(tree).toMatchSnapshot();
  // });

  it("renders label correctly", () => {
    const { getByTestId } = render(
      <TextInput
        label="Email"
        state=""
        setState={() => {}}
      />,
      {}
    );
    expect(getByTestId("Email-label")).toHaveTextContent("Email");
  });

  it("renders error message when error is true and errorMessage prop is provided", () => {
    const { getByTestId } = render(
      <TextInput
        label="Email"
        state=""
        setState={() => {}}
        errorMessage="Invalid email"
        error={true}
      />,
      {}
    );
    expect(getByTestId("Email-error-message")).toHaveTextContent(
      "Invalid email"
    );
  });

  it("does not render error message when error is false and errorMessage prop is provided", () => {
    const { getByTestId, queryByTestId } = render(
      <TextInput
        label="Email"
        state=""
        setState={() => {}}
        errorMessage="Invalid email"
        error={false}
      />,
      {}
    );
    expect(queryByTestId("Email-error-message")).toBeFalsy();
  });

  it("does not render an error message when no errorMessage prop", () => {
    const { queryByTestId } = render(
      <TextInput
        label="Email"
        state=""
        setState={() => {}}
      />,
      {}
    );
    expect(queryByTestId("Email-error-message")).toBeFalsy();
  });

  it("calls setState when text is entered", () => {
    const setState = jest.fn();
    const state = "";

    const { getByTestId } = render(
      <TextInput
        setState={setState}
        label="Email"
        state={state}
      />,
      {}
    );
    const input = getByTestId("Email-input");

    fireEvent.changeText(input, "test@example.com");

    expect(setState).toHaveBeenCalledWith("test@example.com");
  });

  it("has the value of the state", () => {
    const state = "test input";

    const { getByTestId } = render(
      <TextInput
        setState={() => {}}
        label="Email"
        state={state}
      />,
      {}
    );
    const input = getByTestId("Email-input");

    expect(input).toHaveProp("value", state);
  });

  it("passes the textContentType prop to the Input component", () => {
    const { getByTestId } = render(
      <TextInput
        setState={() => {}}
        label="Email"
        state=""
        textContentType="emailAddress"
      />,
      {}
    );
    const input = getByTestId("Email-input");

    expect(input).toHaveProp("textContentType", "emailAddress");
  });

  it("sets the theme prop to 'red' when there's an error", () => {
    const { getByTestId } = render(
      <TextInput
        setState={() => {}}
        label="Email"
        state=""
        error={true}
      />,
      {}
    );
    const input = getByTestId("Email-input");

    expect(input).toHaveStyle({
      borderLeftColor: "red",
      borderRightColor: "red",
      borderTopColor: "red",
      borderBottomColor: "red"
    });
  });

  it("sets the theme prop to undefined when there's no error", () => {
    const { getByTestId } = render(
      <TextInput
        setState={() => {}}
        label="Email"
        state=""
      />,
      {}
    );
    const input = getByTestId("Email-input");

    expect(input).toHaveStyle({ borderTopColor: "#3c3632" });
  });

  test("handleOnChangeText sets the state", () => {
    const setState = jest.fn();
    const { getByTestId } = render(
      <TextInput
        setState={setState}
        state=""
        error={true}
        label="Email"
      />,
      {}
    );

    const input = getByTestId("Email-input");
    fireEvent.changeText(input, "new text");

    expect(setState).toHaveBeenCalledWith("new text");
  });
});
