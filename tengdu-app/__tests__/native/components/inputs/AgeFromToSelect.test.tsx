import { fireEvent, waitFor, within } from "@testing-library/react-native";

import AgeFromToSelect from "../../../../components/inputs/AgeFromToSelect";
import { useProfile } from "../../../../providers/ProfileProvider";
import { render } from "../../../../render";
import { useFocusEffect } from "@react-navigation/native";
import { MockNavigationContainer } from "__mocks__/mockNavigationContainer";

// Mock the useFocusEffect hook
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: jest.fn()
}));

jest.mock("providers/ProfileProvider");

const TestAgeFromToSelect = () => {
  return (
    <MockNavigationContainer>
      <AgeFromToSelect />
    </MockNavigationContainer>
  );
};

describe("AgeFromToSelect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders without crashing", () => {
    (useProfile as jest.Mock).mockImplementationOnce(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 65,
          ageTo: 76
        }
      }
    }));
    render(<TestAgeFromToSelect />, {});
  });

  it("displays the correct from and to values", async () => {
    (useProfile as jest.Mock).mockImplementationOnce(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 65,
          ageTo: 76
        }
      }
    }));
    const { getByTestId } = await waitFor(() =>
      render(<TestAgeFromToSelect />, {})
    );

    const fromSelect = getByTestId("from-select-trigger");
    const toSelect = getByTestId("to-select-trigger");

    expect(within(fromSelect).getByText("65")).toBeTruthy();
    expect(within(toSelect).getByText("76")).toBeTruthy();
  });

  it("correctly updates toRange when FROM value is changed", async () => {
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 20,
          ageTo: 80
        }
      }
    }));

    const { getByTestId, getAllByTestId } = render(<AgeFromToSelect />, {});

    const fromSelect = await waitFor(() => getByTestId("from-select-trigger"));

    fireEvent.press(fromSelect);

    const fromSelectItem = await getAllByTestId("from-select-item")[1];
    fireEvent.press(fromSelectItem);

    await waitFor(() => {
      expect(getAllByTestId("from-select-item")[0]).toHaveTextContent("18");
      expect(getAllByTestId("to-select-item")[0]).toHaveTextContent("20");
    });
    expect(getAllByTestId("from-select-item").length).toBe(62);
    expect(getAllByTestId("to-select-item").length).toBe(80);
  });

  it("correctly updates fomRange when TO value is changed", async () => {
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 20,
          ageTo: 80
        }
      }
    }));

    const { getByTestId, getAllByTestId } = await waitFor(() =>
      render(<AgeFromToSelect />, {})
    );
    const toSelect = getByTestId("to-select-trigger");

    fireEvent.press(toSelect);

    await waitFor(() => fireEvent.press(getAllByTestId("to-select-item")[1]));

    await waitFor(() => {
      expect(getAllByTestId("from-select-item")[0]).toHaveTextContent("18");
      expect(getAllByTestId("to-select-item")[0]).toHaveTextContent("21");
    });
    expect(getAllByTestId("from-select-item").length).toBe(4);
    expect(getAllByTestId("to-select-item").length).toBe(79);
  });

  it("does not update profile when age range is not changed", async () => {
    const mockUpdateProfile = jest.fn();
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 20,
          ageTo: 80
        }
      },
      updateProfile: mockUpdateProfile
    }));

    render(<TestAgeFromToSelect />);

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });

  it("updates profile when age range is changed", async () => {
    const mockUpdateProfile = jest.fn();
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "",
        matching: {
          ageFrom: 20,
          ageTo: 80
        }
      },
      updateProfile: mockUpdateProfile
    }));

    const { getByTestId, getAllByTestId } = render(<TestAgeFromToSelect />);

    const toSelect = getByTestId("to-select-trigger");

    fireEvent.press(toSelect);

    await waitFor(() => fireEvent.press(getAllByTestId("to-select-item")[1]));

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        matching: { ageFrom: 20, ageTo: 22 }
      });
    });
  });
});
