import { getFirestore } from "firebase-admin/firestore";

export const addReportToUser = async (
  reportedBy: string,
  reportedUsers: string[],
  reason: string,
) => {
  await getFirestore().collection("reports").doc("1").set({
    reportedUsers,
    reportedBy,
    reason,
  });
};
