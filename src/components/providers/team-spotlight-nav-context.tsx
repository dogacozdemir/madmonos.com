"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TeamSpotlightNavContextValue = {
  teamSpotlightActive: boolean;
  setTeamSpotlightActive: (value: boolean) => void;
};

const TeamSpotlightNavContext = createContext<
  TeamSpotlightNavContextValue | undefined
>(undefined);

export function TeamSpotlightNavProvider({ children }: { children: ReactNode }) {
  const [teamSpotlightActive, setTeamSpotlightActiveState] = useState(false);
  const setTeamSpotlightActive = useCallback((value: boolean) => {
    setTeamSpotlightActiveState(value);
  }, []);

  const value = useMemo(
    () => ({ teamSpotlightActive, setTeamSpotlightActive }),
    [teamSpotlightActive, setTeamSpotlightActive]
  );

  return (
    <TeamSpotlightNavContext.Provider value={value}>
      {children}
    </TeamSpotlightNavContext.Provider>
  );
}

export function useTeamSpotlightNav() {
  const ctx = useContext(TeamSpotlightNavContext);
  if (!ctx) {
    throw new Error("useTeamSpotlightNav must be used within TeamSpotlightNavProvider");
  }
  return ctx;
}

/** Safe for `Nav` when provider is absent (tests / Storybook). */
export function useTeamSpotlightNavOptional() {
  return useContext(TeamSpotlightNavContext);
}
