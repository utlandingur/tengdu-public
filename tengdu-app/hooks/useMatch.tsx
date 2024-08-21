import { useEffect, useState } from "react";
import { getUsers } from "db/users";
import { MatchInfo, PublicUserInfo } from "models/user";
import { useMatches } from "providers/MatchProvider";
import { useSession } from "providers/AuthProvider";

export const useMatch = (
  matchId: string
): { match: MatchInfo; users: PublicUserInfo[] } => {
  const { user } = useSession();
  const useMatchesResult = useMatches();
  const { matches } = useMatchesResult || {};

  const [match, setMatch] = useState<MatchInfo>(undefined);
  const [users, setUsers] = useState<PublicUserInfo[]>([]);

  useEffect(() => {
    if (matchId && matches) {
      const thisMatch = matches.find((match) => match.id == matchId);
      setMatch(thisMatch);
    } else {
      setMatch(undefined);
    }
  }, [matches, matchId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!match) {
        setUsers([]);
        return;
      }
      try {
        const users = (await getUsers(match.matchedUsers)).filter(
          (u) => u.uid !== user.uid
        );
        setUsers(users);
      } catch (error) {
        setUsers([]);
        console.error(error);
      }
    };
    fetchData();
  }, [match]);

  return { match, users };
};
