import * as React from "react";
import { useRef } from "react";

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
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Local storage is unavailable:", e);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();
  const isMounted = useRef(true);

  React.useEffect(() => {
    const fetchState = async () => {
      try {
        if (typeof localStorage !== "undefined") {
          const value = localStorage.getItem(key);
          if (isMounted.current) {
            setState(value);
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Local storage is unavailable:", e);
        }
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
