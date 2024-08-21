import React from "react";
import { XCircle } from "@tamagui/lucide-icons";
import { Paragraph, styled, ThemeableStack, XStack } from "tamagui";

import { onPressStyles } from "../tamagui.config";

export interface myChipProps {
  text: string;
  selected?: boolean;
  onPress?: () => void;
  deletable?: boolean;
  testId?: string;
  pressable?: boolean;
}

export default function MyChip(props: myChipProps) {
  const { text, selected, onPress, deletable, testId, pressable } = props;
  const inverse: boolean = selected || deletable;

  return (
    <Chip
      onPress={onPress}
      backgroundColor={inverse ? "$primaryBackground" : "$backgroundStrong"}
      hoverStyle={{
        backgroundColor: "$tertiaryColor"
      }}
      marginHorizontal={"$1"}
      pressStyle={pressable ? onPressStyles : null}
      testID={testId}
      borderColor={inverse ? "transparent" : "$black"}
    >
      <Paragraph
        color={inverse ? "$primaryColor" : "$black"}
        fontWeight={"bold"}
      >
        {text}
      </Paragraph>
      {deletable && (
        <XStack alignItems="center">
          <XCircle
            size={"$1"}
            color={"$primaryColor"}
            pressStyle={{ opacity: 0.8 }}
          />
        </XStack>
      )}
    </Chip>
  );
}

const Chip = styled(ThemeableStack, {
  focusTheme: true,
  bordered: true,
  borderRadius: 8,
  paddingHorizontal: "$2.5",
  paddingVertical: "$1.5",
  space: "$2",
  flexDirection: "row",
  marginBottom: "$2"
});
