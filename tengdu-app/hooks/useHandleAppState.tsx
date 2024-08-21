// Do something when the app state changes

import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UseHandleAppStateParams {
  handleChangeToActiveState: () => void;
  handleChangeToNonActiveState: () => void;
}

export const useHandleAppState = ({
  handleChangeToActiveState,
  handleChangeToNonActiveState
}: UseHandleAppStateParams) => {
  const appState = useRef(AppState.currentState);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground
      handleChangeToActiveState();
    } else if (
      appState.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to the background
      handleChangeToNonActiveState();
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);
};
