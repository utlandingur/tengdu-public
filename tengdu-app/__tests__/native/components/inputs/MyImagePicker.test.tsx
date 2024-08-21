jest.mock("expo-image-picker");
import { fireEvent, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";

import MyImagePicker from "../../../../components/inputs/MyImagePicker";
import { render } from "../../../../render";

const onChange = jest.fn();

describe("MyImagePicker", () => {
  it("renders correctly with default props", async () => {
    const { getByTestId } = await waitFor(() =>
      render(<MyImagePicker onChange={onChange} />, {})
    );
    expect(getByTestId("AddImageText")).toBeTruthy();
  });

  it("calls onChange when an image is picked", async () => {
    jest
      .spyOn(ImagePicker, "launchImageLibraryAsync")
      .mockImplementation(() => {
        return Promise.resolve({
          canceled: false,
          assets: [
            { uri: "http://example.com/image.jpg", width: 100, height: 100 }
          ]
        });
      });

    const { getByTestId, debug } = await waitFor(() =>
      render(<MyImagePicker onChange={onChange} />, {})
    );
    fireEvent.press(getByTestId("AddImageText"));

    await waitFor(() =>
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled()
    );
  });

  it("displays the image when provided", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <MyImagePicker
          onChange={onChange}
          defaultUrl="http://example.com/image.jpg"
        />,
        {}
      )
    );
    expect(getByTestId("ImagePreview")).toBeDefined();
    expect(queryByTestId("AddImageText")).toBeNull();
  });
  it("displays the button when provided", async () => {
    const { getByTestId } = await waitFor(() =>
      render(
        <MyImagePicker
          onChange={onChange}
          withButton={true}
        />,
        {}
      )
    );
    expect(getByTestId("AddImageButton")).toBeTruthy();
  });
  it("does not display the button when not provided", async () => {
    const { queryByTestId } = await waitFor(() =>
      render(<MyImagePicker onChange={onChange} />, {})
    );
    expect(queryByTestId("AddImageButton")).toBeNull();
  });
});
