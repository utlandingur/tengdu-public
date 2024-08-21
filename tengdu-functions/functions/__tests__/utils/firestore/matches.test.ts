import {
  clearUsers,
  generateUserTestData,
  initializeUsers,
} from "../../../__data__/users";
import { MatchInfo, UserInfo } from "../../../src/models/users";
import {
  createMatchDocument,
  deleteMatch,
  deleteMatchDocument,
  getMatch,
  removeUserFromMatch,
} from "../../../src/utils/firestore/matches";
import {
  getUsers,
  updateUserMatches,
} from "../../../src/utils/firestore/users";
import { makeMatch } from "../../../src/utils/matching";

describe("firestore matches", () => {
  const users = generateUserTestData();
  let matchId = "";

  beforeEach(async () => {
    await initializeUsers(users);
    const newMatch = makeMatch(users);
    matchId = newMatch.id;

    await createMatchDocument(newMatch);

    await updateUserMatches(newMatch);
  });

  afterEach(async () => {
    await clearUsers(users);
    await deleteMatchDocument(matchId);
  });

  test("should delete match", async () => {
    await deleteMatch(matchId);
    const match = await getMatch(matchId);
    expect(match).toEqual(undefined);
    const usersWithNoMatch = await getUsers(users.map((user) => user.uid));
    for (const user of usersWithNoMatch) {
      expect(user.matches).toHaveLength(0);
    }
  });

  test("remove user from match", async () => {
    await removeUserFromMatch(matchId, users[0].uid);

    const match: MatchInfo = await getMatch(matchId);
    expect(match.matchedUsers).toEqual([users[1].uid]);

    const usersInFirebase: UserInfo[] = await getUsers(users.map((u) => u.uid));

    for (const u of usersInFirebase) {
      if (u.uid == users[0].uid) {
        expect(u.matches).toHaveLength(0);
      } else {
        expect(u.matches).toEqual([matchId]);
      }
    }
  });
});
