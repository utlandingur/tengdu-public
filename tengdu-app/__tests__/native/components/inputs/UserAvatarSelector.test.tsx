import { useEffect } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import MyImagePicker from "components/inputs/MyImagePicker";
import UserAvatarSelector from "components/profile/UserAvatarSelector";
import { useSession } from "providers/AuthProvider";
import { useProfile } from "providers/ProfileProvider";
import { uploadUserAvatar } from "storage/userAvatar";

jest.mock("providers/AuthProvider");
jest.mock("providers/ProfileProvider");
jest.mock("storage/userAvatar");
jest.mock("components/inputs/MyImagePicker");

(useSession as jest.Mock).mockReturnValue({
  user: { uid: "test-uid" }
});

let mockProfile = {
  photoURL: "test-photo-url"
};

const mockUpdateProfile = jest.fn();

(useProfile as jest.Mock).mockImplementation(() => ({
  profile: mockProfile,
  updateProfile: mockUpdateProfile
}));

jest.mock("storage/userAvatar");

(MyImagePicker as jest.Mock).mockImplementation(({ onChange }) => {
  useEffect(() => {
    onChange("mocked-uri");
  }, [onChange]);

  // Return a dummy component with a testID prop
  return <View testID="my-image-picker" />;
});

describe("UserAvatarSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the MyImagePicker component with the correct props", async () => {
    (MyImagePicker as jest.Mock).mockImplementation(() => {
      // Return a dummy component with a testID prop
      return <View testID="my-image-picker" />;
    });

    const { getByTestId } = render(<UserAvatarSelector />);
    const imagePicker = getByTestId("my-image-picker");
    await waitFor(() => expect(imagePicker).toBeTruthy());
  });

  it("should call uploadUserAvatar with the correct arguments", async () => {
    (MyImagePicker as jest.Mock).mockImplementation(({ onChange }) => {
      // Call the onChange function with a mocked uri
      useEffect(() => {
        onChange("mocked-uri");
      }, [onChange]);
    });
    render(<UserAvatarSelector />);
    await waitFor(() => {
      expect(uploadUserAvatar).toHaveBeenCalledWith("mocked-uri", "test-uid");
    });
  });

  it("should call updateProfile with the correct arguments", async () => {
    (uploadUserAvatar as jest.Mock).mockResolvedValue("new-photo-url");
    render(<UserAvatarSelector />);
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        photoURL: "new-photo-url"
      });
    });
  });

  it("should handle errors from uploadUserAvatar", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (uploadUserAvatar as jest.Mock).mockRejectedValueOnce(
      new Error("Test error")
    );
    render(<UserAvatarSelector />);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error uploading user avatar: ",
        new Error("Test error")
      );
    });
    consoleSpy.mockRestore();
  });

  it("should pass the correct withButton prop to MyImagePicker", () => {
    const { rerender } = render(<UserAvatarSelector />);
    expect(MyImagePicker).toHaveBeenCalledWith(
      expect.objectContaining({ withButton: undefined }),
      {}
    );

    rerender(<UserAvatarSelector withButton />);
    expect(MyImagePicker).toHaveBeenCalledWith(
      expect.objectContaining({ withButton: true }),
      {}
    );
  });
});
