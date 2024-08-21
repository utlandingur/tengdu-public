import { fireEvent, waitFor } from "@testing-library/react-native";

import MyFormNavButtons from "../../../components/MyFormNavButtons";
import { render } from "../../../render";

describe("MyFormNavButtons", () => {
  const onBack = jest.fn();
  const onNext = jest.fn();

  it('calls onBack when the "Back" button is pressed', async () => {
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
      />,
      {}
    );

    fireEvent.press(getByTestId("back-button"));
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });

  it('calls onNext when the "Next" button is pressed', async () => {
    const onNext = jest.fn();
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
      />,
      {}
    );

    fireEvent.press(getByTestId("next-button"));
    await waitFor(() => expect(onNext).toHaveBeenCalled());
  });

  it('displays "Finish" when shouldFinish is true', async () => {
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
        shouldFinish
      />,
      {}
    );

    await waitFor(() =>
      expect(getByTestId("next-button")).toHaveTextContent("Finish")
    );
  });

  it('displays "Next" when shouldFinish is undefined', async () => {
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
      />,
      {}
    );

    await waitFor(() =>
      expect(getByTestId("next-button")).toHaveTextContent("Next")
    );
  });
  it('displays "Next" when shouldFinish is false', async () => {
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
        shouldFinish={false}
      />,
      {}
    );

    await waitFor(() =>
      expect(getByTestId("next-button")).toHaveTextContent("Next")
    );
  });

  it('disables the "Back" button when disableBack is true', async () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
        disableBack
      />,
      {}
    );

    fireEvent.press(getByTestId("back-button"));
    await waitFor(() => expect(onBack).not.toHaveBeenCalled());
  });
  it('does not disable the "Back" button when disableBack is false', async () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <MyFormNavButtons
        onBack={onBack}
        onNext={onNext}
        disableBack={false}
      />,
      {}
    );

    fireEvent.press(getByText("Back"));
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });
});
