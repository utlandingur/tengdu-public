import "@testing-library/jest-native/extend-expect";

import { fireEvent, waitFor } from "@testing-library/react-native";
import { getInterests } from "db/interests";
import InterestsPage from "pages/InterestsPage";
import { useProfile } from "providers/ProfileProvider";

import { render } from "../../../render";

import { useFocusEffect } from '@react-navigation/native';
import { MockNavigationContainer } from "__mocks__/mockNavigationContainer";

// Mock the useFocusEffect hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));

jest.mock("providers/ProfileProvider");
(useProfile as jest.Mock).mockImplementation(() => ({
  profile: {
    name: "Test User",
    email: "test@example.com"
  },
  updateProfile: jest.fn(),
}));

jest.mock("db/interests", () => ({
  getInterests: jest.fn().mockImplementation(() => {
    const data = [
      { name: "Test Interest" },
      { name: "Test Interest 2" },
      { name: "Test Interest 3" },
      { name: "Test Interest 4" },
      { name: "Test Interest 5" },
      { name: "Test Interest 6" },
      { name: "Test Interest 7" },
      { name: "Test Interest 8" },
      { name: "Test Interest 9" },
      {
        alts: ["Alt 1", "Alt 2"],
        isl: "Icelandic Name",
        name: "Test Interest 10"
      }
    ];
    return Promise.resolve(data);
  })
}));

const TestInterestsPage = () => (
  <MockNavigationContainer>
    <InterestsPage />
  </MockNavigationContainer>
);

describe("InterestsPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    await waitFor(() => render(<TestInterestsPage />, {}));
  });

  it("calls getInterests on mount", async () => {
    // Set up the mock function to resolve with an empty array
    (getInterests as jest.Mock).mockResolvedValueOnce([]);

    render(<TestInterestsPage />, {});


    // // Wait for any asynchronous effects to run
    await waitFor(() => {
      expect(getInterests).toHaveBeenCalled();
    });
  });

  it("correctly sets interests and selected interests on mount", async () => {
    let getByText, getAllByTestId;
    await waitFor(() => {
      const result = render(<TestInterestsPage />, {});
      getByText = result.getByText;
      getAllByTestId = result.getAllByTestId;
    });

    await waitFor(() => {
      expect(getAllByTestId("chip").length).toBe(10);
      expect(getByText("Test Interest")).toBeTruthy();
      expect(getByText("Test Interest 10")).toBeTruthy();
    });
  });

  it("shows selected interests in the select interest section", async () => {
    (useProfile as jest.Mock).mockImplementationOnce(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        interests: [
          "Test Selected Interest",
          "Test Selected Interest 2",
          "Test Selected Interest 3"
        ]
      }
    }));

    let getByText, getAllByTestId;
    await waitFor(() => {
      const result = render(<TestInterestsPage />, {});
      getByText = result.getByText;
      getAllByTestId = result.getAllByTestId;
    });

    await waitFor(() => {
      expect(getAllByTestId("selected-chip").length).toBe(3);
      expect(getByText("Test Selected Interest")).toBeTruthy();
      expect(getByText("Test Selected Interest 3")).toBeTruthy();
    });
  });

  it("removes items from the selected interest list once pressed", async () => {
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        interests: [
          "Test Selected Interest",
          "Test Selected Interest 2",
          "Test Selected Interest 3"
        ]
      },
      updateProfile: jest.fn()
    }));

    let getByText, getAllByTestId, queryByText;
    await waitFor(() => {
      const result = render(<TestInterestsPage />, {});
      getByText = result.getByText;
      getAllByTestId = result.getAllByTestId;
      queryByText = result.queryByText;
    });

    let chip;
    await waitFor(() => {
      chip = getByText("Test Selected Interest");
    });

    fireEvent.press(chip);
    await waitFor(() => {
      expect(getAllByTestId("selected-chip").length).toBe(2);
      expect(queryByText("Test Selected Interest")).toBeNull();
    });
  });

  it("adds selected interests once selected from the interest list", async () => {
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com"
      },
      updateProfile: jest.fn()
    }));
    let getByText, getAllByTestId, getAllByText;
    await waitFor(() => {
      const result = render(<TestInterestsPage />, {});
      getByText = result.getByText;
      getAllByTestId = result.getAllByTestId;
      getAllByText = result.getAllByText;
    });

    let chip;
    await waitFor(() => {
      chip = getByText("Test Interest 10");
    });

    fireEvent.press(chip);

    await waitFor(() => {
      expect(getAllByTestId("selected-chip").length).toBe(1);
      expect(getAllByText("Test Interest 10").length).toBe(2);
      expect(getAllByTestId("chip").length).toBe(10);
    });
  });

  it("does not allow you to add an 11th interest", async () => {
    const interests = [
      "Test Selected Interest",
      "Test Selected Interest 2",
      "Test Selected Interest 3",
      "Test Selected Interest 4",
      "Test Selected Interest 5",
      "Test Selected Interest 6",
      "Test Selected Interest 7",
      "Test Selected Interest 8",
      "Test Selected Interest 9",
      "Test Selected Interest 10"
    ];

    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        interests: interests
      },
      updateProfile: jest.fn()
    }));

 
      const {getByText, getAllByText, getByTestId} = render(<TestInterestsPage />, {});


    await waitFor(() => {
      fireEvent.press(getByText("Test Interest 10"));
    });
    await waitFor(() => {
      expect(getAllByText("Test Interest 10").length).toBe(1);
      expect(getByTestId("selected-interest-count")).toHaveTextContent("10/10");
    });
  });

  it('should not updateProfile on unblur if interests are the same', async () => {
    const mockUpdateProfile = jest.fn();

    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        interests: []
      },
      updateProfile: mockUpdateProfile  // Use mockUpdateProfile here
    }));  

    render(<InterestsPage />);

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });
  it('calls updateProfile with new interests on unblur', async () => {
    const mockUpdateProfile = jest.fn();

    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com"
      },
      updateProfile: mockUpdateProfile  // Use mockUpdateProfile here
    }));  

    const { getByText } = render(<TestInterestsPage />);

    // Simulate selecting a new interest
    fireEvent.press(getByText("Test Interest"));

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({interests: ["Test Interest"]});
    });
  });
});
