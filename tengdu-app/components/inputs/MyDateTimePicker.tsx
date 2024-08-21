import { useState } from "react";
import { Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // https://github.com/mmazzarolo/react-native-modal-datetime-picker
import { Calendar, Clock } from "@tamagui/lucide-icons";
import InputLabel from "components/InputLabel";
import { Input, XStack, YStack } from "tamagui";

interface datePickerProps {
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
  testID?: string;
}

const MyDateTimePicker = function DatePicker(props: datePickerProps) {
  const {
    label,
    error,
    setError,
    errorMessage,
    state,
    setState,
    type,
    confirmText,
    cancelText,
    accentColor,
    textColor,
    buttonTextColorIOS,
    testID
  } = props;

  const [show, setShow] = useState(false);

  const hideDatePicker = () => {
    setShow(false);
  };

  const showDatePicker = () => {
    setShow(true);
  };

  const handleConfirm = (newState: Date) => {
    // we always set error to false when the user selects a new date
    // logic for setting error is handled in the parent component
    setError && setError(false);
    hideDatePicker();
    setState(newState);
  };

  return (
    <YStack>
      <InputLabel
        testID={testID}
        label={label}
        error={error}
        errorMessage={errorMessage}
      />

      <Pressable
        testID={`${testID}-container`}
        onPress={showDatePicker}
      >
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
            testID={`${testID}-input`}
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
        <DateTimePickerModal
          cancelTextIOS={cancelText}
          confirmTextIOS={confirmText}
          date={state}
          isVisible={show}
          mode={type}
          accentColor={accentColor}
          textColor={textColor}
          buttonTextColorIOS={buttonTextColorIOS}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          testID={`${testID}-modal`}
          confirmButtonTestID={`${testID}-confirm-button`}
          cancelButtonTestID={`${testID}-cancel-button`}
        />
      </Pressable>
    </YStack>
  );
};

export default MyDateTimePicker;
