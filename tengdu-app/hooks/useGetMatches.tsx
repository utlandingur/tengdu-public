import { useEffect, useMemo, useRef, useState } from "react";
import { getMatches } from "db/matches";
import { Matches } from "models/user";
import { useProfile } from "providers/ProfileProvider";
import equal from "fast-deep-equal";
import { useSession } from "providers/AuthProvider";

// This hook returns the matches for the current profile
// Grabs the matches from the profile and fetches the matches from the database
// If profile changes, fetches the matches again
export const useGetMatches = (): {
  matches: Matches;
  newMatches: Matches;
  hasNewMatches: boolean;
  newMatchesChatIds: string[];
} => {
  const { user } = useSession();
  const { profile } = useProfile();
  const [matches, setMatches] = useState<Matches>([]);
  const [newMatches, setNewMatches] = useState<Matches>([]);

  const profileMatchesRef = useRef(null);

  useEffect(() => {
    const fetchData = async (matchIds: string[]) => {
      if (matchIds?.length > 0) {
        try {
          const result = await getMatches(matchIds);
          const matches = result.map((match) => ({
            ...match,
            matchedUsers: match.matchedUsers.filter((u) => u !== user.uid)
          }));
          setMatches(matches);
          return;
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error(error);
          }
        }
      }
      setMatches([]);
    };
    if (
      profile?.matches &&
      !equal(profile.matches, profileMatchesRef.current)
    ) {
      fetchData(profile.matches);
      profileMatchesRef.current = profile.matches;
    }
  }, [profile?.matches]);

  // filter for new matches
  useEffect(() => {
    if (matches && profile?.newMatches) {
      const filteredMatches = matches.filter((match) =>
        profile.newMatches.includes(match?.id)
      );
      setNewMatches(filteredMatches);
    } else {
      setNewMatches([]);
    }
  }, [matches, profile?.newMatches]);

  const newMatchesChatIds = useMemo(() => {
    return newMatches.map((match) => match.chatId).filter(Boolean);
  }, [newMatches]);

  return {
    matches,
    newMatches,
    hasNewMatches: newMatches.length > 0,
    newMatchesChatIds
  };
};
