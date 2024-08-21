import { db } from "../firebaseConfig";
import { Interests } from "../models/interests";

export async function getActivities() {
  const activitiesRef = doc(db, "interests", "activities");
  const activities = await getDoc(activitiesRef);
  if (activities.exists()) {
    return activities.data().activities as Interests;
  } else {
    return null;
  }
}
