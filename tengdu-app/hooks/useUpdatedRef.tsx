import { useEffect, useRef } from "react";

// For keeping a ref up to date with a value
export function useUpdatedRef(value) {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
}
