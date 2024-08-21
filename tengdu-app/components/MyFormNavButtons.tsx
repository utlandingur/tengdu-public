import React from "react";
import { XStack } from "@tamagui/stacks";

import MyButton from "./inputs/MyButton";

interface MyFormNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  disableBack?: boolean;
  shouldFinish?: boolean;
}

export default function MyFormNavButtons(props: MyFormNavButtonsProps) {
  const { onBack, onNext, disableBack, shouldFinish } = props;
  return (
    <XStack
      paddingHorizontal={"$4"}
      paddingBottom={"$true"}
    >
      <XStack
        flex={1}
        justifyContent="space-between"
      >
        <XStack
          flex={1}
          paddingHorizontal={"$true"}
        >
          <MyButton
            flex={1}
            onPress={disableBack ? undefined : onBack}
            type={"secondary"}
            rounded
            disabled={disableBack ? true : false}
            testID="back-button"
          >
            Back
          </MyButton>
        </XStack>
        <XStack
          flex={1}
          paddingHorizontal={"$true"}
        >
          <MyButton
            type={"primary"}
            rounded
            flex={1}
            width={"100%"}
            onPress={onNext}
            testID="next-button"
            text={shouldFinish ? "Finish" : "Next"}
          />
        </XStack>
      </XStack>
    </XStack>
  );
}
