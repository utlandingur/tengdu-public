import { Timestamp } from "firebase/firestore";

import { weeklyAvailability } from "./availability";

export type Gender = "Male" | "Female" | "Other";

export const genderItems = [
  { name: "Male" as Gender },
  { name: "Female" as Gender },
  { name: "Other" as Gender }
];

export type MatchingPreference = "Anyone" | "Same as my gender";

export const matchingPreferences = [
  { name: "Anyone" as MatchingPreference },
  { name: "Same as my gender" as MatchingPreference }
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
  localPhotoURL?: string;
  dateOfBirth?: Timestamp;
  expoPushToken?: string;
  firebaseToken?: string;
  newMatches?: string[];
}

export type UserInfo = PublicUserInfo & PrivateUserInfo;

// setting preferences for matching
interface MatchingInfo {
  gender?: MatchingPreference;
  ageFrom?: number;
  ageTo?: number;
}

// TODO - review when implementing backend
// Information that can be shared with other users

export type MatchedUsers = PublicUserInfo[];

// Information about a match

export interface MatchInfo {
  id: string; // id of the match
  matchedUsers: string[]; // who is in the match
  // TODO : is this the correct type?
  locations?: any[]; // where they live
  sharedInterests?: string[]; // what interests do they share
  sharedAvailability?: weeklyAvailability; // when are they both available
  chatId?: string; // same as channel.id - attached when chat is created
  date: Timestamp;
}

export type Matches = MatchInfo[];
