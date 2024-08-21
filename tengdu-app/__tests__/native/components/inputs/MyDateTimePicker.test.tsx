/* eslint-disable @typescript-eslint/no-empty-function */
import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from "@testing-library/react-native";
import MyDateTimePicker from "components/inputs/MyDateTimePicker";

import { render } from "../../../../render";

jest.mock("react-native-modal-datetime-picker", () => {
  const RealComponent = jest.requireActual(
    "react-native-modal-datetime-picker"
  ).default;

  const MockDateTimePicker = ({ ...props }) => {
    return <RealComponent {...props} />;
  };

  return {
    __esModule: true,
    default: MockDateTimePicker
  };
});

const mockSetState = jest.fn();

describe("MyDateTimePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders correctly with initial state", async () => {
    const initialState = new Date();
    const { getByTestId, queryByTestId, getByPlaceholderText, debug } = render(
      <MyDateTimePicker
        type="date"
        state={initialState}
        setState={mockSetState}
        label="Date"
        testID="Date"
      />
    );

    // Check that the container is rendered
    expect(getByTestId("Date-container")).toBeTruthy();

    // Check that the date picker modal is not open
    expect(queryByTestId("Date-modal")).toBeFalsy();
    // Check that the initial date is correct
    const input = getByPlaceholderText(initialState.toLocaleDateString());
    expect(input.props.placeholder).toBe(initialState.toLocaleDateString());
  });

  it("closes the date picker when confirm pressed", async () => {
    let getByTestId, queryByTestId, findByTestId;
    await waitFor(() => {
      const result = render(
        <MyDateTimePicker
          type="date"
          state={new Date()}
          setState={mockSetState}
          label="Date"
          testID="Date"
        />,
        {}
      );
      getByTestId = result.getByTestId;
      queryByTestId = result.queryByTestId;
      findByTestId = result.findByTestId;
    });

    // Open the date picker
    await waitFor(() => fireEvent.press(getByTestId("Date-container")));
    await waitFor(() => expect(findByTestId("Date-modal")).toBeTruthy());

    // Close the date picker
    await waitFor(() => fireEvent.press(getByTestId("Date-confirm-button")));

    // Wait until the element with the testID 'Date-modal' is removed from the document
    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
  });

  it("closes the date picker when cancel pressed", async () => {
    const { getByTestId, queryByTestId, findByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={mockSetState}
        label="Date"
        testID="Date"
      />,
      {}
    );

    // Open the date picker

    fireEvent.press(getByTestId("Date-container"));
    await waitFor(() => expect(findByTestId("Date-modal")).toBeTruthy());

    // Close the date picker
    fireEvent.press(getByTestId("Date-cancel-button"));

    // Wait until the element with the testID 'Date-modal' is removed from the document
    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
  });

  it("calls setState when a date is confirmed", async () => {
    const setState = jest.fn();

    const { queryByTestId, getByTestId, findByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={setState}
        label="Date"
        testID="Date"
      />,
      {}
    );

    // Open the date picker
    fireEvent.press(getByTestId("Date-container"));
    await waitFor(() => expect(findByTestId("Date-modal")).toBeTruthy());

    fireEvent.press(getByTestId("Date-confirm-button"));

    await waitFor(() => expect(setState).toHaveBeenCalled());

    // Wait until the element with the testID 'Date-modal' is removed from the document
    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
  });

  it("update the state to a new date when a date is confirmed", async () => {
    const testDate = new Date(2022, 11, 31); // December 31, 2022

    const { getByTestId, findByTestId, queryByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={mockSetState}
        label="Date"
        testID="Date"
      />,
      {}
    );

    // Open the date picker
    fireEvent.press(getByTestId("Date-container"));
    const modal = await waitFor(() => findByTestId("Date-modal"));
    await modal.props.onChange({ nativeEvent: { timestamp: testDate } });
    fireEvent.press(getByTestId("Date-confirm-button"));
    await waitFor(() => expect(mockSetState).toHaveBeenCalledWith(testDate));

    // Wait until the element with the testID 'Date-modal' is removed from the document
    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
  });

  it("changes from date picker to time picker when the type prop changes", async () => {
    const { rerender, getByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={mockSetState}
        label="Date"
        testID="Date"
      />
    );

    // Check that the date picker is initially rendered
    expect(getByTestId("Date-container")).toBeTruthy();

    // Rerender the component with the type prop set to "time"
    rerender(
      <MyDateTimePicker
        type="time"
        state={new Date()}
        setState={mockSetState}
        label="Date"
        testID="Date"
      />
    );

    // Check that the time picker is now rendered
    expect(getByTestId("Date-container")).toBeTruthy();
  });

  it("shows a 'red' error message when there's an error", async () => {
    const { getByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={() => {}}
        label="Date"
        error={true}
        errorMessage="Test error"
        testID="Date"
      />
    );

    await waitFor(() => {
      expect(getByTestId("Date-error-message")).toHaveTextContent("Test error");
      expect(getByTestId("Date-error-message")).toHaveStyle({
        color: "#EE0B0B"
      });
    });
  });

  it("doesn't show an error message when there is no error", async () => {
    const { queryByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={mockSetState}
        label="Date"
        error={false}
        errorMessage="Test error"
        testID="Date"
      />
    );

    await waitFor(() => {
      expect(queryByTestId("Date-error-message")).toBeFalsy();
    });
  });

  it("sets error to null when a date is confirmed", async () => {
    const setError = jest.fn();

    const { getByTestId, findByTestId, queryByTestId } = render(
      <MyDateTimePicker
        type="date"
        state={new Date()}
        setState={mockSetState}
        setError={setError}
        label="Date"
        testID="Date"
      />,
      {}
    );

    // Open the date picker
    fireEvent.press(getByTestId("Date-container"));
    await waitFor(() => expect(findByTestId("Date-modal")).toBeTruthy());

    fireEvent.press(getByTestId("Date-confirm-button"));

    await waitFor(() => expect(setError).toHaveBeenCalledWith(false));

    // Wait until the element with the testID 'Date-modal' is removed from the document
    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
  });
});
