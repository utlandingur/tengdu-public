import { weeklyAvailability } from "./availability";
import { Timestamp } from "firebase-admin/firestore";

export type Gender = "Male" | "Female" | "Other";

export const genderItems = [
  { name: "Male" as Gender },
  { name: "Female" as Gender },
  { name: "Other" as Gender },
];

export type MatchingPreference = "Anyone" | "Same as my gender";

export const matchingPreferences = [
  { name: "Anyone" as MatchingPreference },
  { name: "Same as my gender" as MatchingPreference },
];

export interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export interface PublicUserInfo {
  uid?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  gender?: Gender;
  location?: any;
  availability?: weeklyAvailability;
  interests?: string[];
}

export interface PrivateUserInfo {
  user?: User;
  matching?: MatchingInfo;
  setupComplete?: boolean;
  email?: string;
  matches?: string[];
  dateOfBirth?: Timestamp;
  expoPushToken?: string;
  firebaseToken?: string;
}

export type UserInfo = PublicUserInfo & PrivateUserInfo;

// setting preferences for matching
interface MatchingInfo {
  gender?: MatchingPreference;
  ageFrom?: number;
  ageTo?: number;
}

export interface MatchInfo {
  id: string; // id of the match
  newMatch: boolean; // if the match is new
  matchedUsers: string[]; // who is in the match
  // TODO : is this the correct type?
  locations?: any[]; // where they live
  sharedInterests?: string[]; // what interests do they share
  sharedAvailability?: weeklyAvailability; // when are they both available
  chatId?: string; // id of the chat channel
  date: Timestamp;
}
