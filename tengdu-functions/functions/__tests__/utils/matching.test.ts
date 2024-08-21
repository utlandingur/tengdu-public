import { Timestamp } from "firebase-admin/firestore";
import { generateUserTestData } from "__data__/users";
import { fullAvailability } from "src/models/availability";
import { MatchInfo } from "src/models/users";
import { calculateSharedAvailability, makeMatch } from "src/utils/matching";
import { describe, expect, test } from "@jest/globals";

describe("calculateSharedAvailability", () => {
  const user1 = {
    availability: fullAvailability,
  };
  const user2 = {
    availability: fullAvailability,
  };
  const user3 = {
    availability: fullAvailability,
  };

  beforeEach(() => {
    user1.availability = fullAvailability;
    user2.availability = fullAvailability;
    user3.availability = fullAvailability;
  });
  test("should calculate full", () => {
    expect(calculateSharedAvailability([user1, user2, user3])).toEqual(
      fullAvailability,
    );
  });

  test("should calculate partial", () => {
    user1.availability.friday.afternoon = false;
    user2.availability.monday.evening = false;
    user3.availability.wednesday.morning = false;

    const expectedAvailability = fullAvailability;
    expectedAvailability.friday.afternoon = false;
    expectedAvailability.monday.evening = false;
    expectedAvailability.wednesday.morning = false;

    expect(calculateSharedAvailability([user1, user2, user3])).toEqual(
      expectedAvailability,
    );
  });

  test("should handle missing availability", () => {
    expect(calculateSharedAvailability([{}, user1, user2, user3])).toEqual(
      undefined,
    );
  });
});

describe("make match", () => {
  const users = generateUserTestData();

  const expectedMatch: MatchInfo = {
    id: "", // Don't know the id yet
    matchedUsers: users.map((user) => user.uid),
    sharedAvailability: calculateSharedAvailability(users),
    sharedInterests: ["Badminton"],
    locations: ["Reykjavik", "Hafnarfjörður"],
    newMatch: true,
    date: Timestamp.fromDate(new Date()), // This will get updated
  };

  test("should make match", () => {
    const match = makeMatch(users);
    expectedMatch.id = match.id;
    expectedMatch.date = match.date;
    expect(match).toEqual(expectedMatch);
  });

  test("should strip matching from users", () => {
    const oldMatch = makeMatch(users);
    const user1WithMatch = { matches: [oldMatch.id], ...users[0] };
    const user2WithMatch = { matches: [oldMatch.id], ...users[1] };
    const match = makeMatch([user1WithMatch, user2WithMatch]);
    expectedMatch.id = match.id;
    expectedMatch.date = match.date;
    expect(match).toEqual(expectedMatch);
  });
});
