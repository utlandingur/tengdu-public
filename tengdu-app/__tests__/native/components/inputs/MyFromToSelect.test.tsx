import { fireEvent, waitFor, within } from "@testing-library/react-native";

import MyFromToSelect from "../../../../components/inputs/MyFromToSelect";
import { render } from "../../../../render";

describe("MyFromToSelect", () => {
  it("renders without crashing", () => {
    render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={5}
        lowerLimit={1}
        upperLimit={5}
        setFrom={() => {}}
        setTo={() => {}}
      />,
      {}
    );
  });

  it("displays the correct from and to values", () => {
    const { getByTestId } = render(
      <MyFromToSelect
        label="Test"
        from={6}
        to={8}
        lowerLimit={1}
        upperLimit={10}
        setFrom={() => {}}
        setTo={() => {}}
      />,
      {}
    );

    const fromSelect = getByTestId("from-select-trigger");
    const toSelect = getByTestId("to-select-trigger");

    expect(within(fromSelect).getByText("6")).toBeTruthy();
    expect(within(toSelect).getByText("8")).toBeTruthy();
  });

  it("displays the correct number of options", () => {
    const { getAllByTestId } = render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={10}
        lowerLimit={1}
        upperLimit={10}
        setFrom={() => {}}
        setTo={() => {}}
      />,
      {}
    );
    const fromOptions = getAllByTestId("from-select-item");
    const toOptions = getAllByTestId("to-select-item");

    expect(fromOptions.length).toBe(9);
    expect(toOptions.length).toBe(9);
  });

  it("correctly updates toRange when onChangeFrom is called", async () => {
    const { getByTestId, getAllByTestId } = render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={10}
        lowerLimit={1}
        upperLimit={10}
        setFrom={() => {}}
        setTo={() => {}}
      />,
      {}
    );

    const fromSelect = getByTestId("from-select-trigger");
    fireEvent.press(fromSelect);

    fireEvent.press(getAllByTestId("from-select-item")[3]);
    await waitFor(() => expect(within(fromSelect).getByText("4")).toBeTruthy());

    // Check if the select options are updated
    expect(getAllByTestId("to-select-item").length).toBe(6);
    expect(getAllByTestId("from-select-item").length).toBe(9);
  });

  it("correctly updates fromRange when onChangeTo is called", async () => {
    const { getByTestId, getAllByTestId } = render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={10}
        lowerLimit={1}
        upperLimit={10}
        setFrom={() => {}}
        setTo={() => {}}
      />,
      {}
    );

    const toSelect = getByTestId("to-select-trigger");
    fireEvent.press(toSelect);

    fireEvent.press(getAllByTestId("to-select-item")[3]);
    await waitFor(() => expect(within(toSelect).getByText("5")).toBeTruthy());

    // Check if the select options are updated
    expect(getAllByTestId("to-select-item").length).toBe(9);
    expect(getAllByTestId("from-select-item").length).toBe(4);
  });

  it("correctly calls setTo when value changed", async () => {
    const setFrom = jest.fn();
    const setTo = jest.fn();
    const { getByTestId, getAllByTestId, debug } = render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={4}
        lowerLimit={1}
        upperLimit={4}
        setFrom={setFrom}
        setTo={setTo}
      />,
      {}
    );

    const toSelect = getByTestId("to-select-trigger");
    fireEvent.press(toSelect);

    // check if setTo is called
    fireEvent.press(getAllByTestId("to-select-item")[1]);
    await waitFor(() => expect(setTo).toHaveBeenCalledWith(3));
    await waitFor(() => expect(within(toSelect).getByText("3")).toBeTruthy());
  });

  it("correctly calls setFrom when value changed", async () => {
    const setFrom = jest.fn();
    const setTo = jest.fn();
    const { getByTestId, getAllByTestId, debug } = render(
      <MyFromToSelect
        label="Test"
        from={1}
        to={4}
        lowerLimit={1}
        upperLimit={4}
        setFrom={setFrom}
        setTo={setTo}
      />,
      {}
    );

    const fromSelect = getByTestId("from-select-trigger");
    fireEvent.press(fromSelect);

    // check if setFrom is called
    await fireEvent.press(getAllByTestId("from-select-item")[1]);
    await waitFor(() => expect(setFrom).toHaveBeenCalled());
    await waitFor(() => expect(within(fromSelect).getByText("2")).toBeTruthy());
  });
});
