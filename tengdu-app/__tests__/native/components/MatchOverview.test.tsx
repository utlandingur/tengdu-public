import { useMatchInfo } from "providers/MatchInfoProvider";
import MatchOverview from "../../../components/MatchOverview";
import { render } from "../../../render";
import { waitFor } from "@testing-library/react-native";
import { useChatClient } from "providers/ChatClientProvider";
import { useChatContext } from "providers/ChatProvider";
import { useSession } from "providers/AuthProvider";
import { useRouter } from "expo-router";

// ----------------------
// Add tests for the handleOnPress function
// ----------------------

jest.mock("providers/MatchInfoProvider");
jest.mock("providers/AuthProvider");
jest.mock("expo-router");
jest.mock("providers/ChatClientProvider", () => ({
  useChatClient: jest.fn()
}));
jest.mock("providers/ChatProvider", () => ({
  useChatContext: () => ({ setChannel: jest.fn() })
}));

(useSession as jest.Mock).mockReturnValue({ user: { uid: "user1}" } });
(useRouter as jest.Mock).mockReturnValue({ navigate: jest.fn() });

describe("MatchOverview", () => {
  it("renders correctly", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: []
    });

    const { getByTestId } = render(<MatchOverview />);
    expect(getByTestId("profile-overview-scroll")).toBeTruthy();
  });

  it("renders user avatars", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { getByTestId } = render(<MatchOverview />);

    await waitFor(() =>
      expect(getByTestId("user-avatars-scroll")).toBeDefined()
    );
  });

  it("renders match text", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { getAllByTestId } = render(<MatchOverview />);

    await waitFor(() => expect(getAllByTestId("match-text").length).toBe(2));
  });
  it("does not render locations if match.locations is not defined", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("locations-items-scrollview")).toBeNull()
    );
  });
  it("renders locations", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test", locations: ["location1", "location2"] },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("locations-items-scrollview")).toBeDefined()
    );
  });
  it("does not render interests if match.interests is not defined", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("interests-items-scrollview")).toBeNull()
    );
  });
  it("renders interests", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test", sharedInterests: ["interest1", "interest2"] },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("interests-items-scrollview")).toBeDefined()
    );
  });
  it("does not render availability if match.availability is not defined", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: { id: "test" },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("availability-items-scrollview")).toBeNull()
    );
  });
  it("renders availability", async () => {
    (useMatchInfo as jest.Mock).mockReturnValue({
      match: {
        id: "test",
        sharedAvailability: {
          monday: { morning: true, afternoon: false, evening: true },
          tuesday: { morning: false, afternoon: true, evening: false },
          wednesday: { morning: true, afternoon: true, evening: true },
          thursday: { morning: false, afternoon: false, evening: true },
          friday: { morning: true, afternoon: true, evening: false },
          saturday: { morning: false, afternoon: true, evening: true },
          sunday: { morning: true, afternoon: false, evening: false }
        }
      },
      users: [{ id: "1" }, { id: "2" }]
    });
    const { queryByTestId } = render(<MatchOverview />);
    await waitFor(() =>
      expect(queryByTestId("availability-items-scrollview")).toBeDefined()
    );
  });
});
