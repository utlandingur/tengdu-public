import React, { createContext, useContext, useEffect } from "react";
import { useGetMatches } from "hooks/useGetMatches";
import { Matches } from "models/user";

const MatchContext = createContext<{
  matches: Matches;
  newMatches: Matches;
  hasNewMatches: boolean;
  newMatchesChatIds: string[];
} | null>(null);

export const useMatches = () => {
  const value = useContext(MatchContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useMatchesContext must be wrapped in a <MatchProvider />"
      );
    }
  }

  return value;
};

export const MatchProvider = (props: React.PropsWithChildren) => {
  const { matches, newMatches, hasNewMatches, newMatchesChatIds } =
    useGetMatches() || null;

  return (
    <MatchContext.Provider
      value={{ matches, newMatches, hasNewMatches, newMatchesChatIds }}
    >
      {props.children}
    </MatchContext.Provider>
  );
};
