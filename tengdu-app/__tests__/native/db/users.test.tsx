import { getUser, getUsers } from "db/users";
import { UserInfo } from "models/user";
import { getPublicUsers } from "firebaseFunctions";

import { db } from "../../../firebaseConfig";

jest.mock("../../../firebaseConfig");

const mockGet = jest.fn();
const mockCollection = jest.fn().mockImplementation(() => {});
const mockDoc = jest.fn().mockReturnThis();
const mockSet = jest.fn();

(db.collection as jest.Mock).mockImplementation(() => {
  return {
    collection: mockCollection,
    doc: mockDoc,
    get: mockGet,
    set: mockSet
  };
});

jest.mock("firebaseFunctions");

(getPublicUsers as jest.Mock).mockImplementation(() => {
  return [];
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, "error").mockImplementation(() => {});

describe("getUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("returns the correct user data when the user exists", async () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      exists: true,
      data: () => mockUser
    };
    mockGet.mockResolvedValueOnce(mockUser);
    const user = await getUser("1");

    expect(user).toEqual(mockUser);
  });

  it("throws an error when the user does not exist", async () => {
    const mockUser = { exists: false };
    mockGet.mockResolvedValueOnce(mockUser);

    await expect(getUser("2")).rejects.toThrow("Profile doesn't exist");
  });

  it("throws an error when the user does not exist", async () => {
    await expect(getUser("")).rejects.toThrow("User ID is required");
  });
});

describe("getUsers", () => {
  const mockUser1: UserInfo = {
    uid: "1",
    firstName: "Test1",
    lastName: "User1",
    photoURL: "http://example.com/photo1.jpg"
  };
  const mockUser2: UserInfo = {
    uid: "2",
    firstName: "Test2",
    lastName: "User2",
    photoURL: "http://example.com/photo2.jpg"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
  });

  it("calls getPublicUsers with the correct user IDs", async () => {
    await getUsers(["1", "2"]);

    expect(getPublicUsers).toHaveBeenCalledWith(["1", "2"]);
  });
});
