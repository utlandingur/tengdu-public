import { fireEvent, waitFor } from "@testing-library/react-native";
import LocationPage from "pages/LocationPage";

import { render } from "../../../render";
import { MockNavigationContainer } from "__mocks__/mockNavigationContainer";
import { useProfile } from "providers/ProfileProvider";
import { useFocusEffect } from '@react-navigation/native';

// Mock the useFocusEffect hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));

jest.mock("providers/ProfileProvider")

jest.mock("react-native-google-places-autocomplete", () => {
  const RealComponent = jest.requireActual(
    "react-native-google-places-autocomplete"
  ).GooglePlacesAutocomplete;

  return {
    GooglePlacesAutocomplete: (props) => {
      return (
        <RealComponent
          {...props}
          query={{ undefined }}
          requestUrl={{ undefined }}
          // currentLocation={true}
          // currentLocationLabel="Current location"
        />
      );
    }
  };
});


const TestLocationPage = () => {
  return <MockNavigationContainer>
    <LocationPage />
  </MockNavigationContainer>;
}

describe("LocationPage", () => {
  it("updates profile when a location is selected and blurs", async () => {
    const mockUpdateProfile = jest.fn();

    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com"
      },
      updateProfile: mockUpdateProfile
    }));  
      
    const result = render(<TestLocationPage />);

    const inputField = result.getByPlaceholderText("Search");
    await waitFor(() => fireEvent(inputField, "onPress", { description: "New Location" }));

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({location: { description: "New Location" }});
    });
  });
  it ("does not update profile when location is not changed", async () => {

    const mockUpdateProfile = jest.fn();

    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com"
      },
      updateProfile: mockUpdateProfile  
    }));  

    render(<TestLocationPage />);

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();

    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });
});
