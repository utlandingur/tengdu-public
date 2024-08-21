// TODO - Add gender select to the tests
import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within
} from "@testing-library/react-native";
import ProfilePage from "pages/ProfilePage";

import { render } from "../../../render";

// Define mockRouter outside the scope of jest.mock
const mockRouter = {
  navigate: jest.fn(),
  isReady: jest.fn().mockReturnValue(true)
};

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => mockRouter
}));

jest
  .spyOn(console, "error")
  .mockImplementation(() => console.log("check the error"));

jest.mock("react-native-modal-datetime-picker", () => {
  const RealComponent = jest.requireActual(
    "react-native-modal-datetime-picker"
  ).default;

  const MockDateTimePicker = ({ ...props }) => {
    return <RealComponent {...props} />;
  };

  return {
    __esModule: true,
    default: MockDateTimePicker
  };
});

jest.mock("providers/AuthProvider", () => ({
  useSession: jest.fn(() => ({
    user: {
      uid: "1",
      displayName: "Test User",
      photoURL: "https://example.com/photo.jpg",
      email: "test@example.com"
    }
  }))
}));

const mockUpdateProfile = jest.fn();
jest.mock("providers/ProfileProvider", () => {
  return {
    ...jest.requireActual("providers/ProfileProvider"),
    useProfile: () => ({
      profile: {
        name: "Test User",
        email: "test@example.com"
      },
      updateProfile: mockUpdateProfile,
    })
  };
});

describe("ProfilePage", () => {
  it("renders correctly", async () => {
    render(<ProfilePage />);
  });

  it("updates the first name", async () => {
    let getByTestId;
    await waitFor(() => {
      const result = render(<ProfilePage />, {});
      getByTestId = result.getByTestId;
    });
    const firstNameInput = getByTestId("First Name-input");
    fireEvent.changeText(firstNameInput, "Test");
    await waitFor(() => expect(firstNameInput.props.value).toBe("Test"));
  });

  it("updates the last name", async () => {
    const { getByTestId, debug } = render(<ProfilePage />, {});

    const lastNameInput = getByTestId("Last Name-input");
    fireEvent.changeText(lastNameInput, "Test");
    await waitFor(() => expect(lastNameInput.props.value).toBe("Test"));
  });

  it("updates the date", async () => {
    const testDate = new Date(2022, 11, 31); // December 31, 2022

    const { getByTestId, queryByTestId } = render(<ProfilePage />);

    // Open the date picker
    fireEvent.press(getByTestId("Date-container"));
    const modal = await waitFor(() => getByTestId("Date-modal"));
    const input = getByTestId("Date-input");
    await modal.props.onChange({ nativeEvent: { timestamp: testDate } });
    await waitFor(() => fireEvent.press(getByTestId("Date-confirm-button")));

    await waitForElementToBeRemoved(() => queryByTestId("Date-modal"));
    await waitFor(() =>
      expect(input.props.placeholder).toBe(testDate.toLocaleDateString())
    );
  });

  it("updates the gender", async () => {
    const { getByTestId, getAllByTestId } = render(<ProfilePage />);

    const select = await waitFor(() => getByTestId("Gender-select-trigger"));
    fireEvent.press(select);
    const options = await waitFor(() => getAllByTestId("Gender-select-item"));
    expect(options.length).toBe(3);
    expect(select.props.accessibilityState.expanded).toBe(true);

    fireEvent.press(options[1]);
    expect(select.props.accessibilityState.expanded).toBe(false);
    await waitFor(() => {
      expect(within(select).getByText("Female")).toBeTruthy();
      expect(within(select).queryByText("Female")).toBeTruthy();
    });
  });

  it("updates the profile on valid submit", async () => {
    const profileProviderMock = jest.requireMock(
      "../../../providers/ProfileProvider"
    );
    const mockRouter = jest.requireMock("expo-router");
    const { updateProfile } = profileProviderMock.useProfile();
    const { navigate } = mockRouter.useRouter();

    const testDate = new Date(2005, 11, 31); // December 31, 2005
    let getByTestId, getByText, getAllByTestId;
    await waitFor(() => {
      const result = render(<ProfilePage />, {});
      getByTestId = result.getByTestId;
      getByText = result.getByText;
      getAllByTestId = result.getAllByTestId;
    });
    // Fill in the form with valid inputs
    // Names
    const firstNameInput = getByTestId("First Name-input");
    await waitFor(() => fireEvent.changeText(firstNameInput, "Test"));
    const lastNameInput = getByTestId("Last Name-input");
    await waitFor(() => fireEvent.changeText(lastNameInput, "Test"));
    // Date
    await waitFor(() => fireEvent.press(getByTestId("Date-container")));
    const modal = await waitFor(() => getByTestId("Date-modal"));
    await modal.props.onChange({ nativeEvent: { timestamp: testDate } });
    await waitFor(() => fireEvent.press(getByTestId("Date-confirm-button")));
    // Gender
    const select = getByTestId("Gender-select-trigger");
    await fireEvent.press(select);
    const options = await waitFor(() => getAllByTestId("Gender-select-item"));
    fireEvent.press(options[1]);
    await waitFor(() =>
      expect(within(select).getByText("Female")).toBeTruthy()
    );
    // Submit the form
    fireEvent.press(getByText("Next"));
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });

    expect(navigate).toHaveBeenCalled();
  });
  describe("validate()", () => {
    it("validates the form correctly", async () => {
      const testDate = new Date(2005, 11, 31); // December 31, 2022

      const { getByTestId, getByText, queryByTestId, getAllByTestId } = render(
        <ProfilePage />,
        {}
      );

      // Simulate empty form
      await waitFor(() => fireEvent.press(getByText("Next")));
      const firstNameError = getByTestId("First Name-error-message");
      const lastNameError = getByTestId("Last Name-error-message");
      const genderError = getByTestId("Gender-error-message");
      const dateError = getByTestId("Date-error-message");
      expect(firstNameError).toBeDefined();
      expect(lastNameError).toBeDefined();
      expect(genderError).toBeDefined();
      expect(dateError).toBeDefined();
      // Simulate filling the form
      // Names
      const firstNameInput = getByTestId("First Name-input");
      const lastNameInput = getByTestId("Last Name-input");
      await waitFor(() => fireEvent.changeText(firstNameInput, "First"));
      await waitFor(() => fireEvent.changeText(lastNameInput, "Last"));
      // Date
      await waitFor(() => fireEvent.press(getByTestId("Date-container")));
      const modal = await waitFor(() => getByTestId("Date-modal"));
      await modal.props.onChange({ nativeEvent: { timestamp: testDate } });
      await waitFor(() => fireEvent.press(getByTestId("Date-confirm-button")));
      // Gender
      const select = getByTestId("Gender-select-trigger");
      await fireEvent.press(select);
      const options = await waitFor(() => getAllByTestId("Gender-select-item"));
      fireEvent.press(options[1]);
      fireEvent.press(getByText("Next"));
      await waitFor(() =>
        expect(within(select).getByText("Female")).toBeTruthy()
      );
      // Check error messages are gone
      expect(queryByTestId("First Name-error-message")).toBeNull();
      expect(queryByTestId("Last Name-error-message")).toBeNull();
      expect(queryByTestId("Date-error-message")).toBeNull();
      expect(queryByTestId("Gender-error-message")).toBeNull();
    });
  });
});
