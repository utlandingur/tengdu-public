import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import functions from "@react-native-firebase/functions";
import storage from "@react-native-firebase/storage";

// Your web app's Firebase configuration
// // PROD
const firebaseConfig = {
  apiKey: "----",
  authDomain: "----",
  projectId: "----",
  storageBucket: "----",
  messagingSenderId: "----",
  appId: "----",
  measurementId: "----"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig, { logging: true });
}

export const db = firestore();
export const firebaseStorage = storage();
export const firebaseAuth = auth();
export const firebaseFunctions = functions();
export const signInWithCredential = (credential) => {
  return firebaseAuth.signInWithCredential(credential);
};
export const createUserWithEmailAndPassword = (email, password) => {
  return firebaseAuth.createUserWithEmailAndPassword(email, password);
};
export const signInWithEmailAndPassword = (email, password) => {
  return firebaseAuth.signInWithEmailAndPassword(email, password);
};
export const signOut = () => {
  return firebaseAuth.signOut();
};
export const sendPasswordResetEmail = (email) => {
  return firebaseAuth.sendPasswordResetEmail(email);
};
export const onAuthStateChanged = (callback) => {
  return firebaseAuth.onAuthStateChanged(callback);
};
export const GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
