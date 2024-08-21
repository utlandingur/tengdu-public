import { waitFor } from "@testing-library/react-native";
import UserAvatar from "components/UserAvatar";

// import { firebaseStorage as realFirebaseStorage } from "../../../firebaseConfig";
import { render } from "../../../render";
import * as realUserAvatar from "../../../storage/userAvatar";

// Make typescript happy with mocking
// userAvatar
type userAvatarMock = typeof realUserAvatar & {
  loadAvatar: jest.Mock;
};
const userAvatar = realUserAvatar as userAvatarMock;

jest.mock("../../../storage/userAvatar", () => ({
  loadAvatar: jest.fn()
}));

describe("UserAvatar", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it("should render", async () => {
    await waitFor(() => render(<UserAvatar uid="" />, {}));
  });
  it("should show an image when a profile picture is available", async () => {
    // setup mock
    userAvatar.loadAvatar.mockResolvedValue("https://example.com/avatar.jpg");
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <UserAvatar
          uid="123"
          testId="test"
        />,
        {}
      )
    );
    expect(getByTestId("test-image")).toBeDefined();
    await waitFor(() =>
      expect(queryByTestId("test-image-placeholder")).toBeNull()
    );
  });
  it("should show a placeholder image when no profile picture is available", async () => {
    userAvatar.loadAvatar.mockReturnValue(null);

    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <UserAvatar
          uid=""
          testId="test"
        />,
        {}
      )
    );
    expect(getByTestId("test-image-placeholder")).toBeDefined();
    expect(queryByTestId("image")).toBeNull();
  });
  it("should show an image when a photoURL is available and have placeholder", async () => {
    const { getByTestId, queryByTestId } = await waitFor(() =>
      render(
        <UserAvatar
          photoURL="https://example.com/avatar123.jpg"
          testId="test"
        />,
        {}
      )
    );
    expect(getByTestId("test-image")).toBeDefined();
    expect(queryByTestId("test-image-placeholder")).toBeNull();
  });
  it("should show not search for image with uid when a photoURL is provided ", async () => {
    userAvatar.loadAvatar.mockReturnValue(null);

    const { getByTestId } = await waitFor(() =>
      render(
        <UserAvatar
          photoURL="https://example.com/avatar123.jpg"
          testId="test"
        />,
        {}
      )
    );
    expect(getByTestId("test-image")).toBeDefined();
    expect(userAvatar.loadAvatar).not.toHaveBeenCalled();
  });
});
