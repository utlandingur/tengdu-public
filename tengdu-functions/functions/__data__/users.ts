import { emptyAvailability } from "src/models/availability";
import { UserInfo } from "src/models/users";
import {
  createUserDocument,
  deleteUserDocument,
} from "src/utils/firestore/users";
import { v4 as uuidv4 } from "uuid";

export const generateUserTestData = () => {
  const user1Availability = emptyAvailability;
  user1Availability.friday.evening = true;
  user1Availability.saturday.evening = true;
  user1Availability.monday.afternoon = true;
  user1Availability.sunday.morning = true;

  const user1: UserInfo = {
    uid: uuidv4(),
    firstName: "user1",
    lastName: "Hersisson",
    availability: user1Availability,
    interests: ["Basketball", "Soccer", "Badminton"],
    location: "Reykjavik",
  };

  const user2Availability = emptyAvailability;
  user2Availability.friday.evening = true;
  user2Availability.saturday.afternoon = true;
  user2Availability.monday.afternoon = true;
  user2Availability.thursday.morning = true;

  const user2: UserInfo = {
    uid: uuidv4(),
    firstName: "user2",
    lastName: "Hening",
    availability: user2Availability,
    interests: ["D&D", "Hiking", "Badminton"],
    location: "Hafnarfjörður",
  };

  return [user1, user2];
};

export const initializeUsers = async (users: UserInfo[]) => {
  for (const user of users) {
    await createUserDocument(user);
  }
};

export const clearUsers = async (users: UserInfo[]) => {
  for (const user of users) {
    await deleteUserDocument(user.uid);
  }
};
