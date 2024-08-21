import { MatchedUsers } from "models/user";

// To display the best name for the tile
export const shortestName = (users: MatchedUsers) => {
  const longCharacterLength = 7;
  const shortCharacterLength = 5;
  let shortestName = users[0].firstName;
  users.forEach((user) => {
    if (user.firstName.length < shortestName.length) {
      shortestName = user.firstName;
    }
  });

  if (shortestName.length > longCharacterLength) {
    shortestName = `${shortestName.slice(0, longCharacterLength)}...`;
  }

  if (users.length > 1) {
    if (shortestName.length > shortCharacterLength) {
      shortestName = `${shortestName.slice(0, shortCharacterLength)}...`;
    }
    shortestName += ` + ${users.length - 1}`;
  }
  return shortestName;
};
