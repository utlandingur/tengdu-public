import { doc, setDoc } from "firebase/firestore";
import uuid from "uuid";

import { db } from "../firebaseConfig";

export async function uploadFeedback(feedback: string, uid: string) {
  await setDoc(
    doc(db, "feedback", uuid.v4()),
    { feedback: feedback, uid: uid },
    { merge: true }
  );
}
