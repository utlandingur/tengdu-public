import React, { createContext, useContext, useEffect, useState } from "react";
import { useMatch } from "hooks/useMatch";
import { MatchInfo, PublicUserInfo } from "models/user";

interface MatchInfoContextProps {
  matchId: string;
  children: React.ReactNode;
}

const MatchInfoContext = createContext<{
  match: MatchInfo | null;
  users: PublicUserInfo[] | null;
}>(null);

export const useMatchInfo = () => {
  const value = useContext(MatchInfoContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useMatchInfo must be used within a MatchInfoProvider");
    }
  }
  return value;
};

export const MatchInfoProvider = ({
  matchId,
  children
}: MatchInfoContextProps) => {
  const useMatchResult = useMatch(matchId);
  const { match, users } = useMatchResult || {};

  return (
    <MatchInfoContext.Provider value={{ match, users }}>
      {children}
    </MatchInfoContext.Provider>
  );
};
