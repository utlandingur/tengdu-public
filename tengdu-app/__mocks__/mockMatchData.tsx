import { Timestamp } from "firebase/firestore";
import { MatchedUsers, MatchInfo } from "models/user";
import { v4 as uuidv4 } from "uuid";

export const mockAvailability = {
  monday: {
    morning: false,
    afternoon: true,
    evening: false
  },
  tuesday: {
    morning: false,
    afternoon: true,
    evening: false
  },
  wednesday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  thursday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  friday: {
    morning: false,
    afternoon: false,
    evening: true
  },
  saturday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  sunday: {
    morning: false,
    afternoon: false,
    evening: true
  }
};

// an array of all possible mocked users
export const mockMatchedUsers: MatchedUsers = [
  {
    uid: "123",
    firstName: "Janet",
    photoURL:
      "https://avatars.githubusercontent.com/u/7550686?s=80&u=d3108489847f11eb24dfde0b1c6825919c6a5eca&v=4"
  },
  {
    uid: "456",
    firstName: "JimmyLongBottoms",
    photoURL:
      "https://plus.unsplash.com/premium_photo-1679943424873-4192f24004f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BvdGlmeXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    uid: "789",
    firstName: "Jill",
    photoURL:
      "https://avatars.githubusercontent.com/u/7550686?s=80&u=d3108489847f11eb24dfde0b1c6825919c6a5eca&v=4"
  },
  {
    uid: "101",
    firstName: "Jack",
    photoURL:
      "https://plus.unsplash.com/premium_photo-1679943424873-4192f24004f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BvdGlmeXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    uid: "112",
    firstName: "Jill",
    photoURL:
      "https://avatars.githubusercontent.com/u/7550686?s=80&u=d3108489847f11eb24dfde0b1c6825919c6a5eca&v=4"
  },
  {
    uid: "131",
    firstName: "Jack",
    photoURL:
      "https://plus.unsplash.com/premium_photo-1679943424873-4192f24004f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BvdGlmeXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    uid: "142",
    firstName: "Jill",
    photoURL:
      "https://avatars.githubusercontent.com/u/7550686?s=80&u=d3108489847f11eb24dfde0b1c6825919c6a5eca&v=4"
  },
  {
    uid: "153",
    firstName: "Jack",
    photoURL:
      "https://plus.unsplash.com/premium_photo-1679943424873-4192f24004f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BvdGlmeXxlbnwwfHwwfHx8MA%3D%3D"
  }
];

// a function to return matched users based on the number required
export const getMockMatchedUsers = (value: number): MatchedUsers => {
  if (value > 0 && value < 9) {
    return mockMatchedUsers.slice(0, value);
  }
  return [];
};

// a function to return matches based on the number required
export const getMockMatches = (value: number): MatchInfo[] => {
  if (value > 0 && value < 8) {
    const mockMatches: MatchInfo[] = [];
    for (let i = 0; i < value; i++) {
      const match: MatchInfo = {
        matchedUsers: getMockMatchedUsers(i + 1).map((u) => u.uid),
        date: Timestamp.fromDate(new Date()),
        id: i.toString(),
        newMatch: true,
        sharedInterests: ["Running", "Swimming", "Cycling", "Boxing"],
        sharedAvailability: mockAvailability,
        locations: [
          { description: "London" },
          { description: "Manchester" },
          { description: "Birmingham" }
        ]
      };
      mockMatches.push(match);
    }
    return mockMatches;
  } else {
    return [];
  }
};

export const makeMockMatch = (
  numberOfUsers: number
): { match: MatchInfo; users: MatchedUsers } => {
  const matchedUsers = mockMatchedUsers.slice(0, numberOfUsers);
  return {
    match: {
      matchedUsers: matchedUsers.map((u) => u.uid),
      date: Timestamp.fromDate(new Date()),
      id: uuidv4(),
      newMatch: true,
      sharedInterests: ["Running", "Swimming", "Cycling", "Boxing"],
      sharedAvailability: mockAvailability,
      locations: [
        { description: "London" },
        { description: "Manchester" },
        { description: "Birmingham" }
      ]
    },
    users: matchedUsers
  };
};
