import {
  dailyAvailability,
  dailyPeriodsArray,
  fullAvailability,
  weeklyAvailability,
  weeklyAvailabilityArray,
} from "../models/availability";
import { MatchInfo, UserInfo } from "../models/users";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";

export const calculateSharedAvailability = (users: UserInfo[]) => {
  const availabilities: weeklyAvailability[] = [];

  // gather all availabilities into an array
  users.forEach((user: any) => {
    if (user?.availability) {
      availabilities.push(user.availability);
    }
  });

  // if a user has no availability then sharedAvailability returns default/empty availability
  if (availabilities.length < users.length) return undefined;

  const sharedAvailability = { ...fullAvailability };

  // for each availability [day][period] set true if 1 user has that availability
  availabilities.forEach((avail: weeklyAvailability) => {
    weeklyAvailabilityArray.forEach((day: keyof weeklyAvailability) => {
      dailyPeriodsArray.forEach((period: keyof dailyAvailability) => {
        sharedAvailability[day][period] =
          sharedAvailability[day][period] && avail[day][period];
      });
    });
  });

  return sharedAvailability;
};

export const makeMatch = (users: UserInfo[]): MatchInfo => {
  const firstUser = users[0];

  const sharedInterests = firstUser?.interests.filter((interest: string) =>
    users.every((user) => user?.interests.includes(interest)),
  );

  const sharedAvailability = calculateSharedAvailability(users);

  const locations: string[] = [firstUser?.location];
  users.forEach((user) => {
    if (!locations.includes(user?.location)) {
      locations.push(user?.location);
    }
  });

  const matchId = uuidv4();

  const match: MatchInfo = {
    id: matchId,
    sharedInterests,
    sharedAvailability,
    matchedUsers: users.map((user) => user.uid),
    newMatch: true,
    locations,
    date: Timestamp.fromDate(new Date()),
  };

  return match;
};
