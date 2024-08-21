import ProfileOverview from "pages/ProfileOverview";

import { render } from "../../../render";

jest.mock("providers/ProfileProvider", () => {
  return {
    useProfile: () => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        photoURL: "https://example.com/photo.jpg"
      }
    })
  };
});

jest.mock("providers/AuthProvider", () => {
  return {
    useSession: () => ({
      signOut: jest.fn()
    })
  };
});

describe("ProfileOverviewPage", () => {
  test("renders ProfileOverview", async () => {
    render(<ProfileOverview />, {});
  });
});
