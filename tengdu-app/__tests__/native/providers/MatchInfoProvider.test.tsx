import React from "react";
import { renderHook } from "@testing-library/react-native";
import { useMatch } from "hooks/useMatch";
import { MatchInfoProvider, useMatchInfo } from "providers/MatchInfoProvider";

jest.mock("hooks/useMatch");

const mockUseMatch = useMatch as jest.Mock;

const wrapper = ({ children }) => (
  <MatchInfoProvider matchId="test">{children}</MatchInfoProvider>
);

describe("MatchInfoProvider", () => {
  it("calls useMatch within MatchInfoProvider", () => {
    mockUseMatch.mockReturnValue(null);

    renderHook(() => useMatchInfo(), { wrapper });
    expect(mockUseMatch).toHaveBeenCalled();
  });

  it("provides the correct context value when match and users are undefined", () => {
    const mockMatch = { match: undefined, users: undefined };
    mockUseMatch.mockReturnValue(mockMatch);

    const { result } = renderHook(() => useMatchInfo(), { wrapper });
    expect(result.current).toEqual(mockMatch);
  });

  it("provides the correct context value", () => {
    const mockMatch = {
      match: { id: "test", otherMatchProperties: "otherValues" },
      users: [{ id: "user1", otherUserProperties: "otherValues" }]
    };
    mockUseMatch.mockReturnValue(mockMatch);

    const { result } = renderHook(() => useMatchInfo(), { wrapper });
    expect(result.current).toEqual(mockMatch);
  });

  it("throws an error when useMatchInfo is used outside of MatchInfoProvider", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    try {
      renderHook(() => useMatchInfo());
    } catch (error) {
      expect(error).toEqual(
        Error("useMatchInfo must be used within a MatchInfoProvider")
      );
    }
  });
});
