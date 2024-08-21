import { getFirestore } from "firebase-admin/firestore";
import { generateUserTestData } from "../__data__/users";
import { UserInfo } from "../src/models/users";

describe("Reporing API", () => {
  const users: UserInfo[] = generateUserTestData();

  test("should report user", async () => {
    const request = {
      auth: { uid: users[0] },
      data: { reportedUsers: [users[1].uid], reason: "test" },
    };
    const wrapped = global.fTest.wrap(global.myFunctions.reportUsers);
    await wrapped(request);
    const report = await getFirestore().collection("reports").doc("1").get();
  });
});
