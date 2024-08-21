import { waitFor } from "@testing-library/react-native";
import { getMatches } from "db/matches";
import { Matches, MatchInfo } from "models/user";

import { db } from "../../../firebaseConfig";

jest.mock("../../../firebaseConfig");

const mockGet = jest.fn();
const mockCollection = jest.fn().mockReturnThis();
const mockDoc = jest.fn().mockReturnThis();

(db.collection as jest.Mock).mockImplementation(() => {
  return {
    collection: mockCollection,
    doc: mockDoc,
    get: mockGet
  };
});

const matchIds = ["id1", "id2"];
const mockMatches: Matches = [
  { id: "id1" } as MatchInfo,
  { id: "id2" } as MatchInfo
];

const consoleErrorSpy = jest
  .spyOn(console, "error")
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  .mockImplementation(() => {});

describe("getMatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("fetches matches from Firestore", async () => {
    // Mock Firestore get function
    mockGet
      .mockImplementationOnce(() => {
        return {
          exists: true,
          data: () => mockMatches[0]
        };
      })
      .mockImplementationOnce(() => {
        return {
          exists: true,
          data: () => mockMatches[1]
        };
      });

    const matches = await getMatches(matchIds);

    expect(matches).toEqual(mockMatches);
    expect(db.collection).toHaveBeenCalledWith("matches");
    matchIds.forEach((id) => {
      expect(mockDoc).toHaveBeenCalledWith(id);
      expect(mockGet).toHaveBeenCalled();
    });
  });
  it("returns an empty array when called with an empty array", async () => {
    const matches = await getMatches([]);
    expect(matches).toEqual([]);
    expect(db.collection).not.toHaveBeenCalled();
  });
  it("filters out non-existing matches", async () => {
    const matchIds = ["id1", "id2"];
    const mockMatches: Matches = [{ id: "id1" } as MatchInfo];

    mockGet
      .mockImplementationOnce(() => {
        return { exists: true, data: () => mockMatches[0] };
      })
      .mockImplementationOnce(() => {
        return { exists: false };
      });

    const matches = await getMatches(matchIds);

    expect(matches).toEqual([mockMatches[0]]);
    expect(db.collection).toHaveBeenCalledWith("matches");
    expect(mockDoc).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
  it("does not throw an error when Firestore throws an error", async () => {
    const matchIds = ["id1"];
    mockGet.mockImplementationOnce(() => {
      throw new Error("Firestore error");
    });

    getMatches(matchIds);
    await waitFor(() => {
      expect(db.collection).toHaveBeenCalledWith("matches");
      expect(mockDoc).toHaveBeenCalledWith("id1");
      expect(mockGet).toHaveBeenCalled();
    });
  });
});
