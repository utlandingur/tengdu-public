// useInputField.ts
import { useState } from "react";

export type useInputFieldProps = {
  initialValue: any;
  errorMessage?: string;
};

export type InputField = {
  val: any;
  setVal: (val: any) => void;
  err: boolean;
  setErr: (err: boolean) => void;
  errorMessage?: string;
};

export type useInputField = (props: useInputFieldProps) => InputField;

export const useInputField = ({
  initialValue,
  errorMessage
}: useInputFieldProps) => {
  const [val, setVal] = useState(initialValue);
  const [err, setErr] = useState(false);

  return { val, setVal, err, setErr, errorMessage };
};
