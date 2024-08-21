import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const getDB = () => {
  if (getApps().length == 0) {
    initializeApp();
  }
  return getFirestore();
};
