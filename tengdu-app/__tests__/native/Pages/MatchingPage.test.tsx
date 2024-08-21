import { waitFor } from "@testing-library/react-native";

import MatchingPage from "../../../pages/MatchingPage";
import { SessionProvider } from "../../../providers/AuthProvider";
import { ProfileProvider } from "../../../providers/ProfileProvider";
import { render } from "../../../render";

jest.mock("../../../providers/ProfileProvider");
jest.mock("expo-router");

const TestComponent = () => {
  return (
    <SessionProvider>
      <ProfileProvider>
        <MatchingPage />
      </ProfileProvider>
    </SessionProvider>
  );
};

describe("MatchingPage", () => {
  it("renders without crashing", async () => {
    await waitFor(() => render(<TestComponent />, {}));
  });
});
