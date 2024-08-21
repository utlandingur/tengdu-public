import { useFocusEffect } from '@react-navigation/native';
import "@testing-library/jest-native/extend-expect";
import { fireEvent, waitFor } from "@testing-library/react-native";
import AvailabilityPage from "../../../pages/ProfileAvailabilityPage";
import { render } from "../../../render";
import { MockNavigationContainer } from '__mocks__/mockNavigationContainer';
import { useProfile } from 'providers/ProfileProvider';
import { emptyAvailability } from 'models/availability';

// Mock the useFocusEffect hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));


jest.mock("../../../providers/ProfileProvider")

const TestAvailabilityPage = () => {
  return <MockNavigationContainer>
    <AvailabilityPage />
  </MockNavigationContainer>;
}

const mockUpdateProfile = jest.fn();

describe("AvailabilityPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })
  it("should render", async () => {
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
      },
      updateProfile: mockUpdateProfile  // Use mockUpdateProfile here
    }));
    await waitFor(() => render(<TestAvailabilityPage />, {}));
  });

  it('calls updateProfile with new availability on unblur', async () => {
    const mockUpdateProfile = jest.fn();
    
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
      },
      updateProfile: mockUpdateProfile  // Use mockUpdateProfile here
    }));
  
    const { getByTestId } = render(<TestAvailabilityPage />);
  
    // Simulate changing availability
    fireEvent.press(getByTestId("availability-item-monday-morning"));

    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();
  
    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        availability: {
          monday: { morning: true, afternoon: false, evening: false },
          tuesday: { morning: false, afternoon: false, evening: false },
          wednesday: { morning: false, afternoon: false, evening: false },
          thursday: { morning: false, afternoon: false, evening: false },
          friday: { morning: false, afternoon: false, evening: false },
          saturday: { morning: false, afternoon: false, evening: false },
          sunday: { morning: false, afternoon: false, evening: false }
        }
      });
    });
  });

  it('does not call updateProfile when availability is not changed', async () => {
    const mockUpdateProfile = jest.fn();
    
    (useProfile as jest.Mock).mockImplementation(() => ({
      profile: {
        name: "Test User",
        email: "test@example.com",
        availability: emptyAvailability
      },
      updateProfile: mockUpdateProfile  // Use mockUpdateProfile here
    }));
  
    render(<TestAvailabilityPage />);
  
    // Simulate unblur by calling the cleanup function returned by the callback
    const callback = (useFocusEffect as jest.Mock).mock.calls[0][0];
    const cleanup = callback();
  
    cleanup();
    await waitFor(() => {
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });
  });
});
