import {
  clearUsers,
  initializeUsers,
  generateUserTestData,
} from "../../../__data__/users";
import { emptyAvailability } from "../../../src/models/availability";
import { MatchInfo, PublicUserInfo, UserInfo } from "../../../src/models/users";
import {
  extractPublicUserInformation,
  getUsers,
  removeMatchFromUser,
  removeMatchFromUsers,
  removeUserFromMatchedUsers,
  updateUserMatches,
} from "../../../src/utils/firestore/users";
import { makeMatch } from "../../../src/utils/matching";

describe("extractPublicUserInformation", () => {
  test("should extract only public user info", () => {
    const userInfo: UserInfo = {
      uid: "1",
      firstName: "Sesar",
      lastName: "Hersisson",
      photoURL: "www.photo.net",
      gender: "Male",
      location: "Reykjavik",
      availability: emptyAvailability,
      interests: ["Basketball", "Soccer"],
      matches: [],
      user: {
        uid: "1",
        displayName: "sessib",
        photoURL: "www.photo.net",
        email: "sesar@tengdu.net",
      },
      matching: {},
      setupComplete: true,
      email: "sesar@tengdu.net",
    };
    const publicUserInfo: PublicUserInfo = {
      uid: "1",
      firstName: "Sesar",
      lastName: "Hersisson",
      photoURL: "www.photo.net",
      gender: "Male",
      location: "Reykjavik",
      availability: emptyAvailability,
      interests: ["Basketball", "Soccer"],
    };
    expect(extractPublicUserInformation(userInfo)).toEqual(publicUserInfo);
  });
});

describe("removeUserFromMatchedUsers", () => {
  const users = generateUserTestData();

  test("should remove user from matched users", () => {
    const match: MatchInfo = makeMatch(users);

    const matchWithoutFirstUser: MatchInfo = {
      ...match,
    };
    matchWithoutFirstUser.matchedUsers = [users[1].uid];

    expect(removeUserFromMatchedUsers(match, users[0].uid)).toEqual(
      matchWithoutFirstUser,
    );

    const matchWithoutSecondUser: MatchInfo = {
      ...match,
    };
    matchWithoutSecondUser.matchedUsers = [users[0].uid];

    expect(removeUserFromMatchedUsers(match, users[1].uid)).toEqual(
      matchWithoutSecondUser,
    );
  });
});

describe("updateUserMatches", () => {
  const users = generateUserTestData();

  beforeEach(async () => {
    await initializeUsers(users);
  });

  afterEach(async () => {
    await clearUsers(users);
  });

  test("should update users matches", async () => {
    const match: MatchInfo = makeMatch(users);
    await updateUserMatches(match);

    const usersInFirebase = await getUsers(users.map((user) => user.uid));

    for (const user of usersInFirebase) {
      expect(user.matches).toContainEqual(match.id);
    }
  });
});

describe("removeMatchFromUser", () => {
  const users = generateUserTestData();
  beforeEach(async () => {
    await initializeUsers(users);
  });
  afterEach(async () => {
    await clearUsers(users);
  });
  test("should remove match from user", async () => {
    const match: MatchInfo = makeMatch(users);

    await removeMatchFromUser(users[0].uid, match.id);

    const user: UserInfo = (await getUsers([users[0].uid])).pop();
    expect(user.matches).toHaveLength(0);
  });
});

describe("removeMatchFromUsers", () => {
  const users = generateUserTestData();

  beforeEach(async () => {
    await initializeUsers(users);
  });

  afterEach(async () => {
    await clearUsers(users);
  });

  test("should remove match from users", async () => {
    const match1: MatchInfo = makeMatch(users);
    const match2: MatchInfo = makeMatch(users);

    await updateUserMatches(match1);
    await updateUserMatches(match2);

    await removeMatchFromUsers(match1);

    const usersWithMatch2 = await getUsers(users.map((user) => user.uid));

    for (const user of usersWithMatch2) {
      expect(user.matches).toContainEqual(match2.id);
    }

    await removeMatchFromUsers(match2);

    const usersWithNoMatch = await getUsers(users.map((user) => user.uid));

    for (const user of usersWithNoMatch) {
      expect(user.matches).toHaveLength(0);
    }
  });
});
