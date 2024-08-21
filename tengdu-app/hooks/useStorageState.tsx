import * as React from "react";
import { useRef } from "react";
import * as SecureStore from "expo-secure-store";

type UseStateHook<T> = [[boolean, T | null], (value?: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, undefined]
): UseStateHook<T> {
  return React.useReducer(
    (state: [boolean, T | null], action: T | null = null) => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}
export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();
  const isMounted = useRef(true);

  React.useEffect(() => {
    const fetchState = async () => {
      const value = await SecureStore.getItemAsync(key);
      if (isMounted.current) {
        setState(value);
      }
    };

    fetchState();

    return () => {
      isMounted.current = false;
    };
  }, [key]);

  const setValue = React.useCallback(
    (value: string | null) => {
      setStorageItemAsync(key, value).then(() => {
        if (isMounted.current) {
          setState(value);
        }
      });
    },
    [key]
  );

  return [state, setValue];
}
