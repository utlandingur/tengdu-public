import { renderHook, waitFor } from "@testing-library/react-native";
import { useUpdatedRef } from "hooks/useUpdatedRef";

describe("useUpdatedRef", () => {
  it("returns a ref object with the current value", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useUpdatedRef(value),
      {
        initialProps: { value: "initial" }
      }
    );

    expect(result.current.current).toBe("initial");

    await waitFor(() => {
      rerender({ value: "updated" });
    });

    expect(result.current.current).toBe("updated");
  });

  it("does not change the ref when the value stays the same", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useUpdatedRef(value),
      {
        initialProps: { value: "initial" }
      }
    );

    const initialRef = result.current;

    await waitFor(() => {
      rerender({ value: "initial" });
    });

    expect(result.current).toBe(initialRef);
  });
});
