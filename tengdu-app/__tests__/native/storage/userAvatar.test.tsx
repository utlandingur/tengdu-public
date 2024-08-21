import "@testing-library/jest-native/extend-expect";

import { firebaseStorage as realFirebaseStorage } from "../../../firebaseConfig";
import { loadAvatar } from "../../../storage/userAvatar";

type FirebaseStorageMock = typeof realFirebaseStorage & {
  ref: jest.Mock;
  getDownloadURL: jest.Mock;
};

const firebaseStorage = realFirebaseStorage as FirebaseStorageMock;

jest.mock("../../../firebaseConfig", () => ({
  firebaseStorage: {
    ref: jest.fn().mockReturnThis(),
    getDownloadURL: jest.fn()
  }
}));

describe("loadAvatar()", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should load an avatar when given a uid", async () => {
    // setup mock
    const urlToReturn = "https://example.com/avatar.jpg";

    firebaseStorage.getDownloadURL.mockResolvedValue(
      "https://example.com/avatar.jpg"
    );

    const uid = "123";

    const downloadURL = await loadAvatar(uid);

    expect(downloadURL).toBe(urlToReturn);

    expect(firebaseStorage.ref).toHaveBeenCalledWith(`avatars/${uid}`);
  });
  it("should return null if the avatar does not exist", async () => {
    // setup mock
    firebaseStorage.getDownloadURL.mockRejectedValue(new Error("not found"));

    const uid = "123";

    const downloadURL = await loadAvatar(uid);

    expect(downloadURL).toBeNull();

    expect(firebaseStorage.ref).toHaveBeenCalledWith(`avatars/${uid}`);
  });
  it("should return null if the uid supplied is null", async () => {
    // setup mock
    firebaseStorage.getDownloadURL.mockRejectedValue(new Error("not found"));

    const uid = "123";

    const downloadURL = await loadAvatar(uid);

    expect(downloadURL).toBeNull();

    expect(firebaseStorage.ref).not.toHaveBeenCalledWith();
  });
});
