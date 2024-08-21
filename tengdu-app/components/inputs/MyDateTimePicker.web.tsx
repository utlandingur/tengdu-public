import { useEffect, useState } from "react";
import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // https://github.com/mmazzarolo/react-native-modal-datetime-picker
import { Calendar, Clock } from "@tamagui/lucide-icons";
import { Input, Stack, XStack } from "tamagui";

import WebDateTimePicker from "../web/WebDateTimePicker";

interface datePickerPropsWeb {
  type: "date" | "time";
  label: string;
  state: Date;
  setState: (state: Date) => void;
  onChange?: (date: Date) => void;
  error?: boolean;
  setError?: (error: boolean) => void;
  errorMessage?: string;
  confirmText?: string;
  cancelText?: string;
  accentColor?: string;
  textColor?: string;
  buttonTextColorIOS?: string;
}

const MyDateTimePicker = function DatePicker(props: datePickerProps) {
  const {
    label,
    error,
    setError,
    errorMessage,
    onChange,
    state,
    setState,
    type,
    confirmText,
    cancelText,
    accentColor,
    textColor,
    buttonTextColorIOS
  } = props;

  const [show, setShow] = useState(false);

  const hideDatePicker = () => {
    setShow(false);
  };

  const showDatePicker = () => {
    setShow(true);
  };

  const handleOnChange = (newState: Date) => {
    setState(newState);

    // we always set error to false when the user selects a new date
    // logic for setting error is handled in the parent component
    if (error) {
      if (typeof setError !== "undefined") {
        setError(false);
      }
    }
    hideDatePicker();
  };

  return (
    <Pressable onPress={showDatePicker}>
      <XStack
        alignItems={"center"}
        justifyContent="flex-end"
      >
        <Input
          pointerEvents="none"
          editable={false}
          flexGrow={1}
          placeholder={
            type === "date"
              ? state?.toLocaleDateString()
              : state?.toLocaleTimeString()
          }
          id={label}
          testID={`${label}-input`}
          borderColor={error ? "red" : undefined}
        />

        <XStack
          paddingRight={10}
          position="absolute"
        >
          {type === "date" && <Calendar />}

          {type === "time" && <Clock />}
        </XStack>
      </XStack>
      <Stack
        position="absolute"
        justifyContent="flex-end"
        width={"100%"}
        height={"100%"}
        opacity={0}
      >
        <WebDateTimePicker
          onChange={(event) => {
            const newDate = new Date(event.target.value);
            handleOnChange(newDate);
          }}
          value={state}
        />
      </Stack>
    </Pressable>
  );
};

export default MyDateTimePicker;
