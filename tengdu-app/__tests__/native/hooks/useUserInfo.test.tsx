/* eslint-disable @typescript-eslint/no-empty-function */
import { renderHook, waitFor } from "@testing-library/react-native";
import { useUserInfo } from "hooks/useUserInfo";
import { useSession } from "providers/AuthProvider";
import { db } from "../../../firebaseConfig";

jest.mock("providers/AuthProvider");
jest.mock("../../../firebaseConfig");

const mockUser = { uid: "testUid", email: "testEmail" };
const mockUserInfo = { uid: "testUid", email: "testEmail", name: "Test User" };

const userInfoHook = () => useUserInfo();

describe("useUserInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user info when user exists", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: mockUser });
    const docMock = {
      exists: true,
      data: () => mockUserInfo,
    };
    const onSnapshotMock = jest.fn((callback) => {
      callback(docMock);
      return jest.fn();
    });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ onSnapshot: onSnapshotMock }),
    });

    const { result } = renderHook(() => useUserInfo());

    expect(result.current.userInfo).toEqual(mockUserInfo);
  });

  it("should create and return new user when user doesn't exist", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: mockUser });
    const docMock = {
      exists: false,
      data: () => undefined,
    };
    const onSnapshotMock = jest.fn((callback) => {
      callback(docMock);
      return jest.fn();
    });
    const setMock = jest.fn().mockImplementation((userData) => {
      // Simulate the behavior of the real-time listener noticing the change
      docMock.exists = true;
      docMock.data = () => userData;
      onSnapshotMock.mock.calls[0][0](docMock);
      return Promise.resolve();
    });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ onSnapshot: onSnapshotMock, set: setMock }),
    });

    const { result } = renderHook(() => useUserInfo());

    const expectedRequest = { email: mockUser.email, setupComplete: false };

    expect(setMock).toHaveBeenCalledWith(expectedRequest, { merge: true });
    
    await waitFor(() => expect(result.current.userInfo).toEqual(expectedRequest));
    
  });

  it("should update user info when updateUserInfo is called", async () => {
    (useSession as jest.Mock).mockReturnValue({ user: mockUser });
    const docMock = {
      exists: true,
      data: () => mockUserInfo,
    };
    const onSnapshotMock = jest.fn((callback) => {
      callback(docMock);
      return jest.fn();
    });
    const setMock = jest.fn().mockImplementation((userData) => {
      // Simulate the behavior of the real-time listener noticing the change
      docMock.data = () => userData;
      onSnapshotMock.mock.calls[0][0](docMock);
      return Promise.resolve();
    });
    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ onSnapshot: onSnapshotMock, set: setMock }),
    });

    const { result } = renderHook(() => useUserInfo());

    const updatedUserInfo = { name: "Updated User", ...mockUserInfo };
    await waitFor(() => {
      result.current.updateUserInfo(updatedUserInfo);
    });

    expect(setMock).toHaveBeenCalledWith(updatedUserInfo, { merge: true });
    expect(result.current.userInfo).toEqual(updatedUserInfo);
  })

  
it("should update Firestore document with updatedUserInfo when updateUserInfo is called", async () => {
  (useSession as jest.Mock).mockReturnValue({ user: mockUser });
  const docMock = {
    exists: true,
    data: () => mockUserInfo,
  };
  const onSnapshotMock = jest.fn((callback) => {
    callback(docMock);
    return jest.fn();
  });
  const setMock = jest.fn().mockImplementation((userData) => {
    // Simulate the behavior of the real-time listener noticing the change
    docMock.data = () => userData;
    onSnapshotMock.mock.calls[0][0](docMock);
    return Promise.resolve();
  });
  (db.collection as jest.Mock).mockReturnValue({
    doc: jest.fn().mockReturnValue({ onSnapshot: onSnapshotMock, set: setMock }),
  });

  const { result } = renderHook(() => useUserInfo());

  const updatedUserInfo = { name: "Updated User", ...mockUserInfo };
  await waitFor(() => {
    result.current.updateUserInfo(updatedUserInfo);
  });

  expect(setMock).toHaveBeenCalledWith(updatedUserInfo, { merge: true });
  expect(result.current.userInfo).toEqual(updatedUserInfo);
});

it("should return userInfo === null when user is null", async () => {
  (useSession as jest.Mock).mockReturnValue({ user: null });
  const { result } = renderHook(() => useUserInfo());
  expect(result.current.userInfo).toBeNull();
})

it("should do nothing when updateUserInfo is called without uid or userInfo", async () => {
  (useSession as jest.Mock).mockReturnValue({ user: null });
  const { result } = renderHook(() => useUserInfo());
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  await waitFor(async () => {
    result.current.updateUserInfo(mockUserInfo);
  });
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

it("should log an error when updateUserInfo catches an error", async () => {
  (useSession as jest.Mock).mockReturnValue({ user: mockUser });
  const docMock = {
    exists: true,
    data: () => mockUserInfo,
  };
  const onSnapshotMock = jest.fn((callback) => {
    callback(docMock);
    return jest.fn();
  });
  const setMock = jest.fn().mockRejectedValue(new Error("Test error"));
  (db.collection as jest.Mock).mockReturnValue({
    doc: jest.fn().mockReturnValue({ onSnapshot: onSnapshotMock, set: setMock }),
  });
  const { result } = renderHook(() => useUserInfo());
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  await waitFor( async () => {
    result.current.updateUserInfo(mockUserInfo);
  });
  expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating user data: ", new Error("Test error"));  consoleErrorSpy.mockRestore();
});

it("should do nothing when updateUserInfo is called with undefined", async () => {
  (useSession as jest.Mock).mockReturnValue({ user: mockUser });
  const { result } = renderHook(() => useUserInfo());
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  await waitFor(async () => {
    result.current.updateUserInfo(undefined);
  });
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

});
