import { db } from "../firebaseConfig";
import { Interests } from "../models/interests";

export async function getInterests() {
  const interestsRef = db.collection("interests").doc("activities");
  const interests = await interestsRef.get();
  if (interests) {
    return interests?._data?.activities as Interests;
  } else {
    return null;
  }
}
