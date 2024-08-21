import React, { useEffect, useState } from "react";
import { Linking } from "react-native";
import { Check } from "@tamagui/lucide-icons";
import { Checkbox, CheckedState, Label, XStack } from "tamagui";

interface CheckboxInputProps {
  label: string;
  setChecked: (checked: CheckedState) => void;
  testName?: string;
  error?: boolean;
  setError?: (checkedError: boolean) => void;
  labelLink?: string;
}

const CheckboxInput = (props: CheckboxInputProps) => {
  const { setChecked, error, label, labelLink, testName, setError } = props;

  const handleOnCheckedChange = (newState) => {
    setChecked(newState);
    if (error) {
      if (typeof setError !== "undefined") {
        setError(false);
      }
    }
  };

  return (
    <XStack
      alignContent="center"
      justifyContent="space-around"
      gap={"$true"}
      width={"100%"}
    >
      <Checkbox
        onCheckedChange={handleOnCheckedChange}
        testID={`${testName}-checkbox`}
        alignSelf="center"
        backgroundColor={"$white"}
        borderColor={error ? "red" : "$black"}
        pressTheme={false}
        hoverTheme={false}
        borderWidth={error ? 3 : undefined}
        focusStyle={{ borderColor: "$green" }}
      >
        <Checkbox.Indicator>
          <Check color={"$black"} />
        </Checkbox.Indicator>
      </Checkbox>
      {labelLink && (
        <Label
          onPress={() => Linking.openURL(labelLink)}
          testID={`${testName}-label`}
          maxWidth={"100%"}
          lineHeight={"$3"}
          color={error ? "red" : undefined}
        >
          {label}
        </Label>
      )}
      {!labelLink && (
        <Label
          testID={`${testName}-label`}
          maxWidth={"100%"}
          lineHeight={"$3"}
        >
          {label}
        </Label>
      )}
    </XStack>
  );
};

export default CheckboxInput;
