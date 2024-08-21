import "@testing-library/jest-native/extend-expect";

import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";

import MyButton from "../../../components/inputs/MyButton";
import { render, renderSnapshot } from "../../../render";

describe("MyButton", () => {
  it("renders ", () => {
    const tree = renderSnapshot(
      <MyButton type="primary">button</MyButton>
    ).toJSON();
    // expect(tree).toMatchSnapshot();
    expect(tree.props.style.borderTopLeftRadius).toBe(9);
    expect(tree.props.style.borderStyle).toBe("solid");
    expect(tree.props.style.justifyContent).toBe("center");
  });
  it("renders primary types correctly", () => {
    const tree = renderSnapshot(
      <MyButton type="primary">button</MyButton>
    ).toJSON();
    // expect(tree).toMatchSnapshot();
    expect(tree.props.style.backgroundColor).toBe("#44A751");
    expect(tree.props.style.color).toBe("#fff");
  });
  it("renders secondary types correctly", () => {
    const tree = renderSnapshot(
      <MyButton type="secondary">button</MyButton>
    ).toJSON();
    // expect(tree).toMatchSnapshot();
    expect(tree.props.style.backgroundColor).toBe("#506553");
    expect(tree.props.style.color).toBe("#fff");
  });
  it("renders tertiary types correctly", () => {
    const tree = renderSnapshot(
      <MyButton type="tertiary">button</MyButton>
    ).toJSON();
    // expect(tree).toMatchSnapshot();
    expect(tree.props.style.backgroundColor).toBe("#fff");
    expect(tree.props.style.color).toBe("#3c3632");
  });
  it("renders danger types correctly", () => {
    const tree = renderSnapshot(
      <MyButton type="danger">button</MyButton>
    ).toJSON();
    // expect(tree).toMatchSnapshot();
    expect(tree.props.style.backgroundColor).toBe("#EE0B0B");
    expect(tree.props.style.color).toBe("#fff");
  });
  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <MyButton
        type="secondary"
        onPress={onPress}
        testID="MyButton"
      >
        button
      </MyButton>,
      {}
    );
    const button = getByTestId("MyButton");

    fireEvent.press(button);

    await waitFor(() => expect(onPress).toHaveBeenCalled());
  });
});
