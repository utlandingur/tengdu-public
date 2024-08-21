// useInputField.test.ts;

import { renderHook, waitFor } from "@testing-library/react-native";
import { useInputField } from "hooks/useInputField";

describe("useInputField", () => {
  it("should initialize with provided value", () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test", errorMessage: "Error message" })
    );

    expect(result.current.val).toBe("Test");
    expect(result.current.err).toBe(false);
    expect(result.current.errorMessage).toBe("Error message");
  });

  it("should update value when setVal is called", async () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test", errorMessage: "Error message" })
    );

    await waitFor(() => {
      result.current.setVal("New value");
    });

    expect(result.current.val).toBe("New value");
  });

  it("should update error state when setErr is called", async () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test", errorMessage: "Error message" })
    );

    await waitFor(() => {
      result.current.setErr(true);
    });

    expect(result.current.err).toBe(true);
  });

  it("should initialize with error state as false", () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test", errorMessage: "Error message" })
    );

    expect(result.current.err).toBe(false);
  });

  it("should initialize with provided error message", () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test", errorMessage: "Error message" })
    );

    expect(result.current.errorMessage).toBe("Error message");
  });

  it("should initialize with errorMessage as undefined when not provided", () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "Test" })
    );

    expect(result.current.errorMessage).toBeUndefined();
  });

  it("should initialize with empty value when provided", () => {
    const { result } = renderHook(() =>
      useInputField({ initialValue: "", errorMessage: "Error message" })
    );

    expect(result.current.val).toBe("");
  });
});
