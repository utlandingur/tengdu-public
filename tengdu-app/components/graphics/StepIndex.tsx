import { Image } from "react-native";
import { Text } from "@tamagui/core";
import { Circle } from "@tamagui/shapes";
import { XStack, YStack } from "@tamagui/stacks";
import { H1, H3 } from "@tamagui/text";

interface StepIndexProps {
  position: number;
}

export function StepIndex(props: StepIndexProps) {
  return (
    <XStack
      justifyContent="center"
      alignContent="center"
      alignItems="center"
      height="$6"
      flexWrap="wrap"
    >
      <XStack
        alignItems="center"
        flex={1}
        justifyContent="space-evenly"
      >
        {[1, 2, 3, 4, 5].map((step) => {
          return (
            <XStack key={step}>
              <XStack
                justifyContent="space-evenly"
                flex={1}
              >
                <Circle
                  backgroundColor={
                    props.position >= step ? "$purple" : "#E3E3E3"
                  }
                  size={32}
                  flex
                  justifyContent="center"
                >
                  <H3 color={"#fff"}>{step}</H3>
                </Circle>
              </XStack>
            </XStack>
          );
        })}
      </XStack>
    </XStack>
  );
}
