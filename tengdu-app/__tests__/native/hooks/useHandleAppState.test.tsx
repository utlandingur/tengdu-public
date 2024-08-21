import { AppState, AppStateStatus } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useHandleAppState } from "hooks/useHandleAppState";

jest.mock("react-native", () => ({
  AppState: {
    currentState: "active",
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() })
  }
}));

const handleChangeToActiveState = jest.fn();
const handleChangeToNonActiveState = jest.fn();

describe("useHandleAppState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle app state changes", () => {
    renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    const eventHandler = (AppState.addEventListener as jest.Mock).mock
      .calls[0][1];

    // Simulate app going to the background
    act(() => {
      AppState.currentState = "background";
      eventHandler("background");
    });

    expect(handleChangeToNonActiveState).toHaveBeenCalled();

    // Simulate app coming to the foreground
    act(() => {
      AppState.currentState = "active";
      eventHandler("active");
    });

    expect(handleChangeToActiveState).toHaveBeenCalled();
  });

  it("should not call callbacks when app state does not change", () => {
    renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    const eventHandler = (AppState.addEventListener as jest.Mock).mock
      .calls[0][1];

    // Simulate app state not changing
    act(() => {
      eventHandler("active");
    });

    expect(handleChangeToActiveState).not.toHaveBeenCalled();
    expect(handleChangeToNonActiveState).not.toHaveBeenCalled();
  });

  it("should call callbacks correct number of times when app state changes multiple times", async () => {
    renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    const eventHandler = (AppState.addEventListener as jest.Mock).mock
      .calls[0][1];

    // Simulate app going to the background and coming to the foreground multiple times
    act(() => {
      AppState.currentState = "background";
      eventHandler("background");
      AppState.currentState = "active";
      eventHandler("active");
      AppState.currentState = "background";
      eventHandler("background");
      AppState.currentState = "active";
      eventHandler("active");
      AppState.currentState = "inactive";
      eventHandler("inactive");
      AppState.currentState = "active";
      eventHandler("active");
      AppState.currentState = "inactive";
      eventHandler("inactive");
      AppState.currentState = "active";
      eventHandler("active");
    });

    await waitFor(() => {
      expect(handleChangeToActiveState).toHaveBeenCalledTimes(4);
      expect(handleChangeToNonActiveState).toHaveBeenCalledTimes(4);
    });
  });

  it("should not call callbacks when app state changes to an unrecognized state", () => {
    renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    const eventHandler = (AppState.addEventListener as jest.Mock).mock
      .calls[0][1];

    // Simulate app state changing to an unrecognized state
    act(() => {
      AppState.currentState = "unrecognized" as AppStateStatus;
      eventHandler("unrecognized");
    });

    expect(handleChangeToActiveState).not.toHaveBeenCalled();
    expect(handleChangeToNonActiveState).not.toHaveBeenCalled();
  });

  it("should remove event listener on unmount", () => {
    const { unmount } = renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    unmount();

    const removeListener = (AppState.addEventListener as jest.Mock).mock
      .results[0].value.remove;

    expect(removeListener).toHaveBeenCalled();
  });

  it("should not call callbacks on initial render", async () => {
    renderHook(() =>
      useHandleAppState({
        handleChangeToActiveState,
        handleChangeToNonActiveState
      })
    );

    await waitFor(() => {
      expect(handleChangeToActiveState).not.toHaveBeenCalled();
      expect(handleChangeToNonActiveState).not.toHaveBeenCalled();
    });
  });
});
